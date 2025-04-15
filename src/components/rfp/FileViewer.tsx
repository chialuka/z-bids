import { useState, useEffect } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from "@heroui/react";
import DocumentEditor from "./DocumentEditor";
import SearchBar from "./SearchBar";
import TableEditor from "./TableEditor";

interface FileViewerProps {
	isOpen: boolean;
	onClose: () => void;
	fileName: string;
	documentId: string;
	documentContent: string;
	onSaveDocument: (id: string, name: string, content: string) => Promise<void>;
}

export default function FileViewer({
	isOpen,
	onClose,
	fileName,
	documentId,
	documentContent,
	onSaveDocument,
}: FileViewerProps) {
	const [content, setContent] = useState<string>("");
	const [viewMode, setViewMode] = useState<"raw" | "table">("table");
	const [tableData, setTableData] = useState<string[][]>([]);

	useEffect(() => {
		if (documentContent) {
			try {
				if (typeof documentContent === "string") {
					setContent(documentContent);
					// Parse CSV content for table view
					const rows = documentContent.split("\n").map((row) => row.split(","));
					setTableData(rows);
					// Automatically switch to table view if it looks like CSV
					if (rows.length > 1 && rows[0].length > 1) {
						setViewMode("table");
					}
				} else {
					const stringContent = JSON.stringify(documentContent, null, 2);
					setContent(stringContent);
					setTableData([]);
					setViewMode("raw");
				}
			} catch (error) {
				console.error("Error parsing document content:", error);
				setContent("");
				setTableData([]);
				setViewMode("raw");
			}
		}
	}, [documentContent]);

	const handleDownloadCSV = () => {
		if (!content) {
			console.log("No content available for download");
			return;
		}

		const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `${fileName.replace(/\.[^/.]+$/, "")}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleSaveTableContent = async (newContent: string) => {
		setContent(newContent);
		await onSaveDocument(documentId, fileName, newContent);
	};

	const renderTableView = () => {
		if (tableData.length === 0) return null;

		return (
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{tableData[0].map((header, index) => (
								<th
									key={index}
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{tableData.slice(1).map((row, rowIndex) => (
							<tr
								key={rowIndex}
								className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
							>
								{row.map((cell, cellIndex) => (
									<td
										key={cellIndex}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="full"
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-medium">{fileName}</h3>
						<div className="flex items-center space-x-2">
							{tableData.length > 0 && (
								<Button
									color="primary"
									variant="light"
									onPress={() =>
										setViewMode(viewMode === "raw" ? "table" : "raw")
									}
								>
									{viewMode === "raw" ? "View as Table" : "View as Raw"}
								</Button>
							)}
						</div>
					</div>
				</ModalHeader>
				<ModalBody className="flex gap-4">
					<div>
						{viewMode === "table" ? (
							<>
								<TableEditor
									tableData={tableData}
									onSave={handleSaveTableContent}
								/>
								<div className="mt-4">
									<h3 className="text-lg font-medium mb-2">Table Preview</h3>
									{renderTableView()}
								</div>
							</>
						) : (
							<DocumentEditor
								documentId={documentId}
								initialContent={documentContent}
								documentName={fileName}
								onSave={onSaveDocument}
							/>
						)}
					</div>
					<div className="">
						<SearchBar documentContent={documentContent} />
					</div>
				</ModalBody>
				<ModalFooter className="flex gap-2">
					<div className="flex items-center space-x-2">
						<Button
							color="primary"
							variant="solid"
							onPress={handleDownloadCSV}
							className="font-semibold"
						>
							Download CSV
						</Button>
					</div>
					<Button color="danger" variant="light" onPress={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
