import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, documentId } = await req.json();
    const complianceMatrix = await fetch(`${process.env.API_URL}/rfp/compliance-matrix`, {
      method: "POST",
      body: JSON.stringify({ pdf_file_content: content, document_id: documentId }),
    });
    return NextResponse.json({ complianceMatrix });
  } catch (error) {
    console.error("Error in compliance matrix:", error);
    return NextResponse.json({ error: "Error in compliance matrix" }, { status: 500 });
  }
}
