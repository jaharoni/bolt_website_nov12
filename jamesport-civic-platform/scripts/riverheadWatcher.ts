import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { MeetingDetectionResult } from "@/lib/types";

const urls = (process.env.SCRAPER_TARGET_URLS ?? "https://www.townofriverheadny.gov/AgendaCenter").split(",").map((value) => value.trim());
const keywords = (process.env.SCRAPER_KEYWORDS ?? "jamesport,route 25").split(",").map((value) => value.trim().toLowerCase());

async function detectMeetings() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const matches: MeetingDetectionResult[] = [];

  for (const url of urls) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const entries = await page.$$eval("a", (links) =>
      links
        .filter((link) => link.href && link.innerText)
        .map((link) => ({ title: link.innerText.trim(), url: link.href }))
    );

    entries.forEach((entry) => {
      const matched = keywords.filter((keyword) => entry.title.toLowerCase().includes(keyword));
      if (matched.length) {
        matches.push({ url: entry.url, title: entry.title, matchedKeywords: matched });
      }
    });
  }

  await browser.close();
  return matches;
}

async function run() {
  const results = await detectMeetings();
  const timestamp = new Date().toISOString();
  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const file = path.join(logDir, `riverhead-${timestamp}.json`);
  fs.writeFileSync(file, JSON.stringify({ timestamp, results }, null, 2));
  console.log(`Detected ${results.length} meetings. Logged to ${file}`);
}

run().catch((error) => {
  console.error("Scraper error", error);
  process.exitCode = 1;
});
