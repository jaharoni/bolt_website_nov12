import { v4 as uuid } from "uuid";
import { keywords, townName } from "@/lib/config/appConfig";
import { logScrapedUpdate } from "@/lib/db/scrapedUpdates";
import { dispatchMeetingAlert } from "@/lib/notifications/alerts";
import { MeetingDetectionResult } from "@/lib/types";

const targetUrl =
  process.env.SCRAPER_TARGET_URL ??
  "https://www.townofriverheadny.gov/meeting-calendar";

const normalize = (value: string) =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

async function tryPlaywright() {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    const entries = await page.$$eval("a", (anchors) =>
      anchors
        .map((anchor) => ({
          title: anchor.textContent ?? "",
          href: anchor.href,
        }))
        .filter((item) => item.title)
    );
    await browser.close();
    return entries;
  } catch (error) {
    console.warn("[scraper] Playwright failed, falling back to fetch()", error);
    return null;
  }
}

async function fetchFallback() {
  const response = await fetch(targetUrl);
  const html = await response.text();
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  const results: Array<{ title: string; href: string }> = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const title = match[2]?.replace(/<[^>]+>/g, "").trim();
    if (title) {
      results.push({ title, href: new URL(match[1], targetUrl).toString() });
    }
  }
  return results;
}

export async function detectMeetings(): Promise<MeetingDetectionResult[]> {
  const links =
    (await tryPlaywright()) ??
    (await fetchFallback()) ??
    ([] as Array<{ title: string; href: string }>);

  const matches = links
    .map((link) => {
      const normalized = normalize(link.title);
      const matchedKeywords = keywords.filter((keyword) =>
        normalized.includes(keyword.toLowerCase())
      );
      if (matchedKeywords.length === 0) {
        return null;
      }
      return {
        url: link.href,
        title: link.title,
        publishedAt: new Date().toISOString(),
        matchedKeywords,
      };
    })
    .filter(Boolean) as MeetingDetectionResult[];

  return matches;
}

export async function runMeetingWatcher() {
  const matches = await detectMeetings();
  if (matches.length === 0) {
    console.info("[scraper] No new meetings detected");
    return [];
  }

  for (const match of matches) {
    await logScrapedUpdate({
      id: uuid(),
      sourceUrl: match.url,
      content: match.title,
      detectedAt: new Date().toISOString(),
      processed: false,
      alertSent: true,
      matchedKeywords: match.matchedKeywords,
    });

    await dispatchMeetingAlert({
      subject: `New ${townName} meeting mention: ${match.matchedKeywords.join(
        ", "
      )}`,
      message: `${match.title}\n${match.url}`,
      keywords: match.matchedKeywords,
    });
  }

  return matches;
}
