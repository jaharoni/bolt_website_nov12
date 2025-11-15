#!/usr/bin/env tsx

import { runMeetingWatcher } from "@/lib/scraper/meetingWatcher";

async function main() {
  const matches = await runMeetingWatcher();
  console.log(`Scraper finished. ${matches.length} potential meetings detected.`);
  matches.forEach((match) =>
    console.log(`- ${match.title} (${match.matchedKeywords.join(", ")})`)
  );
}

main().catch((error) => {
  console.error("Scraper failed", error);
  process.exit(1);
});
