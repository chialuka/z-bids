import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { documentsTable } from "@/server/db/schema";

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
  try {
    const requestBody = await request.json();
    const newDocument = await db.insert(documentsTable).values({
      name: requestBody.name,
      content: requestBody.content,
    });
    return NextResponse.json({ newDocument }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

