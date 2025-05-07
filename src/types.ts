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
	feasibilityCheck: string;
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

export type SharePointFile = {
  "@microsoft.graph.downloadUrl": string;
  cTag: string;
  createdBy: {
    user: {
      email: string;
      id: string;
      displayName: string;
    };
  };
  createdDateTime: string;
  eTag: string;
  file: {
    hashes: {
      quickXorHash: string;
    };
    mimeType: string;
  };
  fileSystemInfo: {
    createdDateTime: string;
    lastModifiedDateTime: string;
  };
  id: string;
  lastModifiedBy: {
    user: {
      displayName: string;
      email: string;
      id: string;
    };
  };
  lastModifiedDateTime: string;
  name: string;
  parentReference: {
    driveId: string;
    driveType: string;
    id: string;
    name: string;
    path: string;
    siteId: string;
  };
};

export interface ReductoResponse {
  job_id: string;
  duration: number;
  pdf_url: null;
  usage: {
    num_pages: number;
  };
  result: {
    type: string;
    chunks: Array<{
      blocks: Array<{
        content: string;
      }>;
    }>;
    ocr: null;
    custom: null;
  };
}
