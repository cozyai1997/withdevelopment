"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readRole, readString } from "@/lib/validation";

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const id = readString(formData, "id");
  const role = readRole(formData);

  if (!supabase || !id) {
    redirect(`/admin/users?message=${encodeURIComponent("가입자 승인 요청을 확인해 주세요.")}`);
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);

  if (error) {
    redirect(`/admin/users?message=${encodeURIComponent("권한을 변경하지 못했습니다.")}`);
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users?message=${encodeURIComponent("권한을 변경했습니다.")}`);
}
