import { NextResponse } from "next/server";
import { parseFile } from "@/server/modules/reducto";
import { extractComplianceMatrix } from "@/server/modules/openai";

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
			const complianceMatrix = await extractComplianceMatrix({
				document: content,
			});
      console.log({ complianceMatrix })
			return NextResponse.json({ data: complianceMatrix });
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
