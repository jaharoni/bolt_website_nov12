import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/serverClient";
import { ResidentProfile } from "@/lib/types";
import { registrationSchema } from "@/lib/validators/schemas";
import { v4 as uuid } from "uuid";

const fallbackResidents: ResidentProfile[] = [];

export async function registerResident(payload: unknown) {
  const parsed = registrationSchema.parse(payload);
  const record: ResidentProfile = {
    id: uuid(),
    name: parsed.name,
    email: parsed.email,
    phone: parsed.phone || undefined,
    volunteerRole: parsed.volunteerRole,
    alertPrefs: parsed.alertPrefs,
    confirmed: false,
  };

  if (!isSupabaseConfigured) {
    fallbackResidents.push(record);
    return {
      ...record,
      confirmationToken: record.id,
    };
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("users")
    .insert({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      volunteer_role: record.volunteerRole,
      alert_prefs: record.alertPrefs,
      confirmed: false,
      confirmation_token: record.id,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to register resident", error.message);
    throw new Error("Unable to register at this time.");
  }

  return data;
}

export async function confirmResident(token: string) {
  if (!isSupabaseConfigured) {
    const resident = fallbackResidents.find((item) => item.id === token);
    if (resident) {
      resident.confirmed = true;
      return resident;
    }
    throw new Error("Confirmation token not found.");
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("users")
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq("confirmation_token", token)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Confirmation link is invalid or expired.");
  }

  return data;
}

export async function listResidents() {
  if (!isSupabaseConfigured) {
    return fallbackResidents;
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to list residents", error.message);
    throw new Error("Unable to list residents");
  }

  return (
    data?.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone ?? undefined,
      volunteerRole: row.volunteer_role ?? undefined,
      alertPrefs: row.alert_prefs ?? {
        generalUpdates: true,
        meetingAlerts: true,
        volunteerOpportunities: false,
        smsOptIn: false,
        keywords: [],
      },
      confirmed: row.confirmed,
    })) ?? []
  );
}

export async function getResidentStats() {
  if (!isSupabaseConfigured) {
    return {
      total: fallbackResidents.length,
      confirmed: fallbackResidents.filter((r) => r.confirmed).length,
      volunteers: fallbackResidents.filter((r) => !!r.volunteerRole).length,
    };
  }

  const client = createServiceClient();
  const [{ count: total }, { count: confirmed }, { count: volunteers }] =
    await Promise.all([
      client.from("users").select("*", { count: "exact", head: true }),
      client
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("confirmed", true),
      client
        .from("users")
        .select("*", { count: "exact", head: true })
        .not("volunteer_role", "is", null),
    ]);

  return {
    total: total ?? 0,
    confirmed: confirmed ?? 0,
    volunteers: volunteers ?? 0,
  };
}
