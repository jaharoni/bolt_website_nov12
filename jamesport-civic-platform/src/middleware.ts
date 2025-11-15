import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { expectedAdminHash } from "@/lib/auth/sessionHash";

const SESSION_COOKIE = "jamesport-admin-session";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const expected = expectedAdminHash();
  if (!expected) {
    return NextResponse.redirect(new URL("/admin/login?reason=missing-config", request.url));
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (cookie !== expected) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
