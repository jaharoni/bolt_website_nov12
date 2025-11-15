#!/usr/bin/env tsx

import { dispatchMeetingAlert } from "@/lib/notifications/alerts";

async function main() {
  await dispatchMeetingAlert({
    subject: "Test alert: Riverhead Planning Board agenda posted",
    message:
      "This is a simulation to verify email/SMS integrations for the Jamesport Civic Platform.",
    keywords: ["test", "simulation"],
  });
  console.log("Alert simulation complete");
}

main().catch((error) => {
  console.error("Alert simulation failed", error);
  process.exit(1);
});
