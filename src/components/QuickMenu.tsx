"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/AppContext";
import { allPois } from "@/lib/pois";
import { CATEGORY_COLOURS, PoiCategoryKey } from "@/lib/config";

interface Props {
  onClose: () => void;
  onSelectPoi: (poiId: string) => void;
}

interface PoiItem {
  id: string;
  name: string;
  shortCode?: string | null;
  category: string;
}

const searchablePois: PoiItem[] = allPois.map((poi) => ({
  id: poi.id,
  name: poi.name,
  shortCode: poi.shortCode,
  category: poi.category,
}));

export default function QuickMenu({ onClose, onSelectPoi }: Props) {
  const { unlockedBuildings } = useApp();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "unlocked">("search");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
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

  const q = query.toLowerCase();
  const searchResults = q.length >= 1
    ? searchablePois.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortCode?.toLowerCase().includes(q) ?? false)
      )
    : searchablePois;

  const unlockedPois = searchablePois.filter((p) => unlockedBuildings.has(p.id));

  const displayList = activeTab === "search" ? searchResults : unlockedPois;

  return (
    <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end justify-center">
      <div
        ref={overlayRef}
        className="w-full max-w-md bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-250"
        style={{ maxHeight: "65vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 pt-1">
          {(["search", "unlocked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#4F2D7F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "search" ? "Search" : `Unlocked (${unlockedBuildings.size})`}
            </button>
          ))}
        </div>

        {/* Search input */}
        {activeTab === "search" && (
          <div className="px-4 pb-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Building name or code…"
              className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F2D7F]/30"
            />
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto px-4 pb-4 space-y-1" style={{ maxHeight: "calc(65vh - 140px)" }}>
          {displayList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {activeTab === "unlocked" ? "No buildings unlocked yet" : "No results found"}
            </p>
          ) : (
            displayList.map((poi) => {
              const colours = CATEGORY_COLOURS[poi.category as PoiCategoryKey] ?? CATEGORY_COLOURS.academic;
              const unlocked = unlockedBuildings.has(poi.id);
              const selectable = activeTab === "search" || unlocked;
              return (
                <button
                  key={poi.id}
                  onClick={() => {
                    if (selectable) onSelectPoi(poi.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    selectable
                      ? "hover:bg-gray-50"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${colours.stamp} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">
                      {poi.shortCode?.slice(0, 2) ?? poi.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{poi.name}</p>
                    <p className={`text-xs capitalize ${colours.text}`}>{poi.category}</p>
                  </div>
                  {selectable && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-300 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
