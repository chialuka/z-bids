import { NextResponse } from "next/server";
import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { listAllUploadThingFiles } from "@/server/modules/uploadThing";

// Export routes for Next App Router
export const { POST } = createRouteHandler({
	router: ourFileRouter,

	// Apply an (optional) custom config:
	// config: { ... },
	config: {
		token: process.env.UPLOADTHING_KNOWLEDGE_BASE_TOKEN,
	},
});

export async function GET() {
	try {
		const files = await listAllUploadThingFiles({ folder: "rfp" });
		return NextResponse.json({ files });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
