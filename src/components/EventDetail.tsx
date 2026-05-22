"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/AppContext";
import type { OWeekEvent } from "@/components/EventCard";
import type { ResolvedVenue } from "@/lib/resolveVenue";

interface Props {
  event: OWeekEvent;
  resolved: ResolvedVenue;
  onClose: () => void;
  onShowOnMap?: () => void;
}

export default function EventDetail({
  event,
  resolved,
  onClose,
  onShowOnMap,
}: Props) {
  const { savedEventIds, toggleSavedEvent } = useApp();
  const saved = savedEventIds.has(event.id);
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div
        ref={panelRef}
        className="w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "80vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="scrollbar-none overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(80vh - 30px)" }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {event.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="w-4 h-4 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Meta rows */}
          <div className="space-y-2.5 pb-4">
            {/* Time */}
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4F2D7F" strokeWidth={2} className="w-4.5 h-4.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              <span>
                {event.day_label}, {event.start_time} – {event.end_time}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4F2D7F" strokeWidth={2} className="w-4.5 h-4.5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
              <span>
                {resolved.displayLabel}
                {resolved.locationHint && (
                  <span className="text-gray-400"> · {resolved.locationHint}</span>
                )}
              </span>
            </div>

            {/* Audience */}
            {event.audience_tags.length > 0 && !event.audience_tags.includes("ALL") && (
              <div className="flex items-start gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4F2D7F" strokeWidth={2} className="w-4.5 h-4.5 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex flex-wrap gap-1">
                  {event.audience_tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-4" />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleSavedEvent(event.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                saved
                  ? "bg-purple-100 text-[#4F2D7F]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={saved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {saved ? "Saved" : "Save"}
            </button>

            {resolved.poiId && onShowOnMap && (
              <button
                onClick={onShowOnMap}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#4F2D7F] text-white rounded-xl text-sm font-semibold hover:bg-[#3d2263] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Show on Map
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
