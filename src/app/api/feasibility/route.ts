import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { content, documentId } = await req.json();
	try {
		const feasibilityCheck = await fetch(
			`${process.env.API_URL}/rfp/feasibility`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content, document_id: documentId }),
			}
		);
    const data = await feasibilityCheck.json();

		return NextResponse.json({ data });
	} catch (error) {
		console.error("Error in feasibility check:", error);
		return NextResponse.json(
			{ error: "Error in feasibility check" },
			{ status: 500 }
		);
	}
}
