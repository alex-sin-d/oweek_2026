"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { DEMO_DATE, TRACKED_POI_IDS, TOTAL_TRACKED_POIS, BADGES } from "@/lib/config";
import { trackedPoiById } from "@/lib/pois";
import { venueResolver as resolver } from "@/lib/venueResolver";
import eventsJson from "@/data/events.json";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EventRecord {
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

// ─── Static data (created once at module level) ─────────────────────────────

const allEvents = (eventsJson as { events: EventRecord[] }).events;
const TOTAL_BUILDINGS = TOTAL_TRACKED_POIS;

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEMO_TIME = "10:15";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const { profile, unlockedBuildings, earnedBadgeIds } = useApp();

  const displayName = profile?.name || "Explorer";

  // ── Happening Now ───────────────────────────────────────────────────────
  const happeningNow = useMemo(() => {
    const now = timeToMinutes(DEMO_TIME);
    return allEvents.find(
      (e) =>
        e.date === DEMO_DATE &&
        timeToMinutes(e.start_time) <= now &&
        timeToMinutes(e.end_time) > now,
    ) ?? null;
  }, []);

  const happeningNowResolved = useMemo(() => {
    if (!happeningNow) return null;
    return resolver.resolve(happeningNow.venue_id);
  }, [happeningNow]);

  const timeRemaining = useMemo(() => {
    if (!happeningNow) return null;
    const diff = timeToMinutes(happeningNow.end_time) - timeToMinutes(DEMO_TIME);
    if (diff >= 60) {
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins > 0 ? `${hrs}h ${mins}m remaining` : `${hrs}h remaining`;
    }
    return `${diff}m remaining`;
  }, [happeningNow]);

  // ── Passport stats ────────────────────────────────────────────────────
  const unlockCount = TRACKED_POI_IDS.filter((poiId) =>
    unlockedBuildings.has(poiId),
  ).length;

  const latestBadge = useMemo(() => {
    if (earnedBadgeIds.length === 0) return null;
    const lastId = earnedBadgeIds[earnedBadgeIds.length - 1];
    return BADGES.find((b) => b.id === lastId) ?? null;
  }, [earnedBadgeIds]);

  // ── Your Next Stop ────────────────────────────────────────────────────
  let nextStop: {
    id: string;
    name: string;
    description: string;
  } | null = null;

  for (const poiId of TRACKED_POI_IDS) {
    if (unlockedBuildings.has(poiId)) continue;
    const feature = trackedPoiById.get(poiId);
    if (!feature) continue;

    nextStop = {
      id: poiId,
      name: feature.properties.name,
      description:
        feature.properties.description ?? "Explore this location on campus.",
    };
    break;
  }

  // ── Mini grid for passport ────────────────────────────────────────────
  const stampGrid = useMemo(() => {
    return TRACKED_POI_IDS.map((id) => unlockedBuildings.has(id));
  }, [unlockedBuildings]);

  return (
    <div className="h-full overflow-y-auto bg-[#f8f7fa]">
      <div className="px-4 pt-6 pb-8 space-y-5 max-w-lg mx-auto">

        {/* ── 1. Header ──────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {displayName}
          </h1>
          <p className="text-sm font-semibold text-[#4F2D7F] mt-0.5">
            OWeek 2026
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Tuesday, September 8
          </p>
        </div>

        {/* ── 2. Happening Now ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200 border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Happening Now
            </span>
          </div>

          {happeningNow ? (
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {happeningNow.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {happeningNowResolved?.displayLabel ?? happeningNow.raw_location_label}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-500">
                  {formatTime(happeningNow.start_time)} – {formatTime(happeningNow.end_time)}
                </span>
                {timeRemaining && (
                  <span className="text-xs font-semibold text-[#4F2D7F] bg-purple-50 px-2 py-0.5 rounded-full">
                    {timeRemaining}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No event right now</p>
          )}

          <Link
            href="/schedule"
            className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#4F2D7F] hover:underline"
          >
            See Full Schedule
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* ── 3. Quick Access ────────────────────────────────────────────── */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
          {QUICK_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                // Placeholder — no real navigation
              }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm shadow-gray-200 border border-gray-100 flex items-center justify-center text-[#4F2D7F]">
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── 4. Passport Summary ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200 border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Campus Passport</h2>
            <span className="text-xs font-bold text-[#4F2D7F]">
              {unlockCount}/{TOTAL_BUILDINGS} unlocked
            </span>
          </div>

          {/* Mini 6x4 stamp grid */}
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {stampGrid.map((unlocked, i) => (
              <div
                key={i}
                className={`w-full aspect-square rounded-full ${
                  unlocked ? "bg-[#4F2D7F]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {latestBadge && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 mb-3">
              <span className="text-lg">&#127942;</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-yellow-800 truncate">
                  {latestBadge.label}
                </p>
                <p className="text-[10px] text-yellow-600 truncate">
                  {latestBadge.description}
                </p>
              </div>
            </div>
          )}

          <Link
            href="/passport"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#4F2D7F] hover:underline"
          >
            View Passport
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* ── 5. Your Next Stop ──────────────────────────────────────────── */}
        {nextStop && (
          <div className="bg-white rounded-2xl shadow-sm shadow-gray-200 border border-gray-100 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-1">
              Your Next Stop
            </h2>
            <h3 className="text-base font-bold text-[#4F2D7F]">
              {nextStop.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {nextStop.description}
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#4F2D7F] hover:underline"
            >
              Show on Map
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Access items ─────────────────────────────────────────────────────

const QUICK_ITEMS = [
  {
    label: "Notices",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    label: "Shuttle",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17l-2 2m2-2V5a2 2 0 012-2h4a2 2 0 012 2v12m0 0l2 2M3 11h18" />
      </svg>
    ),
  },
  {
    label: "Safety",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Wellness",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    label: "FAQs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];
