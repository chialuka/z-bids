"use client";

import {
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	Spinner,
	Input,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import DOMPurify from "dompurify";

import { File } from "@/types";
import { documentsTable } from "@/server/db/schema";

export default function GetSharePointFiles({ files }: { files: File[] }) {
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isLoadingChatResponse, setIsLoadingChatResponse] =
		useState<boolean>(false);
	const [chatResponse, setChatResponse] = useState<string>("");
  const [allDocuments, setAllDocuments] = useState<typeof documentsTable.$inferSelect[]>([]);

  useEffect(() => {
    fetch("/api/supabase").then(async (res) => {
      const response = await res.json();
      console.log(response, "response");
      setAllDocuments(response.allDocuments);
    });
  }, []);

	const parseFile = (file: File) => {
		setOpenFileName(file.name);
		setIsLoading(true);
    const documentExists = allDocuments?.find((doc) => doc.name === file.name);
    if (documentExists && documentExists.content) {
      setContent(documentExists.content);
    } else {
      fetch("/api/reducto", {
        method: "POST",
        body: JSON.stringify({
          documentUrl: `https://pa6rt2x38u.ufs.sh/f/${file.key}`,
        }),
      }).then(async (res) => {
        const response = await res.json();
        console.log(response, "response");
        // Sanitize the response to prevent XSS attacks
        const safeHtml = DOMPurify.sanitize(response.data);
        setContent(safeHtml);
        await fetch("/api/supabase", {
          method: "POST",
          body: JSON.stringify({
            name: file.name,
            content: safeHtml,
          }),
        });
      });
      
    }
    setIsLoading(false);
    setIsModalOpen(true);
	};

	const searchFile = (searchTerm: string) => {
		setIsLoadingChatResponse(true);
		fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify({ messages: { searchTerm, document: content } }),
		}).then(async (res) => {
			const response = await res.json();
			console.log(response, "response");

			// Sanitize the response to prevent XSS attacks
			const safeHtml = DOMPurify.sanitize(response.data);
			setChatResponse(safeHtml);
			setIsLoadingChatResponse(false);

			return response;
		});
	};

	return (
		<section>
			<div>
				{files.length ? (
					isLoading ? (
						<Spinner color="default" label="Parsing document..." />
					) : (
						<Table aria-label="Table of SharePoint Files">
							<TableHeader>
								<TableColumn>Name</TableColumn>
								{/* <TableColumn>Created By</TableColumn> */}
								<TableColumn>Created Date</TableColumn>
							</TableHeader>
							<TableBody>
								{files.map((file: File) => (
									<TableRow
										key={file.id}
										onClick={() => parseFile(file)}
										className="cursor-pointer"
									>
										<TableCell>{file.name}</TableCell>
										{/* <TableCell>{file.createdBy.user.displayName}</TableCell> */}
										<TableCell>
											{new Date(file.uploadedAt).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)
				) : (
					<p>No files found.</p>
				)}
			</div>
			<Modal
				isOpen={isModalOpen}
				size="full"
				onClose={() => setIsModalOpen(false)}
				scrollBehavior="inside"
			>
				<ModalContent>
					<ModalHeader className="text-2xl font-bold text-center">
						{openFileName}
					</ModalHeader>
					<ModalBody>
						<div className="p-10">
							<div>
								<Input
									placeholder="Search File"
									value={searchTerm}
									name="searchTerm"
									onChange={(e) => setSearchTerm(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && searchFile(searchTerm)}
									endContent={
										<SearchIcon
											onClick={() => searchFile(searchTerm)}
											className="h-6 w-6 text-gray-400 cursor-pointer"
										/>
									}
									className="py-10"
								/>
								{isLoadingChatResponse ? (
									<Spinner />
								) : (
									// This has been sanitized to prevent XSS attacks
									<div
										className="pt-5 pb-10 mb-5 bg-gray-100 p-4 rounded-lg border border-gray-300"
										dangerouslySetInnerHTML={{ __html: chatResponse }}
									/>
								)}
							</div>
							<div>
								<p className="font-bold text-center text-xl">
									Compliance Matrix
								</p>
								<div dangerouslySetInnerHTML={{ __html: content }} />
							</div>
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		</section>
	);
}
