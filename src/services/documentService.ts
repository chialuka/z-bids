import DOMPurify from "dompurify";

interface DocumentData {
  id?: string;
  name: string;
  content: string;
}

/**
 * Fetches all documents from the database
 */
export async function fetchAllDocuments() {
  try {
    const response = await fetch("/api/supabase", {
      method: "GET",
    });
    
    const data = await response.json();
    // Extract the allDocuments array from the response
    return data.allDocuments || [];
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
  const response = await fetch("/api/reducto", {
    method: "POST",
    body: JSON.stringify({
      documentUrl: `https://pa6rt2x38u.ufs.sh/f/${fileKey}`,
    }),
  });
  
  const data = await response.json();
  // Sanitize the response to prevent XSS attacks
  return DOMPurify.sanitize(data.data);
}

/**
 * Saves a document to the database
 * @param document - The document data to save
 */
export async function saveDocument(document: DocumentData) {
  const response = await fetch("/api/supabase", {
    method: document.id ? "PATCH" : "POST",
    body: JSON.stringify(document),
  });
  
  const data = await response.json();
  // Extract the document from the response
  return document.id ? { ...document, id: document.id } : data.newDocument;
}

/**
 * Searches within a document using AI
 * @param searchTerm - The term to search for
 * @param documentContent - The content to search within
 */
export async function searchDocument(searchTerm: string, documentContent: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ 
      messages: { 
        searchTerm, 
        document: documentContent 
      } 
    }),
  });
  
  const data = await response.json();
  return DOMPurify.sanitize(data.data);
} 
