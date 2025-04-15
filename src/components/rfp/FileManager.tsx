"use client";

import { useEffect, useState, useCallback } from "react";
import { File } from "@/types";
import FileList from "./FileList";
import FileViewer from "./FileViewer";
import { fetchAllDocuments, parseExternalFile, saveDocument } from "@/services/documentService";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";

// Define the document type
interface Document {
	id: number;
	name: string;
	content: string;
}

export default function RFPFiles({ files }: { files: File[] }) {
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [documentId, setDocumentId] = useState<string>("");
  const [showFolderContent, setShowFolderContent] = useState<boolean>(false);

	// Memoize the document loading function
	const loadDocuments = useCallback(async (): Promise<Document[]> => {
		try {
			const documents = await fetchAllDocuments();
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
			// First ensure we have the latest documents
			const documents = await loadDocuments();
			
			// Check if the document already exists in our database
			const documentExists = documents.find((doc: Document) => doc.name === file.name);
			
			if (documentExists && documentExists.content) {
				setContent(documentExists.content);
				setDocumentId(documentExists.id.toString());
			} else {
				const parsedContent = await parseExternalFile(file.key);
				
				setContent(parsedContent);
				
				const newDocument = await saveDocument({
					name: file.name,
					content: parsedContent,
				});
				
				setDocumentId(newDocument.id.toString());
			}
		} catch (error) {
			console.error("Error processing file:", error);
		} finally {
			setIsLoading(false);
			setIsModalOpen(true);
		}
	}, [loadDocuments]);

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
          <p className="font-medium text-gray-700 text-base sm:text-sm">RFP Files</p>
        </div>
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showFolderContent ? 'max-h-[80vh] sm:max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="mt-2 sm:mt-4 border-t pt-2 sm:pt-4">
            <FileList 
              files={files} 
              isLoading={isLoading} 
              onFileSelect={handleFileSelect} 
            />
          </div>
        </div>
      </section>
			
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
