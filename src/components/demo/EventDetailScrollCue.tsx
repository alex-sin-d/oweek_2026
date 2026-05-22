"use client";

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

interface Props {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  iframeKey: number;
}

const CHECK_INTERVAL_MS = 200;

// Fallback: hide once the user passes ~70% of the scroll progress through the
// Event Detail modal. Primary signal is data-attribute visibility below; this
// catches modals that don't have the "From last year" section.
const SCROLL_PROGRESS_HIDE = 0.7;

// Hide when the "From last year" section's top has actually entered the
// scroller's visible band (so the user can see it appearing). A small +40px
// buffer fires it just as the section is about to crest into view.
const LAST_YEAR_PROXIMITY_PX = 40;

export default function EventDetailScrollCue({ iframeRef, iframeKey }: Props) {
  const [isEventDetail, setIsEventDetail] = useState(false);
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
    // Track per-overlay-session whether we've already faded out, so the cue
    // doesn't pop back in when the user scrolls back up.
    let progressedInSession = false;

    function evaluateProgress() {
      if (!currentScroller) return;
      const sc = currentScroller as HTMLElement;
      const scrollTop = sc.scrollTop;
      const maxScroll = Math.max(1, sc.scrollHeight - sc.clientHeight);
      const progress = scrollTop / maxScroll;

      // Primary signal: is the "From last year" section near the bottom of view?
      const doc = iframe?.contentDocument;
      const lastYearEl = doc?.querySelector(
        '[data-demo-target="event-detail-last-year"]',
      ) as HTMLElement | null;

      let lastYearReached = false;
      if (lastYearEl) {
        // getBoundingClientRect on an element inside the iframe is relative to
        // the iframe's viewport. The scroller fills that viewport, so we can
        // compare the section's top against the scroller's clientHeight.
        const rect = lastYearEl.getBoundingClientRect();
        // section top is measured from top of iframe viewport (= top of scroller)
        const scrollerBottom = sc.clientHeight;
        lastYearReached = rect.top <= scrollerBottom + LAST_YEAR_PROXIMITY_PX;
      }

      if (lastYearReached || progress >= SCROLL_PROGRESS_HIDE) {
        progressedInSession = true;
        setHasProgressed(true);
      }
    }

    function check() {
      if (cancelled) return;
      const doc = iframe?.contentDocument;
      if (!doc?.body) return;

      const isDetail = !!doc.querySelector('[data-demo-target="event-detail-screen"]');
      setIsEventDetail(isDetail);

      const scroller = doc.querySelector(".featured-overlay-scroll");

      if (isDetail && scroller && scroller !== currentScroller) {
        // New overlay session opened — reset state and attach listener
        if (currentScroller) {
          currentScroller.removeEventListener("scroll", evaluateProgress);
        }
        currentScroller = scroller;
        scroller.addEventListener("scroll", evaluateProgress, { passive: true });
        progressedInSession = false;
        setHasProgressed(false);
      } else if (!isDetail && currentScroller) {
        currentScroller.removeEventListener("scroll", evaluateProgress);
        currentScroller = null;
        progressedInSession = false;
        setHasProgressed(false);
      } else if (isDetail && currentScroller && !progressedInSession) {
        // Heartbeat re-evaluation — catches cases where the "From last year"
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
  }, [iframeRef, iframeKey, updatePhoneRect]);

  const visible = isEventDetail && !hasProgressed;

  if (!phoneRect) return null;

  // Card width: clamp(320, 24vw, 380) but resolved in JS so we can also use
  // the value for the "is there room to the right of the phone" check.
  const CARD_WIDTH = Math.max(
    320,
    Math.min(380, Math.round(window.innerWidth * 0.24)),
  );

  // Position cue to the right of the phone, vertically centered in the lower
  // half of the Event Detail content (around 58% of phone height).
  const cueLeft = phoneRect.right + 32;
  const cueTop = phoneRect.top + phoneRect.height * 0.72;

  // Suppress if there isn't room to the right
  if (cueLeft + CARD_WIDTH + 8 > window.innerWidth) return null;

  // Curved leader from cue's left edge to the phone's right side.
  const arrowOriginX = 0;
  const arrowOriginY = 36;
  const arrowTargetX = -(cueLeft - phoneRect.right + 8);
  const arrowTargetY = 56;

  return (
    <>
      <style>{`
        @keyframes demo-cue-float {
          0%, 100% { transform: translateY(-50%) translateY(0px); }
          50% { transform: translateY(-50%) translateY(-5px); }
        }
        @keyframes demo-chevron-bounce {
          0%, 100% { opacity: 0.7; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(4px); }
        }
        @keyframes demo-cue-glow {
          0%, 100% { box-shadow: 0 24px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(200,182,255,0.12) inset, 0 0 36px rgba(157,78,221,0.18); }
          50% { box-shadow: 0 24px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(200,182,255,0.16) inset, 0 0 48px rgba(157,78,221,0.28); }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: cueLeft,
          top: cueTop,
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 215,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.45s ease",
          animation: visible ? "demo-cue-float 3.6s ease-in-out infinite" : undefined,
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
          {/* Arrowhead */}
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

        {/* Cue card — presentation-scale: eyebrow → title → subtext → chevron */}
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
            animation: visible ? "demo-cue-glow 4.5s ease-in-out infinite" : undefined,
          }}
        >
          {/* Hairline accent line at top — adds a "branded badge" feel */}
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

          {/* Row 1 — Eyebrow: "GUIDED CUE" label */}
          <div
            style={{
              marginBottom: 14,
            }}
          >
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
              Guided Cue
            </span>
          </div>

          {/* Row 2 — Title */}
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
            Scroll to see more
          </div>

          {/* Row 3 — Subtext */}
          <p
            style={{
              fontSize: 15,
              color: "rgba(229,219,255,0.78)",
              lineHeight: 1.5,
              margin: 0,
              marginBottom: 18,
            }}
          >
            Photos, notes, and what to know below
          </p>

          {/* Row 4 — Bottom chevron, centered */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 2,
              animation: "demo-chevron-bounce 1.6s ease-in-out infinite",
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
            Transparent logo pixels now composite against the page background,
            making the border appear to "stop" where the logo sits. */}
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

        </div>{/* end wrapper */}
      </div>
    </>
  );
}
