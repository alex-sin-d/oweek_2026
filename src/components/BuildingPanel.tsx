"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { MapIcon } from "@/components/map/mapIcons";
import { getMapPreviewMedia } from "@/lib/mapPreviewMedia";
import {
  CATEGORY_COLOURS,
  DEMO_DATE,
  type PoiCategoryKey,
} from "@/lib/config";
import { getPoiById } from "@/lib/pois";
import {
  getRelativeEventStatusText,
  timeLabelToMinutes,
} from "@/lib/mapPresentation";
import type { VenueResolver } from "@/lib/resolveVenue";

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

interface Props {
  poiId: string;
  resolver: VenueResolver;
  events: OWeekEvent[];
  onClose: () => void;
}

function getPoi(poiId: string) {
  return getPoiById(poiId);
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
    .sort((left, right) => {
      return timeLabelToMinutes(left.start_time) - timeLabelToMinutes(right.start_time);
    });
}

export default function BuildingPanel({
  poiId,
  resolver,
  events,
  onClose,
}: Props) {
  const poi = getPoi(poiId);
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
  const poiEvents = useMemo(
    () => getEventsForPoi(poiId, events, resolver),
    [events, poiId, resolver],
  );

  const colours =
    CATEGORY_COLOURS[(props?.category ?? "academic") as PoiCategoryKey] ??
    CATEGORY_COLOURS.academic;

  const leadingEvent = poiEvents[0] ?? null;
  const previewMedia = getMapPreviewMedia(poiId, leadingEvent?.id ?? null);

  useEffect(() => {
    function handleOutside(event: MouseEvent | TouchEvent) {
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
  }, [onClose]);

  if (!props) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-[rgba(18,12,28,0.18)] backdrop-blur-[3px]">
      <div
        ref={panelRef}
        className="relative w-full max-w-md overflow-hidden rounded-t-[34px] bg-[linear-gradient(180deg,rgba(252,250,255,0.98)_0%,rgba(246,241,251,0.98)_100%)] shadow-[0_-16px_54px_rgba(36,24,54,0.2)] ring-1 ring-white/85"
        style={{
          maxHeight: "78vh",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-11 rounded-full bg-[#d8cfe9]" />
        </div>

        <div className="relative overflow-y-auto px-5 pb-2 pt-3" style={{ maxHeight: "calc(78vh - 20px)" }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_72%)]" />
          <div className="pointer-events-none absolute -right-10 top-10 h-28 w-28 rounded-full bg-[#eadffd]/60 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${colours.bg} ${colours.text}`}
                >
                  {props.category}
                </span>
                {props.short_code ? (
                  <span className="rounded-full bg-[#f1e8fb] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6d43b4]">
                    {props.short_code}
                  </span>
                ) : null}
              </div>

              <h2 className="mt-3 text-[32px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#221833]">
                {props.name}
              </h2>

              <p className="mt-2 text-[14px] leading-6 text-[#625773]">
                {props.description ?? "Explore what is happening at this OWeek stop today."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close location details"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/88 text-[#6941aa] shadow-[0_12px_24px_rgba(79,45,127,0.08)] ring-1 ring-white/80"
            >
              <MapIcon name="close" className="h-4.5 w-4.5" />
            </button>
          </div>

          {previewMedia ? (
            <div className="relative z-10 mt-4 overflow-hidden rounded-[26px] shadow-[0_18px_30px_rgba(79,45,127,0.12)] ring-1 ring-white/80">
              <div className="relative h-40 w-full">
                <Image
                  src={previewMedia.src}
                  alt={previewMedia.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 430px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,20,45,0.06)_0%,rgba(30,20,45,0.54)_100%)]" />
              {leadingEvent ? (
                <div className="absolute inset-x-4 bottom-4 rounded-[22px] bg-white/88 px-4 py-3 shadow-[0_14px_24px_rgba(36,24,54,0.16)] backdrop-blur-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8768b0]">
                    Up next
                  </p>
                  <p className="mt-1 text-[18px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#231836]">
                    {leadingEvent.title}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-[#655a78]">
                    {getRelativeEventStatusText(leadingEvent)}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative z-10 mt-4 rounded-[26px] bg-white/88 p-4 shadow-[0_16px_30px_rgba(79,45,127,0.08)] ring-1 ring-white/80">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#f5eefc] text-[#6d43b4] ring-1 ring-white/80">
                  <MapIcon
                    name={poiEvents.length > 0 ? "event" : "building"}
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a71af]">
                    Today here
                  </p>
                  <p className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-[#251a37]">
                    {poiEvents.length > 0
                      ? `${poiEvents.length} event${poiEvents.length === 1 ? "" : "s"} on the schedule`
                      : "No scheduled events right now"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="relative z-10 mt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a71af]">
                  OWeek lineup
                </p>
                <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.045em] text-[#221833]">
                  {poiEvents.length > 0 ? "Today’s events" : "No events today"}
                </h3>
              </div>

              {poiEvents.length > 0 ? (
                <span className="rounded-full bg-[#f2e8fc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6e43b4]">
                  {poiEvents.length} scheduled
                </span>
              ) : null}
            </div>

            {poiEvents.length === 0 ? (
              <div className="mt-4 rounded-[26px] bg-white/88 px-5 py-6 text-center shadow-[0_16px_30px_rgba(79,45,127,0.08)] ring-1 ring-white/80">
                <p className="text-[15px] font-medium text-[#6d627f]">
                  This stop is still part of the campus map, but there are no OWeek events scheduled here today.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3 pb-3">
                {poiEvents.map((event) => {
                  const resolved = resolver.resolve(event.venue_id);
                  return (
                    <div
                      key={event.id}
                      className="rounded-[26px] bg-white/92 px-4 py-4 shadow-[0_18px_34px_rgba(79,45,127,0.08)] ring-1 ring-white/80"
                    >
                      <div className="flex gap-3">
                        <div className="flex w-16 shrink-0 flex-col rounded-[18px] bg-[#f4eefb] px-2 py-3 text-center ring-1 ring-white/80">
                          <span className="text-[15px] font-semibold leading-none tracking-[-0.03em] text-[#5d31a2]">
                            {event.start_time}
                          </span>
                          <span className="mt-1 text-[11px] font-medium text-[#86799d]">
                            to {event.end_time}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[18px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#231836]">
                            {event.title}
                          </p>

                          <div className="mt-2 space-y-1.5 text-[13px] font-medium text-[#675b79]">
                            <div className="flex items-center gap-2">
                              <MapIcon name="location" className="h-4 w-4 shrink-0 text-[#7d64a4]" />
                              <span>
                                {resolved.displayLabel}
                                {resolved.locationHint ? ` · ${resolved.locationHint}` : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapIcon name="time" className="h-4 w-4 shrink-0 text-[#7d64a4]" />
                              <span>{getRelativeEventStatusText(event)}</span>
                            </div>
                          </div>

                          {event.audience_tags.length > 0 &&
                          !event.audience_tags.includes("ALL") ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {event.audience_tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#f0e6fb] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6d43b4]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
