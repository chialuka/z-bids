import { NextResponse } from "next/server";
import { parseFile } from "@/server/modules/reducto";
import { extractCoverSheet } from "@/server/modules/openai/generateCoverSheet";
import { generateSummary } from "@/server/modules/openai/generateSummary";

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
			const [coverSheet, summary] = await Promise.all([
				extractCoverSheet({
					document: content,
				}),
				generateSummary({ document: content }),
			]);

			return NextResponse.json({
				data: { coverSheet, summary },
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
