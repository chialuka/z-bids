import { UTApi } from "uploadthing/server";

export const listAllFiles = async () => {
	if (!process.env.UPLOADTHING_TOKEN) {
		throw new Error("UPLOADTHING_TOKEN is not set");
	}
	const ut = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
	const files = await ut.listFiles();
  console.log({ files });
	return files.files;
};
