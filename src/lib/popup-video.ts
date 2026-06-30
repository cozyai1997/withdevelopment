import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PopupVideoSetting } from "@/lib/types";

export const HOME_POPUP_VIDEO_ID = "home";
export const DEFAULT_POPUP_VIDEO_URL = "https://youtu.be/o2ogVKgrCS4?si=svNUnVizhhgcIEvz";

export type PopupVideo = {
  youtubeUrl: string;
  embedUrl: string;
  watchUrl: string;
};

function normalizeYouTubeHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
}

export function extractYouTubeVideoId(input: string) {
  const value = input.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const host = normalizeYouTubeHost(url.hostname);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") {
      return pathParts[0] ?? null;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      if ((pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live") && pathParts[1]) {
        return pathParts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function createPopupVideoFromUrl(youtubeUrl: string): PopupVideo | null {
  const videoId = extractYouTubeVideoId(youtubeUrl);

  if (!videoId || !/^[A-Za-z0-9_-]{6,32}$/.test(videoId)) {
    return null;
  }

  return {
    youtubeUrl,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export async function getPublicPopupVideo() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return createPopupVideoFromUrl(DEFAULT_POPUP_VIDEO_URL);
  }

  const { data } = await supabase
    .from("popup_video_settings")
    .select("id,youtube_url,enabled,created_at,updated_at")
    .eq("id", HOME_POPUP_VIDEO_ID)
    .eq("enabled", true)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return createPopupVideoFromUrl(data.youtube_url);
}

export async function getAdminPopupVideoSetting(): Promise<PopupVideoSetting | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("popup_video_settings")
    .select("id,youtube_url,enabled,created_at,updated_at")
    .eq("id", HOME_POPUP_VIDEO_ID)
    .maybeSingle();

  return data;
}
