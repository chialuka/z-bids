"use client";

import { useState, useCallback, useEffect } from "react";
import { Document, Folder } from "@/types";
import FileList from "./FileList";
import FileViewer from "./FileViewer";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
	fetchAllDocuments,
	parseExternalFile,
	saveDocument,
} from "@/services/document";
import { OpenFolderIcon } from "../icons/OpenFolderIcon";
import { ClosedFolderIcon } from "../icons/ClosedFolderIcon";
interface FileManagerProps {
	initialDocuments: Document[];
	initialFolders: Folder[];
}

export default function RFPFiles({
	initialDocuments,
	initialFolders,
}: FileManagerProps) {
	const [shownContent, setShownContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [openFileName, setOpenFileName] = useState<string>("");
	const [folders, setFolders] = useState<Folder[]>(initialFolders);
	const [documents, setDocuments] = useState<Document[]>(initialDocuments);
	const [showNewFolderInput, setShowNewFolderInput] = useState<boolean>(false);
	const [newFolderName, setNewFolderName] = useState<string>("");
	const [showFolderContent, setShowFolderContent] = useState<boolean>(false);
	const [documentType, setDocumentType] = useState<
		"coverSheet" | "pdfContent" | "complianceMatrix" | "feasibilityCheck"
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
		remainingCount: 0,
	});
	const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

	// Auto-hide success message after 3 seconds
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (processingStatus.isComplete && !processingStatus.error) {
			timer = setTimeout(() => {
				setProcessingStatus((prev) => ({ ...prev, isComplete: false }));
			}, 3000);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [processingStatus.isComplete, processingStatus.error]);

	useEffect(() => {
		let isMounted = true;

		const processFiles = async () => {
			try {
				if (!isMounted) return;

				setProcessingStatus((prev) => ({
					...prev,
					isProcessing: true,
					message:
						prev.processedCount > 0
							? `Processed ${prev.processedCount} files. Processing next file...`
							: "Processing files...",
				}));

				const response = await fetch("/api/process-files");

				if (!response.ok) {
					throw new Error("Failed to process files");
				}

				const data = await response.json();

				if (!data.success) {
					throw new Error(data.error || "Failed to process files");
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
							processedCount:
								prev.processedCount + (data.processedFile ? 1 : 0),
							remainingCount: 0,
						}));
					}
				} else {
					// Update status with processed file info
					if (isMounted) {
						setProcessingStatus((prev) => ({
							...prev,
							message: `Processed file ${data.processedFile}. ${data.remainingFiles} files remaining.`,
							processedCount: prev.processedCount + 1,
							remainingCount: data.remainingFiles,
						}));

						// Continue processing if more files exist
						processFiles();
					}
				}
			} catch (err) {
				console.error("Error processing files:", err);
				if (isMounted) {
					setProcessingStatus((prev) => ({
						...prev,
						isProcessing: false,
						error:
							err instanceof Error ? err.message : "Failed to process files",
					}));
				}
			}
		};

		// Start processing files sequentially
		processFiles();

		return () => {
			isMounted = false;
		};
	}, []);

  const addNewFolder = async ({ name }: { name: string }) => {
    // Check if folder with same name already exists
    const folderExists = folders.some(folder => folder.name.toLowerCase() === name.toLowerCase());
    
    if (!folderExists) {
      const newFolder = {
        id: folders[folders.length - 1] ? folders[folders.length - 1].id + 1 : 1,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setFolders([...folders, newFolder]);
      const res = await fetch("/api/supabase/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (data.newFolder.id !== newFolder.id) {
        setFolders([...folders, data.newFolder[0]]);
      }
    }
  }

	// Function to move a file from one folder to another
	const moveFile = async (fileId: number, targetFolderId: number) => {
		try {
      console.log("moving file", fileId, targetFolderId);
			// Update local state
			const updatedDocuments = documents.map(doc => 
				doc.id === fileId ? { ...doc, folderId: targetFolderId } : doc
			);
			setDocuments(updatedDocuments);
			
			// Update in database
			const docToUpdate = documents.find(doc => doc.id === fileId);
			if (docToUpdate) {
				await fetch('/api/supabase/documents', {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: fileId,
						folderId: targetFolderId,
					}),
				});
			}
		} catch (error) {
			console.error('Error moving file:', error);
			// Revert the state change if the API call fails
			setDocuments([...documents]);
		}
	};

	// Handle document saving with immediate updates
	// const handleSaveDocument = useCallback(
	// 	async (id: string, name: string, updatedContent: string) => {
	// 		try {
	// 			console.log("handleSaveDocument called for:", name);
	// 			setShownContent(updatedContent);
	// 			await saveDocument({
	// 				id,
	// 				name,
	// 				coverSheet: updatedContent,
	// 			});
	// 		} catch (error) {
	// 			console.error("Error saving document:", error);
	// 		}
	// 	},
	// 	[]
	// );

	const handleFileSelect = useCallback(
		async (
			file: Document,
			contentType:
				| "coverSheet"
				| "pdfContent"
				| "complianceMatrix"
				| "feasibilityCheck"
		) => {
			console.log("handleFileSelect called for:", file.name, contentType);
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
						feasibilityCheck: documentExists.feasibilityCheck,
					};

					let value = content[contentType];
					if (!value && (contentType === "coverSheet" || contentType === "complianceMatrix" || contentType === "feasibilityCheck")) {
						const fetcherFunctions = {
							coverSheet: async () => {
								const res = await fetch("api/cover-sheet", {
									method: "POST",
									body: JSON.stringify({ document: documentExists.pdfContent, documentId: documentExists.id }),
								});
								const data = await res.json();
								return data.coverSheet;
							},
							complianceMatrix: async () => {
								const res = await fetch("api/compliance-matrix", {
									method: "POST",
									body: JSON.stringify({
										pdf_file_content: documentExists.pdfContent,
										document_id: documentExists.id,
									}),
								});
								const data = await res.json();
								return data.content;
							},
							feasibilityCheck: async () => {
								const res = await fetch("api/feasibility", {
									method: "POST",
									body: JSON.stringify({
										content: documentExists.pdfContent,
										document_id: documentExists.id,
									}),
								});
								const data = await res.json();
								return data.content;
							},
						};

						value = await fetcherFunctions[contentType]();
					}
          console.log({ value }, "the fetched value");
					setShownContent(value);
					setDocumentType(contentType);
				} else {
					console.log("Document doesn't exist, parsing and saving:", file.name);
					const parsedContent = await parseExternalFile(file.name);

					setShownContent(parsedContent.sanitizedContent);

					// Save the document only once
					await saveDocument({
						name: file.name,
						coverSheet: parsedContent.sanitizedContent,
						description: parsedContent.summary.summary,
						dueDate: parsedContent.summary.dueDate,
						pdfContent: parsedContent.pdfContent,
						complianceMatrix: parsedContent.complianceMatrix,
					});

					setDocumentType(contentType);
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

	// Add folder editing and deletion functions
	const editFolder = async (folderId: number, newName: string) => {
		try {
			// First update locally for immediate UI feedback
			const updatedFolders = folders.map(folder => 
				folder.id === folderId ? { ...folder, name: newName } : folder
			);
			setFolders(updatedFolders);
			
			// Then update on the server
			const res = await fetch("/api/supabase/folders", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: folderId, name: newName }),
			});
			
			const data = await res.json();
			console.log("Updated folder:", data);
		} catch (error) {
			console.error("Error updating folder:", error);
		}
	};

	const deleteFolder = async (folderId: number) => {
		// Open the confirmation dialog
		setFolderToDelete(folderId);
		setShowDeleteConfirm(true);
	};

	const confirmDeleteFolder = async () => {
		if (!folderToDelete) return;
		
		try {
			const folderId = folderToDelete;
			// Update files to remove folder association
			const updatedDocuments = documents.map(doc => 
				doc.folderId === folderId ? { ...doc, folderId: undefined } : doc
			);
			setDocuments(updatedDocuments);
			
			// Remove folder from state
			const updatedFolders = folders.filter(folder => folder.id !== folderId);
			setFolders(updatedFolders);
			
			// Update on the server
			const res = await fetch("/api/supabase/folders", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: folderId }),
			});
			
			const data = await res.json();
			console.log("Deleted folder:", data);
			
			// Update files in database to remove folder association
			const filesInFolder = documents.filter(doc => doc.folderId === folderId);
			
			for (const file of filesInFolder) {
				await fetch('/api/supabase/documents', {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: file.id,
						folderId: undefined,
					}),
				});
			}
		} catch (error) {
			console.error("Error deleting folder:", error);
		} finally {
			// Close the dialog
			setShowDeleteConfirm(false);
			setFolderToDelete(null);
		}
	};

	return (
		<section>
			{processingStatus.isProcessing && (
				<div className="mb-4 p-3 bg-blue-50 rounded-md text-blue-700">
					{processingStatus.message || "Processing files..."}
					{processingStatus.processedCount > 0 && (
						<div className="text-xs mt-1">
							Processed: {processingStatus.processedCount}, Remaining:{" "}
							{processingStatus.remainingCount}
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

			<DndProvider backend={HTML5Backend}>
				<section className="border rounded-lg p-1 sm:p-4 bg-white shadow-sm">
					<div className="flex items-center p-3 sm:p-2 rounded-md">
						<div
							onClick={() => setShowFolderContent(!showFolderContent)}
							className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md transition-colors touch-manipulation w-[95%]"
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
						<Dropdown>
							<DropdownTrigger>
								<Button isIconOnly variant="ghost" size="sm">
									<span className="sr-only">Open menu</span>
									<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem key="add" onPress={() => setShowNewFolderInput(true)}>
									Add New Folder
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
					{showNewFolderInput && (
						<div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center gap-2">
							<Input
								type="text"
								placeholder="New Folder Name"
								className="flex-1"
								value={newFolderName}
								onChange={(e) => setNewFolderName(e.target.value)}
							/>
							<Button 
								onPress={() => {
									if (newFolderName.trim()) {
										addNewFolder({ name: newFolderName });
										setNewFolderName("");
										setShowNewFolderInput(false);
									}
								}}
								variant="ghost"
								size="sm"
							>
								Add Folder
							</Button>
						</div>
					)}
					<div
						className={`${showFolderContent ? "opacity-100" : "h-0 opacity-0"}`}
					>
						<div className="h-full">
							<FileList
								files={documents}
								isLoading={isLoading}
								onFileSelect={handleFileSelect}
								folders={folders}
								onMoveFile={moveFile}
								onEditFolder={editFolder}
								onDeleteFolder={deleteFolder}
							/>
						</div>
					</div>
				</section>
			</DndProvider>

			<FileViewer
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				fileName={openFileName}
				documentContent={shownContent}
				documentType={documentType}
			/>

			{/* Delete Confirmation Modal */}
			<Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
				<ModalContent>
					<ModalHeader>
						<h3>Delete Folder</h3>
					</ModalHeader>
					<ModalBody>
						<p>Are you sure you want to delete this folder? Files inside will be moved to Uncategorized.</p>
					</ModalBody>
					<ModalFooter>
						<Button 
							color="danger" 
							variant="solid" 
							onPress={confirmDeleteFolder}
						>
							Delete
						</Button>
						<Button 
							variant="light" 
							onPress={() => setShowDeleteConfirm(false)}
						>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</section>
	);
}

