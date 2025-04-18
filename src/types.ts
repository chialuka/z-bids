
export type File = {
  name: string;
  webUrl: string;
  id: string;
  key: string;
  createdBy: {
    user: {
      displayName: string;
      email: string;
      id: string;
    };
  };
  uploadedAt: string;
};

export interface Document {
	id: number;
	name: string;
	pdfContent: string;
	coverSheet: string;
	complianceMatrix: string;
	description?: string;
	dueDate?: string;
  folderId?: number;
  uploadedAt: string;
  createdAt: string;
}

export interface Folder {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}
export interface PDFData {
  documentText: string;
  documentFilename: string;
  chunkCount: number;
  error?: string;
}

export interface AnalysisStage {
  name: string;
  systemPrompt: string;
  messageTemplate: string;
}

export interface WorkflowResult {
  status: 'success' | 'error';
  results: Record<string, string>;
  finalTable: string | null;
}
