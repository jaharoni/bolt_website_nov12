import twilio from "twilio";
import { serverEnv } from "@/lib/env";

let smsClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (smsClient !== null) return smsClient;

  if (!serverEnv.TWILIO_ACCOUNT_SID || !serverEnv.TWILIO_AUTH_TOKEN) {
    console.info("Twilio not configured; SMS alerts will be logged only");
    smsClient = null;
    return smsClient;
  }

  smsClient = twilio(serverEnv.TWILIO_ACCOUNT_SID, serverEnv.TWILIO_AUTH_TOKEN);
  return smsClient;
}

export async function sendSmsAlert(to: string, message: string) {
  const client = getTwilioClient();
  if (!client || !serverEnv.TWILIO_FROM_NUMBER) {
    console.info("[sms-stub]", { to, message });
    return;
  }

  await client.messages.create({
    body: message,
    to,
    from: serverEnv.TWILIO_FROM_NUMBER,
  });
}
