import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/serverClient";
import bcrypt from "bcryptjs";

const fallbackAdmin = {
  email: process.env.ADMIN_SEED_EMAIL ?? "admin@jamesportcivic.org",
  password: process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!",
};

export async function validateAdminCredentials(email: string, password: string) {
  if (!isSupabaseConfigured) {
    const isValid =
      email === fallbackAdmin.email && password === fallbackAdmin.password;
    return isValid
      ? { id: "local-admin", email, role: "super_admin" as const }
      : null;
  }

  const client = createServiceClient();
  const { data, error } = await client
    .from("admin_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) {
    return null;
  }

  return { id: data.id, email: data.email, role: data.role };
}
