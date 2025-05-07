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

// Define types for feasibility check data
interface FeasibilityItem {
	req_no: number;
	section: string;
	requirement: string;
	feasible: "Yes" | "No" | "Uncertain";
	reason: string;
	citations: string;
}

type FeasibilityData  = FeasibilityItem[];

interface FileViewerProps {
	isOpen: boolean;
	onClose: () => void;
	fileName: string;
	documentId: string;
	documentContent: string;
	documentType: "coverSheet" | "pdfContent" | "complianceMatrix" | "feasibilityCheck";
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
					// Parse CSV content for table view with exactly three columns
					const parseCSVToThreeColumns = (csvString: string) => {
						// Split by newlines first
						const lines = csvString.split('\n');
						const processedRows = [];
						
						for (const line of lines) {
							// Skip empty lines
							if (!line.trim()) continue;
							
							// Regex to match CSV format with consideration for quotes
							// This matches: field,field,"field with, commas"
							const parts = [];
							let inQuotes = false;
							let currentPart = '';
							let columnCount = 0;
							
							// Process character by character
							for (let i = 0; i < line.length; i++) {
								const char = line[i];
								
								if (char === '"') {
									// Toggle quote state
									inQuotes = !inQuotes;
									// Add the quote to the current part
									currentPart += char;
								} else if (char === ',' && !inQuotes) {
									// End of field - but only process first two columns
									parts.push(currentPart);
									currentPart = '';
									columnCount++;
									
									// If we already have two columns, the rest goes into the third
									if (columnCount >= 2) {
										// Get the rest of the line
										currentPart = line.substring(i + 1);
										break;
									}
								} else {
									// Regular character
									currentPart += char;
								}
							}
							
							// Add the last part
							if (currentPart) {
								parts.push(currentPart);
							}
							
							// Ensure we have exactly 3 columns
							while (parts.length < 3) {
								parts.push('');
							}
							
							// Truncate to 3 columns if somehow we have more
							if (parts.length > 3) {
								parts.length = 3;
							}
							
							processedRows.push(parts);
						}
						
						// Ensure we have at least one row with headers
						if (processedRows.length === 0) {
							processedRows.push(['Section', 'Subsection', 'Content']);
						}
						
						return processedRows;
					};
					
					const rows = parseCSVToThreeColumns(documentContent);
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
						{/* <div className="flex items-center space-x-2">
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
						</div> */}
					</div>
				</ModalHeader>
				<ModalBody className="flex gap-4 overflow-x-hidden pb-40">
					{documentType === "coverSheet" && (
						<div className="w-full overflow-x-auto">
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
					{documentType === "complianceMatrix" && (
						<div className="w-full overflow-x-auto">
							<div className="prose prose-sm max-w-none dark:prose-invert prose-table:border-collapse prose-td:border prose-td:border-gray-300 prose-td:p-2 prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800">
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{documentContent}
								</ReactMarkdown>
							</div>
						</div>
					)}
					{documentType === "feasibilityCheck" && (
						<div className="w-full overflow-x-auto">
							<div className="p-4 bg-blue-50 rounded mb-4">
								<h3 className="text-lg font-semibold text-blue-900 mb-2">Feasibility Analysis Results</h3>
								<p className="text-blue-800 mb-2">The following analysis shows how well this RFP matches your organization&apos;s capabilities.</p>
							</div>
							<div className="px-4">
								{(() => {
									try {
										// Parse the JSON data
										const data = JSON.parse(documentContent) as FeasibilityData;
                    console.log({ data }, "feasibility data");
										
										if (!data || !Array.isArray(data)) {
											return (
												<div className="p-4 text-red-500">
													Invalid feasibility data format
												</div>
											);
										}
										
										return (
											<table className="w-full border-collapse">
												<thead>
													<tr className="bg-gray-100">
														<th className="border border-gray-300 p-2 text-left">Req #</th>
														<th className="border border-gray-300 p-2 text-left">Section</th>
														<th className="border border-gray-300 p-2 text-left">Requirement</th>
														<th className="border border-gray-300 p-2 text-left">Feasible</th>
														<th className="border border-gray-300 p-2 text-left">Reason</th>
														<th className="border border-gray-300 p-2 text-left">Citations</th>
													</tr>
												</thead>
												<tbody>
													{data.map((item: FeasibilityItem) => (
														<tr key={item.req_no}>
															<td className="border border-gray-300 p-2">{item.req_no}</td>
															<td className="border border-gray-300 p-2">{item.section}</td>
															<td className="border border-gray-300 p-2">{item.requirement}</td>
															<td className={`border border-gray-300 p-2 ${
																item.feasible === "Yes" ? "bg-green-100" :
																item.feasible === "No" ? "bg-red-100" : "bg-yellow-100"
															}`}>
																{item.feasible}
															</td>
															<td className="border border-gray-300 p-2">{item.reason}</td>
															<td className="border border-gray-300 p-2">{item.citations || "-"}</td>
														</tr>
													))}
												</tbody>
											</table>
										);
									} catch (e) {
										return (
											<div className="p-4 text-red-500">
												Error parsing feasibility data: {e instanceof Error ? e.message : String(e)}
											</div>
										);
									}
								})()}
							</div>
						</div>
					)}
					<div className="fixed bottom-0 left-0 right-0 bg-white py-10 px-4 border-t">
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
