import { cookies } from "next/headers";
import { expectedAdminHash } from "@/lib/auth/sessionHash";

const SESSION_COOKIE = "jamesport-admin-session";

export function getExpectedAdminSessionValue() {
  return expectedAdminHash();
}

export async function createAdminSession() {
  const value = expectedAdminHash();
  if (!value) {
    throw new Error("Admin credentials are not configured");
  }
  cookies().set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export function clearAdminSession() {
  cookies().delete(SESSION_COOKIE);
}

export function isAdminAuthenticated() {
  const expected = expectedAdminHash();
  if (!expected) return false;
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  return cookie === expected;
}
