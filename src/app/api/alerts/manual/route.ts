import { NextResponse } from "next/server";
import { dispatchMeetingAlert } from "@/lib/notifications/alerts";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const subject = body.subject ?? "Jamesport civic alert";
  const message = body.message ?? "New update posted.";
  const keywords = (body.keywords as string[]) ?? [];

  await dispatchMeetingAlert({ subject, message, keywords });

  return NextResponse.json({ success: true });
}
