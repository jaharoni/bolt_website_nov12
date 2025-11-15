import sgMail from "@sendgrid/mail";
import { serverEnv } from "@/lib/env";

let configured = false;

function getClient() {
  if (!serverEnv.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not set; emails will be logged to console");
    return null;
  }

  if (!configured) {
    sgMail.setApiKey(serverEnv.SENDGRID_API_KEY);
    configured = true;
  }

  return sgMail;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(payload: EmailPayload) {
  const client = getClient();
  if (!client) {
    console.info("[email-stub]", payload);
    return;
  }

  await client.send({
    to: payload.to,
    from: serverEnv.SENDGRID_FROM_EMAIL ?? "alerts@jamesportcivic.org",
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
