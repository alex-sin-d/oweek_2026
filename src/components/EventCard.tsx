"use client";

import { useApp } from "@/lib/AppContext";
import { ResolvedVenue } from "@/lib/resolveVenue";

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
  event: OWeekEvent;
  resolved: ResolvedVenue;
  onTap?: () => void;
}

export default function EventCard({ event, resolved, onTap }: Props) {
  const { savedEventIds, toggleSavedEvent } = useApp();
  const saved = savedEventIds.has(event.id);

  return (
    <div
      onClick={onTap}
      role="button"
      tabIndex={0}
      className="w-full text-left bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Time block */}
        <div className="flex-shrink-0 w-14 pt-0.5">
          <p className="text-sm font-bold text-[#4F2D7F] leading-tight">
            {event.start_time}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
            {event.end_time}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {event.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {resolved.displayLabel}
            {resolved.locationHint && (
              <span className="text-gray-400"> · {resolved.locationHint}</span>
            )}
          </p>

          {/* Audience tags */}
          {event.audience_tags.length > 0 &&
            !event.audience_tags.includes("ALL") && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {event.audience_tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSavedEvent(event.id);
          }}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label={saved ? "Remove from My Agenda" : "Save to My Agenda"}
        >
          <svg
            viewBox="0 0 24 24"
            fill={saved ? "#4F2D7F" : "none"}
            stroke={saved ? "#4F2D7F" : "#9CA3AF"}
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
