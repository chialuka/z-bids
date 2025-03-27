import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner
} from "@heroui/react";
import { File } from "@/types";

interface FileListProps {
  files: File[];
  isLoading: boolean;
  onFileSelect: (file: File) => void;
}

export default function FileList({ files, isLoading, onFileSelect }: FileListProps) {
  if (isLoading) {
    return <Spinner color="default" label="Parsing document..." />;
  }

  if (!files.length) {
    return <p>No files found.</p>;
  }

  return (
    <Table aria-label="Table of Files">
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Created Date</TableColumn>
      </TableHeader>
      <TableBody>
        {files.map((file: File) => (
          <TableRow
            key={file.id}
            onClick={() => onFileSelect(file)}
            className="cursor-pointer"
          >
            <TableCell>{file.name}</TableCell>
            <TableCell>
              {new Date(file.uploadedAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 
