"use client";

import { useState, useCallback, useEffect } from "react";
import { Document, Folder } from "@/types";
import FileList from "./FileList";
import FileViewer from "./FileViewer";
import {
	fetchAllDocuments,
	// fetchAllFolders,
	parseExternalFile,
	saveDocument,
} from "@/services/document";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";

interface FileManagerProps {
	// files: File[];
	initialDocuments: Document[];
	initialFolders: Folder[];
	shouldProcessFiles?: boolean;
}

export default function RFPFiles({ initialDocuments, initialFolders, shouldProcessFiles = false }: FileManagerProps) {
	const [shownContent, setShownContent] = useState<string>("");
	// const [pdfContent, setPdfContent] = useState<string>("");
	// const [complianceMatrix, setComplianceMatrix] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [documentId, setDocumentId] = useState<string>("");
	const [showFolderContent, setShowFolderContent] = useState<boolean>(false);
	// const [allDocuments, setAllDocuments] = useState<Document[]>(initialDocuments);
	// const [allFolders] = useState<Folder[]>(initialFolders);
	const [documentType, setDocumentType] = useState<
		"coverSheet" | "pdfContent" | "complianceMatrix"
	>("coverSheet");
	const [processingStatus, setProcessingStatus] = useState<{
		isProcessing: boolean;
		isComplete: boolean;
		error: string | null;
		message: string;
		processedCount: number;
		remainingCount: number;
	}>({
		isProcessing: false,
		isComplete: false,
		error: null,
		message: "",
		processedCount: 0,
		remainingCount: 0
	});

	// Auto-hide success message after 3 seconds
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (processingStatus.isComplete && !processingStatus.error) {
			timer = setTimeout(() => {
				setProcessingStatus(prev => ({ ...prev, isComplete: false }));
			}, 3000);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [processingStatus.isComplete, processingStatus.error]);

	// Process files when component mounts if shouldProcessFiles is true
	useEffect(() => {
		if (!shouldProcessFiles) return;
		
		let isMounted = true;
		
		const processFiles = async () => {
			try {
				if (!isMounted) return;
				
				setProcessingStatus((prev) => ({ 
					...prev, 
					isProcessing: true,
					message: prev.processedCount > 0 
						? `Processed ${prev.processedCount} files. Processing next file...` 
						: "Processing files..."
				}));
				
				const response = await fetch('/api/process-files');
				
				if (!response.ok) {
					throw new Error('Failed to process files');
				}
				
				const data = await response.json();
				
				if (!data.success) {
					throw new Error(data.error || 'Failed to process files');
				}

				// If no more files to process, mark as complete
				if (!data.processedFile || data.remainingFiles === 0) {
					if (isMounted) {
						setProcessingStatus((prev) => ({
							...prev,
							isProcessing: false,
							isComplete: true,
							message: data.processedFile 
								? `Processed file ${data.processedFile}. All files processed.` 
								: "No files needed processing.",
							processedCount: prev.processedCount + (data.processedFile ? 1 : 0),
							remainingCount: 0
						}));
					}
				} else {
					// Update status with processed file info
					if (isMounted) {
						setProcessingStatus((prev) => ({
							...prev,
							message: `Processed file ${data.processedFile}. ${data.remainingFiles} files remaining.`,
							processedCount: prev.processedCount + 1,
							remainingCount: data.remainingFiles
						}));
						
						// Continue processing if more files exist
						processFiles();
					}
				}
			} catch (err) {
				console.error('Error processing files:', err);
				if (isMounted) {
					setProcessingStatus((prev) => ({
						...prev,
						isProcessing: false,
						error: err instanceof Error ? err.message : 'Failed to process files'
					}));
				}
			}
		};

		// Start processing files sequentially
		processFiles();
		
		return () => {
			isMounted = false;
		};
	}, [shouldProcessFiles]);

	// Handle document saving with immediate updates
	const handleSaveDocument = useCallback(
		async (id: string, name: string, updatedContent: string) => {
			try {
				console.log("handleSaveDocument called for:", name);
				setShownContent(updatedContent);
				await saveDocument({
					id,
					name,
					coverSheet: updatedContent,
				});
			} catch (error) {
				console.error("Error saving document:", error);
			}
		},
		[]
	);

	const handleFileSelect = useCallback(
		async (
			file: Document,
			contentType: "coverSheet" | "pdfContent" | "complianceMatrix"
		) => {
			console.log("handleFileSelect called for:", file.name);
			setOpenFileName(file.name);
			setIsLoading(true);

			try {
				// First ensure we have the latest documents
				const fetchedDocs = await fetchAllDocuments();
				const documents = fetchedDocs as unknown as Document[];

				// Check if the document already exists in our database
				const documentExists = documents.find(
					(doc: Document) => doc.name === file.name
				);

				if (documentExists) {
					const content = {
						coverSheet: documentExists.coverSheet,
						pdfContent: documentExists.pdfContent,
						complianceMatrix: documentExists.complianceMatrix,
					};
					console.log("Document exists, using existing content:", file.name);
					setShownContent(content[contentType]);
					setDocumentId(documentExists.id.toString());
					setDocumentType(contentType);
				} else {
					console.log("Document doesn't exist, parsing and saving:", file.name);
					const parsedContent = await parseExternalFile(file.name);

					setShownContent(parsedContent.sanitizedContent);

					// Save the document only once
					const newDocument = await saveDocument({
						name: file.name,
						coverSheet: parsedContent.sanitizedContent,
						description: parsedContent.summary.summary,
						dueDate: parsedContent.summary.dueDate,
						pdfContent: parsedContent.pdfContent,
						complianceMatrix: parsedContent.complianceMatrix,
					});

					setDocumentId(newDocument.id.toString());
				}
			} catch (error) {
				console.error("Error processing file:", error);
			} finally {
				setIsLoading(false);
				setIsModalOpen(true);
			}
		},
		[]
	);

	return (
		<section>
			{processingStatus.isProcessing && (
				<div className="mb-4 p-3 bg-blue-50 rounded-md text-blue-700">
					{processingStatus.message || "Processing files..."}
					{processingStatus.processedCount > 0 && (
						<div className="text-xs mt-1">
							Processed: {processingStatus.processedCount}, Remaining: {processingStatus.remainingCount}
						</div>
					)}
				</div>
			)}
			
			{processingStatus.error && (
				<div className="mb-4 p-3 bg-red-50 rounded-md text-red-700">
					{processingStatus.error}
				</div>
			)}
			
			{processingStatus.isComplete && !processingStatus.error && (
				<div className="mb-4 p-3 bg-green-50 rounded-md text-green-700 animate-fade-out">
					{processingStatus.message || "Files processed successfully"}
				</div>
			)}
			
			<section className="border rounded-lg p-1 sm:p-4 bg-white shadow-sm">
				<div
					onClick={() => setShowFolderContent(!showFolderContent)}
					className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 sm:p-2 rounded-md transition-colors touch-manipulation"
				>
					{showFolderContent ? (
						<OpenFolderIcon className="text-blue-500 transition-transform duration-500 w-6 h-6 sm:w-5 sm:h-5" />
					) : (
						<ClosedFolderIcon className="text-blue-500 transition-transform duration-500 w-6 h-6 sm:w-5 sm:h-5" />
					)}
					<p className="font-medium text-gray-700 text-base sm:text-sm">
						RFP Files
					</p>
				</div>
				<div
					className={`${showFolderContent ? "opacity-100" : "h-0 opacity-0"}`}
				>
					<div className="h-full">
						<FileList
							files={initialDocuments}
							isLoading={isLoading}
							onFileSelect={handleFileSelect}
							folders={initialFolders}
						/>
					</div>
				</div>
			</section>

			<FileViewer
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				fileName={openFileName}
				documentId={documentId}
				documentContent={shownContent}
				onSaveDocument={handleSaveDocument}
				documentType={documentType}
			/>
		</section>
	);
}
