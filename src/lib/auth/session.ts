import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";
import { AdminSession } from "@/lib/types";

const sessionPassword =
  process.env.SESSION_PASSWORD ??
  "development-session-secret-value-32chars!!";

const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "jamesport_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  return session;
}

export async function persistAdminSession(data: AdminSession) {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, sessionOptions);
  session.isLoggedIn = data.isLoggedIn;
  session.adminId = data.adminId;
  session.email = data.email;
  session.role = data.role;
  await session.save();
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSession>(cookieStore, sessionOptions);
  session.destroy();
}
