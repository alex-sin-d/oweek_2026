"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import {
  TRACKED_POI_CATEGORIES,
  TRACKED_POI_IDS,
  TOTAL_TRACKED_POIS,
  CATEGORY_LABELS,
  CATEGORY_COLOURS,
  BADGES,
  SAMPLE_RESIDENCE_PROGRESS,
  type PoiCategoryKey,
} from "@/lib/config";
import { trackedPoiById } from "@/lib/pois";

interface PoiProps {
  id: string;
  name: string;
  short_code: string | null;
  category: string;
}

const TOTAL_POIS = TOTAL_TRACKED_POIS;

// ─── Component ──────────────────────────────────────────────────────────────

export default function PassportPage() {
  const { profile, unlockedBuildings, earnedBadgeIds } = useApp();

  const totalUnlocked = useMemo(() => {
    return TRACKED_POI_IDS.filter((id) => unlockedBuildings.has(id)).length;
  }, [unlockedBuildings]);

  return (
    <div className="h-full overflow-y-auto px-4 pt-4 pb-8 space-y-6">
      {/* ── Section 1: Campus Passport ───────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Campus Passport</h1>
          <span className="text-sm font-medium text-gray-500">
            {totalUnlocked} / {TOTAL_POIS} stamps
          </span>
        </div>

        {/* Category stamp groups */}
        <div className="space-y-4">
          {(Object.keys(TRACKED_POI_CATEGORIES) as Exclude<PoiCategoryKey, "dining">[]).map((catKey) => {
            const ids = TRACKED_POI_CATEGORIES[catKey];
            const unlocked = ids.filter((id) => unlockedBuildings.has(id)).length;
            const colours = CATEGORY_COLOURS[catKey];

            return (
              <div
                key={catKey}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                {/* Category header + progress */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${colours.text}`}
                  >
                    {CATEGORY_LABELS[catKey]}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {unlocked}/{ids.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-gray-200 mb-3">
                  <div
                    className={`h-1.5 rounded-full ${colours.stamp} transition-all duration-300`}
                    style={{
                      width: `${ids.length > 0 ? (unlocked / ids.length) * 100 : 0}%`,
                    }}
                  />
                </div>

                {/* Stamp grid */}
                <div className="grid grid-cols-5 gap-2">
                  {ids.map((poiId) => {
                    const poi = trackedPoiById.get(poiId)?.properties as PoiProps | undefined;
                    const isUnlocked = unlockedBuildings.has(poiId);
                    const label =
                      poi?.short_code ||
                      poi?.name
                        ?.split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 3)
                        .toUpperCase() ||
                      "?";

                    return (
                      <div key={poiId} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold leading-none ${
                            isUnlocked
                              ? `${colours.stamp} text-white`
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {isUnlocked ? label : "?"}
                        </div>
                        <span className="text-[9px] text-gray-400 text-center leading-tight truncate w-full">
                          {poi?.name?.split(" ")[0] ?? poiId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Badges ──────────────────────────────────────────────────────── */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Badges</h2>
          <div className="grid grid-cols-2 gap-3">
            {BADGES.map((badge) => {
              const earned = earnedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl p-3 border ${
                    earned
                      ? "bg-purple-50 border-purple-200"
                      : "bg-gray-50 border-gray-100 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{earned ? "\u2B50" : "\uD83D\uDD12"}</span>
                    <span
                      className={`text-sm font-semibold ${
                        earned ? "text-[#4F2D7F]" : "text-gray-400"
                      }`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {earned && (
                    <p className="text-xs text-gray-500 leading-snug">
                      {badge.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Residence Discovery Board ─────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Residence Discovery
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          How&rsquo;s your residence doing?
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {SAMPLE_RESIDENCE_PROGRESS.map((entry) => {
            const pct = Math.round((entry.discovered / entry.total) * 100);
            const isUser = profile?.residenceTag === entry.tag;

            return (
              <div
                key={entry.tag}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isUser
                    ? "bg-purple-50 border-l-4 border-l-[#4F2D7F]"
                    : ""
                }`}
              >
                <span
                  className={`text-sm font-medium w-28 shrink-0 ${
                    isUser ? "text-[#4F2D7F]" : "text-gray-700"
                  }`}
                >
                  {entry.label}
                  {isUser && (
                    <span className="ml-1 text-[10px] text-[#4F2D7F] font-semibold">
                      YOU
                    </span>
                  )}
                </span>

                <div className="flex-1 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isUser ? "#4F2D7F" : "#F7B500",
                    }}
                  />
                </div>

                <span className="text-xs text-gray-500 w-10 text-right font-medium">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Sample data for demo purposes
        </p>
      </section>
    </div>
  );
}
