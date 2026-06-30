"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readString, validatePostFields } from "@/lib/validation";

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

async function requireSupabaseForAdmin(): Promise<NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithMessage("/admin", "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  return supabase;
}

export async function createPost(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await requireSupabaseForAdmin();

  const fields = validatePostFields(formData);
  const now = new Date().toISOString();

  const { error } = await supabase.from("posts").insert({
    ...fields,
    published_at: fields.status === "published" ? now : null,
    created_by: profile.id,
    updated_by: profile.id,
  });

  if (error) {
    redirectWithMessage("/admin/posts/new", "게시글을 저장하지 못했습니다. 슬러그 중복 여부를 확인해 주세요.");
  }

  revalidatePath("/");
  revalidatePath(`/${fields.board}`);
  redirectWithMessage("/admin", "게시글을 저장했습니다.");
}

export async function updatePost(id: string, formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await requireSupabaseForAdmin();

  const fields = validatePostFields(formData);
  const now = new Date().toISOString();

  const { data: current } = await supabase.from("posts").select("published_at").eq("id", id).maybeSingle();

  const { error } = await supabase
    .from("posts")
    .update({
      ...fields,
      published_at: fields.status === "published" ? current?.published_at ?? now : null,
      updated_by: profile.id,
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage(`/admin/posts/${id}/edit`, "게시글을 수정하지 못했습니다. 슬러그 중복 여부를 확인해 주세요.");
  }

  revalidatePath("/");
  revalidatePath(`/${fields.board}`);
  redirectWithMessage("/admin", "게시글을 수정했습니다.");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const supabase = await requireSupabaseForAdmin();
  const id = readString(formData, "id");

  if (!id) {
    redirectWithMessage("/admin", "게시글 삭제 요청을 확인해 주세요.");
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    redirectWithMessage("/admin", "게시글을 삭제하지 못했습니다.");
  }

  revalidatePath("/");
  redirectWithMessage("/admin", "게시글을 삭제했습니다.");
}

export async function setPostStatus(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = await requireSupabaseForAdmin();
  const id = readString(formData, "id");
  const status = readString(formData, "status");

  if (!id || (status !== "draft" && status !== "published")) {
    redirectWithMessage("/admin", "게시글 상태 변경 요청을 확인해 주세요.");
  }

  const { error } = await supabase
    .from("posts")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_by: profile.id,
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("/admin", "게시글 상태를 변경하지 못했습니다.");
  }

  revalidatePath("/");
  redirectWithMessage("/admin", "게시글 상태를 변경했습니다.");
}
