import { parseFile } from "@/server/modules/reducto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log({ requestBody }, "route");
    const document = await parseFile({ documentUrl: requestBody.documentUrl });
    if (typeof document === "object" && document !== null && "data" in document) {
      console.log("document.data", document.data);
      return NextResponse.json({ data: document.data });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
