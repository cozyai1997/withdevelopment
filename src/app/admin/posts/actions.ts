"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isLocalMockMode } from "@/lib/local-mock-mode";
import { localMockStore } from "@/lib/local-mock-store";
import { CASE_IMAGE_BUCKET, isAllowedCaseImageFile, normalizeCaseImageFileName } from "@/lib/post-images";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Board, PostStatus } from "@/lib/types";
import { readString, validatePostFields } from "@/lib/validation";

type AdminSupabase = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

async function requireSupabaseForAdmin(): Promise<AdminSupabase> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithMessage("/admin", "Supabase 환경변수를 먼저 설정해 주세요.");
  }

  return supabase;
}

function revalidatePostPaths(board: Board, slug?: string | null) {
  revalidatePath("/");
  revalidatePath(`/${board}`);

  if (slug) {
    revalidatePath(`/${board}/${slug}`);
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
}

function parsePostFields(formData: FormData, errorPath: string) {
  try {
    return validatePostFields(formData);
  } catch (error) {
    redirectWithMessage(errorPath, getErrorMessage(error));
  }
}

function readIdList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function readCaseImageFiles(formData: FormData) {
  return formData.getAll("case_images").filter((value): value is File => value instanceof File && value.size > 0);
}

function readImageSyncOptions(formData: FormData) {
  return {
    orderedImageIds: readIdList(formData, "existing_image_ids"),
    deleteImageIds: readIdList(formData, "delete_image_ids"),
    imageFiles: readCaseImageFiles(formData),
  };
}

async function removeCaseImageObjects(supabase: AdminSupabase, paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from(CASE_IMAGE_BUCKET).remove(paths);

  if (error) {
    throw new Error("이미지 파일을 삭제하지 못했습니다.");
  }
}

async function uploadCaseImages({
  supabase,
  postId,
  files,
  title,
  startOrder,
}: {
  supabase: AdminSupabase;
  postId: string;
  files: File[];
  title: string;
  startOrder: number;
}) {
  if (files.length === 0) {
    return;
  }

  const uploadedPaths: string[] = [];
  const rows: {
    post_id: string;
    bucket: typeof CASE_IMAGE_BUCKET;
    storage_path: string;
    alt_text: string;
    sort_order: number;
  }[] = [];

  try {
    for (const [index, file] of files.entries()) {
      if (!isAllowedCaseImageFile(file)) {
        throw new Error("이미지는 JPG, JPEG, PNG 형식의 10MB 이하 파일만 등록할 수 있습니다.");
      }

      const fileName = normalizeCaseImageFileName(file.name);
      const storagePath = `posts/${postId}/${Date.now()}-${index}-${randomUUID()}-${fileName}`;
      const { error } = await supabase.storage.from(CASE_IMAGE_BUCKET).upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        throw new Error("이미지 파일을 업로드하지 못했습니다.");
      }

      uploadedPaths.push(storagePath);
      rows.push({
        post_id: postId,
        bucket: CASE_IMAGE_BUCKET,
        storage_path: storagePath,
        alt_text: `${title} 이미지 ${startOrder + index + 1}`,
        sort_order: startOrder + index,
      });
    }

    const { error } = await supabase.from("post_images").insert(rows);

    if (error) {
      throw new Error("이미지 정보를 저장하지 못했습니다.");
    }
  } catch (error) {
    await removeCaseImageObjects(supabase, uploadedPaths).catch(() => undefined);
    throw error;
  }
}

async function deletePostImagesByIds(supabase: AdminSupabase, postId: string, imageIds: string[]) {
  if (imageIds.length === 0) {
    return;
  }

  const { data, error } = await supabase.from("post_images").select("id, storage_path").eq("post_id", postId).in("id", imageIds);

  if (error) {
    throw new Error("삭제할 이미지를 확인하지 못했습니다.");
  }

  await removeCaseImageObjects(
    supabase,
    (data ?? []).map((image) => image.storage_path),
  );

  const { error: deleteError } = await supabase.from("post_images").delete().eq("post_id", postId).in("id", imageIds);

  if (deleteError) {
    throw new Error("이미지 정보를 삭제하지 못했습니다.");
  }
}

async function deleteAllPostImages(supabase: AdminSupabase, postId: string) {
  const { data, error } = await supabase.from("post_images").select("id, storage_path").eq("post_id", postId);

  if (error) {
    throw new Error("게시글 이미지를 확인하지 못했습니다.");
  }

  const imageIds = (data ?? []).map((image) => image.id);
  await removeCaseImageObjects(
    supabase,
    (data ?? []).map((image) => image.storage_path),
  );

  if (imageIds.length === 0) {
    return;
  }

  const { error: deleteError } = await supabase.from("post_images").delete().eq("post_id", postId).in("id", imageIds);

  if (deleteError) {
    throw new Error("이미지 정보를 삭제하지 못했습니다.");
  }
}

async function syncPostImages(supabase: AdminSupabase, postId: string, formData: FormData, title: string) {
  const orderedImageIds = readIdList(formData, "existing_image_ids");
  const deleteImageIds = readIdList(formData, "delete_image_ids");
  const files = readCaseImageFiles(formData);

  await deletePostImagesByIds(supabase, postId, deleteImageIds);

  const keptImageIds = orderedImageIds.filter((id) => !deleteImageIds.includes(id));

  for (const [index, imageId] of keptImageIds.entries()) {
    const { error } = await supabase.from("post_images").update({ sort_order: index }).eq("post_id", postId).eq("id", imageId);

    if (error) {
      throw new Error("이미지 순서를 저장하지 못했습니다.");
    }
  }

  await uploadCaseImages({
    supabase,
    postId,
    files,
    title,
    startOrder: keptImageIds.length,
  });
}

export async function createPost(formData: FormData) {
  const profile = await requireAdmin();
  const fields = parsePostFields(formData, "/admin/posts/new");

  if (isLocalMockMode()) {
    try {
      const post = await localMockStore.createPost(fields, {
        imageFiles: fields.board === "cases" ? readCaseImageFiles(formData) : [],
      });
      revalidatePostPaths(post.board, post.slug);
      redirectWithMessage("/admin", "게시글을 저장했습니다. Local Mock Mode에 저장되었습니다.");
    } catch (error) {
      redirectWithMessage("/admin/posts/new", getErrorMessage(error));
    }
  }

  const supabase = await requireSupabaseForAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...fields,
      published_at: fields.status === "published" ? now : null,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirectWithMessage("/admin/posts/new", "게시글을 저장하지 못했습니다. 슬러그 중복 여부를 확인해 주세요.");
  }

  try {
    if (fields.board === "cases") {
      await uploadCaseImages({
        supabase,
        postId: data.id,
        files: readCaseImageFiles(formData),
        title: fields.title,
        startOrder: 0,
      });
    }
  } catch (error) {
    await supabase.from("posts").delete().eq("id", data.id);
    redirectWithMessage("/admin/posts/new", getErrorMessage(error));
  }

  revalidatePostPaths(fields.board, fields.slug);
  redirectWithMessage("/admin", "게시글을 저장했습니다.");
}

export async function updatePost(id: string, formData: FormData) {
  const profile = await requireAdmin();
  const fields = parsePostFields(formData, `/admin/posts/${id}/edit`);

  if (isLocalMockMode()) {
    const current = await localMockStore.getAdminPost(id);

    if (!current) {
      redirectWithMessage("/admin", "수정할 게시글을 찾지 못했습니다.");
    }

    try {
      const post = await localMockStore.updatePost(id, fields, fields.board === "cases" ? readImageSyncOptions(formData) : {});
      revalidatePostPaths(current.board, current.slug);
      revalidatePostPaths(post.board, post.slug);
      redirectWithMessage("/admin", "게시글을 수정했습니다. Local Mock Mode에 저장되었습니다.");
    } catch (error) {
      redirectWithMessage(`/admin/posts/${id}/edit`, getErrorMessage(error));
    }
  }

  const supabase = await requireSupabaseForAdmin();
  const now = new Date().toISOString();

  const { data: current, error: currentError } = await supabase
    .from("posts")
    .select("board, slug, published_at")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    redirectWithMessage("/admin", "수정할 게시글을 찾지 못했습니다.");
  }

  const { error } = await supabase
    .from("posts")
    .update({
      ...fields,
      published_at: fields.status === "published" ? current.published_at ?? now : null,
      updated_by: profile.id,
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage(`/admin/posts/${id}/edit`, "게시글을 수정하지 못했습니다. 슬러그 중복 여부를 확인해 주세요.");
  }

  try {
    if (fields.board === "cases") {
      await syncPostImages(supabase, id, formData, fields.title);
    } else {
      await deleteAllPostImages(supabase, id);
    }
  } catch (error) {
    redirectWithMessage(`/admin/posts/${id}/edit`, getErrorMessage(error));
  }

  revalidatePostPaths(current.board, current.slug);
  revalidatePostPaths(fields.board, fields.slug);
  redirectWithMessage("/admin", "게시글을 수정했습니다.");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = readString(formData, "id");

  if (!id) {
    redirectWithMessage("/admin", "삭제할 게시글을 확인해 주세요.");
  }

  if (isLocalMockMode()) {
    const deleted = await localMockStore.deletePost(id);

    if (deleted) {
      revalidatePostPaths(deleted.board, deleted.slug);
    } else {
      revalidatePath("/");
    }

    redirectWithMessage("/admin", "게시글을 삭제했습니다. Local Mock Mode에서 삭제되었습니다.");
  }

  const supabase = await requireSupabaseForAdmin();
  const { data: current } = await supabase.from("posts").select("board, slug").eq("id", id).maybeSingle();

  try {
    await deleteAllPostImages(supabase, id);
  } catch (error) {
    redirectWithMessage("/admin", getErrorMessage(error));
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    redirectWithMessage("/admin", "게시글을 삭제하지 못했습니다.");
  }

  if (current) {
    revalidatePostPaths(current.board, current.slug);
  } else {
    revalidatePath("/");
  }

  redirectWithMessage("/admin", "게시글을 삭제했습니다.");
}

export async function setPostStatus(formData: FormData) {
  const profile = await requireAdmin();
  const id = readString(formData, "id");
  const status = readString(formData, "status") as PostStatus;

  if (!id || (status !== "draft" && status !== "published")) {
    redirectWithMessage("/admin", "게시글 상태 변경 요청을 확인해 주세요.");
  }

  if (isLocalMockMode()) {
    try {
      const post = await localMockStore.setPostStatus(id, status);
      revalidatePostPaths(post.board, post.slug);
      redirectWithMessage("/admin", "게시글 상태를 변경했습니다. Local Mock Mode에 저장되었습니다.");
    } catch (error) {
      redirectWithMessage("/admin", getErrorMessage(error));
    }
  }

  const supabase = await requireSupabaseForAdmin();
  const { data: current } = await supabase.from("posts").select("board, slug").eq("id", id).maybeSingle();
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

  if (current) {
    revalidatePostPaths(current.board, current.slug);
  } else {
    revalidatePath("/");
  }

  redirectWithMessage("/admin", "게시글 상태를 변경했습니다.");
}
