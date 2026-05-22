"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import FeaturedEventOverlay from "@/components/FeaturedEventOverlay";
import { useApp } from "@/lib/AppContext";
import { OWEEK_DAYS, DEMO_DATE } from "@/lib/config";
import { buildEventExperience } from "@/lib/eventExperience";
import { venueResolver as resolver } from "@/lib/venueResolver";
import EventCard from "@/components/EventCard";
import type { OWeekEvent } from "@/components/EventCard";

import eventsJson from "@/data/events.json";

const allEvents = (eventsJson as { events: OWeekEvent[] }).events;

// ID of the Science demo event highlighted in Guided Demo Mode. Matches
// SCIENCE_FEATURED_EVENT.id from data/featuredEventExperience.ts so tapping
// the schedule card opens the same Event Detail overlay used from Home.
const SCIENCE_DEMO_EVENT_ID = "2026-09-08_science_home_base_major_meetup";

// ─── Component ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const router = useRouter();
  const {
    profile,
    savedEventIds,
    toggleSavedEvent,
    setSelectedPoiId,
    setPanelPoiId,
  } = useApp();

  // Day picker — locked to demo date
  const [selectedDate, setSelectedDate] = useState(DEMO_DATE);

  // View toggle: "all" or "my"
  const [view, setView] = useState<"all" | "my">("all");

  // Audience filter toggle
  const [filterByProfile, setFilterByProfile] = useState(false);

  // Event detail
  const [detailEvent, setDetailEvent] = useState<OWeekEvent | null>(null);
  const detailResolved = useMemo(
    () => (detailEvent ? resolver.resolve(detailEvent.venue_id) : null),
    [detailEvent],
  );
  const detailExperience = useMemo(
    () =>
      detailEvent && detailResolved
        ? buildEventExperience(detailEvent, detailResolved)
        : null,
    [detailEvent, detailResolved],
  );

  // ── Filtered events ─────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let events = allEvents.filter((e) => e.date === selectedDate);

    // My Agenda — only saved events
    if (view === "my") {
      events = events.filter((e) => savedEventIds.has(e.id));
    }

    // Audience filter — show events matching user's faculty/residence, plus ALL
    if (filterByProfile && profile) {
      events = events.filter((e) => {
        if (e.audience_tags.includes("ALL")) return true;
        if (profile.facultyTag && e.audience_tags.includes(profile.facultyTag))
          return true;
        if (
          profile.residenceTag &&
          e.audience_tags.includes(profile.residenceTag)
        )
          return true;
        return false;
      });
    }

    return events;
  }, [selectedDate, view, filterByProfile, profile, savedEventIds]);

  // ── Time grouping ───────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups: { hour: string; events: OWeekEvent[] }[] = [];
    const seen = new Map<string, OWeekEvent[]>();

    for (const e of filteredEvents) {
      const hour = e.start_time.split(":")[0] + ":00";
      if (!seen.has(hour)) {
        const arr: OWeekEvent[] = [];
        seen.set(hour, arr);
        groups.push({ hour, events: arr });
      }
      seen.get(hour)!.push(e);
    }

    return groups;
  }, [filteredEvents]);

  // ── Show on Map ─────────────────────────────────────────────────────────────
  const handleShowOnMap = useCallback(
    (event: OWeekEvent) => {
      const resolved = resolver.resolve(event.venue_id);
      if (resolved.poiId) {
        setSelectedPoiId(resolved.poiId);
        setPanelPoiId(resolved.poiId);
      }
      router.push("/map");
    },
    [router, setPanelPoiId, setSelectedPoiId],
  );

  return (
    <div
      data-demo-target="schedule-screen"
      className="h-full flex flex-col bg-[#f8f7fa]"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Schedule</h1>

        {/* Day picker */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
          {OWEEK_DAYS.map((day) => {
            const active = day.date === selectedDate;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#4F2D7F] text-white shadow-md shadow-purple-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {day.short}
                </span>
                <span className="text-sm mt-0.5">
                  {day.date.split("-")[2]}
                </span>
              </button>
            );
          })}
        </div>

        {/* View toggle + filter */}
        <div className="flex items-center justify-between mt-2">
          {/* All / My Agenda toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setView("my")}
              data-demo-target="schedule-my-agenda-tab"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === "my"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              My Agenda
              {savedEventIds.size > 0 && (
                <span className="ml-1 bg-[#4F2D7F] text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {savedEventIds.size}
                </span>
              )}
            </button>
          </div>

          {/* "For Me" filter */}
          {profile && (
            <button
              onClick={() => setFilterByProfile((v) => !v)}
              data-demo-target="schedule-for-me"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterByProfile
                  ? "bg-purple-100 text-[#4F2D7F]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={filterByProfile ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              For Me
            </button>
          )}
        </div>
      </div>

      {/* ── Event List ──────────────────────────────────────────────────────── */}
      <div className="scrollbar-none flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div
            data-demo-target={
              view === "my" ? "schedule-my-agenda-empty" : undefined
            }
            className="flex flex-col items-center justify-center h-full text-center px-8"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth={1.5}
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {view === "my" ? "No saved events" : "No events found"}
            </p>
            <p className="text-xs text-gray-400">
              {view === "my"
                ? "Tap the bookmark icon on events to save them here."
                : filterByProfile
                  ? "Try turning off the 'For Me' filter to see all events."
                  : "No events scheduled for this day."}
            </p>
          </div>
        ) : (
          <div
            data-demo-target="schedule-event-list"
            className="px-4 pt-3 pb-6 space-y-4"
          >
            {grouped.map(({ hour, events }) => (
              <div key={hour}>
                {/* Time header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#4F2D7F] uppercase tracking-wider">
                    {formatHour(hour)}
                  </span>
                  <div className="flex-1 h-px bg-purple-100" />
                </div>

                <div className="space-y-2">
                  {events.map((event) => {
                    const resolved = resolver.resolve(event.venue_id);
                    const isScienceDemo = event.id === SCIENCE_DEMO_EVENT_ID;
                    // Wrap only the Science demo event so we can hang a
                    // `data-demo-target` on a stable element without modifying
                    // EventCard's API.
                    if (isScienceDemo) {
                      return (
                        <div
                          key={event.id}
                          data-demo-target="schedule-science-card"
                        >
                          <EventCard
                            event={event}
                            resolved={resolved}
                            onTap={() => setDetailEvent(event)}
                          />
                        </div>
                      );
                    }
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        resolved={resolved}
                        onTap={() => setDetailEvent(event)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Event Detail Overlay ────────────────────────────────────────────── */}
      {detailEvent && detailResolved && detailExperience && (
        <FeaturedEventOverlay
          event={detailEvent}
          detail={detailExperience.detail}
          resolved={detailResolved}
          phase="open"
          originRect={null}
          isSaved={savedEventIds.has(detailEvent.id)}
          onClose={() => setDetailEvent(null)}
          onOpenInMap={() => {
            setDetailEvent(null);
            handleShowOnMap(detailEvent);
          }}
          onToggleSaved={() => toggleSavedEvent(detailEvent.id)}
        />
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHour(hour: string): string {
  const h = parseInt(hour, 10);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
