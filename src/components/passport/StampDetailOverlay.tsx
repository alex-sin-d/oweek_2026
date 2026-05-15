"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { PassportStampDefinition } from "@/data/passport";
import { getStampImage } from "@/lib/stampImages";

const PURPLE = "#4F2D7F";
const PURPLE_DARK = "#3A1F63";
const GOLD = "#C9A961";
const SPRING = "cubic-bezier(0.34, 1.26, 0.64, 1)";
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

const SHEET_MARGIN = 8;
const SHEET_MAX_WIDTH = 512;

export interface StampRectSnapshot {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type StampOverlayPhase = "opening" | "open" | "closing";

export interface StampDetailContent {
  displayName: string;
  shortTag: string;
  stateChip?: string;
  contextChip?: string;
  whyMatters: string;
  bullets: string[];
}

export interface CollectionContext {
  totalCollected: number;
  totalStamps: number;
  categoryCollected: number;
  categoryTotal: number;
  categoryLabel: string;
  siblings: Array<{ stamp: PassportStampDefinition; isCollected: boolean }>;
}

interface Props {
  stamp: PassportStampDefinition;
  detail: StampDetailContent;
  phase: StampOverlayPhase;
  originRect: StampRectSnapshot | null;
  collectionContext?: CollectionContext;
  onClose: () => void;
}

type FlyPhase = "pre" | "flying" | "arrived" | "gone";

export default function StampDetailOverlay({
  stamp,
  detail,
  phase,
  originRect,
  collectionContext,
  onClose,
}: Props) {
  const titleId = useId();
  const shellRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const heroStageRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState(getViewportSize);

  // Measured rect of the hero stage div after layout
  const [heroRect, setHeroRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Flying stamp phase
  const [flyPhase, setFlyPhase] = useState<FlyPhase>("pre");

  // Content reveal flags
  const [headVisible, setHeadVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);
  const [glowVisible, setGlowVisible] = useState(false);
  const [sparklesVisible, setSparklesVisible] = useState(false);

  const isClosing = phase === "closing";
  const src = getStampImage(stamp.poiId);

  // Viewport resize
  useEffect(() => {
    const onResize = () => setViewport(getViewportSize());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Measure hero stage after initial layout (shell is opacity-0 at this point)
  useLayoutEffect(() => {
    if (!heroStageRef.current) return;
    const r = heroStageRef.current.getBoundingClientRect();
    setHeroRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  // Flying stamp initial transform: makes hero position look like origin position
  const flyInitialTransform = useMemo<string>(() => {
    if (!heroRect || !originRect) return "none";
    const fromCX = originRect.left + originRect.width / 2;
    const fromCY = originRect.top + originRect.height / 2;
    const toCX = heroRect.left + heroRect.width / 2;
    const toCY = heroRect.top + heroRect.height / 2;
    const dx = fromCX - toCX;
    const dy = fromCY - toCY;
    const scale = originRect.width / heroRect.width;
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
  }, [heroRect, originRect]);

  // Orchestrate the full reveal sequence
  useEffect(() => {
    if (phase !== "open" || !heroRect) return;

    // Arm the flying stamp (initial transform, no transition)
    setFlyPhase("pre");

    // One double-RAF to ensure initial transform renders before transition starts
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setFlyPhase("flying");          // stamp begins flight
        setHeadVisible(true);           // header fades in
        setGlowVisible(true);           // stage glow fades in
      }),
    );

    const t1 = window.setTimeout(() => {
      setFlyPhase("arrived");           // flying stamp opacity → 0
      setHeroVisible(true);             // static hero fades in
      setSparklesVisible(true);
    }, 500);

    const t2 = window.setTimeout(() => setFlyPhase("gone"), 700);
    const t3 = window.setTimeout(() => setBodyVisible(true), 560);

    return () => {
      cancelAnimationFrame(r);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [phase, heroRect]);

  // Reset on close
  useEffect(() => {
    if (phase === "closing") {
      setFlyPhase("gone");
      setHeadVisible(false);
      setHeroVisible(false);
      setBodyVisible(false);
      setGlowVisible(false);
      setSparklesVisible(false);
    }
  }, [phase]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Swipe-down dismiss
  const dragRef = useRef<{ startY: number; startT: number } | null>(null);
  const [dragY, setDragY] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (phase !== "open") return;
    const scroller = shellRef.current?.querySelector<HTMLElement>("[data-scroller]");
    if (scroller && scroller.scrollTop > 2) return;
    dragRef.current = { startY: e.touches[0].clientY, startT: Date.now() };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current) return;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if (!dragRef.current) return;
    const dy = dragY;
    const elapsed = Date.now() - dragRef.current.startT;
    dragRef.current = null;
    if (dy > 130 || dy / Math.max(elapsed, 1) > 0.5) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
  };

  // Shell geometry
  const frame = useMemo(() => computeFrame(viewport), [viewport]);

  const shellStyle = useMemo((): CSSProperties => {
    let opacity = 1;
    let transform = "translate3d(0,0,0) scale(1)";

    if (isClosing) {
      opacity = 0;
      transform = "translate3d(0, 14px, 0) scale(0.98)";
    } else if (phase === "opening") {
      opacity = 0;
      transform = "translate3d(0, 6px, 0) scale(0.97)";
    }

    if (dragY > 0 && !isClosing) {
      const d = Math.min(dragY * 0.88, 200);
      const s = Math.max(0.95, 1 - d / 2200);
      transform = `translate3d(0, ${d}px, 0) scale(${s})`;
    }

    return {
      top: `${frame.top}px`,
      left: `${frame.left}px`,
      width: `${frame.width}px`,
      height: `${frame.height}px`,
      borderRadius: 34,
      opacity,
      transform,
      boxShadow:
        "0 32px 88px rgba(18,10,34,0.30), 0 10px 28px rgba(18,10,34,0.14)",
    };
  }, [frame, phase, isClosing, dragY]);

  // Flying stamp style — fixed element outside the shell
  const flyingStampStyle = useMemo((): CSSProperties => {
    if (!src || !heroRect || !originRect || flyPhase === "gone") {
      return { display: "none" };
    }
    const base: CSSProperties = {
      position: "fixed",
      top: heroRect.top,
      left: heroRect.left,
      width: heroRect.width,
      zIndex: 105,
      pointerEvents: "none",
      transformOrigin: "center center",
    };
    if (flyPhase === "pre") {
      return { ...base, transform: flyInitialTransform, transition: "none", opacity: 1 };
    }
    if (flyPhase === "flying") {
      return {
        ...base,
        transform: "translate(0,0) scale(1)",
        transition: `transform 520ms ${SPRING}`,
        opacity: 1,
      };
    }
    // arrived → fade out while static hero fades in
    return {
      ...base,
      transform: "translate(0,0) scale(1)",
      transition: "opacity 200ms ease",
      opacity: 0,
    };
  }, [src, heroRect, originRect, flyPhase, flyInitialTransform]);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`stamp-reveal-backdrop ${!isClosing ? "is-active" : ""}`}
        onClick={onClose}
      />

      {/* Flying stamp — moves from collection position to hero position */}
      {src && heroRect && originRect && flyPhase !== "gone" && (
        <div style={flyingStampStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            aria-hidden
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              filter:
                "drop-shadow(0 0 8px rgba(201,169,97,0.4)) drop-shadow(0 12px 28px rgba(0,0,0,0.24))",
            }}
          />
        </div>
      )}

      {/* Shell */}
      <section
        ref={shellRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="stamp-shell-reveal fixed overflow-hidden"
        style={shellStyle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          data-scroller
          className="scrollbar-none h-full overflow-y-auto"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 50% 0%, #fef9ff 0%, #f8f0fc 40%, #f2eaf7 100%)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-0">
            <div
              className="h-[3px] w-9 rounded-full"
              style={{ background: "rgba(79,45,127,0.16)" }}
            />
          </div>

          {/* ── Header ────────────────────────────────────────────────── */}
          <header
            className={`stamp-reveal-head flex items-start justify-between gap-3 px-5 pt-3 ${
              headVisible ? "is-visible" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckIcon />
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.24em]"
                  style={{ color: PURPLE }}
                >
                  Stamp Collected
                </p>
              </div>
              <h2
                id={titleId}
                className="text-[24px] font-semibold leading-[1.06] tracking-[-0.025em] text-[#1a1230]"
              >
                {detail.displayName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Chip variant="tag">{detail.shortTag}</Chip>
                {detail.stateChip && (
                  <Chip variant="state">{detail.stateChip}</Chip>
                )}
                {detail.contextChip && (
                  <Chip variant="context">{detail.contextChip}</Chip>
                )}
              </div>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close stamp details"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/85 text-[#2f2447] shadow-[0_4px_14px_rgba(24,16,39,0.12)] ring-1 ring-[rgba(79,45,127,0.1)] backdrop-blur transition-transform duration-150 active:scale-[0.9]"
            >
              <CloseIcon />
            </button>
          </header>

          {/* ── Hero stage ─────────────────────────────────────────────── */}
          <div className="relative mt-3 px-0">
            {/* Stage glow backdrop */}
            <div
              aria-hidden
              className={`stamp-reveal-glow pointer-events-none absolute inset-0 ${
                glowVisible ? "is-visible" : ""
              }`}
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,169,97,0.26) 0%, rgba(79,45,127,0.14) 40%, transparent 72%)",
                filter: "blur(8px)",
              }}
            />

            {/* Hero stamp placeholder — measured for flying stamp alignment */}
            <div
              ref={heroStageRef}
              className="relative w-full"
              style={{ aspectRatio: "108 / 56" }}
            >
              {/* Static hero stamp — fades in when flying stamp arrives */}
              {src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={detail.displayName}
                  className={`absolute inset-0 w-full h-auto transition-opacity duration-300 ${
                    heroVisible ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    filter:
                      "drop-shadow(0 0 10px rgba(201,169,97,0.44)) drop-shadow(0 0 28px rgba(79,45,127,0.22)) drop-shadow(0 18px 36px rgba(0,0,0,0.20))",
                  }}
                />
              )}
            </div>

            {/* Sparkles around the stage */}
            {SPARKLE_CONFIG.map((s, i) => (
              <div
                key={i}
                aria-hidden
                className={`stamp-reveal-sparkle absolute ${
                  sparklesVisible ? "is-visible" : ""
                }`}
                style={{
                  top: s.top,
                  left: s.left,
                  right: s.right,
                  bottom: s.bottom,
                  transitionDelay: `${s.delay}ms`,
                }}
              >
                <StarGlyph size={s.size} />
              </div>
            ))}
          </div>

          {/* ── Scrollable body ──────────────────────────────────────────── */}
          <div
            className={`stamp-reveal-body px-4 pt-4 pb-10 space-y-3 ${
              bodyVisible ? "is-visible" : ""
            }`}
          >
            {/* Why this stop matters */}
            <ContentCard>
              <SectionLabel>Why this stop matters</SectionLabel>
              <p className="mt-2 text-[14.5px] leading-[1.58] text-[#3c3050]">
                {detail.whyMatters}
              </p>
              {detail.bullets.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {detail.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-[#4a3d62]"
                    >
                      <span
                        aria-hidden
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: GOLD }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ContentCard>

            {/* Category progress */}
            {collectionContext && (
              <CategoryCard context={collectionContext} currentPoiId={stamp.poiId} />
            )}

            {/* Passport journey */}
            {collectionContext && (
              <JourneyCard context={collectionContext} />
            )}

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/passport-seal.png"
                alt=""
                aria-hidden
                width={22}
                style={{ height: "auto", opacity: 0.75 }}
                className="select-none"
              />
              <span
                className="text-[10.5px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: PURPLE_DARK, opacity: 0.7 }}
              >
                Added to your passport
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Category progress card ───────────────────────────────────────────────────

function CategoryCard({
  context,
  currentPoiId,
}: {
  context: CollectionContext;
  currentPoiId: string;
}) {
  const pct = context.categoryTotal > 0
    ? context.categoryCollected / context.categoryTotal
    : 0;

  const displaySiblings = context.siblings.slice(0, 5);

  return (
    <ContentCard>
      <div className="flex items-center justify-between">
        <SectionLabel>{context.categoryLabel}</SectionLabel>
        <span className="text-[11px] font-semibold" style={{ color: "#7a6e90" }}>
          {context.categoryCollected} / {context.categoryTotal} collected
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="mt-2.5 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(79,45,127,0.1)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: `linear-gradient(90deg, ${PURPLE} 0%, #7d47d3 100%)`,
            transition: "width 800ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      {/* Sibling stamps */}
      {displaySiblings.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {displaySiblings.map(({ stamp: s, isCollected }) => {
            const sibSrc = getStampImage(s.poiId);
            return (
              <div
                key={s.poiId}
                className="flex shrink-0 flex-col items-center gap-1.5"
                style={{ width: 60 }}
              >
                <div
                  className="relative flex h-[32px] w-[60px] items-center justify-center overflow-hidden rounded-[8px]"
                  style={{ background: "rgba(79,45,127,0.06)" }}
                >
                  {sibSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sibSrc}
                      alt={s.name}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "contain",
                        opacity: isCollected ? 1 : 0.28,
                        filter: isCollected ? "none" : "grayscale(1)",
                      }}
                    />
                  ) : (
                    <span
                      className="text-[8px] font-bold"
                      style={{ color: isCollected ? PURPLE : "#9e99a8" }}
                    >
                      {s.shortLabel}
                    </span>
                  )}
                  {!isCollected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="flex h-[18px] w-[18px] items-center justify-center rounded-full backdrop-blur-sm"
                        style={{ background: "rgba(255,255,255,0.75)" }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={PURPLE}
                          strokeWidth={2.2}
                          className="h-2.5 w-2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 10V7a4 4 0 1 1 8 0v3m-9 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className="w-full text-center leading-[1.2]"
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    color: isCollected ? "#3c3050" : "#a09bb0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  } as CSSProperties}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </ContentCard>
  );
}

// ─── Passport journey card ────────────────────────────────────────────────────

function JourneyCard({ context }: { context: CollectionContext }) {
  const pct = context.totalStamps > 0
    ? context.totalCollected / context.totalStamps
    : 0;

  return (
    <ContentCard style={{ background: "rgba(255,255,255,0.72)" }}>
      <div className="flex items-center justify-between">
        <SectionLabel>Your OWeek passport</SectionLabel>
        <span className="text-[11px] font-semibold" style={{ color: "#7a6e90" }}>
          {Math.round(pct * 100)}% complete
        </span>
      </div>
      <div
        className="mt-2.5 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(79,45,127,0.1)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: `linear-gradient(90deg, ${PURPLE} 0%, #7d47d3 100%)`,
            transition: "width 1000ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <p className="mt-2 text-[12.5px]" style={{ color: "#6b5f80" }}>
        {context.totalCollected} of {context.totalStamps} stamps collected across campus
      </p>
    </ContentCard>
  );
}

// ─── Small reusables ──────────────────────────────────────────────────────────

function ContentCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="rounded-[20px] p-4"
      style={{
        background: "rgba(255,255,255,0.86)",
        boxShadow: "0 14px 32px rgba(72,47,104,0.07)",
        border: "1px solid rgba(255,255,255,0.9)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-[0.22em]"
      style={{ color: PURPLE }}
    >
      {children}
    </p>
  );
}

function Chip({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "tag" | "state" | "context";
}) {
  const styles: Record<typeof variant, CSSProperties> = {
    tag: {
      background: "rgba(79,45,127,0.09)",
      color: PURPLE_DARK,
      borderColor: "rgba(79,45,127,0.16)",
    },
    state: {
      background: "rgba(16,163,89,0.1)",
      color: "#0d7a44",
      borderColor: "rgba(16,163,89,0.22)",
    },
    context: {
      background: "rgba(201,169,97,0.14)",
      color: "#7a5e18",
      borderColor: "rgba(201,169,97,0.34)",
    },
  };
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
      style={styles[variant]}
    >
      {variant === "state" && (
        <span
          aria-hidden
          className="mr-1 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#10a359" }}
        />
      )}
      {children}
    </span>
  );
}

function StarGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill={GOLD} aria-hidden>
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={13}
      height={13}
      fill="none"
      stroke={PURPLE}
      strokeWidth={2}
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 8.5l1.5 1.5 3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      className="h-[18px] w-[18px]"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPARKLE_CONFIG = [
  { top: "8%",  left: "7%",        size: 9,  delay: 60  },
  { top: "14%", right: "9%",       size: 7,  delay: 120 },
  { top: "52%", left: "2%",        size: 6,  delay: 180 },
  { top: "58%", right: "2%",       size: 5,  delay: 220 },
  { bottom: "18%", left: "11%",    size: 8,  delay: 160 },
  { bottom: "10%", right: "13%",   size: 6,  delay: 200 },
] as const;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function getViewportSize() {
  if (typeof window === "undefined") return { width: 390, height: 844 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function computeFrame(viewport: { width: number; height: number }) {
  const w = Math.min(SHEET_MAX_WIDTH, Math.max(320, viewport.width - SHEET_MARGIN * 2));
  const l = Math.max((viewport.width - w) / 2, SHEET_MARGIN);
  return { top: SHEET_MARGIN, left: l, width: w, height: viewport.height - SHEET_MARGIN * 2 };
}
