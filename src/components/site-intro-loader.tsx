"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

const INTRO_STORAGE_KEY = "hamkke_site_intro_entered";
const INTRO_MESSAGE_LINES = [
  "다양한 현장 경험을 바탕으로",
  "신속한 업무 처리와 만족하실 수 있는",
  "공사 결과를 약속드리겠습니다.",
  "주식회사 함께하는개발",
];

export function SiteIntroLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const introRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const completeRef = useRef(false);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const revealStateRef = useRef({ progress: 0 });
  const revealTweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const autoRevealRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    readyRef.current = false;
    completeRef.current = false;
    progressRef.current = 0;
    targetProgressRef.current = 0;
    revealStateRef.current.progress = 0;
    revealTweenRef.current?.kill();
    revealTweenRef.current = null;
    autoRevealRef.current = false;
    touchYRef.current = null;

    if (pathname.startsWith("/admin")) {
      root.dataset.siteIntro = "skip";
      const skipTimer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    let hasSeenIntro = false;
    const shouldReplayIntro = window.location.search.includes("intro_check=");

    try {
      hasSeenIntro = sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
    } catch {
      hasSeenIntro = false;
    }

    if (hasSeenIntro && !shouldReplayIntro) {
      root.dataset.siteIntro = "skip";
      const skipTimer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    root.dataset.siteIntro = "active";
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!introRef.current) {
      return () => {
        window.clearTimeout(showTimer);
      };
    }

    const completeIntro = () => {
      if (completeRef.current) {
        return;
      }

      completeRef.current = true;
      readyRef.current = false;
      autoRevealRef.current = true;
      revealTweenRef.current?.kill();
      revealTweenRef.current = null;

      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        // Keep the intro usable even when sessionStorage is unavailable.
      }

      gsap.to(introRef.current, {
        opacity: 0,
        duration: 0.32,
        ease: "power2.out",
        onComplete: () => {
          root.dataset.siteIntro = "done";
          setVisible(false);

          if (pathname !== "/") {
            router.push("/");
          }
        },
      });
    };

    const renderRevealProgress = (nextProgress: number) => {
      const intro = introRef.current;

      if (!intro || completeRef.current) {
        return;
      }

      const progress = Math.max(0, Math.min(1, nextProgress));
      const normalizedProgress = progress >= 0.995 ? 1 : progress;
      const easedProgress = 1 - Math.pow(1 - normalizedProgress, 2.45);
      progressRef.current = normalizedProgress;
      revealStateRef.current.progress = normalizedProgress;
      intro.style.setProperty("--intro-clip-radius", `${normalizedProgress === 0 ? -2 : easedProgress * 145}vmax`);

      gsap.set(".site-intro__thanks", {
        y: easedProgress * 72,
        opacity: Math.max(0, 1 - normalizedProgress * 1.28),
        filter: `blur(${normalizedProgress * 7}px)`,
      });
      gsap.set(".site-intro__scroll-cue", {
        y: easedProgress * 54,
        opacity: Math.max(0, 1 - normalizedProgress * 1.85),
      });

      if (normalizedProgress >= 1) {
        completeIntro();
      }
    };

    const startAutoReveal = () => {
      if (!readyRef.current || autoRevealRef.current || completeRef.current) {
        return;
      }

      autoRevealRef.current = true;
      readyRef.current = false;
      targetProgressRef.current = 1;
      introRef.current?.setAttribute("data-scroll-ready", "auto");
      revealTweenRef.current?.kill();
      revealTweenRef.current = gsap.to(revealStateRef.current, {
        progress: 1,
        duration: 1.15,
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: () => renderRevealProgress(revealStateRef.current.progress),
        onComplete: () => renderRevealProgress(1),
      });
    };

    const applyScrollDelta = (delta: number) => {
      if (!readyRef.current || autoRevealRef.current || completeRef.current) {
        return;
      }

      if (delta > 4) {
        startAutoReveal();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!readyRef.current || completeRef.current) {
        return;
      }

      event.preventDefault();
      applyScrollDelta(event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!readyRef.current || autoRevealRef.current || completeRef.current || touchYRef.current === null) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? touchYRef.current;
      const delta = touchYRef.current - currentY;
      touchYRef.current = currentY;
      event.preventDefault();

      if (delta > 6) {
        startAutoReveal();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!readyRef.current || autoRevealRef.current || completeRef.current) {
        return;
      }

      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        startAutoReveal();
      }

      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    const context = gsap.context(() => {
      const activateEntry = () => {
        readyRef.current = true;
        introRef.current?.setAttribute("data-scroll-ready", "true");
      };

      renderRevealProgress(0);
      gsap.set(".site-intro__video", { opacity: 0, scale: 1.08 });
      gsap.set(".site-intro__ambient", { opacity: 0 });
      gsap.set(".site-intro__frame-line--top, .site-intro__frame-line--bottom", { opacity: 0, scaleX: 0 });
      gsap.set(".site-intro__frame-line--left, .site-intro__frame-line--right", { opacity: 0, scaleY: 0 });
      gsap.set(".site-intro__eyebrow", { opacity: 0, y: 8 });
      gsap.set(".site-intro__motion", { opacity: 1, visibility: "visible" });
      gsap.set(".site-intro__mark-shell", { opacity: 1, scale: 0.985, visibility: "visible" });
      gsap.set(".site-intro__logo-ring", { opacity: 0, rotate: -90, transformOrigin: "50% 50%" });
      gsap.set(".site-intro__ring-progress", { strokeDashoffset: 100 });
      gsap.set(".site-intro__logo-mark", { opacity: 0, scale: 0.86, filter: "blur(6px)" });
      gsap.set(".site-intro__wordmark", { opacity: 0, y: 10, filter: "blur(8px)", visibility: "visible" });
      gsap.set(".site-intro__thanks", { opacity: 0 });
      gsap.set(".site-intro__thanks span", { opacity: 0, y: 18, filter: "blur(10px)" });
      gsap.set(".site-intro__scroll-cue", { opacity: 0, y: 14 });

      if (reduceMotion) {
        gsap.to(
          [
            ".site-intro__video",
            ".site-intro__ambient",
            ".site-intro__frame-line",
            ".site-intro__thanks",
            ".site-intro__thanks span",
            ".site-intro__scroll-cue",
          ],
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            scaleX: 1,
            filter: "blur(0px)",
            duration: 0.36,
            ease: "power3.out",
            onComplete: activateEntry,
          },
        );
        gsap.set([".site-intro__eyebrow", ".site-intro__motion", ".site-intro__mark-shell", ".site-intro__wordmark"], {
          opacity: 0,
          visibility: "hidden",
        });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .to(".site-intro__video", { opacity: 0.36, scale: 1, duration: 1.35 }, 0)
        .to(".site-intro__ambient", { opacity: 1, duration: 1.0 }, 0)
        .to(".site-intro__frame-line--top, .site-intro__frame-line--bottom", { opacity: 0.28, scaleX: 1, duration: 1.08 }, 0.14)
        .to(".site-intro__frame-line--left, .site-intro__frame-line--right", { opacity: 0.18, scaleY: 1, duration: 1.08 }, 0.28)
        .to(".site-intro__eyebrow", { opacity: 0.9, y: 0, duration: 0.86 }, 0.62)
        .to(".site-intro__logo-ring", { opacity: 0.88, duration: 0.44 }, 0.92)
        .to(".site-intro__logo-mark", { opacity: 0.92, scale: 1, filter: "blur(0px)", duration: 0.72, ease: "power3.out" }, 1.02)
        .to(".site-intro__ring-progress", { strokeDashoffset: 0, duration: 2.2, ease: "sine.inOut" }, 1.1)
        .to(".site-intro__logo-ring", { rotate: 270, duration: 2.2, ease: "none" }, 1.1)
        .to(".site-intro__mark-shell", { scale: 1.02, duration: 2.2, ease: "sine.inOut" }, 1.1)
        .to(".site-intro__wordmark", { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 }, 3.34)
        .to(".site-intro__eyebrow", { opacity: 0, y: -8, duration: 0.58 }, 4.44)
        .to([".site-intro__mark-shell", ".site-intro__wordmark"], { opacity: 0, y: -10, duration: 0.72, ease: "sine.inOut" }, 4.58)
        .set([".site-intro__motion", ".site-intro__mark-shell", ".site-intro__wordmark"], { visibility: "hidden" }, 5.34)
        .to(".site-intro__thanks", { opacity: 1, duration: 0.1 }, 6.1)
        .to(
          ".site-intro__thanks span",
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.86, stagger: 0.26 },
          6.22,
        )
        .to(
          ".site-intro__scroll-cue",
          {
            opacity: 1,
            y: 0,
            duration: 0.86,
            onComplete: activateEntry,
          },
          7.56,
        );

      timeline.play(0);
    }, introRef);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      revealTweenRef.current?.kill();
      revealTweenRef.current = null;
      context.revert();
    };
  }, [pathname, router]);

  if (!visible || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      ref={introRef}
      className="site-intro"
      role="status"
      aria-live="polite"
      aria-label="스크롤하여 홈페이지를 확인합니다"
    >
      <div className="site-intro__curtain" aria-hidden="true">
        <video className="site-intro__video" autoPlay muted loop playsInline preload="auto">
          <source src="/0_Demolition_Construction_1920x1080.mp4" type="video/mp4" />
        </video>
        <div className="site-intro__ambient" />
        <span className="site-intro__frame-line site-intro__frame-line--top" />
        <span className="site-intro__frame-line site-intro__frame-line--right" />
        <span className="site-intro__frame-line site-intro__frame-line--bottom" />
        <span className="site-intro__frame-line site-intro__frame-line--left" />
      </div>
      <div className="site-intro__stage">
        <p className="site-intro__eyebrow">DEMOLITION SERVICE</p>
        <div className="site-intro__motion" aria-hidden="true">
          <div className="site-intro__mark-shell">
            <svg className="site-intro__logo-ring" viewBox="0 0 120 120" focusable="false">
              <circle className="site-intro__ring-track" cx="60" cy="60" r="48" pathLength="100" />
              <circle className="site-intro__ring-progress" cx="60" cy="60" r="48" pathLength="100" />
            </svg>
            <Image className="site-intro__logo-mark" src="/brand/hamkke-logo-mark.png" alt="" width={118} height={94} priority />
          </div>
          <p className="site-intro__wordmark">WITH DEVELOPMENT</p>
        </div>
        <div className="site-intro__entry">
          <div className="site-intro__thanks" aria-label={INTRO_MESSAGE_LINES.join(" ")}>
            {INTRO_MESSAGE_LINES.map((line) => (
              <span className="site-intro__message-line" key={line}>
                {line}
              </span>
            ))}
          </div>
          <div className="site-intro__scroll-cue" aria-hidden="true">
            <svg className="site-intro__scroll-icon" viewBox="0 0 64 64" focusable="false">
              <path
                className="site-intro__scroll-disc"
                d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4Z"
              />
              <path className="site-intro__scroll-dot" d="M32 18.5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
              <path
                className="site-intro__scroll-arrow"
                d="M21.68 32.78a2.12 2.12 0 0 1 3 0L32 40.1l7.32-7.32a2.12 2.12 0 0 1 3 3L33.5 44.6a2.12 2.12 0 0 1-3 0l-8.82-8.82a2.12 2.12 0 0 1 0-3Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
