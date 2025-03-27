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
	Button,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import DOMPurify from "dompurify";

import { File } from "@/types";
import { documentsTable } from "@/server/db/schema";
import Editor from "@/components/tiptap/Editor";
export default function GetSharePointFiles({ files }: { files: File[] }) {
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isLoadingChatResponse, setIsLoadingChatResponse] =
		useState<boolean>(false);
	const [chatResponse, setChatResponse] = useState<string>("");
	const [allDocuments, setAllDocuments] = useState<
		(typeof documentsTable.$inferSelect)[]
	>([]);
	const [isEditMode, setIsEditMode] = useState<boolean>(true);
	const [documentId, setDocumentId] = useState<string>("");

	console.log(isEditMode, "isEditMode");

	useEffect(() => {
		fetch("/api/supabase").then(async (res) => {
			const response = await res.json();
			setAllDocuments(response.allDocuments);
		});

    // Use this value to trigger the content to update after an edit
	}, [isEditMode]);

	const parseFile = (file: File) => {
		setOpenFileName(file.name);
		setIsLoading(true);
		const documentExists = allDocuments?.find((doc) => doc.name === file.name);
		if (documentExists && documentExists.content) {
			setContent(documentExists.content);
			setDocumentId(documentExists.id.toString());
		} else {
			fetch("/api/reducto", {
				method: "POST",
				body: JSON.stringify({
					documentUrl: `https://pa6rt2x38u.ufs.sh/f/${file.key}`,
				}),
			}).then(async (res) => {
				const response = await res.json();
				// Sanitize the response to prevent XSS attacks
				const safeHtml = DOMPurify.sanitize(response.data);
				setContent(safeHtml);
				const newDocument = await fetch("/api/supabase", {
					method: "POST",
					body: JSON.stringify({
						name: file.name,
						content: safeHtml,
					}),
				});
				const newDocumentResponse = await newDocument.json();
				setDocumentId(newDocumentResponse.id);
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

			// Sanitize the response to prevent XSS attacks
			const safeHtml = DOMPurify.sanitize(response.data);
			setChatResponse(safeHtml);
			setIsLoadingChatResponse(false);

			return response;
		});
	};

	const saveContent = async ({
		id,
		content,
	}: {
		id: string;
		content: string;
	}) => {
		setIsEditMode(false);
		await fetch("/api/supabase", {
			method: "PATCH",
			body: JSON.stringify({ id, content }),
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
								<Editor content={content} editable={isEditMode} setContent={setContent} />
								<div className="flex justify-end gap-3 mt-4 mb-2">
									<Button
										className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
										onPress={() => setIsEditMode(true)}
										isDisabled={isEditMode}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
											/>
										</svg>
										Edit
									</Button>
									<Button
										className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
										onPress={() => saveContent({ id: documentId, content })}
										isDisabled={!isEditMode}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 mr-2"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Save
									</Button>
								</div>
							</div>
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		</section>
	);
}
