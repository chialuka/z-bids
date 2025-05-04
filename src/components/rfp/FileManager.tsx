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
	}>({
		isProcessing: false,
		isComplete: false,
		error: null
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
		if (shouldProcessFiles) {
			const processFiles = async () => {
				try {
					setProcessingStatus((prev) => ({ ...prev, isProcessing: true }));
					const response = await fetch('/api/process-files');
					
					if (!response.ok) {
						throw new Error('Failed to process files');
					}
					
					const data = await response.json();
					
					if (!data.success) {
						throw new Error(data.error || 'Failed to process files');
					}
					
					setProcessingStatus((prev) => ({ ...prev, isComplete: true }));
					
					// Refresh documents after processing
					// Commenting out to avoid typing issues - can be reimplemented if needed
					// const updatedDocuments = await fetchAllDocuments();
				} catch (err) {
					console.error('Error processing files:', err);
					setProcessingStatus((prev) => ({
						...prev,
						error: err instanceof Error ? err.message : 'Failed to process files'
					}));
				} finally {
					setProcessingStatus((prev) => ({ ...prev, isProcessing: false }));
				}
			};

			processFiles();
		}
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
					Processing new files, please wait...
				</div>
			)}
			
			{processingStatus.error && (
				<div className="mb-4 p-3 bg-red-50 rounded-md text-red-700">
					{processingStatus.error}
				</div>
			)}
			
			{processingStatus.isComplete && !processingStatus.error && (
				<div className="mb-4 p-3 bg-green-50 rounded-md text-green-700 animate-fade-out">
					Files processed successfully
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
