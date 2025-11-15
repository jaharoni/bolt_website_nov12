import crypto from "node:crypto";
import { serverEnv } from "@/lib/env";

export function expectedAdminHash() {
  if (!serverEnv.ADMIN_DASHBOARD_PASSWORD || !serverEnv.ADMIN_DASHBOARD_SESSION_SALT) {
    return null;
  }

  return crypto
    .createHash("sha256")
    .update(`${serverEnv.ADMIN_DASHBOARD_PASSWORD}:${serverEnv.ADMIN_DASHBOARD_SESSION_SALT}`)
    .digest("hex");
}
