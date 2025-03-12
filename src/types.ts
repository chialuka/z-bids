
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
