import { cache } from "react";
import { getSupabaseClient } from "@/lib/db/client";
import { TENANT_ID } from "@/lib/config/platform";
import { mockTimelineEvents } from "@/lib/db/mockData";
import { AlertPreferences } from "@/lib/types";

export interface CivicUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  alertPrefs: AlertPreferences;
  volunteerRole?: string | null;
  committeeInterest?: string | null;
  confirmed: boolean;
  createdAt: string;
}

const fallbackUsers: CivicUser[] = mockTimelineEvents.slice(0, 2).map((event, idx) => ({
  id: `mock-user-${idx}`,
  name: idx === 0 ? "Jamie Neighbor" : "Alex Volunteer",
  email: idx === 0 ? "jamie@example.com" : "alex@example.com",
  phone: idx === 0 ? "(631) 555-3490" : null,
  alertPrefs: { general: true, meetings: true, volunteer: idx !== 0 },
  volunteerRole: idx === 0 ? null : "Logistics",
  committeeInterest: idx === 0 ? "Letter writing" : "Events",
  confirmed: idx === 0,
  createdAt: event.date,
}));

export const fetchUsers = cache(async (): Promise<CivicUser[]> => {
  const client = getSupabaseClient("service");
  if (!client) return fallbackUsers;

  const { data, error } = await client
    .from("users")
    .select(
      "id,name,email,phone,alert_prefs,volunteer_role,committee_interest,confirmed,created_at"
    )
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error || !data) {
    console.error("user fetch error", error);
    return fallbackUsers;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    alertPrefs: row.alert_prefs,
    volunteerRole: row.volunteer_role,
    committeeInterest: row.committee_interest,
    confirmed: row.confirmed,
    createdAt: row.created_at,
  }));
});

export async function insertUser(payload: {
  name: string;
  email: string;
  phone?: string;
  alertPrefs: AlertPreferences;
  volunteerRole?: string;
  committeeInterest?: string;
  confirmationToken: string;
}) {
  const client = getSupabaseClient("service");
  if (!client) {
    throw new Error("Supabase service client not configured");
  }

  const { error } = await client.from("users").upsert(
    {
      tenant_id: TENANT_ID,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      alert_prefs: payload.alertPrefs,
      volunteer_role: payload.volunteerRole,
      committee_interest: payload.committeeInterest,
      confirmation_token: payload.confirmationToken,
      confirmed: false,
    },
    { onConflict: "email" }
  );

  if (error) {
    throw error;
  }
}

export async function confirmUser(token: string) {
  const client = getSupabaseClient("service");
  if (!client) return false;

  const { data, error } = await client
    .from("users")
    .update({ confirmed: true, confirmed_at: new Date().toISOString(), confirmation_token: null })
    .eq("confirmation_token", token)
    .eq("tenant_id", TENANT_ID)
    .select("id")
    .single();

  if (error || !data) {
    console.error("confirm user error", error);
    return false;
  }

  return true;
}
