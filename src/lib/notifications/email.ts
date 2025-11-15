import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "alerts@jamesportcivic.org";

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const isConfigured = Boolean(apiKey && fromEmail);

export async function sendConfirmationEmail({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  if (!isConfigured) {
    console.info(
      `[dev] Confirmation email skipped. Token for ${email}: ${token}`
    );
    return;
  }

  const confirmationUrl = `${
    process.env.PUBLIC_APP_BASE_URL ?? "http://localhost:3000"
  }/confirm?token=${token}`;

  await sgMail.send({
    to: email,
    from: fromEmail,
    subject: "Please confirm your Jamesport Civic alerts subscription",
    html: `<p>Hi ${name},</p>
      <p>Thanks for joining the Jamesport Civic Platform. Please confirm your alerts subscription by clicking the secure link below:</p>
      <p><a href="${confirmationUrl}">Confirm my alerts</a></p>
      <p>If you did not make this request, feel free to ignore this message.</p>`,
  });
}

export async function sendAlertEmail({
  recipients,
  subject,
  content,
}: {
  recipients: string[];
  subject: string;
  content: string;
}) {
  if (!isConfigured) {
    console.info("[dev] Alert email skipped", { recipients, subject });
    return;
  }

  await sgMail.sendMultiple({
    to: recipients,
    from: fromEmail,
    subject,
    html: content,
  });
}
