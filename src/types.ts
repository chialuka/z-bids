
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
	content: string;
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
