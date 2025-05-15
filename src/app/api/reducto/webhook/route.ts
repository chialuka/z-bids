import { llmAnalysis } from "@/server/modules/documentService";
import { getJobDetails } from "@/server/modules/reducto";
import { ReductoResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		console.log(body);

		if (body.status === "Completed") {
			console.log(body.metadata, "metadata");
			const document: { result: ReductoResponse } = await getJobDetails({
				jobId: body.job_id,
			});
			console.log(document, "job details");
			if (
				typeof document === "object" &&
				document !== null &&
				"result" in document &&
				"result" in document.result &&
				"chunks" in document.result.result
			) {
				console.log("Processing document chunks");
				const content = document.result.result.chunks
					.map((chunk) => chunk.blocks.map((block) => block.content).join(""))
					.join("");
				console.log("Successfully processed document chunks");
				llmAnalysis({
					document: content,
					fileName: body.metadata.fileName,
				}).catch((err) => {
					console.error(err);
					return NextResponse.json(
						{ error: "Error processing document: " + err },
						{ status: 400 }
					);
				});
				return NextResponse.json({
					message: "Document processed successfully",
				});
			} else {
				return NextResponse.json(
					{
						message: "Invalid document format received:",
					},
					{ status: 400 }
				);
			}
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
