import { NextResponse } from "next/server";
import { confirmResident } from "@/lib/db/residents";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  try {
    await confirmResident(token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirmation error", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  try {
    await confirmResident(token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirmation error", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
}
