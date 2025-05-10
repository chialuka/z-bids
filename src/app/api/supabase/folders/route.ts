import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { foldersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allFolders = await db.select().from(foldersTable);
    return NextResponse.json({ allFolders }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const newFolder = await db.insert(foldersTable).values({ name }).returning();
    return NextResponse.json({ newFolder }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, name } = await req.json();
    const updatedFolder = await db.update(foldersTable).set({ name }).where(eq(foldersTable.id, id));
    return NextResponse.json({ updatedFolder }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

