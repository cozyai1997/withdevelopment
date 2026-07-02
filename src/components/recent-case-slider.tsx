"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCaseImagePublicUrl } from "@/lib/post-images";
import { boards } from "@/lib/site";
import type { PostWithImages } from "@/lib/types";
import type { CSSProperties, FocusEvent, MouseEvent, PointerEvent, TransitionEvent } from "react";

const LOOP_COPY_COUNT = 5;

function formatDate(value: string | null) {
  if (!value) {
    return "공개 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function CaseSlide({
  post,
  active = false,
  duplicate = false,
  onClick,
}: {
  post: PostWithImages;
  active?: boolean;
  duplicate?: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const image = post.images[0];
  const imageUrl = getCaseImagePublicUrl(image?.storage_path);

  return (
    <Link
      aria-hidden={duplicate || undefined}
      className={active ? "recent-case-slide recent-case-slide--active" : "recent-case-slide"}
      draggable={false}
      href={`${boards.cases.href}/${post.slug}`}
      onClick={onClick}
      tabIndex={duplicate ? -1 : undefined}
    >
      <div className="recent-case-slide__image">
        {imageUrl ? <img alt={image?.alt_text ?? post.title} draggable={false} src={imageUrl} /> : <div className="case-placeholder">사진 없음</div>}
      </div>
      <div className="recent-case-slide__body">
        <div className="case-card__meta">
          <span className="badge">{post.case_category ?? boards.cases.label}</span>
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
        </div>
        <h3>{post.title}</h3>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
      </div>
    </Link>
  );
}

export function RecentCaseSlider({ posts }: { posts: PostWithImages[] }) {
  const slides = posts.slice(0, 5);
  const canDrag = slides.length > 1;
  const loopStartIndex = canDrag ? slides.length * Math.floor(LOOP_COPY_COUNT / 2) : 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const clickSuppressTimerRef = useRef<number | null>(null);
  const dragRef = useRef({
    didDrag: false,
    pointerId: -1,
    startX: 0,
  });
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(loopStartIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoopResetting, setIsLoopResetting] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [slideStep, setSlideStep] = useState(0);
  const renderedSlides = canDrag
    ? Array.from({ length: slides.length * LOOP_COPY_COUNT }, (_, index) => slides[index % slides.length])
    : slides;

  const measureSlideStep = useCallback(() => {
    const track = trackRef.current;
    const firstSlide = track?.querySelector<HTMLElement>(".recent-case-slide");

    if (!track || !firstSlide) {
      return 0;
    }

    const trackStyle = window.getComputedStyle(track);
    const gap = Number.parseFloat(trackStyle.columnGap || trackStyle.gap || "0");

    return firstSlide.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);
  }, []);

  useEffect(() => {
    function syncSlideStep() {
      setSlideStep(measureSlideStep());
    }

    syncSlideStep();
    window.addEventListener("resize", syncSlideStep);

    return () => window.removeEventListener("resize", syncSlideStep);
  }, [measureSlideStep, slides.length]);

  useEffect(() => {
    if (!canDrag || isDragging || isUserPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => current + 1);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [canDrag, isDragging, isUserPaused]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) {
        window.clearTimeout(pauseTimerRef.current);
      }

      if (clickSuppressTimerRef.current) {
        window.clearTimeout(clickSuppressTimerRef.current);
      }
    };
  }, []);

  function pauseAutoPlay() {
    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    setIsUserPaused(true);
  }

  function resumeAutoPlayAfter(delay = 2600) {
    if (pauseTimerRef.current) {
      window.clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = window.setTimeout(() => {
      setIsUserPaused(false);
      pauseTimerRef.current = null;
    }, delay);
  }

  function moveTo(nextIndex: number) {
    if (!canDrag) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(nextIndex);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!canDrag || event.button !== 0) {
      return;
    }

    dragRef.current = {
      didDrag: false,
      pointerId: event.pointerId,
      startX: event.clientX,
    };
    pauseAutoPlay();
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const delta = event.clientX - dragRef.current.startX;
    const step = slideStep || measureSlideStep() || 1;
    const limitedDelta = Math.max(Math.min(delta, step * 0.9), step * -0.9);

    if (Math.abs(delta) > 6) {
      dragRef.current.didDrag = true;
    }

    setDragOffset(limitedDelta);
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const delta = event.clientX - dragRef.current.startX;
    const step = slideStep || measureSlideStep() || 1;
    const threshold = Math.min(96, Math.max(42, step * 0.18));

    if (dragRef.current.didDrag) {
      suppressClickRef.current = true;

      if (clickSuppressTimerRef.current) {
        window.clearTimeout(clickSuppressTimerRef.current);
      }

      clickSuppressTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        clickSuppressTimerRef.current = null;
      }, 360);
    }

    setIsDragging(false);
    setDragOffset(0);

    if (delta <= -threshold) {
      moveTo(activeIndex + 1);
    } else if (delta >= threshold) {
      moveTo(activeIndex - 1);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resumeAutoPlayAfter();
  }

  function handleSlideClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      resumeAutoPlayAfter();
    }
  }

  function resetLoopPositionIfNeeded() {
    if (!canDrag) {
      return;
    }

    const lowerResetIndex = slides.length;
    const upperResetIndex = slides.length * (LOOP_COPY_COUNT - 2);

    if (activeIndex < lowerResetIndex || activeIndex >= upperResetIndex) {
      setIsLoopResetting(true);
      setActiveIndex(loopStartIndex + wrapIndex(activeIndex, slides.length));

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setIsLoopResetting(false));
      });
    }
  }

  function handleTrackTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") {
      return;
    }

    resetLoopPositionIfNeeded();
  }

  if (slides.length === 0) {
    return (
      <div className="case-empty case-empty--compact">
        <p className="eyebrow">CASES</p>
        <h3>공개 가능한 시공 실적을 준비 중입니다</h3>
        <p>관리자에서 시공실적 게시글을 공개하면 최근 5개가 자동으로 표시됩니다.</p>
      </div>
    );
  }

  const safeActiveIndex = wrapIndex(activeIndex, slides.length);
  const trackStyle: CSSProperties = {
    transform: `translate3d(${slideStep ? -activeIndex * slideStep + dragOffset : dragOffset}px, 0, 0)`,
  };
  const sliderClassName = [
    "recent-case-slider",
    isDragging ? "recent-case-slider--dragging" : "",
    isLoopResetting ? "recent-case-slider--loop-reset" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={sliderClassName}
      aria-label="최근 시공 실적"
      onBlur={handleBlur}
      onFocus={pauseAutoPlay}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={() => resumeAutoPlayAfter(1600)}
    >
      <div
        className={canDrag ? "recent-case-slider__viewport recent-case-slider__viewport--draggable" : "recent-case-slider__viewport"}
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
      >
        <div
          className={canDrag ? "recent-case-slider__track" : "recent-case-slider__track recent-case-slider__track--static"}
          onTransitionEnd={handleTrackTransitionEnd}
          ref={trackRef}
          style={trackStyle}
        >
          {renderedSlides.map((post, index) => (
            <CaseSlide
              active={wrapIndex(index, slides.length) === safeActiveIndex}
              duplicate={canDrag && (index < loopStartIndex || index >= loopStartIndex + slides.length)}
              key={`${post.id}-${index}`}
              onClick={handleSlideClick}
              post={post}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
