import { createClient } from "@supabase/supabase-js";
import "server-only";

const requiredKeys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const isSupabaseConfigured = requiredKeys.every(
  (key) => !!process.env[key]
);

const getEnv = (key: (typeof requiredKeys)[number]) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const createServiceClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase variables are not configured yet.");
  }

  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export const createAnonClient = () => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase variables are not configured yet.");
  }

  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));
};
