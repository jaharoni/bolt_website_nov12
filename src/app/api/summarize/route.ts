import { NextResponse } from "next/server";
import { summarizeDocument } from "@/lib/ai/summarize";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  try {
    const result = await summarizeDocument(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Summarization error", error);
    return NextResponse.json(
      { error: "Unable to summarize document" },
      { status: 400 }
    );
  }
}
