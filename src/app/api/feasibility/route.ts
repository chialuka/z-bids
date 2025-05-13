import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { content, document_id } = await req.json();
	try {
		const feasibilityCheck = await fetch(
			`${process.env.API_URL}/rfp/feasibility`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content, document_id }),
			}
		);
		const data = await feasibilityCheck.json();
		
		// Return the raw data without wrapping it in another object
		return new Response(JSON.stringify(data));
	} catch (error) {
		console.error("Error in feasibility check:", error);
		return NextResponse.json(
			{ error: "Error in feasibility check" },
			{ status: 500 }
		);
	}
}
