import { NextResponse } from "next/server";
import {
  createTimelineEvent,
  fetchTimelineEvents,
} from "@/lib/db/timeline";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const events = await fetchTimelineEvents({
    eventType: url.searchParams.get("type") ?? undefined,
    startDate: url.searchParams.get("startDate") ?? undefined,
    endDate: url.searchParams.get("endDate") ?? undefined,
    includeDrafts: url.searchParams.get("includeDrafts") === "true",
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  try {
    const record = await createTimelineEvent(body);
    return NextResponse.json(record);
  } catch (error) {
    console.error("Timeline create error", error);
    return NextResponse.json(
      { error: "Unable to create event" },
      { status: 400 }
    );
  }
}
