import { cache } from "react";
import { getSupabaseClient } from "@/lib/db/client";
import { TENANT_ID } from "@/lib/config/platform";
import { mockScrapedUpdates } from "@/lib/db/mockData";
import { ScrapedUpdate } from "@/lib/types";

export const fetchScrapedUpdates = cache(async (): Promise<ScrapedUpdate[]> => {
  const client = getSupabaseClient("service");

  if (!client) return mockScrapedUpdates;

  const { data, error } = await client
    .from("scraped_updates")
    .select(
      "id,source_url,source_label,content,detected_at,processed,alert_sent,keywords"
    )
    .eq("tenant_id", TENANT_ID)
    .order("detected_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error("scraped updates fetch error", error);
    return mockScrapedUpdates;
  }

  return data.map((row) => ({
    id: row.id,
    sourceUrl: row.source_url,
    sourceLabel: row.source_label ?? undefined,
    content: row.content,
    detectedAt: row.detected_at,
    processed: row.processed,
    alertSent: row.alert_sent,
    keywords: row.keywords ?? [],
  }));
});
