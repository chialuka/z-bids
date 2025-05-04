// import DOMPurify from "dompurify";
// import fetch from "node-fetch";
import { extractCoverSheet } from "@/server/modules/openai/generateCoverSheet";
import { generateSummary } from "@/server/modules/openai/generateSummary";

import { Document, File as UploadThingFile, Folder } from "@/types";
import { listAllUploadThingFiles } from "@/server/modules/uploadThing";
import { parseFile } from "@/server/modules/reducto";
interface DocumentData {
	id?: string;
	name: string;
	coverSheet?: string;
	pdfContent?: string;
	complianceMatrix?: string;
	description?: string;
	dueDate?: string;
}

const getBaseUrl = () => {
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return "http://localhost:3000";
};

/**
 * Fetches all documents from the database
 */
export async function fetchAllDocuments() {
	try {
		const response = await fetch(`${getBaseUrl()}/api/supabase/documents`);
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

/**
 * Parses a file from an external source
 * @param fileKey - The key of the file to parse
 */
export async function parseExternalFile(fileKey: string) {
	try {
		const document = await parseFile({
			documentUrl: `https://pa6rt2x38u.ufs.sh/f/${fileKey}`,
		});
		if (
			typeof document === "object" &&
			document !== null &&
			"data" in document
		) {
			const content = document.data.result.chunks
				.map((chunk: { blocks: Array<{ content: string }> }) =>
					chunk.blocks.map((block) => block.content).join("")
				)
				.join("");

			return content;
		}
	} catch (error) {
		console.error(error);
		return error;
	}
}

export async function generateRFPAnalysis({
	pdfContent,
}: {
	pdfContent: string;
}) {
	const [coverSheet, summary] = await Promise.all([
		extractCoverSheet({
			document: pdfContent,
		}),
		generateSummary({ document: pdfContent }),
	]);
	// // Ensure summary is properly formatted
	// let summary = data.data.summary;
	let finalSummary;

	// If summary is a string, try to parse it as JSON
	if (typeof summary === "string") {
		try {
			// Remove any markdown code block formatting if present
			const cleanedSummary = summary.replace(/```json\s*|\s*```/g, "").trim();
			finalSummary = JSON.parse(cleanedSummary);
		} catch (error) {
			console.error("Error parsing summary JSON:", error);
			// If parsing fails, create a default summary object
			finalSummary = { summary: summary, dueDate: "" };
		}
	}

	return {
		coverSheet,
		summary: finalSummary,
		pdfContent,
	};
}

/**
 * Saves a document to the database
 * @param document - The document data to save
 */
export async function saveDocument(document: DocumentData) {
	try {
		const response = await fetch("http://localhost:3000/api/supabase/documents", {
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

export async function fetchAllFolders() {
	try {
		const response = await fetch(`${getBaseUrl()}/api/supabase/folders`);
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

export async function processNewFiles() {
	try {
    const existingDocuments = await fetchAllDocuments();
		const files = (await listAllUploadThingFiles()) as UploadThingFile[];
		const filesNotInDatabase = files.filter(
			(file) => !existingDocuments?.some((doc) => doc.name === file.name)
		);
		if (filesNotInDatabase.length) {
			for (const file of filesNotInDatabase) {
				try {
					console.log("Processing file:", file.name);
					const parsedContent = await parseExternalFile(file.key);
					console.log("reducto parsing done");
					const rfpAnalysis = await generateRFPAnalysis({
						pdfContent: parsedContent,
					});
					console.log("rfp analysis done");
					const result = await fetch(
						"http://localhost:2500/analyze",
						{
							method: "POST",
							body: JSON.stringify({ pdf_file_content: parsedContent }),
							headers: {
								"Content-Type": "application/json",
							},
						}
					)
          const complianceMatrix = await result.json() as { final_table: string };
					console.log("compliance matrix done");

					await saveDocument({
						name: file.name,
						coverSheet: rfpAnalysis.coverSheet || "",
						description: rfpAnalysis.summary.summary,
						dueDate: rfpAnalysis.summary.dueDate,
						pdfContent: rfpAnalysis.pdfContent,
						complianceMatrix: complianceMatrix.final_table,
					});
				} catch (error) {
					console.error(`Error processing file ${file.name}:`, error);
					// Continue with next file even if one fails
				}
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error processing files:", error);
		return { success: false, error };
	}
}
