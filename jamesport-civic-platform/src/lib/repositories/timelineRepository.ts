import { cache } from "react";
import { getSupabaseClient } from "@/lib/db/client";
import { mockTimelineEvents } from "@/lib/db/mockData";
import { TENANT_ID } from "@/lib/config/platform";
import { TimelineEvent, EventCategory } from "@/lib/types";

type TimelineRow = {
  id: string;
  date: string;
  title: string;
  description: string;
  event_type: EventCategory;
  source_url?: string | null;
  tags?: string[] | null;
  documents?: { label: string; url: string }[] | null;
  created_by?: string | null;
};

export type TimelineFilter = {
  eventType?: EventCategory;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
};

const mapRecord = (record: TimelineRow): TimelineEvent => ({
  id: record.id,
  date: record.date,
  title: record.title,
  description: record.description,
  eventType: record.event_type,
  sourceUrl: record.source_url ?? undefined,
  tags: record.tags ?? [],
  documents: record.documents ?? [],
  createdBy: record.created_by ?? undefined,
});

export const fetchTimeline = cache(async (filter?: TimelineFilter): Promise<TimelineEvent[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return mockTimelineEvents;
  }

  let query = client
    .from("timeline_events")
    .select("id,date,title,description,event_type,source_url,tags,documents,created_by")
    .eq("tenant_id", TENANT_ID)
    .order("date", { ascending: false });

  if (filter?.eventType) {
    query = query.eq("event_type", filter.eventType);
  }

  if (filter?.dateFrom) {
    query = query.gte("date", filter.dateFrom);
  }

  if (filter?.dateTo) {
    query = query.lte("date", filter.dateTo);
  }

  if (filter?.tags && filter.tags.length) {
    query = query.overlaps("tags", filter.tags);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("timeline fetch error", error);
    return mockTimelineEvents;
  }

  return data.map(mapRecord);
});

export async function createTimelineEvent(payload: Omit<TimelineEvent, "id">) {
  const client = getSupabaseClient("service");
  if (!client) {
    throw new Error("Supabase service client not configured");
  }

  const { error } = await client.from("timeline_events").insert({
    tenant_id: TENANT_ID,
    date: payload.date,
    title: payload.title,
    description: payload.description,
    event_type: payload.eventType,
    source_url: payload.sourceUrl,
    documents: payload.documents,
    tags: payload.tags,
  });

  if (error) {
    throw error;
  }
}

export async function updateTimelineEvent(id: string, payload: Partial<Omit<TimelineEvent, "id">>) {
  const client = getSupabaseClient("service");
  if (!client) {
    throw new Error("Supabase service client not configured");
  }

  const { error } = await client
    .from("timeline_events")
    .update({
      date: payload.date,
      title: payload.title,
      description: payload.description,
      event_type: payload.eventType,
      source_url: payload.sourceUrl,
      documents: payload.documents,
      tags: payload.tags,
    })
    .eq("id", id)
    .eq("tenant_id", TENANT_ID);

  if (error) {
    throw error;
  }
}

export async function deleteTimelineEvent(id: string) {
  const client = getSupabaseClient("service");
  if (!client) {
    throw new Error("Supabase service client not configured");
  }

  const { error } = await client
    .from("timeline_events")
    .delete()
    .eq("id", id)
    .eq("tenant_id", TENANT_ID);

  if (error) {
    throw error;
  }
}
