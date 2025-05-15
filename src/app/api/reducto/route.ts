import { NextResponse } from "next/server";
import { syncFileParsing } from "@/server/modules/reducto";
import { ReductoResponse } from "@/types";

export async function POST(request: Request) {
	try {
		const requestBody = await request.json();
		const response = await syncFileParsing({ documentUrl: requestBody.documentUrl });

		if (!response.ok) {
			throw new Error(`Failed to parse file: ${response.statusText}`);
		}

		const document = (await response.json()) as ReductoResponse;
		console.log(document, "document from parsing");

		return NextResponse.json({
			message: "Success",
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
