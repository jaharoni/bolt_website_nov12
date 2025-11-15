import crypto from "node:crypto";
import { RegistrationPayload } from "@/lib/types";
import { insertUser } from "@/lib/repositories/userRepository";
import { alertPreferenceDefaults, PLATFORM_NAME } from "@/lib/config/platform";
import { sendEmail } from "@/lib/email/sendgrid";
import { serverEnv } from "@/lib/env";

export async function registerResident(payload: RegistrationPayload) {
  const confirmationToken = crypto.randomUUID();

  await insertUser({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    volunteerRole: payload.volunteerRole,
    committeeInterest: payload.committeeInterest,
    alertPrefs: payload.alertPrefs ?? alertPreferenceDefaults,
    confirmationToken,
  });

  const baseUrl = serverEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const confirmationUrl = `${baseUrl}/confirm/${confirmationToken}`;

  await sendEmail({
    to: payload.email,
    subject: `Confirm your ${PLATFORM_NAME} alerts`,
    text: `Please confirm your subscription by visiting ${confirmationUrl}`,
    html: `<p>Thanks for supporting Jamesport! Please confirm your alerts:</p><p><a href="${confirmationUrl}">Confirm my email</a></p>`,
  });
}
