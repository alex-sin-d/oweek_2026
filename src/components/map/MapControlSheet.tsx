"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapIcon } from "@/components/map/mapIcons";
import type {
  MapFilterKey,
  MapSearchItem,
} from "@/lib/mapPresentation";

type MapControlSheetTab = "search" | "unlocked" | "filters";

interface Props {
  initialTab: MapControlSheetTab;
  query: string;
  searchItems: MapSearchItem[];
  unlockedItems: MapSearchItem[];
  activeFilters: Record<MapFilterKey, boolean>;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSelectPoi: (poiId: string) => void;
  onToggleFilter: (filterKey: MapFilterKey) => void;
}

const FILTER_COPY: Record<
  MapFilterKey,
  { title: string; subtitle: string }
> = {
  events: {
    title: "Events",
    subtitle: "Featured OWeek stops happening today",
  },
  buildings: {
    title: "Buildings",
    subtitle: "Core campus locations and residences",
  },
  food: {
    title: "Food & Beverage",
    subtitle: "Dining highlights and quick campus stops",
  },
  transit: {
    title: "Shuttle & Transit",
    subtitle: "Late-night pickup and utility transport",
  },
};

export default function MapControlSheet({
  initialTab,
  query,
  searchItems,
  unlockedItems,
  activeFilters,
  onClose,
  onQueryChange,
  onSelectPoi,
  onToggleFilter,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<MapControlSheetTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    function handleOutside(event: MouseEvent | TouchEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
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

  const filteredSearchItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return searchItems;
    }

    return searchItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.shortCode?.toLowerCase().includes(normalizedQuery) ?? false) ||
        item.supportingText.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, searchItems]);

  const isKindEnabled = useCallback(
    (kind: MapSearchItem["kind"]) => {
      if (kind === "event") return activeFilters.events;
      if (kind === "food") return activeFilters.food;
      if (kind === "transit") return activeFilters.transit;
      return activeFilters.buildings;
    },
    [activeFilters],
  );

  const scopedSearchItems = useMemo(
    () => filteredSearchItems.filter((item) => isKindEnabled(item.kind)),
    [filteredSearchItems, isKindEnabled],
  );

  const scopedUnlockedItems = useMemo(
    () => unlockedItems.filter((item) => isKindEnabled(item.kind)),
    [isKindEnabled, unlockedItems],
  );

  const activeList =
    activeTab === "unlocked" ? scopedUnlockedItems : scopedSearchItems;

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-[rgba(25,18,36,0.22)] backdrop-blur-[6px]">
      <div
        ref={overlayRef}
        className="w-full max-w-md overflow-hidden rounded-t-[32px] bg-[linear-gradient(180deg,rgba(252,250,255,0.98)_0%,rgba(246,241,251,0.98)_100%)] shadow-[0_-14px_48px_rgba(42,28,68,0.18)] ring-1 ring-white/80"
        style={{
          maxHeight: "74vh",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1.5 w-11 rounded-full bg-[#d7cdea]" />
        </div>

        <div className="px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8e78b0]">
                Map Controls
              </p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.045em] text-[#221833]">
                Explore campus
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close map controls"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/84 text-[#4f2d7f] shadow-[0_12px_24px_rgba(79,45,127,0.1)] ring-1 ring-white/80"
            >
              <MapIcon name="close" className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-[22px] bg-white/75 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-white/80">
            {([
              ["search", "Search"],
              ["unlocked", "Unlocked"],
              ["filters", "Filters"],
            ] as const).map(([tab, label]) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-[18px] px-3 py-2.5 text-[13px] font-semibold tracking-[-0.02em] transition-all ${
                    active
                      ? "bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] text-white shadow-[0_14px_26px_rgba(79,45,127,0.2)]"
                      : "text-[#6b6080]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "search" ? (
          <div className="px-4 pb-3">
            <label className="flex items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 shadow-[0_10px_20px_rgba(79,45,127,0.08)] ring-1 ring-white/80">
              <MapIcon name="search" className="h-4.5 w-4.5 text-[#7a5ea6]" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search buildings, food, or event hubs"
                className="w-full bg-transparent text-[15px] font-medium tracking-[-0.02em] text-[#2a1f3b] placeholder:text-[#8e82a6] focus:outline-none"
              />
            </label>
          </div>
        ) : null}

        <div
          className="scrollbar-none overflow-y-auto px-4 pb-2"
          style={{ maxHeight: "calc(74vh - 220px)" }}
        >
          {activeTab === "filters" ? (
            <div className="space-y-3 pb-3">
              <div className="rounded-[26px] bg-white/88 p-4 shadow-[0_18px_36px_rgba(79,45,127,0.08)] ring-1 ring-white/80">
                <p className="text-[13px] font-medium leading-5 text-[#655a78]">
                  All 51 markers stay visible on the map. Use these categories to narrow the search and unlocked lists without changing map positions.
                </p>
              </div>

              {(
                ["events", "buildings", "food", "transit"] as const satisfies readonly MapFilterKey[]
              ).map((filterKey) => {
                const copy = FILTER_COPY[filterKey];
                const active = activeFilters[filterKey];
                return (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => onToggleFilter(filterKey)}
                    className="flex w-full items-center gap-3 rounded-[26px] bg-white/92 px-4 py-4 text-left shadow-[0_18px_34px_rgba(79,45,127,0.08)] ring-1 ring-white/80 transition-transform duration-150 active:scale-[0.988]"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ring-1 ${
                        active
                          ? "bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] text-white ring-[#7d47d3]/15"
                          : "bg-[#f6f0fc] text-[#735e98] ring-white/80"
                      }`}
                    >
                      <MapIcon name={filterKey} className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#231a33]">
                        {copy.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-[#6b6080]">
                        {copy.subtitle}
                      </p>
                    </div>

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                        active
                          ? "border-transparent bg-[#6c3ab7] text-white"
                          : "border-[#d8cbe9] bg-white text-transparent"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.25}
                        className="h-3.5 w-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4.2 4.2L19 6.5" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 pb-3">
              {activeList.length === 0 ? (
                <div className="rounded-[26px] bg-white/88 px-5 py-6 text-center shadow-[0_18px_36px_rgba(79,45,127,0.08)] ring-1 ring-white/80">
                  <p className="text-[15px] font-medium text-[#726785]">
                    {activeTab === "unlocked"
                      ? "No unlocked stops in the selected categories yet."
                      : "No matching stops in the selected categories."}
                  </p>
                </div>
              ) : (
                activeList.map((item) => (
                  <button
                    key={item.poiId}
                    type="button"
                    onClick={() => onSelectPoi(item.poiId)}
                    className="flex w-full items-center gap-3 rounded-[24px] bg-white/92 px-4 py-3.5 text-left shadow-[0_16px_30px_rgba(79,45,127,0.08)] ring-1 ring-white/80 transition-transform duration-150 active:scale-[0.988]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#f5eefc] text-[#6e42b6] ring-1 ring-white/80">
                      <MapIcon name={item.kind} className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[16px] font-semibold tracking-[-0.03em] text-[#221833]">
                          {item.name}
                        </p>
                        {item.shortCode ? (
                          <span className="rounded-full bg-[#f1e7fb] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7245b8]">
                            {item.shortCode}
                          </span>
                        ) : null}
                        {item.isUnlocked ? (
                          <span className="rounded-full bg-[#edf7ef] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4d8a62]">
                            Unlocked
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[13px] leading-5 text-[#6c617f]">
                        {item.supportingText}
                      </p>
                    </div>

                    <MapIcon
                      name="chevron-right"
                      className="h-4.5 w-4.5 shrink-0 text-[#9c8eb6]"
                    />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
