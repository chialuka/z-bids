import { NextResponse } from "next/server";
import { parseFile } from "@/server/modules/reducto";
import { ReductoResponse } from "@/types";

export async function POST(request: Request) {
	try {
		const requestBody = await request.json();
		const response = await parseFile({ documentUrl: requestBody.documentUrl });
		
		if (!response.ok) {
			throw new Error(`Failed to parse file: ${response.statusText}`);
		}

		const document = await response.json() as ReductoResponse;
		
		if (
			typeof document === "object" &&
			document !== null &&
			"result" in document &&
			"chunks" in document.result
		) {
			const content = document.result.chunks
				.map((chunk) =>
					chunk.blocks.map((block) => block.content).join("")
				)
				.join("");

			return NextResponse.json({
				content,
			});
		}

		throw new Error("Invalid response format from Reducto");
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
