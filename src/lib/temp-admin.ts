import { createHash } from "node:crypto";
import type { Profile } from "./types";

export const TEMP_ADMIN_ID = "admin";
export const TEMP_ADMIN_PASSWORD = "1234";
export const TEMP_ADMIN_COOKIE = "withdevelopment-temp-admin";

export function isTempAdminEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DISABLE_TEMP_ADMIN !== "true";
}

export function getTempAdminCookieValue() {
  return createHash("sha256").update(`${TEMP_ADMIN_ID}:${TEMP_ADMIN_PASSWORD}:withdevelopment`).digest("hex");
}

export function isTempAdminCredentials(id: string, password: string) {
  return isTempAdminEnabled() && id.trim() === TEMP_ADMIN_ID && password === TEMP_ADMIN_PASSWORD;
}

export function isTempAdminSession(value: string | undefined) {
  return isTempAdminEnabled() && value === getTempAdminCookieValue();
}

export function getTempAdminProfile(): Profile {
  return {
    id: "temp-admin",
    email: TEMP_ADMIN_ID,
    role: "admin",
    created_at: null,
    updated_at: null,
  };
}
