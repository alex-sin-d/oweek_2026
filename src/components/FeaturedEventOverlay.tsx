"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import type { OWeekEvent } from "@/components/EventCard";
import type { FeaturedEventExperienceData } from "@/data/featuredEventExperience";
import type { ResolvedVenue } from "@/lib/resolveVenue";

export interface RectSnapshot {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type FeaturedOverlayPhase = "opening" | "open" | "closing";

interface Props {
  event: OWeekEvent;
  detail: FeaturedEventExperienceData;
  resolved: ResolvedVenue;
  phase: FeaturedOverlayPhase;
  originRect: RectSnapshot | null;
  isSaved: boolean;
  onClose: () => void;
  onOpenInMap: () => void;
  onToggleSaved: () => void;
}

interface OverlayFrame {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SHEET_MARGIN = 8;
const SHEET_MAX_WIDTH = 512;
const BODY_REVEAL_DELAY_MS = 130;

export default function FeaturedEventOverlay({
  event,
  detail,
  resolved,
  phase,
  originRect,
  isSaved,
  onClose,
  onOpenInMap,
  onToggleSaved,
}: Props) {
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [viewport, setViewport] = useState(() => getViewportSize());
  const [showBody, setShowBody] = useState(phase === "open");
  const isSettled = phase === "open";

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setViewport(getViewportSize());
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (phase !== "open") {
      setShowBody(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowBody(true);
    }, BODY_REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) {
        return;
      }

      const focusable = getFocusableElements(sheetRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const finalFrame = useMemo(
    () => computeOverlayFrame(viewport),
    [viewport],
  );

  const shellStyle = useMemo(
    () => buildShellStyle(finalFrame, originRect, isSettled),
    [finalFrame, originRect, isSettled],
  );

  return (
    <div className="fixed inset-0 z-[95]">
      <div
        aria-hidden="true"
        className={`featured-overlay-backdrop ${phase !== "closing" ? "is-active" : ""}`}
        onClick={onClose}
      />

      <section
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-demo-target="event-detail-screen"
        className="featured-overlay-shell fixed overflow-hidden bg-[#fbf9ff] ring-1 ring-white/80"
        style={shellStyle}
      >
        <div className="featured-overlay-scroll scrollbar-none h-full overflow-y-auto">
          <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_28%),linear-gradient(180deg,#fbf9ff_0%,#f8f4fc_40%,#f4eff9_100%)]">
            <header data-demo-target="event-detail-hero" className="relative min-h-[356px] overflow-hidden">
              <Image
                src={detail.heroImage}
                alt={event.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 512px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,20,39,0.08)_0%,rgba(29,20,39,0.22)_30%,rgba(16,11,26,0.84)_100%)]" />
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_72%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(120,82,196,0.18),transparent_42%)]" />

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close event details"
                className="absolute left-5 top-5 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/92 text-[#2f2447] shadow-[0_16px_36px_rgba(24,16,39,0.2)] backdrop-blur transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CloseIcon />
              </button>

              <div className="relative z-10 flex min-h-[356px] flex-col justify-end px-5 pb-6 pt-16">
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-[rgba(249,241,255,0.94)] px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#3d2263] shadow-[0_12px_26px_rgba(20,12,29,0.16)]">
                  {detail.badge}
                </span>

                <h2
                  id={titleId}
                  className="max-w-[13ch] text-[42px] font-semibold leading-[0.98] tracking-[-0.05em] text-white"
                >
                  {event.title}
                </h2>

                <p className="mt-2 text-[17px] font-semibold text-white/94">
                  {detail.startsIn}
                </p>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="space-y-2 text-[14px] text-white/84">
                    <div className="flex items-center gap-2">
                      <MetaIcon type="time" />
                      <span>{detail.timeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MetaIcon type="location" />
                      <span>{detail.locationLabel}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white backdrop-blur">
                    {detail.facultyTag}
                  </span>
                </div>
              </div>
            </header>

            <div className={`featured-overlay-body px-4 pb-8 pt-4 ${showBody ? "is-visible" : ""}`}>
              <div className="rounded-[30px] bg-white/92 p-4 shadow-[0_24px_48px_rgba(72,47,104,0.12)] ring-1 ring-white/85 backdrop-blur">
                <div data-demo-target="event-detail-actions" className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={onOpenInMap}
                    className="flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] px-5 py-3 text-[17px] font-semibold text-white shadow-[0_18px_34px_rgba(79,45,127,0.28)] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {detail.primaryActionLabel}
                  </button>

                  <button
                    type="button"
                    onClick={onToggleSaved}
                    aria-pressed={isSaved}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 py-3 text-[17px] font-semibold transition-colors ${
                      isSaved
                        ? "border-[#d7c7ed] bg-[#f4edff] text-[#4f2d7f]"
                        : "border-[#6a409f] bg-white text-[#5d2e95]"
                    }`}
                  >
                    <BookmarkIcon filled={isSaved} />
                    {isSaved
                      ? detail.savedActionLabel
                      : detail.secondaryActionLabel}
                  </button>
                </div>

                <div data-demo-target="event-detail-location-card" className="mt-4">
                  <MapPreviewCard
                    detail={detail}
                    resolved={resolved}
                  />
                </div>
              </div>

              <section data-demo-target="event-detail-description" className="mt-6 rounded-[30px] bg-white/90 px-5 py-6 shadow-[0_22px_48px_rgba(72,47,104,0.08)] ring-1 ring-white/80 backdrop-blur">
                <h3 className="text-[32px] font-semibold tracking-[-0.04em] text-[#1f1830]">
                  Description
                </h3>
                <p className="mt-4 text-[15px] leading-7 text-[#433659]">
                  {detail.description}
                </p>
              </section>

              <section className="mt-5 rounded-[30px] bg-white/88 px-5 py-6 shadow-[0_20px_42px_rgba(72,47,104,0.08)] ring-1 ring-white/80 backdrop-blur">
                <span className="inline-flex items-center rounded-full border border-[#d7c7ed] bg-[#f7f2fc] px-4 py-1.5 text-[14px] font-semibold text-[#44236b] shadow-[0_10px_24px_rgba(79,45,127,0.08)]">
                  {detail.whatToKnowTitle}
                </span>

                <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#382d4d]">
                  {detail.whatToKnow.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 rounded-full bg-[#6b3db2]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section data-demo-target="event-detail-last-year" className="mt-5 rounded-[32px] bg-white/90 p-4 shadow-[0_24px_52px_rgba(72,47,104,0.1)] ring-1 ring-white/85 backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7e7296]">
                      {detail.recapEyebrow}
                    </p>
                    <h3 className="mt-1 text-[34px] font-semibold tracking-[-0.04em] text-[#1f1830]">
                      {detail.recapTitle}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#efe6fa] px-3 py-1 text-[12px] font-semibold text-[#4f2d7f]">
                    {detail.facultyTag}
                  </span>
                </div>

                <div className="overflow-hidden rounded-[26px] bg-[#f6f0fb] ring-1 ring-[#ece0f8]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={detail.recapImage}
                      alt={detail.recapCaption}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,17,38,0)_0%,rgba(24,17,38,0.32)_100%)]" />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[15px] font-medium text-[#4a3e60]">
                      {detail.recapCaption}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MapPreviewCard({
  detail,
  resolved,
}: {
  detail: FeaturedEventExperienceData;
  resolved: ResolvedVenue;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#ece3f6] bg-[linear-gradient(180deg,#fbf8ff_0%,#f5effb_100%)] shadow-[0_16px_34px_rgba(77,48,119,0.08)]">
      <div className="relative h-[196px] overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute left-[12%] top-[-8%] h-[120%] w-6 rotate-[32deg] rounded-full bg-white/90 shadow-[0_10px_22px_rgba(80,61,113,0.08)]" />
          <div className="absolute left-[34%] top-[-12%] h-[126%] w-5 rotate-[32deg] rounded-full bg-white/88 shadow-[0_10px_22px_rgba(80,61,113,0.08)]" />
          <div className="absolute left-[57%] top-[-18%] h-[134%] w-6 rotate-[32deg] rounded-full bg-white/90 shadow-[0_10px_22px_rgba(80,61,113,0.08)]" />
          <div className="absolute left-[77%] top-[-8%] h-[122%] w-5 rotate-[32deg] rounded-full bg-white/86 shadow-[0_10px_22px_rgba(80,61,113,0.08)]" />
          <div className="absolute left-[-10%] top-[30%] h-4 w-[124%] rotate-[-12deg] rounded-full bg-white/88 shadow-[0_10px_22px_rgba(80,61,113,0.08)]" />
          <div className="absolute left-[-8%] top-[58%] h-5 w-[124%] rotate-[-12deg] rounded-full bg-white/84 shadow-[0_10px_22px_rgba(80,61,113,0.08)]" />
          <div className="absolute right-[9%] top-[14%] h-24 w-24 rounded-[24px] border border-white/75 bg-[#ece6f6]" />
          <div className="absolute left-[18%] top-[16%] h-20 w-20 rounded-[22px] border border-white/75 bg-[#ebe6f4]" />
          <div className="absolute left-[42%] top-[56%] h-16 w-16 rounded-[20px] border border-white/75 bg-[#e8e3f1]" />
        </div>

        <div className="absolute left-1/2 top-[48%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] text-[18px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_18px_36px_rgba(79,45,127,0.32)]">
            {detail.facultyTag}
          </div>
          <div className="-mt-1 h-6 w-6 rotate-45 rounded-[6px] bg-[#5e2ba6] shadow-[0_18px_34px_rgba(79,45,127,0.22)]" />
          <div className="mt-5 rounded-[18px] bg-white/92 px-3 py-2 text-center shadow-[0_16px_30px_rgba(63,41,98,0.12)] ring-1 ring-white/80">
            <p className="text-[15px] font-semibold text-[#2b213f]">
              {resolved.displayLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#ece3f6] bg-white/92 px-4 py-3">
        <p className="text-[15px] font-medium leading-6 text-[#3d3151]">
          {detail.mapHelperText}
        </p>
      </div>
    </div>
  );
}

function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: 390, height: 844 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function computeOverlayFrame(viewport: { width: number; height: number }): OverlayFrame {
  const width = Math.min(
    SHEET_MAX_WIDTH,
    Math.max(320, viewport.width - SHEET_MARGIN * 2),
  );
  const left = Math.max((viewport.width - width) / 2, SHEET_MARGIN);
  const top = SHEET_MARGIN;
  const height = viewport.height - SHEET_MARGIN * 2;

  return { top, left, width, height };
}

function buildShellStyle(
  finalFrame: OverlayFrame,
  originRect: RectSnapshot | null,
  isSettled: boolean,
) {
  const transform = !originRect || isSettled
    ? "translate3d(0, 0, 0) scale(1)"
    : buildOriginTransform(originRect, finalFrame);

  return {
    top: `${finalFrame.top}px`,
    left: `${finalFrame.left}px`,
    width: `${finalFrame.width}px`,
    height: `${finalFrame.height}px`,
    transform,
    borderRadius: isSettled ? "36px" : "30px",
    boxShadow: isSettled
      ? "0 28px 84px rgba(44, 27, 65, 0.24), 0 14px 34px rgba(44, 27, 65, 0.14)"
      : "0 34px 96px rgba(44, 27, 65, 0.28), 0 18px 40px rgba(44, 27, 65, 0.16)",
  } satisfies CSSProperties;
}

function buildOriginTransform(originRect: RectSnapshot, finalFrame: OverlayFrame) {
  const scaleX = originRect.width / finalFrame.width;
  const scaleY = originRect.height / finalFrame.height;
  const translateX = originRect.left - finalFrame.left;
  const translateY = originRect.top - finalFrame.top;

  return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`;
}

function getFocusableElements(container: HTMLElement) {
  const selector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("aria-hidden"),
  );
}

function MetaIcon({ type }: { type: "time" | "location" }) {
  if (type === "time") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-[18px] w-[18px] shrink-0 text-white/76"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 7.5v5l3.5 2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-[18px] w-[18px] shrink-0 text-white/76"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      className="h-4.5 w-4.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
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
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12" />
    </svg>
  );
}
