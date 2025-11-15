import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const isConfigured = Boolean(accountSid && authToken && fromNumber);

const client = isConfigured ? twilio(accountSid, authToken) : null;

export async function sendSms({
  to,
  message,
}: {
  to: string;
  message: string;
}) {
  if (!client || !fromNumber) {
    console.info("[dev] SMS skipped", { to, message });
    return;
  }

  await client.messages.create({
    to,
    from: fromNumber,
    body: message,
  });
}
