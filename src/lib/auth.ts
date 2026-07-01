import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTempAdminProfile, isTempAdminSession, TEMP_ADMIN_COOKIE } from "@/lib/temp-admin";
import type { Profile } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const tempAdminCookie = cookieStore.get(TEMP_ADMIN_COOKIE)?.value;

  if (isTempAdminSession(tempAdminCookie)) {
    return getTempAdminProfile();
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,role,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    return data;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: "pending",
    created_at: null,
    updated_at: null,
  };
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }

  return profile;
}
