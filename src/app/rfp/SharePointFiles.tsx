"use client";

import {
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
} from "@heroui/react";
import { useState } from "react";

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
	const parseFile = (fileUrl: string) =>
		fetch("/api/reducto", {
			method: "POST",
			body: JSON.stringify({ documentUrl: fileUrl }),
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
			return response;
		});
	return (
		<section>
			<div>
				{files.length ? (
					<Table aria-label="Table of SharePoint Files">
						<TableHeader>
							<TableColumn>Name</TableColumn>
							<TableColumn>Created By</TableColumn>
							<TableColumn>Created Date</TableColumn>
						</TableHeader>
						<TableBody>
							{files.map((file: File) => (
								<TableRow key={file.id}>
									<TableCell>
										<a href={file.webUrl}>{file.name}</a>
									</TableCell>
									<TableCell onClick={() => parseFile(file.webUrl)}>
										{file.createdBy.user.displayName}
									</TableCell>
									<TableCell>
										{new Date(file.createdDateTime).toLocaleDateString()}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<p>No files found.</p>
				)}
			</div>
			<>
				{content.length ? (
					<div>
						<p className="text-lg font-bold text-center py-10">Content</p>
						<p>{content}</p>
					</div>
				) : null}
			</>
		</section>
	);
}
