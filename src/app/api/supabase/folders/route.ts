import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { foldersTable } from "@/server/db/schema";

export async function GET() {
  try {
    const allFolders = await db.select().from(foldersTable);
    return NextResponse.json({ allFolders }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
