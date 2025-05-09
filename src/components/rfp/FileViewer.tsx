import React, { useState, useEffect } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
} from "@heroui/react";
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

	/**
	 * Renders a formatted summary section for the compliance matrix
	 */
	const renderComplianceMatrixSummary = (summaryText: string) => {
		// Format the summary nicely
		const formattedSummary = summaryText
			// Remove hash symbols and "Summary" text
			.replace(/^#\s*(Final Vendor Requirements Table)\s*#{1,2}\s*(Summary)?(Information)?/i, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
			// Format section titles
			.replace(/#{1,2}\s*([^#\n]+)/g, '<h2 class="text-xl font-semibold my-3">$1</h2>')
			// Format bold text
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			// Format bullet points with proper spacing and styling
			.replace(/• (.*?)(\n• |$)/g, '<li class="mb-2">$1</li>')
			.replace(/\n- (.*?)(\n- |\n\n|$)/g, '<li class="mb-2">$1</li>')
			// Format numbers to be bold
			.replace(/(\d+)(\s+requirements|\s+requirement)/g, '<span class="font-semibold">$1</span>$2')
			// Wrap lists in proper list elements
			.replace(/<li class="mb-2">(.*?)<\/li>/g, function(match) {
				return '<ul class="list-disc pl-5 space-y-2 my-3">' + match + '</ul>';
			})
			// Remove duplicate lists
			.replace(/<\/ul>\s*<ul class="list-disc pl-5 space-y-2 my-3">/g, '');
			
		return (
			<div className="compliance-summary mb-8 leading-relaxed bg-white rounded-lg p-5 shadow-sm">
				<div dangerouslySetInnerHTML={{ __html: formattedSummary }} />
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
					{documentType === "pdfContent" && (
						<div className="w-full text-gray-800 overflow-x-auto">
							<div dangerouslySetInnerHTML={{ __html: documentContent }} />
						</div>
					)}
					{documentType === "complianceMatrix" && (
						<div className="w-full overflow-x-auto">
							<div className="font-sans max-w-full mx-auto text-gray-800 p-4">
								{(() => {
									try {
										// First, check if this is a properly formatted markdown table with newlines
										if (documentContent && 
											(documentContent.includes("\n| Page | Section |") || 
											 documentContent.includes("\n|------|") || 
											 documentContent.includes("\n| --- | --- |"))) {
											
											// This is a proper markdown table with newlines
											const parts = documentContent.split(/(?=\n\|[\s-]*Page[\s-]*\|)/i);
											const summaryText = parts[0] || "";
											
											// Extract table data - find all rows that start with | and contain |
											const tableRows = documentContent
												.split('\n')
												.filter(line => line.trim().startsWith('|') && line.includes('|'));
											
											if (tableRows.length < 3) {
												return <div dangerouslySetInnerHTML={{ __html: documentContent }} />;
											}
											
											// Parse header and data rows
											const headerRow = tableRows[0];
											// const separatorRow = tableRows[1]; // Row with |---|---|--- pattern - not needed for rendering
											const dataRows = tableRows.slice(2); // Skip header and separator rows
											
											// Extract headers
											const headers = headerRow.split('|')
												.filter(cell => cell.trim())
												.map(cell => cell.trim());
											
											return (
												<>
													{renderComplianceMatrixSummary(summaryText)}
													
													<h2 className="text-xl font-semibold mb-4 text-gray-800">Comprehensive Vendor Requirements Table</h2>
													
													<div className="overflow-x-auto mb-8 rounded-lg shadow">
														<table className="w-full border-collapse border-spacing-0 text-sm">
															<thead>
																<tr>
																	{headers.map((header, index) => (
																		<th 
																			key={index}
																			className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0"
																			style={{
																				width: index === 0 ? '5%' : 
																					  index === 1 ? '15%' : 
																					  index === 2 ? '30%' :
																					  index === 6 ? '20%' : 'auto'
																			}}
																		>
																			{header}
																		</th>
																	))}
																</tr>
															</thead>
															<tbody>
																{dataRows.map((row, rowIndex) => {
																	const cells = row.split('|')
																		.map(cell => cell.trim())
																		.filter((cell, index) => index > 0); // Skip the first empty cell before the first |
																	
																	// Skip rows that don't have enough cells
																	if (cells.length < 3) return null;
																	
																	return (
																		<tr 
																			key={rowIndex} 
																			className={`${rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
																		>
																			{cells.map((cell, cellIndex) => {
																				// Special styling for Human Review Flag column (should be the last column)
																				const isYesReview = cellIndex === headers.length - 1 && 
																					   (cell.startsWith('Yes') || cell.includes('Yes -'));
																				
																				return (
																					<td 
																						key={cellIndex} 
																						className={`p-3 border-b border-gray-200 align-top ${isYesReview ? 'text-red-700 font-medium' : ''}`}
																					>
																						{cell}
																					</td>
																				);
																			})}
																		</tr>
																	);
																}).filter(Boolean)}
															</tbody>
														</table>
													</div>
												</>
											);
										}
										
										// Special case for the one-line format with pipe characters
										if (documentContent && documentContent.includes("|") && !documentContent.includes("\n|")) {
											// Extract the summary (everything before the first pipe sequence)
											const parts = documentContent.split(/(?=\|\s*Page\s*\|)/i);
											const summaryText = parts[0] || "";
											
											// Try to find table headers
											const headerMatch = documentContent.match(/\|\s*Page\s*\|\s*Section\s*\|\s*Requirement Text\s*\|\s*Obligation Verb\s*\|\s*Obligation Level\s*\|\s*Cross-References\s*\|\s*Human Review Flag\s*\|/i);
											
											if (!headerMatch) {
												// No standard headers found, just render as-is with nice formatting
												return (
													<>
														{renderComplianceMatrixSummary(summaryText)}
														<pre className="whitespace-pre-wrap text-sm p-4 bg-gray-50 rounded-lg border border-gray-200">
															{documentContent}
														</pre>
													</>
												);
											}
											
											// Regular expression to find each row
											// Looking for patterns like | number | text | text | text | text | text | text |
											const rowRegex = /\|\s*(\d+(?:\.\d+)?)\s*\|\s*([^|]+)\s*\|\s*("[^"]+"|\S[^|]*)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*([^|]*)\s*\|\s*([^|]*)\s*\|/g;
											
											const matches = [];
											let match;
											
											// Find all matches in the content
											while ((match = rowRegex.exec(documentContent)) !== null) {
												matches.push({
													page: match[1].trim(),
													section: match[2].trim(),
													requirement: match[3].trim(),
													verb: match[4].trim(),
													level: match[5].trim(),
													references: match[6].trim(),
													reviewFlag: match[7].trim()
												});
											}
											
											// If the regex didn't find anything, fall back to a simpler approach
											if (matches.length === 0) {
												// For the one-line format fallback approach
												const allCells = documentContent
													.split('|')
													.map(cell => cell.trim())
													.filter((cell, index) => index > 0 && cell && !cell.includes('-----')); // Skip the first empty cell and filter out separators
												
												// Find where the table starts - look for "Page"
												let tableStartIndex = allCells.findIndex(cell => 
													cell.toLowerCase() === 'page' || 
													cell.match(/^page$/i)
												);

												if (tableStartIndex === -1) tableStartIndex = 0;

												// Group the remaining cells into rows
												const tableRows: string[][] = [];
												for (let i = tableStartIndex + 7; i < allCells.length; i += 7) {
													if (i + 7 <= allCells.length) {
														tableRows.push(allCells.slice(i, i + 7));
													}
												}
												
												return (
													<>
														{renderComplianceMatrixSummary(summaryText)}
														
														<h2 className="text-xl font-semibold mb-4 text-gray-800">Consolidated Vendor Requirements Table</h2>
														
														<div className="overflow-x-auto mb-8 rounded-lg shadow">
															<table className="w-full border-collapse border-spacing-0 text-sm">
																<thead>
																	<tr>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[5%]">Page</th>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[15%]">Section</th>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[30%]">Requirement Text</th>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0">Obligation Verb</th>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0">Obligation Level</th>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0">Cross-References</th>
																		<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[20%]">Human Review Flag</th>
																	</tr>
																</thead>
																<tbody>
																	{tableRows.map((row, rowIndex) => (
																		<tr 
																			key={rowIndex} 
																			className={`${rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
																		>
																			{row.map((cell, cellIndex) => {
																				// Special styling for Human Review Flag column
																				const isYesReview = cellIndex === 6 && cell.includes("Yes");
																				
																				return (
																					<td 
																						key={cellIndex} 
																						className={`p-3 border-b border-gray-200 align-top ${isYesReview ? 'text-red-700 font-medium' : ''}`}
																					>
																						{cell}
																					</td>
																				);
																			})}
																		</tr>
																	))}
																</tbody>
															</table>
														</div>
													</>
												);
											}
											
											// Use the regex matches to render a proper table
											return (
												<>
													{renderComplianceMatrixSummary(summaryText)}
													
													<h2 className="text-xl font-semibold mb-4 text-gray-800">Consolidated Vendor Requirements Table</h2>
													
													<div className="overflow-x-auto mb-8 rounded-lg shadow">
														<table className="w-full border-collapse border-spacing-0 text-sm">
															<thead>
																<tr>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[5%]">Page</th>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[15%]">Section</th>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[30%]">Requirement Text</th>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0">Obligation Verb</th>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0">Obligation Level</th>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0">Cross-References</th>
																	<th className="bg-gray-100 text-gray-800 font-semibold text-left p-3 border-b border-gray-200 sticky top-0 w-[20%]">Human Review Flag</th>
																</tr>
															</thead>
															<tbody>
																{matches.map((row, rowIndex) => (
																	<tr 
																		key={rowIndex} 
																		className={`${rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}
																	>
																		<td className="p-3 border-b border-gray-200 align-top">{row.page}</td>
																		<td className="p-3 border-b border-gray-200 align-top">{row.section}</td>
																		<td className="p-3 border-b border-gray-200 align-top">{row.requirement}</td>
																		<td className="p-3 border-b border-gray-200 align-top">{row.verb}</td>
																		<td className="p-3 border-b border-gray-200 align-top">{row.level}</td>
																		<td className="p-3 border-b border-gray-200 align-top">{row.references}</td>
																		<td className={`p-3 border-b border-gray-200 align-top ${row.reviewFlag.includes("Yes") ? 'text-red-700 font-medium' : ''}`}>{row.reviewFlag}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</>
											);
										}
										
										// If none of our specialized parsers worked, fall back to default rendering
										return (
											<div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
												{documentContent}
											</div>
										);
									} catch (error) {
										console.error("Error parsing compliance matrix:", error);
										// If all else fails, render the content as-is with pre-wrap
										return (
											<div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-200">
												{documentContent}
											</div>
										);
									}
								})()}
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
