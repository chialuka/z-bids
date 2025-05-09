import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { documentsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allDocuments = await db.select().from(documentsTable);
    return NextResponse.json({ allDocuments }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("POST request received");
  try {
    const requestBody = await request.json();
    const newDocument = await db.insert(documentsTable).values({
      name: requestBody.name,
      coverSheet: requestBody.coverSheet,
      pdfContent: requestBody.pdfContent,
      description: requestBody.description,
      complianceMatrix: requestBody.complianceMatrix,
      dueDate: requestBody.dueDate ? new Date(requestBody.dueDate) : null,
      folderId: requestBody.folderId || null,
    }).returning();
    return NextResponse.json({ newDocument }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const requestBody = await request.json();
    const updatedDocument = await db.update(documentsTable).set({
      ...requestBody,
    }).where(eq(documentsTable.id, requestBody.id));
    return NextResponse.json({ updatedDocument }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
