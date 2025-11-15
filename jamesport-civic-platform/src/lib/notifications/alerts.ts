import { sendEmail } from "@/lib/email/sendgrid";
import { sendSmsAlert } from "@/lib/notifications/sms";
import { CONTACT_EMAIL, PLATFORM_NAME } from "@/lib/config/platform";

interface AlertInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  sendSms?: boolean;
}

export async function dispatchAlert(input: AlertInput) {
  await sendEmail({
    to: input.email,
    subject: input.subject,
    text: input.message,
    html: `<p>${input.message}</p><p>- ${PLATFORM_NAME}</p>` ,
  });

  // Send internal copy
  await sendEmail({
    to: CONTACT_EMAIL,
    subject: `[${PLATFORM_NAME}] ${input.subject}`,
    text: `${input.name} (${input.email})\n\n${input.message}`,
    html: `<p><strong>${input.name}</strong> (${input.email})</p><p>${input.message}</p>` ,
  });

  if (input.sendSms && input.phone) {
    await sendSmsAlert(input.phone, input.message);
  }
}
