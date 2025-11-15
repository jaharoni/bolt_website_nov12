import { NextResponse } from "next/server";
import { z } from "zod";
import { registerResident } from "@/lib/services/registrationService";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  volunteerRole: z.string().optional(),
  committeeInterest: z.string().optional(),
  alertPrefs: z.object({
    general: z.boolean(),
    meetings: z.boolean(),
    volunteer: z.boolean(),
  }),
});

export async function POST(request: Request) {
  const json = await request.json();
  const payload = schema.parse(json);

  try {
    await registerResident(payload);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("registration error", error);
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
