import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<Profile | null> {
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
