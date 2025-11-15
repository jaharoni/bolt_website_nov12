import { NextResponse } from "next/server";
import { registerResident } from "@/lib/db/residents";
import { sendConfirmationEmail } from "@/lib/notifications/email";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const record = await registerResident(body);
    const token =
      (record as { confirmation_token?: string }).confirmation_token ??
      (record as { confirmationToken?: string }).confirmationToken ??
      (record as { id?: string }).id;

    if (!token) {
      throw new Error("Unable to generate confirmation token.");
    }

    await sendConfirmationEmail({
      name: body.name,
      email: body.email,
      token,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json(
      { error: "Unable to process registration." },
      { status: 400 }
    );
  }
}
