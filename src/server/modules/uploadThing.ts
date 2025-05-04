import { UTApi } from "uploadthing/server";

if (!process.env.UPLOADTHING_TOKEN) {
  throw new Error("UPLOADTHING_TOKEN is not set");
}

export const utApi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

export const listAllUploadThingFiles = async () => {
  try {
    const files = await utApi.listFiles();
    return files.files;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const uploadFileToUploadThing = async (file: File) => {
  try {
    const upload = await utApi.uploadFiles(file);
    return upload;
  } catch (error) {
    console.error(error);
    return error;
  }
};
