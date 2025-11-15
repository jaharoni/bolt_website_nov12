import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

const clients: Record<string, SupabaseClient | null> = {};

type ClientRole = "anon" | "service";

export function getSupabaseClient(role: ClientRole = "anon") {
  const cacheKey = role;
  if (clients[cacheKey] !== undefined) {
    return clients[cacheKey];
  }

  const url = serverEnv.SUPABASE_URL;
  const key = role === "service" ? serverEnv.SUPABASE_SERVICE_ROLE_KEY : serverEnv.SUPABASE_ANON_KEY;

  if (!url || !key) {
    clients[cacheKey] = null;
    return null;
  }

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  clients[cacheKey] = client;
  return client;
}
