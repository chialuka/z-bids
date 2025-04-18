import { useState, useEffect } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from "@heroui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import DocumentEditor from "./DocumentEditor";
import SearchBar from "./SearchBar";
import TableEditor from "./TableEditor";

interface FileViewerProps {
	isOpen: boolean;
	onClose: () => void;
	fileName: string;
	documentId: string;
	documentContent: string;
	documentType: "coverSheet" | "pdfContent" | "complianceMatrix";
	onSaveDocument: (id: string, name: string, content: string) => Promise<void>;
}

export default function FileViewer({
	isOpen,
	onClose,
	fileName,
	documentId,
	documentContent,
	documentType,
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
					{documentType === "coverSheet" && (
						<div>
							{viewMode === "table" ? (
								<>
									<TableEditor
										tableData={tableData}
										onSave={handleSaveTableContent}
									/>
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
					)}
					{/* {documentType === "complianceMatrix" && (
						<div className="prose prose-sm max-w-none dark:prose-invert">
							<ReactMarkdown>{documentContent}</ReactMarkdown>
						</div>
					)} */}
					{documentType === "complianceMatrix" && (
						<div className="w-full overflow-x-auto">
							<div className="prose prose-sm max-w-none dark:prose-invert prose-table:border-collapse prose-td:border prose-td:border-gray-300 prose-td:p-2 prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800">
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{documentContent}
								</ReactMarkdown>
							</div>
						</div>
					)}
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
							Download Document
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
