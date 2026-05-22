"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

/**
 * Generic external "scroll to see more" cue for any guided-demo screen that
 * has long-form content inside the iPhone frame. Renders a frosted lavender
 * card outside the phone with a curved dashed leader pointing at the phone.
 *
 * Configured per screen via the `config` prop so the same component drives
 * both Event Detail and the ACEB building panel.
 */
export interface DemoScrollCueConfig {
  /**
   * Stable id used as a React key when multiple cues are rendered in parallel.
   * Doubles as the data-demo-cue attribute for QA targeting.
   */
  id: string;
  /**
   * Selector that, when present inside the iframe, indicates this cue's
   * screen is active. Example: '[data-demo-target="event-detail-screen"]'.
   */
  screenSelector: string;
  /**
   * Selector for the scroll container inside the iframe. The cue listens to
   * its `scroll` event to compute progress.
   * Example: ".featured-overlay-scroll" or '[data-demo-scroll="aceb"]'.
   */
  scrollerSelector: string;
  /**
   * Optional. When this element's top crosses into the scroller's visible
   * band, the cue fades out. Used as a "you've reached the meaningful
   * content" signal in addition to the scroll-progress fallback.
   */
  hideTargetSelector?: string;
  /** Scroll-progress threshold (0–1) at which to fade the cue. */
  hideProgress?: number;
  /** Eyebrow label rendered above the title. */
  eyebrow?: string;
  /** Main title text. */
  title: string;
  /** Subtext below the title. */
  subtext: string;
}

interface Props {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  /** Bumped when the iframe re-mounts so observers re-attach. */
  iframeKey: number;
  config: DemoScrollCueConfig;
}

const CHECK_INTERVAL_MS = 200;
const DEFAULT_HIDE_PROGRESS = 0.7;
// Buffer (px) past the scroller's bottom edge at which hide-target proximity
// fires. Lets the cue fade just as the meaningful section is about to crest.
const HIDE_TARGET_PROXIMITY_PX = 40;

export default function DemoScrollCue({ iframeRef, iframeKey, config }: Props) {
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [hasProgressed, setHasProgressed] = useState(false);
  const [phoneRect, setPhoneRect] = useState<DOMRect | null>(null);

  const updatePhoneRect = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setPhoneRect(iframe.getBoundingClientRect());
  }, [iframeRef]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;
    let currentScroller: Element | null = null;
    let progressedInSession = false;
    const hideProgress = config.hideProgress ?? DEFAULT_HIDE_PROGRESS;

    function evaluateProgress() {
      if (!currentScroller) return;
      const sc = currentScroller as HTMLElement;
      const scrollTop = sc.scrollTop;
      const maxScroll = Math.max(1, sc.scrollHeight - sc.clientHeight);
      const progress = scrollTop / maxScroll;

      let hideTargetReached = false;
      if (config.hideTargetSelector) {
        const doc = iframe?.contentDocument;
        const hideEl = doc?.querySelector(
          config.hideTargetSelector,
        ) as HTMLElement | null;
        if (hideEl) {
          // getBoundingClientRect on an element inside the iframe is relative
          // to the iframe viewport, which is the same as the scroller's
          // viewport here.
          const rect = hideEl.getBoundingClientRect();
          const scrollerBottom = sc.clientHeight;
          hideTargetReached = rect.top <= scrollerBottom + HIDE_TARGET_PROXIMITY_PX;
        }
      }

      if (hideTargetReached || progress >= hideProgress) {
        progressedInSession = true;
        setHasProgressed(true);
      }
    }

    function check() {
      if (cancelled) return;
      const doc = iframe?.contentDocument;
      if (!doc?.body) return;

      const onScreen = !!doc.querySelector(config.screenSelector);
      setIsOnScreen(onScreen);

      const scroller = doc.querySelector(config.scrollerSelector);

      if (onScreen && scroller && scroller !== currentScroller) {
        if (currentScroller) {
          currentScroller.removeEventListener("scroll", evaluateProgress);
        }
        currentScroller = scroller;
        scroller.addEventListener("scroll", evaluateProgress, { passive: true });
        progressedInSession = false;
        setHasProgressed(false);
      } else if (!onScreen && currentScroller) {
        currentScroller.removeEventListener("scroll", evaluateProgress);
        currentScroller = null;
        progressedInSession = false;
        setHasProgressed(false);
      } else if (onScreen && currentScroller && !progressedInSession) {
        // Heartbeat re-evaluation — catches cases where the hide-target
        // section enters proximity due to dynamic content shift, not a scroll.
        evaluateProgress();
      }
    }

    function onLoad() {
      if (currentScroller) {
        currentScroller.removeEventListener("scroll", evaluateProgress);
        currentScroller = null;
      }
      progressedInSession = false;
      setHasProgressed(false);
      check();
    }

    iframe.addEventListener("load", onLoad);
    check();
    updatePhoneRect();

    window.addEventListener("resize", updatePhoneRect);
    const heartbeat = window.setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("resize", updatePhoneRect);
      window.clearInterval(heartbeat);
      if (currentScroller) {
        currentScroller.removeEventListener("scroll", evaluateProgress);
      }
    };
  }, [iframeRef, iframeKey, config, updatePhoneRect]);

  const visible = isOnScreen && !hasProgressed;

  if (!phoneRect) return null;

  // Card width: clamp(320, 24vw, 380) but resolved in JS so we can also use
  // the value for the "is there room to the right of the phone" check.
  const CARD_WIDTH = Math.max(
    320,
    Math.min(380, Math.round(window.innerWidth * 0.24)),
  );

  // Position cue to the right of the phone, vertically centered around the
  // lower-middle of the phone (72% of phone height).
  const cueLeft = phoneRect.right + 32;
  const cueTop = phoneRect.top + phoneRect.height * 0.72;

  if (cueLeft + CARD_WIDTH + 8 > window.innerWidth) return null;

  // Curved leader from cue's left edge to the phone's right side.
  const arrowOriginX = 0;
  const arrowOriginY = 36;
  const arrowTargetX = -(cueLeft - phoneRect.right + 8);
  const arrowTargetY = 56;

  const eyebrow = config.eyebrow ?? "Guided Cue";

  return (
    <>
      <style>{`
        @keyframes demo-cue-float-${config.id} {
          0%, 100% { transform: translateY(-50%) translateY(0px); }
          50% { transform: translateY(-50%) translateY(-5px); }
        }
        @keyframes demo-chevron-bounce-${config.id} {
          0%, 100% { opacity: 0.7; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(4px); }
        }
        @keyframes demo-cue-glow-${config.id} {
          0%, 100% { box-shadow: 0 24px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(200,182,255,0.12) inset, 0 0 36px rgba(157,78,221,0.18); }
          50% { box-shadow: 0 24px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(200,182,255,0.16) inset, 0 0 48px rgba(157,78,221,0.28); }
        }
      `}</style>

      <div
        aria-hidden="true"
        data-demo-cue={config.id}
        style={{
          position: "fixed",
          left: cueLeft,
          top: cueTop,
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 215,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.45s ease",
          animation: visible
            ? `demo-cue-float-${config.id} 3.6s ease-in-out infinite`
            : undefined,
        }}
      >
        {/* Curved dashed leader line from card edge → phone */}
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "100%",
            top: "50%",
            transform: "translateY(-50%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
          width={Math.abs(arrowTargetX) + 8}
          height={110}
          viewBox={`${arrowTargetX - 4} -10 ${Math.abs(arrowTargetX) + 12} 120`}
        >
          <path
            d={`M ${arrowOriginX} ${arrowOriginY} Q ${arrowTargetX / 2} ${arrowOriginY} ${arrowTargetX} ${arrowTargetY}`}
            fill="none"
            stroke="#C8B6FF"
            strokeOpacity={0.55}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray="5 4"
          />
          <path
            d={`M ${arrowTargetX + 7} ${arrowTargetY - 7} L ${arrowTargetX} ${arrowTargetY} L ${arrowTargetX + 7} ${arrowTargetY + 7}`}
            fill="none"
            stroke="#C8B6FF"
            strokeOpacity={0.6}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/*
          Wrapper keeps card + badge in the same coordinate space.
          Badge is DOM-ORDER AFTER the card so it composites on top of the
          card's border — transparent logo pixels then reveal the page
          background, not the card border line.
        */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              width: CARD_WIDTH,
              minHeight: 160,
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(200,182,255,0.08) 100%)",
              backdropFilter: "blur(28px) saturate(150%)",
              WebkitBackdropFilter: "blur(28px) saturate(150%)",
              border: "1px solid rgba(200,182,255,0.32)",
              borderRadius: 24,
              padding: "24px 26px",
              animation: visible
                ? `demo-cue-glow-${config.id} 4.5s ease-in-out infinite`
                : undefined,
            }}
          >
            {/* Hairline accent line at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 26,
                right: 26,
                height: 1.5,
                background:
                  "linear-gradient(90deg, rgba(200,182,255,0) 0%, rgba(200,182,255,0.55) 50%, rgba(200,182,255,0) 100%)",
              }}
            />

            <div style={{ marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: "rgba(200,182,255,0.85)",
                  lineHeight: 1,
                }}
              >
                {eyebrow}
              </span>
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#F8F2FF",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              {config.title}
            </div>

            <p
              style={{
                fontSize: 15,
                color: "rgba(229,219,255,0.78)",
                lineHeight: 1.5,
                margin: 0,
                marginBottom: 18,
              }}
            >
              {config.subtext}
            </p>

            {/* Bottom chevron, centered */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 2,
                animation: `demo-chevron-bounce-${config.id} 1.6s ease-in-out infinite`,
              }}
            >
              <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
                <path
                  d="M3 4 L13 13 L23 4"
                  stroke="#C8B6FF"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Corner badge — DOM-AFTER card so it paints above the card border.
              Transparent logo pixels then composite against the page
              background, making the border appear to "stop" where the logo
              sits. */}
          <div
            style={{
              position: "absolute",
              top: -28,
              right: -18,
              width: 120,
              height: 120,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <img
              src="/western_logo.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                display: "block",
                width: 120,
                height: 120,
                opacity: 0.84,
                transform: "rotate(-14deg)",
                filter:
                  "drop-shadow(0 0 8px rgba(255,255,255,0.72)) drop-shadow(0 0 18px rgba(200,182,255,0.55)) drop-shadow(0 3px 8px rgba(0,0,0,0.45))",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
