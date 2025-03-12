import { UTApi } from "uploadthing/server";


if (!process.env.UPLOADTHING_TOKEN) {
  throw new Error("UPLOADTHING_TOKEN is not set");
}

export const utApi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

export const listAllFiles = async () => {
  try {
    const files = await utApi.listFiles();
    console.log({ files });
    return files.files;
  } catch (error) {
    console.error(error);
    return error;
  }
};
