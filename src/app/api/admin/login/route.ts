import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validators/schemas";
import { validateAdminCredentials } from "@/lib/db/adminUsers";
import { persistAdminSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const admin = await validateAdminCredentials(
    parsed.data.email,
    parsed.data.password
  );

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await persistAdminSession({
    isLoggedIn: true,
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  return NextResponse.json({ success: true });
}
