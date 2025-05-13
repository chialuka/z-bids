import {
	uploadFileToUploadThing,
	listAllUploadThingFiles,
} from "@/server/modules/uploadThing";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const upload = await uploadFileToUploadThing({ file, folder: "knowledge" });
    fetch(`${process.env.API_URL}/rfp/vectorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_path: [upload.data?.ufsUrl],
      }),
    });
		return NextResponse.json(upload);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
};

export const GET = async () => {
	try {
		const files = await listAllUploadThingFiles({ folder: "knowledge" });
		return NextResponse.json({ files });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
};
