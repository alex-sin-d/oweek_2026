"use client";

import { useEffect, useRef } from "react";
import type { VenueResolver } from "@/lib/resolveVenue";
import { getPoiById } from "@/lib/pois";
import { DEMO_DATE, CATEGORY_COLOURS, PoiCategoryKey } from "@/lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPoi(poiId: string) {
  return getPoiById(poiId);
}

function getEventsForPoi(
  poiId: string,
  events: OWeekEvent[],
  resolver: VenueResolver
): OWeekEvent[] {
  return events.filter((e) => {
    if (e.date !== DEMO_DATE) return false;
    const resolved = resolver.resolve(e.venue_id);
    return resolved.poiId === poiId;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BuildingPanel({ poiId, resolver, events, onClose }: Props) {
  const poi = getPoi(poiId);
  const props = poi?.properties as {
    id: string; name: string; short_code?: string;
    category: string; description?: string;
  } | undefined;

  const poiEvents = getEventsForPoi(poiId, events, resolver);
  const colours = CATEGORY_COLOURS[(props?.category ?? "academic") as PoiCategoryKey] ?? CATEGORY_COLOURS.academic;

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside tap
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
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
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none">
      <div
        ref={panelRef}
        className="w-full max-w-md pointer-events-auto bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "70vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colours.bg} ${colours.text}`}>
                {props.category.charAt(0).toUpperCase() + props.category.slice(1)}
              </span>
              {props.short_code && (
                <span className="text-xs text-gray-400 font-mono">{props.short_code}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
              {props.name}
            </h2>
            {props.description && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {props.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-5" />

        {/* Events */}
        <div className="overflow-y-auto px-5 py-3" style={{ maxHeight: "calc(70vh - 140px)" }}>
          {poiEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No events here today
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Today&apos;s Events
              </p>
              {poiEvents.map((event) => {
                const resolved = resolver.resolve(event.venue_id);
                return (
                  <div key={event.id} className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {event.start_time} – {event.end_time}
                          </span>
                          {resolved.locationHint && (
                            <>
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-500">{resolved.locationHint}</span>
                            </>
                          )}
                        </div>
                        {event.audience_tags.length > 0 && !event.audience_tags.includes("ALL") && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {event.audience_tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
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
  );
}
