import { NextResponse } from "next/server";
import fetch from "node-fetch";

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
			const [coverSheet, summary, complianceMatrix] = await Promise.all([
				extractCoverSheet({
					document: content,
				}),
				generateSummary({ document: content }),
				fetch("https://z-bid-server-c98ace28198b.herokuapp.com/analyze", {
					method: "POST",
					body: JSON.stringify({ pdf_file_content: content }),
					headers: {
						"Content-Type": "application/json",
					},
				}).then((res) => res.json()),
			]);

			return NextResponse.json({
				data: { coverSheet, summary, pdfContent: content, complianceMatrix },
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
