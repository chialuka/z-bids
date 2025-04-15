import { NextResponse } from "next/server";
import { parseFile } from "@/server/modules/reducto";
import { extractCoverSheet } from "@/server/modules/openai";

export async function POST(request: Request) {
	try {
		const requestBody = await request.json();
		console.log({ requestBody }, "route");
		const document = await parseFile({ documentUrl: requestBody.documentUrl });
		if (
			typeof document === "object" &&
			document !== null &&
			"data" in document
		) {
			console.log("document.data", document.data);
			const content = document.data.result.chunks
				.map((chunk: { blocks: Array<{ content: string }> }) =>
					chunk.blocks.map((block) => block.content).join("")
				)
				.join("");
			const coverSheet = await extractCoverSheet({
				document: content,
			});
      console.log({ coverSheet });

			return NextResponse.json({ 
        data: coverSheet
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
