import { NextResponse } from "next/server";

import { parseFile } from "@/server/modules/reducto";

export async function POST(request: Request) {
	try {
		const requestBody = await request.json();
		const document = await parseFile({ documentUrl: requestBody.documentUrl });
		if (
			typeof document === "object" &&
			document !== null &&
			"data" in document
		) {
			const content = document.data.result.chunks
				.map((chunk: { blocks: Array<{ content: string }> }) =>
					chunk.blocks.map((block) => block.content).join("")
				)
				.join("");

			return NextResponse.json({
				content,
			});
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
