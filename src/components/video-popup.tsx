"use client";

import { useEffect, useId, useState } from "react";
import type { PopupVideo } from "@/lib/popup-video";

const VIDEO_POPUP_HIDE_UNTIL_KEY = "hamkke_video_popup_hide_until";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function VideoPopup({ video }: { video: PopupVideo | null }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!video) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        const hideUntil = Number(window.localStorage.getItem(VIDEO_POPUP_HIDE_UNTIL_KEY) ?? "0");

        if (hideUntil > Date.now()) {
          return;
        }
      } catch {
        // Keep the popup visible when localStorage is unavailable.
      }

      setOpen(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [video]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const closeForOneDay = () => {
    try {
      window.localStorage.setItem(VIDEO_POPUP_HIDE_UNTIL_KEY, String(Date.now() + ONE_DAY_MS));
    } catch {
      // Closing still works even when localStorage is unavailable.
    }

    setOpen(false);
  };

  if (!video || !open) {
    return null;
  }

  return (
    <div className="video-popup" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="video-popup__dialog">
        <div className="video-popup__header">
          <div>
            <p className="eyebrow">VIDEO</p>
            <h2 id={titleId}>연합뉴스경제TV 인터뷰 영상</h2>
          </div>
          <button className="video-popup__close" type="button" onClick={() => setOpen(false)}>
            닫기
          </button>
        </div>
        <div className="video-popup__frame">
          <iframe
            title="연합뉴스경제TV 인터뷰 영상"
            src={video.embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <a className="text-link" href={video.watchUrl} target="_blank" rel="noreferrer">
          유튜브에서 보기
        </a>
        <div className="video-popup__actions">
          <button type="button" onClick={closeForOneDay}>
            1일 동안 보지 않음
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
