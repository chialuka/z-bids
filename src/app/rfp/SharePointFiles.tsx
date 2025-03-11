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
import { useState } from "react";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";

type File = {
	name: string;
	webUrl: string;
	id: string;
	createdBy: {
		user: {
			displayName: string;
			email: string;
			id: string;
		};
	};
	createdDateTime: string;
};

export default function GetSharePointFiles({ files }: { files: File[] }) {
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isLoadingChatResponse, setIsLoadingChatResponse] =
		useState<boolean>(false);
	const [chatResponse, setChatResponse] = useState<string>("");

	const parseFile = (file: File) => {
		setOpenFileName(file.name);
		setIsLoading(true);
		fetch("/api/reducto", {
			method: "POST",
			body: JSON.stringify({ documentUrl: file.webUrl }),
		}).then(async (res) => {
			const response = await res.json();
			console.log(response.data.result.chunks, "response");
			setContent(
				response.data.result.chunks
					.map((chunk: { blocks: Array<{ content: string }> }) =>
						chunk.blocks.map((block) => block.content).join("")
					)
					.join("")
			);
			setIsLoading(false);
			setIsModalOpen(true);
			return response;
		});
	};

	const searchFile = (searchTerm: string) => {
		setIsLoadingChatResponse(true);
		fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify({ messages: { searchTerm, document: content } }),
		}).then(async (res) => {
			const response = await res.json();
			console.log(response, "response");
			setChatResponse(response.data);
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
								<TableColumn>Created By</TableColumn>
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
										<TableCell>{file.createdBy.user.displayName}</TableCell>
										<TableCell>
											{new Date(file.createdDateTime).toLocaleDateString()}
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
				size="5xl"
				onClose={() => setIsModalOpen(false)}
				scrollBehavior="inside"
			>
				<ModalContent>
					<ModalHeader className="text-2xl font-bold text-center">
						{openFileName}
					</ModalHeader>
					<ModalBody>
						<div className="p-10">
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
								<p className="pt-5 pb-10">{chatResponse}</p>
							)}
							<div>
								<p className="font-bold text-center text-xl">Document Summary</p>
								<p>{content}</p>
							</div>
						</div>
					</ModalBody>
				</ModalContent>
			</Modal>
		</section>
	);
}
