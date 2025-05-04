import { Folder } from "@/types";
import DOMPurify from "dompurify";

interface DocumentData {
	id?: string;
	name: string;
	coverSheet?: string;
	pdfContent?: string;
	complianceMatrix?: string;
	description?: string;
	dueDate?: string;
}

/**
 * Fetches all documents from the database
 */
export async function fetchAllDocuments() {
	try {
		const response = await fetch(`/api/supabase/documents`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json() as { allDocuments: Document[] };
		return data.allDocuments;
	} catch (error) {
		console.error("Error fetching documents:", error);
		return [];
	}
}

export async function fetchAllFolders() {
	try {
		const response = await fetch(`/api/supabase/folders`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json() as { allFolders: Folder[] };
		return data.allFolders;
	} catch (error) {
		console.error("Error fetching folders:", error);
		return [];
	}
}

/**
 * Searches within a document using AI
 * @param searchTerm - The term to search for
 * @param documentContent - The content to search within
 */
export async function searchDocument(
	searchTerm: string,
	documentContent: string
) {
	const response = await fetch("/api/chat", {
		method: "POST",
		body: JSON.stringify({
			messages: {
				searchTerm,
				document: documentContent,
			},
		}),
	});

	const data = await response.json() as { data: string };
	return DOMPurify.sanitize(data.data);
}

/**
 * Saves a document to the database
 * @param document - The document data to save
 */
export async function saveDocument(document: DocumentData) {
	try {
		console.log("Saving document:", document);
		const response = await fetch("/api/supabase/documents", {
			method: document.id ? "PATCH" : "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(document),
		});

		const data = await response.json() as { newDocument: {id: string} };
		console.log("Successfully saved document:", data);
		return document.id ? { ...document, id: document.id } : data.newDocument;
	} catch (error) {
		console.error("Error saving document:", error);
		throw error;
	}
}

/**
 * Parses a file from an external source
 * @param fileKey - The key of the file to parse
 */
export async function parseExternalFile(fileKey: string) {
	try {
		const response = await fetch(`/api/reducto`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				documentUrl: `https://pa6rt2x38u.ufs.sh/f/${fileKey}`,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to parse file: ${response.statusText}`);
		}

		const data = await response.json();
		console.log({ data });

		return data;
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		console.error(`Parsing failed for file ${fileKey}:`, errorMessage);
	}
}
