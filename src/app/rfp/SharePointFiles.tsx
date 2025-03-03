"use client";

import {
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
} from "@heroui/table";

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
	return (
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
								<TableCell>{file.createdBy.user.displayName}</TableCell>
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
	);
}
