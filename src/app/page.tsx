import RFPFiles from "@/components/rfp/FileManager";
import {
	listAllUploadThingFiles,
	uploadFileToUploadThing,
} from "@/server/modules/uploadThing";
import {
	getSharePointFiles,
	downloadSharePointFile,
} from "@/server/modules/sharepoint";
import {
	File as UploadThingFile,
	Document,
	Folder,
	SharePointFile,
} from "@/types";
import {
	fetchAllDocuments,
	fetchAllFolders,
} from "@/server/modules/documentService";
// import { Assistant } from "./assistant"

export default async function Home() {
	const [uploadThingFiles, sharePointFiles, documents, folders] =
		(await Promise.all([
			listAllUploadThingFiles({folder: "rfp"}),
			getSharePointFiles(),
			fetchAllDocuments(),
			fetchAllFolders(),
		])) as [UploadThingFile[], SharePointFile[], Document[], Folder[]];

	const filesNotInUploadThing = sharePointFiles.filter(
		(file) =>
			!uploadThingFiles.some(
				(uploadThingFile) => uploadThingFile.name === file.name
			)
	);

	console.log({ filesNotInUploadThing });

	if (filesNotInUploadThing.length > 0) {
		// First upload SharePoint files to UploadThing
		await Promise.all(
			filesNotInUploadThing.map(async (file) => {
				try {
					const fileBlob = await downloadSharePointFile(file);
					const fileToUpload = new File([fileBlob], file.name, {
						type: file.file.mimeType,
					});
					await uploadFileToUploadThing({
						file: fileToUpload,
						folder: "rfp",
					});
				} catch (error) {
					console.error(`Failed to process file ${file.name}:`, error);
				}
			})
		);
	}

	return (
		<main className="m-2 sm:m-5 lg:m-10">
			<h1 className="font-bold text-3xl text-center py-10">Z BIDS</h1>
			<RFPFiles initialDocuments={documents} initialFolders={folders} />
			{/* <Assistant /> */}
		</main>
	);
}
