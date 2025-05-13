"use client";

import { useRef, useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

type KBFile = {
  id: string;
  name: string;
  uploadedAt: string;
  ufsUrl?: string;
};

export default function KnowledgeBasePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<KBFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch files from your API
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/uploadthing/knowledge");
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files);
      if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (const file of Array.from(selectedFiles)) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/uploadthing/knowledge", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setSelectedFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchFiles();
    } catch {
      // Optionally show error
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fafd] my-6 px-2">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        {/* Upload Area */}
        <Card className="rounded-2xl shadow border border-gray-200">
          <CardBody className="p-4">
            <form onSubmit={handleSubmit}>
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-2 py-8 transition-colors cursor-pointer bg-[#fafbfc] ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleChooseFile}
              >
                <CloudArrowUpIcon className="w-12 h-12 text-blue-400 mb-2" />
                <div className="font-semibold text-lg mb-1">Upload a file</div>
                <div className="text-gray-500 mb-4 text-center text-base">
                  Drag and drop a file here or click to browse
                </div>
                <Button
                  type="button"
                  color="primary"
                  onPress={handleChooseFile}
                  className="mb-2"
                  radius="md"
                >
                  Choose File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-700">
                    {Array.from(selectedFiles)
                      .map((file) => file.name)
                      .join(", ")}
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  color="default"
                  size="md"
                  className="mt-2"
                  disabled={!selectedFiles || selectedFiles.length === 0}
                >
                  Upload
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Uploaded Files Table */}
        <Card className="rounded-2xl shadow border border-gray-200">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Uploaded Files</h3>
          </CardHeader>
          <CardBody className="pt-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner label="Loading files..." />
              </div>
            ) : files.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No files uploaded yet.</div>
            ) : (
              <Table aria-label="Knowledge Base Files">
                <TableHeader>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Uploaded At</TableColumn>
                  <TableColumn>Action</TableColumn>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        {file.ufsUrl ? (
                          <a
                            href={file.ufsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {file.name}
                          </a>
                        ) : (
                          file.name
                        )}
                      </TableCell>
                      <TableCell>
                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : ""}
                      </TableCell>
                      <TableCell>
                        {file.ufsUrl && (
                          <Button
                            as="a"
                            href={file.ufsUrl}
                            target="_blank"
                            size="sm"
                            variant="light"
                          >
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
