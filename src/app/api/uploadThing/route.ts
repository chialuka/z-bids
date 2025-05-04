import { NextResponse } from "next/server";

import { listAllUploadThingFiles } from "@/server/modules/uploadThing";

export async function GET() {
  try {
    const files = await listAllUploadThingFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
