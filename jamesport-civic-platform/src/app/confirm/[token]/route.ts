import { NextResponse } from "next/server";
import { confirmUser } from "@/lib/repositories/userRepository";
import { serverEnv } from "@/lib/env";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const isConfirmed = await confirmUser(params.token);
  const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUrl = new URL(isConfirmed ? "/?status=confirmed" : "/?status=error", baseUrl);
  return NextResponse.redirect(redirectUrl);
}
