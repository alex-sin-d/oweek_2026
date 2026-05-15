"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

interface Props {
  frontImageSrc: string;
  lockedImageSrc: string;
  spinGifSrc?: string | null;
  spinDurationMs?: number | null;
  originRef: RefObject<HTMLElement | null>;
  onUnlockCommit: () => void;
  onComplete: () => void;
}

type OverlayVisualPhase = "locked" | "spin" | "front";

const REDUCED_MOTION_DURATION_MS = 720;
const REDUCED_MOTION_REVEAL_FRACTION = 0.5;
const SHOWCASE_TARGET_PX = 280;
const SHOWCASE_VIEWPORT_FRACTION = 0.7;
const SHOWCASE_MAX_PX = 320;
const PULL_FORWARD_DURATION_MS = 680;
const CENTER_HOLD_BEFORE_SPIN_MS = 140;
const CENTER_HOLD_AFTER_SPIN_MS = 140;
const RETURN_DURATION_MS = 620;
const DEFAULT_SPIN_DURATION_MS = 8000;
const LOCKED_FILTER = "saturate(0.15) brightness(0.92)";
const UNLOCKED_FILTER = "saturate(1) brightness(1)";

export default function StampCollectOverlay({
  frontImageSrc,
  lockedImageSrc,
  spinGifSrc,
  spinDurationMs,
  originRef,
  onUnlockCommit,
  onComplete,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [visualPhase, setVisualPhase] = useState<OverlayVisualPhase>("locked");
  const [spinLayerMounted, setSpinLayerMounted] = useState(false);

  const flyerRef = useRef<HTMLDivElement | null>(null);
  const lockBadgeRef = useRef<HTMLSpanElement | null>(null);
  const burstRef = useRef<HTMLSpanElement | null>(null);
  const completedRef = useRef(false);
  const unlockCommittedRef = useRef(false);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  const commitUnlock = () => {
    if (unlockCommittedRef.current) return;
    unlockCommittedRef.current = true;
    onUnlockCommit();
  };

  useEffect(() => {
    setMounted(true);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);

    const preloadUrls = [lockedImageSrc, frontImageSrc, spinGifSrc].filter(
      Boolean,
    ) as string[];
    const preloadLinks: HTMLLinkElement[] = [];

    for (const src of preloadUrls) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
      preloadLinks.push(link);

      const image = new Image();
      image.decoding = "async";
      image.src = src;
    }

    try {
      (navigator as Navigator & { vibrate?: (p: number) => boolean }).vibrate?.(
        12,
      );
    } catch {
      // ignore
    }

    const origin = originRef.current?.getBoundingClientRect() ?? null;
    setOriginRect(origin);

    return () => {
      for (const link of preloadLinks) {
        link.remove();
      }
    };
  }, [frontImageSrc, lockedImageSrc, spinGifSrc, originRef]);

  useEffect(() => {
    if (!mounted || !originRect) return;

    const flyer = flyerRef.current;
    const badge = lockBadgeRef.current;
    const burst = burstRef.current;
    if (!flyer) {
      commitUnlock();
      finish();
      return;
    }

    setVisualPhase("locked");
    setSpinLayerMounted(false);

    const duration = reducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : 0;
    const hasSpinPhase = !reducedMotion && !!spinGifSrc;
    const resolvedSpinDurationMs = hasSpinPhase
      ? Math.max(spinDurationMs ?? DEFAULT_SPIN_DURATION_MS, 1000)
      : 0;
    const spinStartMs = hasSpinPhase
      ? PULL_FORWARD_DURATION_MS + CENTER_HOLD_BEFORE_SPIN_MS
      : 0;
    const frontRevealMs = hasSpinPhase
      ? spinStartMs + resolvedSpinDurationMs
      : PULL_FORWARD_DURATION_MS;
    const returnStartMs = hasSpinPhase
      ? frontRevealMs + CENTER_HOLD_AFTER_SPIN_MS
      : frontRevealMs + 160;
    const totalDuration = reducedMotion
      ? duration
      : returnStartMs + RETURN_DURATION_MS;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const showcaseSize = Math.min(
      SHOWCASE_TARGET_PX,
      vw * SHOWCASE_VIEWPORT_FRACTION,
      SHOWCASE_MAX_PX,
    );
    const showcaseScale = showcaseSize / originRect.width;
    const showcaseWidth = originRect.width * showcaseScale;
    const showcaseHeight = originRect.height * showcaseScale;

    const startX = originRect.left;
    const startY = originRect.top;
    const centerX = vw / 2 - showcaseWidth / 2;
    const centerY = vh / 2 - showcaseHeight / 2;

    const baseEasing = "cubic-bezier(0.22, 1, 0.36, 1)";
    const overshootEasing = "cubic-bezier(0.34, 1.26, 0.64, 1)";
    const pullOvershootMs = hasSpinPhase
      ? Math.max(PULL_FORWARD_DURATION_MS - 120, 0)
      : Math.max(PULL_FORWARD_DURATION_MS - 140, 0);

    const fly = flyer.animate(
      reducedMotion
        ? [
            {
              transform: `translate(${startX}px, ${startY}px) scale(1)`,
              filter: LOCKED_FILTER,
              offset: 0,
              easing: baseEasing,
            },
            {
              transform: `translate(${centerX}px, ${centerY}px) scale(${showcaseScale})`,
              filter: UNLOCKED_FILTER,
              offset: REDUCED_MOTION_REVEAL_FRACTION,
              easing: baseEasing,
            },
            {
              transform: `translate(${centerX}px, ${centerY}px) scale(${showcaseScale})`,
              filter: UNLOCKED_FILTER,
              offset: REDUCED_MOTION_REVEAL_FRACTION,
              easing: baseEasing,
            },
            {
              transform: `translate(${startX}px, ${startY}px) scale(1)`,
              filter: UNLOCKED_FILTER,
              offset: 1,
            },
          ]
        : [
            {
              transform: `translate(${startX}px, ${startY}px) scale(1)`,
              filter: LOCKED_FILTER,
              offset: 0,
              easing: baseEasing,
            },
            {
              transform: `translate(${centerX}px, ${centerY}px) scale(${showcaseScale * 1.055})`,
              filter: UNLOCKED_FILTER,
              offset: pullOvershootMs / totalDuration,
              easing: overshootEasing,
            },
            {
              transform: `translate(${centerX}px, ${centerY}px) scale(${showcaseScale})`,
              filter: UNLOCKED_FILTER,
              offset: PULL_FORWARD_DURATION_MS / totalDuration,
              easing: baseEasing,
            },
            {
              transform: `translate(${centerX}px, ${centerY}px) scale(${showcaseScale})`,
              filter: UNLOCKED_FILTER,
              offset: returnStartMs / totalDuration,
              easing: baseEasing,
            },
            {
              transform: `translate(${startX}px, ${startY}px) scale(1)`,
              filter: UNLOCKED_FILTER,
              offset: 1,
            },
          ],
      {
        duration: totalDuration,
        fill: "forwards",
      },
    );

    let badgeAnim: Animation | null = null;
    if (badge && !reducedMotion) {
      badgeAnim = badge.animate(
        [
          { opacity: 1, transform: "scale(1)", offset: 0 },
          {
            opacity: 0,
            transform: "scale(0.6)",
            offset: Math.min((PULL_FORWARD_DURATION_MS - 80) / totalDuration, 0.25),
          },
          { opacity: 0, transform: "scale(0.6)", offset: 1 },
        ],
        {
          duration: totalDuration,
          fill: "forwards",
          easing: "ease-out",
        },
      );
    }

    let burstAnim: Animation | null = null;
    if (burst && !reducedMotion) {
      burstAnim = burst.animate(
        [
          { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)", offset: 0 },
          {
            opacity: 0,
            transform: "translate(-50%, -50%) scale(0.5)",
            offset: Math.max((spinStartMs - 140) / totalDuration, 0.06),
          },
          {
            opacity: 1,
            transform: "translate(-50%, -50%) scale(1.0)",
            offset: Math.min((spinStartMs + 80) / totalDuration, 0.18),
          },
          {
            opacity: 0.85,
            transform: "translate(-50%, -50%) scale(1.1)",
            offset: Math.min((spinStartMs + 320) / totalDuration, 0.25),
          },
          {
            opacity: 0,
            transform: "translate(-50%, -50%) scale(1.2)",
            offset: Math.min((spinStartMs + 560) / totalDuration, 0.32),
          },
          { opacity: 0, transform: "translate(-50%, -50%) scale(1.2)", offset: 1 },
        ],
        {
          duration: totalDuration,
          fill: "forwards",
          easing: "ease-out",
        },
      );
    }

    const phaseSwapTimer = window.setTimeout(() => {
      if (hasSpinPhase) {
        commitUnlock();
        setSpinLayerMounted(true);
        setVisualPhase("spin");
        return;
      }
      commitUnlock();
      setVisualPhase("front");
    }, reducedMotion
      ? duration * REDUCED_MOTION_REVEAL_FRACTION
      : hasSpinPhase
        ? spinStartMs
        : frontRevealMs);

    const frontRevealTimer = hasSpinPhase
      ? window.setTimeout(() => {
          setVisualPhase("front");
        }, frontRevealMs)
      : null;

    fly.onfinish = () => {
      const destEl = originRef.current;
      if (destEl) {
        try {
          const glow = document.createElement("span");
          glow.className = "stamp-collect-slot-glow";
          destEl.appendChild(glow);
          window.setTimeout(() => glow.remove(), 360);
        } catch {
          // ignore
        }
      }
      finish();
    };

    return () => {
      window.clearTimeout(phaseSwapTimer);
      if (frontRevealTimer) {
        window.clearTimeout(frontRevealTimer);
      }
      try {
        fly.cancel();
        badgeAnim?.cancel();
        burstAnim?.cancel();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, originRect, reducedMotion, spinDurationMs, spinGifSrc]);

  if (!mounted || typeof document === "undefined") return null;
  if (!originRect) return null;

  const initialTransform = `translate(${originRect.left}px, ${originRect.top}px) scale(1)`;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    >
      <span
        ref={burstRef}
        className="stamp-collect-burst"
        style={{
          left: `${(typeof window !== "undefined" ? window.innerWidth : 375) / 2}px`,
          top: `${(typeof window !== "undefined" ? window.innerHeight : 812) / 2}px`,
        }}
      />
      <div
        ref={flyerRef}
        className="stamp-collect-flyer"
        style={{
          width: `${originRect.width}px`,
          height: `${originRect.height}px`,
          transform: initialTransform,
          filter: LOCKED_FILTER,
        }}
      >
        <div className="stamp-collect-flyer-visual">
          <span
            className={`stamp-collect-flyer-layer ${
              visualPhase === "locked" ? "is-visible" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lockedImageSrc} alt="" draggable={false} />
          </span>

          {spinGifSrc ? (
            <span
              className={`stamp-collect-flyer-layer ${
                visualPhase === "spin" ? "is-visible" : ""
              }`}
            >
              {spinLayerMounted ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={spinGifSrc} alt="" draggable={false} />
              ) : null}
            </span>
          ) : null}

          <span
            className={`stamp-collect-flyer-layer ${
              visualPhase === "front" ? "is-visible" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frontImageSrc} alt="" draggable={false} />
          </span>
        </div>

        {!reducedMotion ? (
          <span ref={lockBadgeRef} className="stamp-collect-flyer-lock">
            <LockGlyph />
          </span>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function LockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10V7a4 4 0 1 1 8 0v3m-9 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}
