import { extractCoverSheet } from "@/server/modules/openai/generateCoverSheet";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { documentsTable } from "@/server/db/schema";

export async function POST(req: Request) {
  try {
    const { document, documentId } = await req.json();
    console.log("INPUT DOCUMENT (first 200 chars):", document.substring(0, 200));
    const coverSheet = await extractCoverSheet({ document });
    await db.update(documentsTable).set({
      coverSheet: coverSheet,
    }).where(eq(documentsTable.id, documentId));
    return NextResponse.json({ coverSheet });
  } catch (error) {
    console.error("Error in cover sheet:", error);
    return NextResponse.json({ error: "Error in cover sheet" }, { status: 500 });
  }
}
