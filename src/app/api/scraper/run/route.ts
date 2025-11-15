import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { runMeetingWatcher } from "@/lib/scraper/meetingWatcher";

export async function POST() {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await runMeetingWatcher();
  return NextResponse.json({ matches });
}
