import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/serverClient";
import { TimelineEvent } from "@/lib/types";
import { timelineEventSchema } from "@/lib/validators/schemas";
import { mockTimeline } from "@/lib/data/mockTimeline";
import { v4 as uuid } from "uuid";

type TimelineFilters = {
  eventType?: string;
  startDate?: string;
  endDate?: string;
  includeDrafts?: boolean;
};

export async function fetchTimelineEvents(filters: TimelineFilters = {}) {
  if (!isSupabaseConfigured) {
    return mockTimeline;
  }

  const client = createServiceClient();
  let query = client.from("timeline_events").select("*").order("date", {
    ascending: true,
  });

  if (filters.eventType) {
    query = query.eq("event_type", filters.eventType);
  }
  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }
  if (!filters.includeDrafts) {
    query = query.eq("status", "published");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load timeline events", error.message);
    throw new Error("Unable to load timeline events");
  }

  return (
    data?.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      eventType: event.event_type,
      tags: event.tags ?? [],
      sourceUrl: event.source_url ?? undefined,
      documents: event.documents ?? [],
      createdBy: event.created_by ?? undefined,
      createdAt: event.created_at ?? undefined,
      updatedAt: event.updated_at ?? undefined,
      status: event.status ?? "draft",
      location: event.location ?? undefined,
    })) ?? []
  );
}

export async function createTimelineEvent(
  payload: Omit<TimelineEvent, "id">
) {
  const parsed = timelineEventSchema.omit({ id: true }).parse(payload);

  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Unable to create events.");
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("timeline_events")
    .insert({
      id: uuid(),
      title: parsed.title,
      description: parsed.description,
      date: parsed.date,
      event_type: parsed.eventType,
      tags: parsed.tags,
      source_url: parsed.sourceUrl,
      documents: parsed.documents,
      status: parsed.status,
      location: parsed.location,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create timeline event", error.message);
    throw new Error("Unable to save timeline event");
  }

  return data;
}

export async function updateTimelineEvent(
  id: string,
  payload: Partial<TimelineEvent>
) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Unable to update events.");
  }
  const parsed = timelineEventSchema.partial().parse(payload);

  const client = createServiceClient();
  const { data, error } = await client
    .from("timeline_events")
    .update({
      title: parsed.title,
      description: parsed.description,
      date: parsed.date,
      event_type: parsed.eventType,
      tags: parsed.tags,
      source_url: parsed.sourceUrl,
      documents: parsed.documents,
      status: parsed.status,
      location: parsed.location,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update timeline event", error.message);
    throw new Error("Unable to update timeline event");
  }

  return data;
}

export async function deleteTimelineEvent(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Unable to delete events.");
  }

  const client = createServiceClient();
  const { error } = await client.from("timeline_events").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete timeline event", error.message);
    throw new Error("Unable to delete timeline event");
  }
}
