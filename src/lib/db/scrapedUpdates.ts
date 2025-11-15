import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/serverClient";
import { ScrapedUpdate } from "@/lib/types";

const fallbackUpdates: ScrapedUpdate[] = [];

export async function logScrapedUpdate(update: ScrapedUpdate) {
  if (!isSupabaseConfigured) {
    fallbackUpdates.push(update);
    return update;
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("scraped_updates")
    .insert({
      id: update.id,
      source_url: update.sourceUrl,
      content: update.content,
      detected_at: update.detectedAt,
      processed: update.processed,
      alert_sent: update.alertSent,
      matched_keywords: update.matchedKeywords,
      meeting_date: update.meetingDate,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Unable to log scraped update", error.message);
    throw new Error("Unable to log scraper update");
  }

  return data;
}

export async function listScrapedUpdates(limit = 10) {
  if (!isSupabaseConfigured) {
    return fallbackUpdates.slice(0, limit);
  }
  const client = createServiceClient();
  const { data, error } = await client
    .from("scraped_updates")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Unable to load scraped updates", error.message);
    throw new Error("Unable to load scraped updates");
  }
  return data;
}
