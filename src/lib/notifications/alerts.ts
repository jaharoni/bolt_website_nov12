import { listResidents } from "@/lib/db/residents";
import { sendAlertEmail } from "@/lib/notifications/email";
import { sendSms } from "@/lib/notifications/sms";

export async function dispatchMeetingAlert({
  subject,
  message,
  keywords = [],
}: {
  subject: string;
  message: string;
  keywords?: string[];
}) {
  const residents = await listResidents();
  const emailRecipients = residents
    .filter((resident) => resident.alertPrefs.meetingAlerts)
    .map((r) => r.email);
  const smsRecipients = residents
    .filter(
      (resident) =>
        resident.alertPrefs.meetingAlerts &&
        resident.alertPrefs.smsOptIn &&
        resident.phone
    )
    .map((r) => r.phone!) as string[];

  if (emailRecipients.length > 0) {
    await sendAlertEmail({
      recipients: emailRecipients,
      subject,
      content: `<p>${message}</p><p><strong>Keywords:</strong> ${
        keywords.join(", ") || "N/A"
      }</p>`,
    });
  }

  await Promise.all(
    smsRecipients.map((phone) =>
      sendSms({
        to: phone,
        message: `${subject} — ${message.slice(0, 120)}`,
      })
    )
  );
}
