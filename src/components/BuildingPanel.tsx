"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapIcon } from "@/components/map/mapIcons";
import { CATEGORY_COLOURS, DEMO_DATE, type PoiCategoryKey } from "@/lib/config";
import { getPoiById } from "@/lib/pois";
import type { CampusPoi } from "@/lib/pois";
import {
  MAP_PREVIEW_BASELINE_MINUTES,
  getRelativeEventStatusText,
  timeLabelToMinutes,
} from "@/lib/mapPresentation";
import type { VenueResolver } from "@/lib/resolveVenue";
import { getPoiContent } from "@/lib/poiContent";
import { UNFINISHED_ARTWORK_IDS } from "@/data/passport";
import { getNearbyEvents } from "@/lib/nearbyEvents";
import { useApp } from "@/lib/AppContext";
import { getStampAssets } from "@/lib/stampImages";
import StampCollectOverlay from "@/components/passport/StampCollectOverlay";

type CollectPhase = "idle" | "collecting" | "settled";

export interface OWeekEvent {
  id: string;
  title: string;
  venue_id: string;
  raw_location_label: string;
  date: string;
  day_label: string;
  start_time: string;
  end_time: string;
  audience_tags: string[];
}

type PopupStatus = "live" | "starting_soon" | "later_today" | "quiet";

interface EventBuckets {
  liveNow: OWeekEvent[];
  startingSoon: OWeekEvent[];
  laterToday: OWeekEvent[];
}

interface Props {
  poiId: string;
  resolver: VenueResolver;
  events: OWeekEvent[];
  allPois: CampusPoi[];
  onClose: () => void;
}

function getEventsForPoi(
  poiId: string,
  events: OWeekEvent[],
  resolver: VenueResolver,
): OWeekEvent[] {
  return events
    .filter((event) => {
      if (event.date !== DEMO_DATE) return false;
      const resolved = resolver.resolve(event.venue_id);
      return resolved.poiId === poiId;
    })
    .sort(
      (a, b) => timeLabelToMinutes(a.start_time) - timeLabelToMinutes(b.start_time),
    );
}

function bucketEvents(events: OWeekEvent[]): EventBuckets {
  const baseline = MAP_PREVIEW_BASELINE_MINUTES;
  const liveNow: OWeekEvent[] = [];
  const startingSoon: OWeekEvent[] = [];
  const laterToday: OWeekEvent[] = [];

  for (const event of events) {
    const start = timeLabelToMinutes(event.start_time);
    const end = timeLabelToMinutes(event.end_time);
    if (baseline >= start && baseline < end) {
      liveNow.push(event);
    } else if (baseline < start && start - baseline <= 60) {
      startingSoon.push(event);
    } else if (baseline < start) {
      laterToday.push(event);
    }
  }

  return { liveNow, startingSoon, laterToday };
}

function getPoiStatus(buckets: EventBuckets): PopupStatus {
  if (buckets.liveNow.length > 0) return "live";
  if (buckets.startingSoon.length > 0) return "starting_soon";
  if (buckets.laterToday.length > 0) return "later_today";
  return "quiet";
}

function StatusChip({ status }: { status: PopupStatus }) {
  if (status === "quiet") return null;

  const configs = {
    live: {
      label: "Happening Now",
      dot: "bg-green-500",
      text: "text-green-700",
      bg: "bg-green-50",
    },
    starting_soon: {
      label: "Starting Soon",
      dot: "bg-amber-400",
      text: "text-amber-700",
      bg: "bg-amber-50",
    },
    later_today: {
      label: "Events Later",
      dot: "bg-[#c0b4d6]",
      text: "text-[#6b5d82]",
      bg: "bg-[#f3eefb]",
    },
  } as const;

  const cfg = configs[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function EventRow({
  event,
  resolver,
  dimmed = false,
}: {
  event: OWeekEvent;
  resolver: VenueResolver;
  dimmed?: boolean;
}) {
  const resolved = resolver.resolve(event.venue_id);
  return (
    <div
      className={`flex gap-3 rounded-[20px] px-4 py-3.5 ring-1 ring-white/80 ${
        dimmed
          ? "bg-white/60 shadow-[0_8px_20px_rgba(79,45,127,0.05)]"
          : "bg-white/92 shadow-[0_12px_28px_rgba(79,45,127,0.08)]"
      }`}
    >
      <div className="flex w-[62px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#f4eefb] px-2 py-2.5 text-center ring-1 ring-white/80">
        <span className="text-[14px] font-semibold leading-none tracking-[-0.02em] text-[#5d31a2]">
          {event.start_time}
        </span>
        <span className="mt-0.5 text-[10px] font-medium text-[#9382b2]">
          –{event.end_time}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[16px] font-semibold leading-[1.18] tracking-[-0.025em] text-pretty [text-wrap:balance] [hyphens:manual] ${
            dimmed ? "text-[#4d3f64]" : "text-[#231836]"
          }`}
        >
          {event.title}
        </p>
        <p className="mt-1 text-[12px] font-medium text-[#7a6d8e]">
          {resolved.displayLabel}
          {resolved.locationHint ? ` · ${resolved.locationHint}` : ""}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-[#9382b2]">
          {getRelativeEventStatusText(event)}
        </p>
      </div>
    </div>
  );
}

export default function BuildingPanel({
  poiId,
  resolver,
  events,
  allPois,
  onClose,
}: Props) {
  const { unlockBuilding, unlockedBuildings } = useApp();
  const poi = getPoiById(poiId);
  const props = poi?.properties as
    | {
        id: string;
        name: string;
        short_code?: string;
        category: string;
        description?: string;
      }
    | undefined;

  const panelRef = useRef<HTMLDivElement>(null);
  const iconSlotRef = useRef<HTMLSpanElement>(null);
  const [collectPhase, setCollectPhase] = useState<CollectPhase>("idle");

  const poiEvents = useMemo(
    () => getEventsForPoi(poiId, events, resolver),
    [events, poiId, resolver],
  );

  const buckets = useMemo(() => bucketEvents(poiEvents), [poiEvents]);
  const status = getPoiStatus(buckets);

  const content = getPoiContent(poiId);

  const nearbyEvents = useMemo(
    () => getNearbyEvents(poiId, allPois, events, resolver),
    [poiId, allPois, events, resolver],
  );

  const colours =
    CATEGORY_COLOURS[(props?.category ?? "academic") as PoiCategoryKey] ??
    CATEGORY_COLOURS.academic;

  const isUnlocked = !UNFINISHED_ARTWORK_IDS.has(poiId) && unlockedBuildings.has(poiId);

  const stampAssets = getStampAssets(poiId);
  const stampFrontImage = stampAssets?.frontImage ?? null;
  const stampLockedImage = stampAssets?.backImage ?? stampFrontImage;
  const stampSpinGif = stampAssets?.spinGif ?? null;
  const stampSpinDurationMs = stampAssets?.spinDurationMs ?? null;
  const canPlayCollectReveal =
    !!stampFrontImage && !UNFINISHED_ARTWORK_IDS.has(poiId);

  // Button shows the collected treatment once the user has tapped, even
  // while the reveal is still playing — this is the "I did that" beat.
  const buttonShowsCollected = isUnlocked || collectPhase !== "idle";
  const isCollecting = collectPhase === "collecting";

  useEffect(() => {
    function handleOutside(event: MouseEvent | TouchEvent) {
      // Do not tear down the panel mid-reveal — the overlay's destination
      // ref lives inside this panel, so unmounting here would break the
      // fly-to-slot landing.
      if (collectPhase !== "idle") return;
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [onClose, collectPhase]);

  useEffect(() => {
    if (collectPhase !== "settled") return;
    const t = window.setTimeout(() => setCollectPhase("idle"), 16);
    return () => window.clearTimeout(t);
  }, [collectPhase]);

  function handleCollectTap() {
    if (isUnlocked || collectPhase !== "idle") return;
    if (canPlayCollectReveal) {
      setCollectPhase("collecting");
      return;
    }
    unlockBuilding(poiId);
  }

  function handleOverlayUnlockCommit() {
    unlockBuilding(poiId);
  }

  function handleOverlayComplete() {
    setCollectPhase("settled");
  }

  if (!props) return null;

  const categoryLabel =
    content?.role_label ??
    props.category.charAt(0).toUpperCase() + props.category.slice(1);

  const whyCopy =
    content?.why_it_matters ??
    props.description ??
    "Explore what is happening at this OWeek stop today.";

  const primaryEvents =
    status === "live"
      ? buckets.liveNow
      : status === "starting_soon"
        ? buckets.startingSoon
        : [];

  const primaryLabel = status === "live" ? "Happening Now" : "Starting Soon";
  const buttonStampImage = buttonShowsCollected ? stampFrontImage : stampLockedImage;
  const hideButtonStampDuringCollect = isCollecting && !!buttonStampImage;
  const lockedThumbStyle = {
    filter: "saturate(0.15) brightness(0.92)",
    opacity: 0.72,
  } as const;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-[rgba(18,12,28,0.18)] backdrop-blur-[3px]">
      <div
        ref={panelRef}
        className="relative w-full max-w-md overflow-hidden rounded-t-[34px] bg-[linear-gradient(180deg,rgba(252,250,255,0.98)_0%,rgba(246,241,251,0.98)_100%)] shadow-[0_-16px_54px_rgba(36,24,54,0.2)] ring-1 ring-white/85"
        style={{
          maxHeight: "82vh",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-11 rounded-full bg-[#d8cfe9]" />
        </div>

        <div
          className={`px-5 pb-4 pt-3 ${
            isCollecting ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{ maxHeight: "calc(82vh - 20px)" }}
        >
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_72%)]" />
          <div className="pointer-events-none absolute -right-10 top-10 h-28 w-28 rounded-full bg-[#eadffd]/60 blur-3xl" />

          {/* ── 1. Header ── */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-[30px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#221833]">
                {props.name}
              </h2>
              {content?.subtitle ? (
                <p className="mt-0.5 text-[13px] font-medium text-[#7a6a94]">
                  {content.subtitle}
                </p>
              ) : null}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${colours.bg} ${colours.text}`}
                >
                  {categoryLabel}
                </span>
                <StatusChip status={status} />
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close location details"
              disabled={isCollecting}
              className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/88 text-[#6941aa] shadow-[0_8px_20px_rgba(79,45,127,0.1)] ring-1 ring-white/80 transition-opacity ${
                isCollecting ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <MapIcon name="close" className="h-4 w-4" />
            </button>
          </div>

          {/* ── 2. Action row ── */}
          <div className="relative z-10 mt-4">
            <button
              type="button"
              onClick={handleCollectTap}
              disabled={buttonShowsCollected}
              className={`flex min-h-[62px] w-full items-center justify-center rounded-[18px] px-3 py-2 text-[15px] font-semibold tracking-[-0.02em] transition-colors ${
                buttonShowsCollected
                  ? "bg-[#e8dff8] text-[#5a32a0] ring-1 ring-[#c9b6ee]/55"
                  : "bg-[#4f1d96] text-white shadow-[0_10px_28px_rgba(79,29,150,0.35)] active:scale-[0.98]"
              }`}
            >
              <span className="flex items-center gap-2.5 pr-1">
                <span
                  ref={iconSlotRef}
                  className="relative -ml-0.5 flex h-12 w-[92px] shrink-0 items-center justify-center"
                >
                  {buttonStampImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={buttonStampImage}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-contain"
                        style={
                          hideButtonStampDuringCollect
                            ? { opacity: 0 }
                            : buttonShowsCollected
                              ? undefined
                              : lockedThumbStyle
                        }
                      />
                      {!buttonShowsCollected && !hideButtonStampDuringCollect ? (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-white/95 text-[#4f1d96] shadow-[0_1px_2px_rgba(34,18,54,0.25)] ring-1 ring-[#4f1d96]/25"
                        >
                          <LockMicroGlyph />
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <MapIcon
                      name="passport"
                      className={`h-6 w-6 ${
                        buttonShowsCollected ? "" : "opacity-90"
                      }`}
                    />
                  )}
                </span>
                <span className="min-w-[138px] text-left">
                  {buttonShowsCollected ? "Stamp Collected" : "Collect Stamp"}
                </span>
              </span>
            </button>

            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {(
                [
                  { icon: "route", label: "Route" },
                  { icon: "save", label: "Save" },
                  { icon: "share", label: "Share" },
                ] as const
              ).map(({ icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="flex flex-col items-center gap-1 rounded-[14px] bg-white/80 py-2.5 text-[12px] font-semibold text-[#6941aa] shadow-[0_6px_16px_rgba(79,45,127,0.07)] ring-1 ring-white/80"
                >
                  <MapIcon name={icon} className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 3. Why This Stop Matters ── */}
          <div className="relative z-10 mt-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a71af]">
              Why this stop matters
            </p>
            <p className="mt-1.5 text-[14px] leading-[1.6] text-[#4d3f64]">
              {whyCopy}
            </p>
          </div>

          {/* ── 4. Primary time section (Happening Now / Starting Soon) ── */}
          {primaryEvents.length > 0 && (
            <div className="relative z-10 mt-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a71af]">
                {primaryLabel}
              </p>
              <div className="mt-2.5 space-y-2.5">
                {primaryEvents.map((event) => (
                  <EventRow key={event.id} event={event} resolver={resolver} />
                ))}
              </div>
            </div>
          )}

          {/* ── 5. Happening Nearby Now ── */}
          {nearbyEvents.length > 0 && (
            <div className="relative z-10 mt-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a71af]">
                Happening Nearby Now
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {nearbyEvents.map((ne) => (
                  <div
                    key={`${ne.poiId}-${ne.eventTitle}`}
                    className="rounded-[18px] bg-white/80 px-3 py-3 shadow-[0_8px_20px_rgba(79,45,127,0.07)] ring-1 ring-white/80"
                  >
                    <p className="text-[13px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#231836]">
                      {ne.eventTitle}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-[#8678a0]">
                      {ne.startTime} to {ne.endTime}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#9b8ab8]">
                      — {ne.poiName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 6. Later Today Here ── */}
          {buckets.laterToday.length > 0 && (
            <div className="relative z-10 mt-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a71af]">
                Later Today Here
              </p>
              <div className="mt-2.5 space-y-2">
                {buckets.laterToday.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    resolver={resolver}
                    dimmed
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── 7. Quick Info chips ── */}
          {content?.quick_info_chips && content.quick_info_chips.length > 0 && (
            <div className="relative z-10 mt-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a71af]">
                Quick Info
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.quick_info_chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#f0e8fc] px-3 py-1 text-[12px] font-semibold text-[#6d43b4]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── 8. Best For chips ── */}
          {content?.best_for && content.best_for.length > 0 && (
            <div className="relative z-10 mt-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a71af]">
                Best For
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.best_for.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold text-[#6b5d82] ring-1 ring-[#d8ccee]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isCollecting && canPlayCollectReveal && stampFrontImage ? (
        <StampCollectOverlay
          frontImageSrc={stampFrontImage}
          lockedImageSrc={stampLockedImage ?? stampFrontImage}
          spinGifSrc={stampSpinGif}
          spinDurationMs={stampSpinDurationMs}
          originRef={iconSlotRef}
          onUnlockCommit={handleOverlayUnlockCommit}
          onComplete={handleOverlayComplete}
        />
      ) : null}
    </div>
  );
}

function LockMicroGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      className="h-2 w-2"
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
