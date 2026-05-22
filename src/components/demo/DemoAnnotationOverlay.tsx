"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import DemoCallout, {
  type CalloutGeometry,
  type DemoCalloutVariant,
} from "./DemoCallout";

type ScreenKey =
  | "onboarding-profile"
  | "home"
  | "event-detail"
  | "map-initial"
  | "map-walking"
  | "map-arrived"
  | "map-aceb-panel"
  | "map-aceb-collected";

export interface DemoAnnotation {
  id: string;
  number: number;
  title: string;
  subtext?: string;
  shortSubtext?: string;
  /**
   * CSS selector for the target DOM node inside the iframe. Ignored when
   * variant === "status" — status callouts render without an arrow.
   */
  targetSelector: string;
  screenKey: ScreenKey;
  variant?: DemoCalloutVariant;
  /**
   * When set, the callout text block is parked at a fixed viewport-relative
   * slot (derived from the iframe rect + a slot offset). Only the arrow
   * endpoint still tracks the target element. This prevents callout text from
   * jumping when map markers re-render mid-frame during panning or animation.
   *
   * Arrow tip is clamped to the iframe bounds so it never points into the
   * purple host background when the target is scrolled/panned off-screen.
   */
  fixedSlot?:
    | "top-left"
    | "middle-left"
    | "bottom-left"
    | "top-right"
    | "middle-right"
    | "bottom-right";
}

interface DemoAnnotationOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  /** Bumped when the iframe is re-mounted so we re-attach observers. */
  iframeKey: number;
  annotations: DemoAnnotation[];
}

// Onboarding step 2 == profile setup. The host overlay only annotates that
// step; splash, intro, and features render nothing on the host side.
const ONBOARDING_PROFILE_STEP = "2";

const TEXT_WIDTH = 240;
const STATUS_TEXT_WIDTH = 320;
const SIDE_GAP = 28;
const MIN_VERTICAL_GAP = 96;
const SHORT_SUBTEXT_VIEWPORT_BREAKPOINT = 1080;
// A target's anchor point (center) must be at least this far inside the iframe's
// visible band before its callout is shown. Using anchor rather than any-overlap
// prevents arrows from pointing at cards that have nearly scrolled off-screen.
const VIS_BUFFER = 12;

interface ResolvedAnnotation {
  annotation: DemoAnnotation;
  geometry: CalloutGeometry;
  /** True when the target is outside the iframe's visible band — callout fades. */
  hidden: boolean;
}

function elementText(el: Element | null): string {
  return (el?.textContent ?? "").trim();
}

function detectScreen(iframeDoc: Document | null): ScreenKey | null {
  if (!iframeDoc) return null;

  // Onboarding profile (step 2). All other onboarding overlays render nothing.
  const profileShell = iframeDoc.querySelector(
    `[data-onboarding-step="${ONBOARDING_PROFILE_STEP}"]`,
  );
  if (profileShell) return "onboarding-profile";
  const otherOnboardingOverlay = iframeDoc.querySelector(
    "[data-onboarding-splash], [data-onboarding-step]",
  );
  if (otherOnboardingOverlay) return null;

  // ACEB panel + stamp state (highest precedence on /map after walk).
  const acebPanel = iframeDoc.querySelector('[data-demo-target="aceb-panel"]');
  if (acebPanel) {
    const collectBtn = acebPanel.querySelector(
      '[data-demo-target="aceb-collect-stamp"]',
    );
    if (collectBtn?.getAttribute("data-demo-collected") === "true") {
      return "map-aceb-collected";
    }
    return "map-aceb-panel";
  }

  // Map states are derived from the Simulate Walk button's text.
  const simulateWalk = iframeDoc.querySelector(
    '[data-demo-target="simulate-walk"]',
  );
  if (simulateWalk) {
    const txt = elementText(simulateWalk);
    if (txt.includes("Walking")) return "map-walking";
    if (txt.includes("Arrived")) return "map-arrived";
    return "map-initial";
  }

  // Event Detail overlay — checked before "home" so the Home annotations are
  // suppressed the moment the featured event modal mounts (both are in the DOM).
  if (iframeDoc.querySelector('[data-demo-target="event-detail-screen"]')) {
    return "event-detail";
  }

  // Home — featured card present, no Map button.
  if (iframeDoc.querySelector('[data-demo-target="featured-card"]')) {
    return "home";
  }

  return null;
}

/**
 * Clamps a point to the interior of the iframe rect, with the given inset.
 * Used to keep fixed-slot arrow tips inside the phone frame when the target
 * marker has panned off-screen.
 */
function clampToIframe(
  iframeRect: DOMRect,
  x: number,
  y: number,
  inset: number,
): { x: number; y: number } {
  return {
    x: Math.max(iframeRect.left + inset, Math.min(iframeRect.right - inset, x)),
    y: Math.max(iframeRect.top + inset, Math.min(iframeRect.bottom - inset, y)),
  };
}

function pickSide(iframeRect: DOMRect): "left" | "right" {
  const leftRoom = iframeRect.left;
  const rightRoom = window.innerWidth - iframeRect.right;
  if (leftRoom >= TEXT_WIDTH + SIDE_GAP + 12) return "left";
  if (rightRoom >= TEXT_WIDTH + SIDE_GAP + 12) return "right";
  return "left";
}

function computeLayout(
  iframe: HTMLIFrameElement,
  active: DemoAnnotation[],
  shortMode: boolean,
  singleActive: boolean = false,
): { resolved: ResolvedAnnotation[]; side: "left" | "right" } {
  const iframeRect = iframe.getBoundingClientRect();
  const iframeDoc = iframe.contentDocument;
  if (!iframeDoc) return { resolved: [], side: "left" };

  const side = pickSide(iframeRect);
  const textLeft =
    side === "left"
      ? iframeRect.left - TEXT_WIDTH - SIDE_GAP
      : iframeRect.right + SIDE_GAP;
  const dotInnerX = side === "left" ? textLeft + TEXT_WIDTH : textLeft;

  // Bucket annotations by type.
  const statusAnnotations = active.filter((a) => a.variant === "status");
  const fixedSlotAnnotations = active.filter(
    (a) => a.variant !== "status" && !!a.fixedSlot,
  );
  const regularAnnotations = active.filter(
    (a) => a.variant !== "status" && !a.fixedSlot,
  );

  // ── Regular pointer annotations (scroll-tracked, stacked) ───────────
  const candidates = regularAnnotations
    .map((annotation) => {
      const el = iframeDoc.querySelector(annotation.targetSelector);
      if (!el) return null;
      const rect = (el as HTMLElement).getBoundingClientRect();
      const anchorXInside = rect.left + rect.width / 2;
      const anchorYInside = rect.top + rect.height / 2;
      const visible =
        anchorYInside >= VIS_BUFFER &&
        anchorYInside <= iframeRect.height - VIS_BUFFER &&
        anchorXInside >= VIS_BUFFER &&
        anchorXInside <= iframeRect.width - VIS_BUFFER;
      const targetEdgeY = iframeRect.top + anchorYInside;
      const targetEdgeX =
        side === "left"
          ? iframeRect.left + rect.left
          : iframeRect.left + rect.right;
      return {
        annotation,
        targetEdgeX,
        targetEdgeY,
        visible,
        sortKey: rect.top,
      };
    })
    .filter(
      (
        v,
      ): v is {
        annotation: DemoAnnotation;
        targetEdgeX: number;
        targetEdgeY: number;
        visible: boolean;
        sortKey: number;
      } => v !== null,
    )
    .sort((a, b) => a.sortKey - b.sortKey);

  const resolved: ResolvedAnnotation[] = [];
  let lastVisibleAnchorY = -Infinity;

  for (const c of candidates) {
    const anchorY = c.visible
      ? Math.max(c.targetEdgeY, lastVisibleAnchorY + MIN_VERTICAL_GAP)
      : c.targetEdgeY;
    if (c.visible) {
      lastVisibleAnchorY = anchorY;
    }
    const textTop = anchorY - 8;

    const geometry: CalloutGeometry = {
      textTop,
      textLeft,
      textWidth: TEXT_WIDTH,
      side,
      arrowStartX: dotInnerX,
      arrowStartY: anchorY,
      arrowEndX: c.targetEdgeX,
      arrowEndY: c.targetEdgeY,
    };

    const annotation =
      shortMode && c.annotation.shortSubtext
        ? { ...c.annotation, subtext: c.annotation.shortSubtext }
        : c.annotation;

    resolved.push({ annotation, geometry, hidden: !c.visible });
  }

  // For screens where only one callout should be active at a time (e.g. ACEB
  // panel), hide every visible callout except the topmost-visible one.
  // Candidates are already sorted by rect.top so the first visible item is the
  // highest on-screen section.
  if (singleActive) {
    let firstVisibleSeen = false;
    for (const r of resolved) {
      if (!r.hidden) {
        if (firstVisibleSeen) {
          r.hidden = true;
        } else {
          firstVisibleSeen = true;
        }
      }
    }
  }

  // ── Status callouts (legacy variant — float above the phone) ────────
  for (const annotation of statusAnnotations) {
    const statusTextLeft = Math.max(
      12,
      iframeRect.left + iframeRect.width / 2 - STATUS_TEXT_WIDTH / 2,
    );
    const statusTop = Math.max(24, iframeRect.top - 72);
    const geometry: CalloutGeometry = {
      textTop: statusTop,
      textLeft: statusTextLeft,
      textWidth: STATUS_TEXT_WIDTH,
      side: "left",
      arrowStartX: 0,
      arrowStartY: 0,
      arrowEndX: 0,
      arrowEndY: 0,
    };
    const display =
      shortMode && annotation.shortSubtext
        ? { ...annotation, subtext: annotation.shortSubtext }
        : annotation;
    resolved.push({ annotation: display, geometry, hidden: false });
  }

  // ── Fixed-slot annotations (text locked, arrow endpoint clamped) ─────
  // Text position is derived from the iframe rect + a named slot offset so
  // it doesn't move when map markers re-render mid-frame.  Only the arrow
  // tip still tracks the live target element; if the target is off-screen
  // the tip is clamped to the iframe edge so the arrow always lands inside
  // the phone frame.
  for (const annotation of fixedSlotAnnotations) {
    const slot = annotation.fixedSlot!;
    const slotSide: "left" | "right" = slot.endsWith("-left") ? "left" : "right";

    const slotTextLeft =
      slotSide === "left"
        ? iframeRect.left - TEXT_WIDTH - SIDE_GAP
        : iframeRect.right + SIDE_GAP;

    let slotTextTop: number;
    if (slot.startsWith("top")) {
      slotTextTop = iframeRect.top + 56;
    } else if (slot.startsWith("middle")) {
      slotTextTop = iframeRect.top + iframeRect.height * 0.45 - 24;
    } else {
      // bottom
      slotTextTop = iframeRect.top + iframeRect.height - 140;
    }

    // Dot anchors to the phone-facing edge of the text block, vertically at
    // roughly the title row.
    const slotDotX =
      slotSide === "left" ? slotTextLeft + TEXT_WIDTH : slotTextLeft;
    const slotDotY = slotTextTop + 12;

    // Arrow endpoint: track target, clamped to iframe bounds.
    // Use sentinel -1 when the target element cannot be found.
    let arrowEndX = -1;
    let arrowEndY = -1;

    const el = iframeDoc.querySelector(annotation.targetSelector);
    if (el) {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const anchorXInIframe = rect.left + rect.width / 2;
      const anchorYInIframe = rect.top + rect.height / 2;
      const rawEndX = iframeRect.left + anchorXInIframe;
      const rawEndY = iframeRect.top + anchorYInIframe;
      const clamped = clampToIframe(iframeRect, rawEndX, rawEndY, 16);
      arrowEndX = clamped.x;
      arrowEndY = clamped.y;
    }

    const geometry: CalloutGeometry = {
      textTop: slotTextTop,
      textLeft: slotTextLeft,
      textWidth: TEXT_WIDTH,
      side: slotSide,
      // When there is no valid arrow target, pass -1 so the SVG renderer and
      // dot renderer can skip drawing the leader without hiding the callout.
      arrowStartX: arrowEndX >= 0 ? slotDotX : -1,
      arrowStartY: arrowEndX >= 0 ? slotDotY : -1,
      arrowEndX,
      arrowEndY,
    };

    const display =
      shortMode && annotation.shortSubtext
        ? { ...annotation, subtext: annotation.shortSubtext }
        : annotation;

    // Fixed-slot callouts are always visible — the text doesn't move so there
    // is no concept of being "scrolled out of view".
    resolved.push({ annotation: display, geometry, hidden: false });
  }

  return { resolved, side };
}

export default function DemoAnnotationOverlay({
  iframeRef,
  iframeKey,
  annotations,
}: DemoAnnotationOverlayProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenKey | null>(null);
  const [resolved, setResolved] = useState<ResolvedAnnotation[]>([]);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const rafRef = useRef<number | null>(null);

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const iframe = iframeRef.current;
      if (!iframe) {
        setResolved([]);
        setActiveScreen(null);
        return;
      }
      const screen = detectScreen(iframe.contentDocument);
      setActiveScreen(screen);
      if (!screen) {
        setResolved([]);
        return;
      }
      const active = annotations.filter((a) => a.screenKey === screen);
      const shortMode = window.innerWidth < SHORT_SUBTEXT_VIEWPORT_BREAKPOINT;
      const { resolved: next } = computeLayout(
        iframe,
        active,
        shortMode,
        screen === "event-detail" ||
          screen === "map-aceb-panel" ||
          screen === "map-aceb-collected",
      );
      setResolved(next);
    });
  }, [annotations, iframeRef]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let mutationObserver: MutationObserver | null = null;
    let scrollListenerAttached = false;
    let cancelled = false;

    function attachInner() {
      if (cancelled) return;
      const doc = iframe?.contentDocument;
      if (!doc || !doc.body) {
        window.requestAnimationFrame(attachInner);
        return;
      }
      mutationObserver = new MutationObserver(() => scheduleRecompute());
      mutationObserver.observe(doc.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
          "data-demo-target",
          "data-demo-poi",
          "data-demo-arrived",
          "data-demo-collected",
          "id",
          "class",
        ],
        // Watch text changes too so the Simulate Walk button's text swap
        // ("Simulate Walk" → "Walking..." → "Arrived at ACEB") drives the
        // screen state machine without polling.
        characterData: true,
      });
      doc.addEventListener("scroll", scheduleRecompute, true);
      scrollListenerAttached = true;
      scheduleRecompute();
    }

    function onLoad() {
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
      attachInner();
    }

    iframe.addEventListener("load", onLoad);
    attachInner();

    const onResize = () => {
      setViewportWidth(window.innerWidth);
      scheduleRecompute();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", scheduleRecompute, true);

    // Faster heartbeat catches map.easeTo() camera changes (markers transform
    // every frame during Simulate Walk) and post-walk marker settling.
    const heartbeat = window.setInterval(scheduleRecompute, 300);

    return () => {
      cancelled = true;
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", scheduleRecompute, true);
      window.clearInterval(heartbeat);
      if (mutationObserver) mutationObserver.disconnect();
      if (scrollListenerAttached) {
        const doc = iframe.contentDocument;
        doc?.removeEventListener("scroll", scheduleRecompute, true);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [iframeRef, iframeKey, scheduleRecompute]);

  if (activeScreen === null || resolved.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 210,
      }}
      data-viewport-width={viewportWidth}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <marker
            id="demo-arrow-head"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#C8B6FF" />
          </marker>
        </defs>
        {resolved
          .filter(
            ({ annotation, geometry }) =>
              annotation.variant !== "status" && geometry.arrowEndX >= 0,
          )
          .map(({ annotation, geometry, hidden }) => {
            const x1 = geometry.arrowStartX;
            const y1 = geometry.arrowStartY;
            const x2 = geometry.arrowEndX;
            const y2 = geometry.arrowEndY;
            const midX = x1 + (x2 - x1) * 0.55;
            const midY = y1 + (y2 - y1) * 0.5;
            const path = `M ${x1} ${y1} Q ${midX} ${midY}, ${x2} ${y2}`;
            return (
              <path
                key={annotation.id}
                d={path}
                fill="none"
                stroke="#C8B6FF"
                strokeOpacity={hidden ? 0 : 0.85}
                strokeWidth={1.6}
                strokeLinecap="round"
                markerEnd={hidden ? undefined : "url(#demo-arrow-head)"}
                style={{
                  transition: "stroke-opacity 0.2s ease",
                  filter: hidden
                    ? undefined
                    : "drop-shadow(0 0 4px rgba(200,182,255,0.35))",
                }}
              />
            );
          })}
      </svg>
      {resolved.map(({ annotation, geometry, hidden }) => (
        <DemoCallout
          key={annotation.id}
          number={annotation.number}
          title={annotation.title}
          subtext={annotation.subtext}
          geometry={geometry}
          hidden={hidden}
          variant={annotation.variant}
        />
      ))}
    </div>
  );
}
