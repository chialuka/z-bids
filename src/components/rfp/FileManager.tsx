"use client";

import { useEffect, useState, useCallback } from "react";
import { File } from "@/types";
import { documentsTable } from "@/server/db/schema";
import FileList from "./FileList";
import FileViewer from "./FileViewer";
import { fetchAllDocuments, parseExternalFile, saveDocument } from "@/services/documentService";

export default function RFPFiles({ files }: { files: File[] }) {
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [documentId, setDocumentId] = useState<string>("");
	const [allDocuments, setAllDocuments] = useState<
		(typeof documentsTable.$inferSelect)[]
	>([]);

	// Memoize the document loading function
	const loadDocuments = useCallback(async () => {
		try {
			const documents = await fetchAllDocuments();
			setAllDocuments(documents);
			return documents;
		} catch (error) {
			console.error("Error fetching documents:", error);
			return [];
		}
	}, []);

	// Load documents on initial mount
	useEffect(() => {
		loadDocuments();
	}, [loadDocuments]);

	// Handle document saving with immediate updates
	const handleSaveDocument = useCallback(async (id: string, name: string, updatedContent: string) => {
		try {
			// First update the UI optimistically
			setContent(updatedContent);
			
			// Then save to the database
			await saveDocument({ id, name, content: updatedContent });
			
			// Finally, refresh the documents list to ensure consistency
			await loadDocuments();
		} catch (error) {
			console.error("Error saving document:", error);
		}
	}, [loadDocuments]);

	const handleFileSelect = useCallback(async (file: File) => {
		setOpenFileName(file.name);
		setIsLoading(true);
		
		try {
			// Check if the document already exists in our database
			const documentExists = allDocuments?.find((doc) => doc.name === file.name);
			
			if (documentExists && documentExists.content) {
				// Use the existing document
				setContent(documentExists.content);
				setDocumentId(documentExists.id.toString());
			} else {
				// Parse the file from external source
				const parsedContent = await parseExternalFile(file.key);
				setContent(parsedContent);
				
				// Create a new document entry in the database
				const newDocumentResponse = await fetch("/api/supabase", {
					method: "POST",
					body: JSON.stringify({
						name: file.name,
						content: parsedContent,
					}),
				});
				
				const newDocument = await newDocumentResponse.json();
				setDocumentId(newDocument.id);
				
				// Refresh documents to include the new one
				await loadDocuments();
			}
		} catch (error) {
			console.error("Error processing file:", error);
		} finally {
			setIsLoading(false);
			setIsModalOpen(true);
		}
	}, [allDocuments, loadDocuments]);

	return (
		<section>
			<FileList 
				files={files} 
				isLoading={isLoading} 
				onFileSelect={handleFileSelect} 
			/>
			
			<FileViewer
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				fileName={openFileName}
				documentId={documentId}
				documentContent={content}
				onSaveDocument={handleSaveDocument}
			/>
		</section>
	);
}
