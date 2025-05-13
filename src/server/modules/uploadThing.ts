import { UTApi } from "uploadthing/server";
import { UploadFileResult } from "uploadthing/types";

if (!process.env.UPLOADTHING_TOKEN) {
	throw new Error("UPLOADTHING_TOKEN is not set");
}

export const utApi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

export const listAllUploadThingFiles = async ({
	folder,
}: {
	folder: "knowledge" | "rfp";
}) => {
	try {
		const uploadApi = new UTApi({
			token:
				folder === "knowledge"
					? process.env.UPLOADTHING_KNOWLEDGE_BASE_TOKEN
					: process.env.UPLOADTHING_TOKEN,
		});
		const files = await uploadApi.listFiles();
		return files.files;
	} catch (error) {
		console.error(error);
		return error;
	}
};

export const uploadFileToUploadThing = async ({
	file,
	folder,
}: {
	file: File;
	folder: "knowledge" | "rfp";
}): Promise<UploadFileResult> => {
	const uploadApi = new UTApi({
		token:
			folder === "knowledge"
				? process.env.UPLOADTHING_KNOWLEDGE_BASE_TOKEN
				: process.env.UPLOADTHING_TOKEN,
	});
	const upload = await uploadApi.uploadFiles(file);
	return upload;
};
