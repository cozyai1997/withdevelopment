"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createPopupVideoFromUrl, HOME_POPUP_VIDEO_ID } from "@/lib/popup-video";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readString } from "@/lib/validation";

function redirectWithMessage(message: string): never {
  redirect(`/admin/popup?message=${encodeURIComponent(message)}`);
}

export async function updatePopupVideoSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const youtubeUrl = readString(formData, "youtubeUrl");
  const enabled = formData.get("enabled") === "on";

  if (!supabase) {
    redirectWithMessage("Supabase 환경변수를 먼저 설정해 주세요.");
  }

  if (!createPopupVideoFromUrl(youtubeUrl)) {
    redirectWithMessage("유효한 YouTube URL을 입력해 주세요.");
  }

  const { error } = await supabase.from("popup_video_settings").upsert(
    {
      id: HOME_POPUP_VIDEO_ID,
      youtube_url: youtubeUrl,
      enabled,
    },
    { onConflict: "id" },
  );

  if (error) {
    redirectWithMessage("영상 팝업 설정을 저장하지 못했습니다.");
  }

  revalidatePath("/");
  revalidatePath("/admin/popup");
  redirectWithMessage("영상 팝업 설정을 저장했습니다.");
}
