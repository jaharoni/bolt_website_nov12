import { NextResponse } from "next/server";
import { fetchTimeline } from "@/lib/repositories/timelineRepository";

export async function GET() {
  const events = await fetchTimeline();
  return NextResponse.json({ events });
}
