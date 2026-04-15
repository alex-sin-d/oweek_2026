"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { allPoiCoordinates, allPois, getPoiById } from "@/lib/pois";
import {
  PERTH_START_COORDS,
  CAMPUS_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_DEFAULT_PITCH,
  MAP_DEFAULT_BEARING,
  PROXIMITY_RADIUS_M,
  WALK_TICK_MS,
} from "@/lib/config";
import { detectUnlocks } from "@/lib/proximityDetection";
import { advanceRoute, INITIAL_ROUTE_STATE, RouteState } from "@/lib/walkRoute";
import { venueResolver as resolver } from "@/lib/venueResolver";
import BuildingPanel from "@/components/BuildingPanel";
import QuickMenu from "@/components/QuickMenu";
import StampToast from "@/components/StampToast";

import eventsJson from "@/data/events.json";

// ─── Mapbox → OWeek name mapping ─────────────────────────────────────────────

const MAPBOX_NAME_ALIASES: Record<string, string> = {
  "Perth Hall": "perth",
  "Saugeen-Maitland Hall": "saugeen",
  "Saugeen Maitland Hall": "saugeen",
  "Medway-Sydenham Hall": "medsyd",
  "Sydenham Hall": "medsyd",
  "Elgin Hall": "elgin",
  "Delaware Hall": "delaware",
  "Essex Hall": "essex",
  "Lambton Hall": "lambton",
  "Bayfield Hall": "bayfield",
  "Ontario Hall": "ontario",
  "Clare Hall": "clare",
  "King's University College": "kings",
  "King's University College at Western": "kings",
  "Amit Chakma Engineering Building": "aceb",
  "University Community Centre": "ucc",
  "University Community Center": "ucc",
  "Somerville House": "somerville",
  "Thames Hall": "thames",
  "Talbot College": "talbot",
  "Health Sciences Building": "health_sci",
  "Western Alumni Stadium": "alumni_stadium",
  "Recreation Centre": "rec_centre",
  "Western Student Recreation Centre": "rec_centre",
  "Concrete Beach": "concrete_beach",
  "UC Hill": "uc_hill",
  "University College Hill": "uc_hill",
  "Ronald D. Schmeichel Building": "schmeichel",
  "Ronald D. Schmeichel Building for Entrepreneurship and Innovation": "schmeichel",
  "McKellar Theatre": "mckellar",
  "Huron University College": "huron_quad",
  "Huron Quad": "huron_quad",
  HURON: "huron_quad",
  "Alumni staadium": "alumni_stadium",
};

function canonicalizePoiName(value: string): string {
  return value.trim().toLowerCase();
}

const MAPBOX_NAME_TO_POI_ID = (() => {
  const index = new Map<string, string>();
  const register = (value: string | null | undefined, poiId: string) => {
    if (!value) return;
    index.set(canonicalizePoiName(value), poiId);
  };

  for (const poi of allPois) {
    register(poi.name, poi.id);
    register(poi.shortCode, poi.id);
    register(poi.capturedName, poi.id);
  }

  for (const [name, poiId] of Object.entries(MAPBOX_NAME_ALIASES)) {
    register(name, poiId);
  }

  return index;
})();

// ─── Category colour map for circle layer ───────────────────────────────────

const CATEGORY_HEX: Record<string, string> = {
  academic: "#4F2D7F",
  residence: "#F7B500",
  athletics: "#22C55E",
  outdoor: "#38BDF8",
  affiliated: "#F97316",
};
// ─── Build GeoJSON for circle layers ─────────────────────────────────────────

function buildPoiGeoJSON(unlocked: Set<string>): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: allPois.map((poi) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: poi.coordinates,
      },
      properties: {
        id: poi.id,
        name: poi.name,
        short_code: poi.shortCode ?? poi.name.charAt(0),
        category: poi.category,
        unlocked: unlocked.has(poi.id) ? 1 : 0,
        color: CATEGORY_HEX[poi.category] ?? CATEGORY_HEX.academic,
      },
    })),
  };
}

// ─── Debug Coordinate Capture Panel ──────────────────────────────────────────

function DebugPanel({
  captures,
  waitingForClick,
  currentLabel,
  onStartCapture,
  onClearAll,
  onCopyAll,
}: {
  captures: { label: string; lng: number; lat: number }[];
  waitingForClick: boolean;
  currentLabel: string;
  onStartCapture: (label: string) => void;
  onClearAll: () => void;
  onCopyAll: () => void;
}) {
  const [inputVal, setInputVal] = useState("");

  return (
    <div
      className="absolute top-4 left-4 z-30 bg-black/90 text-green-400 rounded-xl p-4 font-mono text-xs max-w-xs shadow-2xl backdrop-blur-sm"
      style={{ maxHeight: "60vh", overflowY: "auto" }}
    >
      <div className="text-green-300 font-bold text-sm mb-2">
        🐛 Debug: Coordinate Capture
      </div>

      {waitingForClick ? (
        <div className="bg-yellow-900/50 text-yellow-300 rounded px-2 py-1 mb-2">
          Click the map to capture: <strong>{currentLabel}</strong>
        </div>
      ) : (
        <div className="flex gap-1 mb-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Building name…"
            className="flex-1 bg-gray-800 text-green-400 border border-gray-600 rounded px-2 py-1 text-xs placeholder:text-gray-500 focus:outline-none focus:border-green-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputVal.trim()) {
                onStartCapture(inputVal.trim());
                setInputVal("");
              }
            }}
          />
          <button
            onClick={() => {
              if (inputVal.trim()) {
                onStartCapture(inputVal.trim());
                setInputVal("");
              }
            }}
            className="bg-green-700 text-white rounded px-2 py-1 text-xs hover:bg-green-600"
          >
            Capture
          </button>
        </div>
      )}

      {captures.length > 0 && (
        <>
          <div className="border-t border-gray-700 pt-2 mt-1 mb-1 text-gray-400">
            Captured ({captures.length}):
          </div>
          {captures.map((c, i) => (
            <div key={i} className="mb-1">
              <span className="text-white">{c.label}:</span>{" "}
              [{c.lng}, {c.lat}]
            </div>
          ))}
          <div className="flex gap-1 mt-2">
            <button
              onClick={onCopyAll}
              className="bg-blue-700 text-white rounded px-2 py-1 text-xs hover:bg-blue-600"
            >
              Copy JSON
            </button>
            <button
              onClick={onClearAll}
              className="bg-red-800 text-white rounded px-2 py-1 text-xs hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </>
      )}

      <div className="text-gray-500 mt-2 text-[10px]">
        ?debug=1 in URL to show this panel
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView() {
  const {
    unlockedBuildings,
    unlockBuilding,
    panelPoiId,
    setPanelPoiId,
    setSelectedPoiId,
  } = useApp();

  const searchParams = useSearchParams();
  const debugMode = searchParams.get("debug") === "1";

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeStateRef = useRef<RouteState>(INITIAL_ROUTE_STATE);
  const walkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unlockedRef = useRef<Set<string>>(new Set());

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [stampToast, setStampToast] = useState<{
    poiId: string;
    name: string;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Debug state
  const [debugCaptures, setDebugCaptures] = useState<
    { label: string; lng: number; lat: number }[]
  >([]);
  const [debugWaiting, setDebugWaiting] = useState(false);
  const [debugCurrentLabel, setDebugCurrentLabel] = useState("");
  const debugWaitingRef = useRef(false);
  const debugLabelRef = useRef("");

  // Keep unlocked ref in sync
  useEffect(() => {
    unlockedRef.current = unlockedBuildings;
  }, [unlockedBuildings]);

  // ── Map initialisation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
    let destroyed = false;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: CAMPUS_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      pitch: MAP_DEFAULT_PITCH,
      bearing: MAP_DEFAULT_BEARING,
      config: {
        basemap: {
          lightPreset: "dusk",
          show3dObjects: true,
          showPointOfInterestLabels: true,
        },
      },
    } as mapboxgl.MapOptions & {
      config: Record<string, Record<string, unknown>>;
    });
    mapRef.current = map;
    if (process.env.NODE_ENV === "development") {
      (window as unknown as Record<string, unknown>).__map = map;
    }

    map.on("error", (e) =>
      console.error("[MapView] Mapbox error:", e.error?.message ?? e)
    );

    map.on("load", () => {
      if (destroyed) return;

      // ── GeoJSON source for all POIs ──────────────────────────────────────
      map.addSource("oweek-pois", {
        type: "geojson",
        data: buildPoiGeoJSON(unlockedRef.current),
      });

      // ── Circle layer — outer ring (border effect) ────────────────────────
      map.addLayer({
        id: "oweek-poi-ring",
        type: "circle",
        source: "oweek-pois",
        slot: "top",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "unlocked"], 1],
            14,
            11,
          ],
          "circle-color": "rgba(255,255,255,0.9)",
          "circle-pitch-alignment": "map",
        },
      });

      // ── Circle layer — filled centre ─────────────────────────────────────
      map.addLayer({
        id: "oweek-poi-circle",
        type: "circle",
        source: "oweek-pois",
        slot: "top",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "unlocked"], 1],
            11,
            9,
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": [
            "case",
            ["==", ["get", "unlocked"], 1],
            1,
            0.75,
          ],
          "circle-pitch-alignment": "map",
        },
      });

      // ── Symbol layer — short code labels ─────────────────────────────────
      map.addLayer({
        id: "oweek-poi-label",
        type: "symbol",
        source: "oweek-pois",
        slot: "top",
        layout: {
          "text-field": ["get", "short_code"],
          "text-size": [
            "case",
            ["==", ["get", "unlocked"], 1],
            10,
            8,
          ],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.4)",
          "text-halo-width": 1,
        },
      });

      // ── Debug capture: source + layer for test markers ───────────────────
      map.addSource("debug-captures", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "debug-capture-circles",
        type: "circle",
        source: "debug-captures",
        slot: "top",
        paint: {
          "circle-radius": 8,
          "circle-color": "#FF0000",
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
          "circle-pitch-alignment": "map",
        },
      });

      map.addLayer({
        id: "debug-capture-labels",
        type: "symbol",
        source: "debug-captures",
        slot: "top",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-offset": [0, -1.5],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#FF0000",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1.5,
        },
      });

      // ── Click handler ────────────────────────────────────────────────────
      map.on("click", "oweek-poi-circle", (e) => {
        // Don't intercept if debug capture is waiting for a click
        if (debugWaitingRef.current) return;

        if (!e.features?.length) return;
        const props = e.features[0].properties;
        if (!props) return;

        const poiId = props.id as string;
        setSelectedPoiId(poiId);
        setPanelPoiId(poiId);
      });

      // Also intercept clicks on Mapbox native POI labels
      map.on("click", (e) => {
        // If debug mode is waiting for a click, handle the capture
        if (debugWaitingRef.current) {
          const { lng, lat } = e.lngLat;
          const lngRound = Math.round(lng * 1e7) / 1e7;
          const latRound = Math.round(lat * 1e7) / 1e7;
          const label = debugLabelRef.current;

          console.log(
            `%c[DEBUG CAPTURE] ${label}: [${lngRound}, ${latRound}]`,
            "color: #00ff00; font-weight: bold; font-size: 14px;"
          );
          console.log(
            "  // Copy-paste for pois.merged-from-manual-captures.json:\n" +
              `  "coordinates": [${lngRound}, ${latRound}]`
          );

          setDebugCaptures((prev) => [
            ...prev,
            { label, lng: lngRound, lat: latRound },
          ]);

          // Add debug marker to the map via GeoJSON source
          const src = map.getSource("debug-captures") as mapboxgl.GeoJSONSource;
          if (src) {
            // We need to rebuild from current state + new point
            setDebugCaptures((prev) => {
              const all = [...prev, { label, lng: lngRound, lat: latRound }];
              src.setData({
                type: "FeatureCollection",
                features: all.map((c) => ({
                  type: "Feature" as const,
                  geometry: {
                    type: "Point" as const,
                    coordinates: [c.lng, c.lat],
                  },
                  properties: { label: c.label },
                })),
              });
              return all;
            });
          }

          debugWaitingRef.current = false;
          debugLabelRef.current = "";
          setDebugWaiting(false);
          setDebugCurrentLabel("");
          return;
        }

        // Check for Mapbox native POI click
        const hits = map.queryRenderedFeatures(e.point);
        for (const f of hits) {
          const name = f.properties?.name ?? f.properties?.name_en;
          if (!name) continue;
          const poiId = MAPBOX_NAME_TO_POI_ID.get(canonicalizePoiName(name));
          if (poiId) {
            setSelectedPoiId(poiId);
            setPanelPoiId(poiId);
            return;
          }
        }
      });

      // Cursor styling for poi circles
      map.on("mouseenter", "oweek-poi-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "oweek-poi-circle", () => {
        map.getCanvas().style.cursor = "";
      });

      setMapReady(true);
      console.log(
        `[MapView] Map loaded — GeoJSON circle layers active (${allPois.length} POIs)`,
      );
    });

    return () => {
      destroyed = true;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── User position marker ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const el = document.createElement("div");
    el.innerHTML = `
      <div style="
        width:18px;height:18px;border-radius:50%;
        background:#4F2D7F;border:3px solid white;
        box-shadow:0 2px 8px rgba(79,45,127,0.5);
        position:relative;
      ">
        <div style="
          position:absolute;inset:-6px;border-radius:50%;
          background:rgba(79,45,127,0.2);
          animation:pulse 2s ease-out infinite;
        "></div>
      </div>
    `;

    if (!document.getElementById("marker-pulse-style")) {
      const style = document.createElement("style");
      style.id = "marker-pulse-style";
      style.textContent = `
        @keyframes pulse {
          0%   { transform:scale(1); opacity:0.6; }
          100% { transform:scale(2.5); opacity:0; }
        }
      `;
      document.head.appendChild(style);
    }

    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat(PERTH_START_COORDS)
      .addTo(mapRef.current);
    userMarkerRef.current = marker;

    return () => {
      marker.remove();
      userMarkerRef.current = null;
    };
  }, [mapReady]);

  // ── Simulated walk ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;

    walkTimerRef.current = setInterval(() => {
      const { state, position, finished } = advanceRoute(
        routeStateRef.current,
      );
      routeStateRef.current = state;
      userMarkerRef.current?.setLngLat(position);

      // Proximity check
      const newUnlocks = detectUnlocks(
        position,
        allPoiCoordinates,
        unlockedRef.current,
        PROXIMITY_RADIUS_M,
      );

      for (const poiId of newUnlocks) {
        unlockBuilding(poiId);
        const name = getPoiById(poiId)?.properties.name ?? poiId;
        setStampToast({ poiId, name });
        setPanelPoiId(poiId);
      }

      if (finished && walkTimerRef.current) {
        clearInterval(walkTimerRef.current);
        walkTimerRef.current = null;
      }
    }, WALK_TICK_MS);

    return () => {
      if (walkTimerRef.current) clearInterval(walkTimerRef.current);
    };
  }, [mapReady, unlockBuilding, setPanelPoiId]);

  // ── Update GeoJSON source when unlocked set changes ───────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const src = mapRef.current.getSource("oweek-pois") as mapboxgl.GeoJSONSource;
    if (src) {
      src.setData(buildPoiGeoJSON(unlockedBuildings));
    }
  }, [unlockedBuildings, mapReady]);

  // ── Debug capture handlers ─────────────────────────────────────────────────
  const handleStartCapture = useCallback((label: string) => {
    debugWaitingRef.current = true;
    debugLabelRef.current = label;
    setDebugWaiting(true);
    setDebugCurrentLabel(label);
    console.log(
      `%c[DEBUG] Waiting for click to capture: "${label}"`,
      "color: #ffff00; font-weight: bold;"
    );
  }, []);

  const handleClearCaptures = useCallback(() => {
    setDebugCaptures([]);
    if (mapRef.current) {
      const src = mapRef.current.getSource("debug-captures") as mapboxgl.GeoJSONSource;
      if (src) {
        src.setData({ type: "FeatureCollection", features: [] });
      }
    }
  }, []);

  const handleCopyAll = useCallback(() => {
    const json = JSON.stringify(
      Object.fromEntries(
        debugCaptures.map((c) => [
          c.label,
          { coordinates: [c.lng, c.lat] },
        ])
      ),
      null,
      2
    );
    navigator.clipboard.writeText(json).then(() => {
      console.log("[DEBUG] Copied to clipboard:", json);
    });
  }, [debugCaptures]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0">
      <div ref={mapContainerRef} className="w-full h-full" />

      {mapReady && (
        <>
          {/* Debug panel — only visible with ?debug=1 */}
          {debugMode && (
            <DebugPanel
              captures={debugCaptures}
              waitingForClick={debugWaiting}
              currentLabel={debugCurrentLabel}
              onStartCapture={handleStartCapture}
              onClearAll={handleClearCaptures}
              onCopyAll={handleCopyAll}
            />
          )}

          <button
            onClick={() => setQuickMenuOpen(true)}
            className="absolute top-4 right-4 z-10 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <span className="pr-1">Search</span>
          </button>

          {stampToast && (
            <StampToast
              name={stampToast.name}
              onDismiss={() => setStampToast(null)}
            />
          )}

          {quickMenuOpen && (
            <QuickMenu
              onClose={() => setQuickMenuOpen(false)}
              onSelectPoi={(poiId) => {
                setQuickMenuOpen(false);
                setPanelPoiId(poiId);
                const poi = allPois.find((entry) => entry.id === poiId);
                if (poi && mapRef.current) {
                  mapRef.current.flyTo({
                    center: poi.coordinates,
                    zoom: 16.5,
                    duration: 800,
                  });
                }
              }}
            />
          )}

          {panelPoiId && (
            <BuildingPanel
              poiId={panelPoiId}
              resolver={resolver}
              events={
                (eventsJson as { events: unknown[] })
                  .events as Parameters<typeof BuildingPanel>[0]["events"]
              }
              onClose={() => setPanelPoiId(null)}
            />
          )}
        </>
      )}

      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.startsWith("pk.eyJ") && (
        <div className="absolute inset-x-4 top-16 z-20 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-4 py-3">
          Add your Mapbox token to <code>.env.local</code> to see the map.
        </div>
      )}
    </div>
  );
}
