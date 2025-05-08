import React, { useState, useEffect } from "react";
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
import { RfpData } from "@/server/modules/openai/generateCoverSheet";
import SearchBar from "./SearchBar";
import { convertJsonToMarkdown, convertToExcel } from "@/lib/utils";
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
	documentContent: string;
	documentType: "coverSheet" | "pdfContent" | "complianceMatrix" | "feasibilityCheck";
}

export default function FileViewer({
	isOpen,
	onClose,
	fileName,
	documentContent,
	documentType,
}: FileViewerProps) {
	const [content, setContent] = useState<string>("");
	const [jsonData, setJsonData] = useState<RfpData | null>(null);
	const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

	useEffect(() => {
		if (documentContent && documentType === "coverSheet") {
			try {
				// Parse the JSON data for structured rendering
				const data = typeof documentContent === "string" 
					? JSON.parse(documentContent) 
					: documentContent;
				
				setJsonData(data);
				
				// Also keep markdown version for download
				let markdown = "";
				try {
					if (typeof documentContent === "string") {
						markdown = convertJsonToMarkdown(documentContent);
					} else {
						markdown = convertJsonToMarkdown(JSON.stringify(documentContent));
					}
					setContent(markdown);
				} catch (error) {
					console.error("Error parsing cover sheet JSON:", error);
					setContent("");
				}
			} catch (error) {
				console.error("Error parsing JSON data:", error);
				setJsonData(null);
				setContent("");
			}
		} else if (documentContent) {
			setContent(documentContent);
			setJsonData(null);
		}
	}, [documentContent, documentType]);

	const handleDownload = async () => {
		if (!content) {
			console.log("No content available for download");
			return;
		}

		setDownloadLoading(true);
		try {
			// Different download behavior based on documentType
			if (documentType === "coverSheet") {
				// Create Excel file for cover sheet
				const excelData = await convertToExcel(documentContent);
				
				// Create and download the Excel file
				const blob = new Blob([excelData], { 
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
				});
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = `${fileName.replace(/\.[^/.]+$/, "")}_cover_sheet.xlsx`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else {
				// For other document types, download as text/markdown/CSV as appropriate
				const mimeType = documentType === "complianceMatrix" ? "text/markdown" : "text/csv";
				const extension = documentType === "complianceMatrix" ? "md" : "csv";
				
				const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				link.download = `${fileName.replace(/\.[^/.]+$/, "")}.${extension}`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch (error) {
			console.error("Error downloading file:", error);
		} finally {
			setDownloadLoading(false);
		}
	};

	// Format text to highlight labels
	const formatValueWithLabels = (text: string): React.ReactNode | string => {
		if (!text || typeof text !== 'string') return text;
		
		// Split by labels ("Label: Value" pattern)
		if (text.includes(': ')) {
			const parts = text.split(/(?<=^|;\s*)([^:;]+):\s*/g).filter(Boolean);
			
			if (parts.length <= 1) return text;
			
			return (
				<div className="space-y-1">
					{parts.map((part, index) => {
						// Skip the parts that are values (every even-indexed item)
						if (index % 2 === 1) return null;
						
						// Get the corresponding value (if exists)
						const value = parts[index + 1] || '';
						const label = part.trim();
						
						// If this is a valid label-value pair
						if (label && index + 1 < parts.length) {
							return (
								<div key={index} className="flex flex-col">
									<span className="font-medium text-gray-800">{label}:</span>
									<span className="text-gray-700 pl-4">{value}</span>
								</div>
							);
						}
						
						// Just output the text if not a label-value pair
						return <span key={index}>{part}</span>;
					})}
				</div>
			);
		}
		
		return text;
	};

	const renderCoverSheetTable = () => {
		if (!jsonData) return null;

		return (
			<div className="overflow-x-auto">
				<h1 className="text-xl font-bold mb-6 text-center">RFP Cover Sheet</h1>
				<table className="w-full border-collapse shadow-sm">
					<tbody>
						{Object.entries(jsonData).map(([section, content]) => {
							// Format the section name nicely
							const formattedSectionName = section
								.replace(/([A-Z])/g, ' $1')
								.replace(/^./, str => str.toUpperCase());
							
							// Generate rows for this section
							const rows = [];
							
							// Add section header
							rows.push(
								<tr key={`section-${section}`}>
									<td 
										colSpan={2} 
										className="bg-blue-50 p-3 font-bold text-blue-700"
									>
										{formattedSectionName.toUpperCase()}
									</td>
								</tr>
							);
							
							// Add the fields and values
							Object.entries(content).forEach(([key, value]) => {
								// Handle empty values
								const displayValue = value || "N/A";
								
								// Check if value contains semicolons (potential list)
								if (typeof displayValue === 'string' && displayValue.includes(';')) {
									const items = displayValue.split(';').map(item => item.trim()).filter(Boolean);
									
									// First item with label
									rows.push(
										<tr key={`${section}-${key}`} className="border-b border-gray-200">
											<td className="p-4 border border-gray-300 font-medium text-gray-900 align-top" rowSpan={items.length}>
												{key}
											</td>
											<td className="p-4 border border-gray-300 text-gray-700">
												{formatValueWithLabels(items[0])}
											</td>
										</tr>
									);
									
									// Subsequent items without label (using a slightly different style)
									items.slice(1).forEach((item, index) => {
										rows.push(
											<tr key={`${section}-${key}-${index}`} className="border-b border-gray-200 bg-white">
												<td className="p-4 border border-gray-300 text-gray-700 border-t-0">
													{formatValueWithLabels(item)}
												</td>
											</tr>
										);
									});
								} else {
									// Regular single-value field
									rows.push(
										<tr key={`${section}-${key}`} className="border-b border-gray-200">
											<td className="p-4 border border-gray-300 font-medium text-gray-900 w-1/3">
												{key}
											</td>
											<td className="p-4 border border-gray-300 text-gray-700 whitespace-pre-wrap">
												{formatValueWithLabels(displayValue)}
											</td>
										</tr>
									);
								}
							});
							
							// Add an empty row after each section
							rows.push(
								<tr key={`section-${section}-spacer`} className="h-4 bg-gray-50/30">
									<td colSpan={2} className="p-1"></td>
								</tr>
							);
							
							return rows;
						})}
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
					</div>
				</ModalHeader>
				<ModalBody className="flex gap-4 overflow-x-hidden pb-40">
					{documentType === "coverSheet" && (
						<div className="w-full">
							{renderCoverSheetTable()}
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
							onPress={handleDownload}
							className="font-semibold"
							isLoading={downloadLoading}
						>
							{downloadLoading ? "Generating..." : (documentType === "coverSheet" ? "Download as Excel" : "Download Document")}
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
