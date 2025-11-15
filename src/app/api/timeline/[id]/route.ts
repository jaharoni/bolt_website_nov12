import { NextResponse } from "next/server";
import {
  deleteTimelineEvent,
  updateTimelineEvent,
} from "@/lib/db/timeline";
import { getAdminSession } from "@/lib/auth/session";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  try {
    const record = await updateTimelineEvent(params.id, payload);
    return NextResponse.json(record);
  } catch (error) {
    console.error("Timeline update error", error);
    return NextResponse.json(
      { error: "Unable to update event" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteTimelineEvent(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Timeline delete error", error);
    return NextResponse.json(
      { error: "Unable to delete event" },
      { status: 400 }
    );
  }
}
