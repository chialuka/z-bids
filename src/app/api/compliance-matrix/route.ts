import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pdf_file_content, document_id } = await req.json();
    const complianceMatrix = await fetch(`${process.env.API_URL}/rfp/compliance-matrix`, {
      method: "POST",
      body: JSON.stringify({ pdf_file_content, document_id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await complianceMatrix.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in compliance matrix:", error);
    return NextResponse.json({ error: "Error in compliance matrix" }, { status: 500 });
  }
}
