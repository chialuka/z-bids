"use client";

import { useEffect, useState, useCallback } from "react";
import { Document, File, Folder } from "@/types";
import FileList from "./FileList";
import FileViewer from "./FileViewer";
import {
	fetchAllDocuments,
	fetchAllFolders,
	parseExternalFile,
	saveDocument,
} from "@/services/documentService";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";

export default function RFPFiles({ files }: { files: File[] }) {
	const [shownContent, setShownContent] = useState<string>("");
	// const [pdfContent, setPdfContent] = useState<string>("");
	// const [complianceMatrix, setComplianceMatrix] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [documentId, setDocumentId] = useState<string>("");
	const [showFolderContent, setShowFolderContent] = useState<boolean>(false);
	const [allDocuments, setAllDocuments] = useState<Document[]>([]);
	const [allFolders, setAllFolders] = useState<Folder[]>([]);
	const [documentType, setDocumentType] = useState<
		"coverSheet" | "pdfContent" | "complianceMatrix"
	>("coverSheet");
	console.log({ files });
	// Memoize the document loading function
	const loadDocuments = useCallback(async (): Promise<Document[]> => {
		try {
			const [documents, folders] = await Promise.all([
				fetchAllDocuments(),
				fetchAllFolders(),
			]);
			setAllFolders(folders);
			const filesNotInDatabase = files.filter(
				(file) =>
					!documents.some((doc: { name: string }) => doc.name === file.name)
			);
			console.log(
				"Files not in database:",
				filesNotInDatabase.map((f) => f.name)
			);
			if (filesNotInDatabase.length) {
				await Promise.all(
					filesNotInDatabase.map(async (file) => {
						console.log("Saving file from loadDocuments:", file.name);
						const parsedContent = await parseExternalFile(file.key);
						console.log({ parsedContent });
						// Save the document only once
						await saveDocument({
							name: file.name,
							coverSheet: parsedContent.sanitizedContent,
							description: parsedContent.summary.summary,
							dueDate: parsedContent.summary.dueDate,
							pdfContent: parsedContent.pdfContent,
							complianceMatrix: parsedContent.complianceMatrix,
						});
					})
				);
			}
			return documents;
		} catch (error) {
			console.error("Error fetching documents:", error);
			return [];
		}
	}, [files]);

	// Load documents on initial mount only
	useEffect(() => {
		loadDocuments().then((documents) => {
			setAllDocuments(documents);
		});
	}, [loadDocuments]);

	// Handle document saving with immediate updates
	const handleSaveDocument = useCallback(
		async (id: string, name: string, updatedContent: string) => {
			try {
				console.log("handleSaveDocument called for:", name);
				// First update the UI optimistically
				setShownContent(updatedContent);

				// Then save to the database
				await saveDocument({
					id,
					name,
					coverSheet: updatedContent,
					// description: fullSummary.summary,
					// dueDate: fullSummary.dueDate,
				});

				// We don't need to refresh the entire documents list here
				// as we've already saved the document directly
				// This was causing double-saving in some cases
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
				const documents = await fetchAllDocuments();
				console.log(
					"Documents fetched in handleFileSelect:",
					documents.map((d: Document) => d.name)
				);

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
							files={allDocuments}
							isLoading={isLoading}
							onFileSelect={handleFileSelect}
							folders={allFolders}
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
