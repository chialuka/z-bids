import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log({ requestBody }, "route");
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
