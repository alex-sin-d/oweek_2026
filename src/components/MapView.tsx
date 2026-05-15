"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  Layer,
  Map as ReactMap,
  Marker,
  Source,
  type LayerProps,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import { useSearchParams } from "next/navigation";
import BuildingPanel, { type OWeekEvent } from "@/components/BuildingPanel";
import MapControlSheet from "@/components/map/MapControlSheet";
import { MapIcon } from "@/components/map/mapIcons";
import MapMarkerBadge from "@/components/map/MapMarkerBadge";
import MapPreviewCard from "@/components/map/MapPreviewCard";
import {
  MAP_DEFAULT_BEARING,
  MAP_DEFAULT_PITCH,
  MAP_DEFAULT_ZOOM,
  DEMO_DATE,
} from "@/lib/config";
import { useApp } from "@/lib/AppContext";
import { allPois } from "@/lib/pois";
import {
  buildMapSearchItems,
  buildMapSelectionPreview,
  createMapPoiPresentations,
  getStableMarkerKind,
  getVisibleMapMarkers,
  type MapFilterKey,
} from "@/lib/mapPresentation";
import { getMapPreviewMedia } from "@/lib/mapPreviewMedia";
import {
  DEMO_WALK_PATH,
  WALK_DURATION_MS,
  WALK_START,
  easeInOutQuad,
  interpolateRoute,
} from "@/lib/walkRoute";
import { venueResolver as resolver } from "@/lib/venueResolver";

import eventsJson from "@/data/events.json";

const ALL_EVENTS = (eventsJson as { events: OWeekEvent[] }).events;
const MAP_POI_PRESENTATIONS = createMapPoiPresentations({
  pois: allPois,
  events: ALL_EVENTS,
  resolver,
});
const MAP_POI_PRESENTATION_BY_ID = new Map(
  MAP_POI_PRESENTATIONS.map((poi) => [poi.poiId, poi]),
);

const DEFAULT_FILTERS: Record<MapFilterKey, boolean> = {
  events: true,
  buildings: true,
  food: true,
  transit: true,
};

const MAP_MARKERS = getVisibleMapMarkers({
  presentations: MAP_POI_PRESENTATIONS,
  activeFilters: DEFAULT_FILTERS,
});

const MAP_MARKER_BY_POI_ID = new Map(
  MAP_MARKERS.map((marker) => [marker.poiId, marker]),
);

const MAP_PADDING_RESET = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

const MAP_STYLE_URL = "mapbox://styles/flyinglow/cmnzbx6e7008c01qv2evv4azd";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

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
  "Alumni Hall": "alumni_hall",
};

const userLocationHaloLayer: LayerProps = {
  id: "user-location-halo",
  type: "circle",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      16,
      18,
      25,
    ],
    "circle-color": "rgba(104, 77, 164, 0.16)",
    "circle-pitch-alignment": "map",
  },
};

const userLocationRingLayer: LayerProps = {
  id: "user-location-ring",
  type: "circle",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      8,
      18,
      11,
    ],
    "circle-color": "#ffffff",
    "circle-pitch-alignment": "map",
  },
};

const userLocationCoreLayer: LayerProps = {
  id: "user-location-core",
  type: "circle",
  paint: {
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      5,
      18,
      7,
    ],
    "circle-color": "#5e2ba6",
    "circle-pitch-alignment": "map",
  },
};

const debugCaptureCircleLayer: LayerProps = {
  id: "debug-capture-circles",
  type: "circle",
  paint: {
    "circle-radius": 8,
    "circle-color": "#FF0000",
    "circle-stroke-color": "#FFFFFF",
    "circle-stroke-width": 2,
    "circle-pitch-alignment": "map",
  },
};

const debugCaptureLabelLayer: LayerProps = {
  id: "debug-capture-labels",
  type: "symbol",
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

function disableBasemapLabels(map: mapboxgl.Map) {
  const configKeys = [
    "showLabels",
    "showPlaceLabels",
    "showRoadLabels",
    "showPointOfInterestLabels",
    "showTransitLabels",
  ] as const;

  for (const key of configKeys) {
    try {
      map.setConfigProperty("basemap", key, false);
    } catch {
      // Custom styles without a Standard basemap import will throw here.
    }
  }
}

function hideNativeLabelLayers(map: mapboxgl.Map) {
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    if (layer.id.startsWith("debug-")) {
      continue;
    }
    if (layer.type !== "symbol") continue;
    map.setLayoutProperty(layer.id, "visibility", "none");
  }
}

function suppressAllMapText(map: mapboxgl.Map) {
  if (!map.isStyleLoaded()) return;
  disableBasemapLabels(map);
  hideNativeLabelLayers(map);
}

function buildUserLocationGeoJSON(
  position: [number, number],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: position,
        },
        properties: {},
      },
    ],
  };
}

function buildDebugCaptureGeoJSON(
  captures: { label: string; lng: number; lat: number }[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: captures.map((capture) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [capture.lng, capture.lat],
      },
      properties: {
        label: capture.label,
      },
    })),
  };
}

function appendCanvasToneOverlay(map: mapboxgl.Map) {
  const container = map.getCanvasContainer();
  if (container.querySelector(".map-canvas-tone-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "map-canvas-tone-overlay";
  container.appendChild(overlay);
}

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
      className="absolute left-4 z-30 max-w-xs rounded-xl bg-black/90 p-4 font-mono text-xs text-green-400 shadow-2xl backdrop-blur-sm"
      style={{
        top: "max(env(safe-area-inset-top), 16px)",
        maxHeight: "60vh",
        overflowY: "auto",
      }}
    >
      <div className="mb-2 text-sm font-bold text-green-300">
        Debug: Coordinate Capture
      </div>

      {waitingForClick ? (
        <div className="mb-2 rounded bg-yellow-900/50 px-2 py-1 text-yellow-300">
          Click the map to capture: <strong>{currentLabel}</strong>
        </div>
      ) : (
        <div className="mb-2 flex gap-1">
          <input
            type="text"
            value={inputVal}
            onChange={(event) => setInputVal(event.target.value)}
            placeholder="Building name…"
            className="flex-1 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-green-400 placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && inputVal.trim()) {
                onStartCapture(inputVal.trim());
                setInputVal("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (inputVal.trim()) {
                onStartCapture(inputVal.trim());
                setInputVal("");
              }
            }}
            className="rounded bg-green-700 px-2 py-1 text-xs text-white hover:bg-green-600"
          >
            Capture
          </button>
        </div>
      )}

      {captures.length > 0 ? (
        <>
          <div className="mb-1 mt-1 border-t border-gray-700 pt-2 text-gray-400">
            Captured ({captures.length}):
          </div>
          {captures.map((capture, index) => (
            <div key={`${capture.label}-${index}`} className="mb-1">
              <span className="text-white">{capture.label}:</span>{" "}
              [{capture.lng}, {capture.lat}]
            </div>
          ))}
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={onCopyAll}
              className="rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-600"
            >
              Copy JSON
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="rounded bg-red-800 px-2 py-1 text-xs text-white hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </>
      ) : null}

      <div className="mt-2 text-[10px] text-gray-500">?debug=1 in URL to show this panel</div>
    </div>
  );
}

export default function MapView() {
  const {
    unlockedBuildings,
    selectedPoiId,
    panelPoiId,
    setPanelPoiId,
    setSelectedPoiId,
  } = useApp();

  const searchParams = useSearchParams();
  const debugMode = searchParams.get("debug") === "1";

  const mapRef = useRef<MapRef | null>(null);
  const rafRef = useRef<number>(0);
  const walkStartRef = useRef<number>(0);
  const initialContextFocusRef = useRef(false);
  const debugWaitingRef = useRef(false);
  const debugLabelRef = useRef("");

  const [controlSheetOpen, setControlSheetOpen] = useState(false);
  const [controlSheetTab, setControlSheetTab] = useState<
    "search" | "unlocked" | "filters"
  >("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] =
    useState<Record<MapFilterKey, boolean>>(DEFAULT_FILTERS);
  const [mapReady, setMapReady] = useState(false);
  const [playerPos, setPlayerPos] = useState<[number, number]>(WALK_START);
  const [walking, setWalking] = useState(false);
  const [walkDone, setWalkDone] = useState(false);
  const [debugCaptures, setDebugCaptures] = useState<
    { label: string; lng: number; lat: number }[]
  >([]);
  const [debugWaiting, setDebugWaiting] = useState(false);
  const [debugCurrentLabel, setDebugCurrentLabel] = useState("");

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const searchItems = useMemo(
    () =>
      buildMapSearchItems({
        presentations: MAP_POI_PRESENTATIONS,
        unlockedPoiIds: unlockedBuildings,
      }),
    [unlockedBuildings],
  );

  const unlockedSearchItems = useMemo(
    () => searchItems.filter((item) => item.isUnlocked),
    [searchItems],
  );

  const selectedPresentation = selectedPoiId
    ? MAP_POI_PRESENTATION_BY_ID.get(selectedPoiId) ?? null
    : null;

  const selectedMarkerKind = selectedPresentation
    ? MAP_MARKER_BY_POI_ID.get(selectedPresentation.poiId)?.kind ??
      getStableMarkerKind(selectedPresentation)
    : null;

  const selectionPreview = useMemo(() => {
    if (!selectedPresentation || !selectedMarkerKind) {
      return null;
    }

    return buildMapSelectionPreview({
      poi: selectedPresentation,
      markerKind: selectedMarkerKind,
      getPreviewMedia: getMapPreviewMedia,
    });
  }, [selectedMarkerKind, selectedPresentation]);

  const userLocationGeoJSON = useMemo(
    () => buildUserLocationGeoJSON(playerPos),
    [playerPos],
  );

  const debugCaptureGeoJSON = useMemo(
    () => buildDebugCaptureGeoJSON(debugCaptures),
    [debugCaptures],
  );

  const clearActiveSelection = useCallback(() => {
    setPanelPoiId(null);
    setSelectedPoiId(null);
  }, [setPanelPoiId, setSelectedPoiId]);

  const focusPoi = useCallback((poiId: string, minimumZoom = 15.65) => {
    const poi = MAP_POI_PRESENTATION_BY_ID.get(poiId);
    const map = mapRef.current?.getMap();
    if (!poi || !map) return;

    map.easeTo({
      center: poi.coordinates,
      zoom: Math.max(map.getZoom(), minimumZoom),
      duration: 700,
      essential: true,
      padding: MAP_PADDING_RESET,
    });
  }, []);

  const handleSelectPoi = useCallback(
    (
      poiId: string,
      options?: {
        closeSheet?: boolean;
        openPanel?: boolean;
        focus?: boolean;
      },
    ) => {
      if (options?.closeSheet !== false) {
        setControlSheetOpen(false);
      }

      setSelectedPoiId(poiId);
      setPanelPoiId(options?.openPanel ? poiId : null);

      if (options?.focus) {
        focusPoi(poiId);
      }
    },
    [focusPoi, setPanelPoiId, setSelectedPoiId],
  );

  useEffect(() => {
    if (!mapReady || initialContextFocusRef.current) return;
    initialContextFocusRef.current = true;

    const poiId = panelPoiId ?? selectedPoiId;
    if (!poiId) return;

    focusPoi(poiId, panelPoiId ? 16.1 : 15.65);
  }, [focusPoi, mapReady, panelPoiId, selectedPoiId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current.getMap();
    const handleStyleData = () => {
      suppressAllMapText(map);
    };

    suppressAllMapText(map);
    map.on("styledata", handleStyleData);
    return () => {
      map.off("styledata", handleStyleData);
    };
  }, [mapReady]);

  const startWalk = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || walking || walkDone) return;

    setControlSheetOpen(false);
    clearActiveSelection();
    setWalking(true);

    cancelAnimationFrame(rafRef.current);
    walkStartRef.current = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(
        (now - walkStartRef.current) / WALK_DURATION_MS,
        1,
      );
      const eased = easeInOutQuad(progress);
      const position = interpolateRoute(DEMO_WALK_PATH, eased);

      setPlayerPos(position);
      map.easeTo({
        center: position,
        duration: 60,
        easing: (value: number) => value,
      });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setWalking(false);
      setWalkDone(true);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [clearActiveSelection, walkDone, walking]);

  const handleStartCapture = useCallback((label: string) => {
    debugWaitingRef.current = true;
    debugLabelRef.current = label;
    setDebugWaiting(true);
    setDebugCurrentLabel(label);
  }, []);

  const handleClearCaptures = useCallback(() => {
    setDebugCaptures([]);
  }, []);

  const handleCopyAll = useCallback(() => {
    const json = JSON.stringify(
      Object.fromEntries(
        debugCaptures.map((capture) => [
          capture.label,
          { coordinates: [capture.lng, capture.lat] },
        ]),
      ),
      null,
      2,
    );
    navigator.clipboard.writeText(json).catch((error) => {
      console.error("[MapView] Failed to copy debug captures:", error);
    });
  }, [debugCaptures]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (debugWaitingRef.current) {
        const { lng, lat } = event.lngLat;
        const lngRound = Math.round(lng * 1e7) / 1e7;
        const latRound = Math.round(lat * 1e7) / 1e7;
        const label = debugLabelRef.current;

        setDebugCaptures((previous) => [
          ...previous,
          { label, lng: lngRound, lat: latRound },
        ]);

        debugWaitingRef.current = false;
        debugLabelRef.current = "";
        setDebugWaiting(false);
        setDebugCurrentLabel("");
        return;
      }

      const hits = map.queryRenderedFeatures(event.point);
      for (const feature of hits) {
        const name = feature.properties?.name ?? feature.properties?.name_en;
        if (!name) continue;
        const poiId = MAPBOX_NAME_TO_POI_ID.get(canonicalizePoiName(name));
        if (poiId) {
          handleSelectPoi(poiId, { focus: true });
          return;
        }
      }

      clearActiveSelection();
    },
    [clearActiveSelection, handleSelectPoi],
  );

  const openControlSheet = useCallback(
    (tab: "search" | "unlocked" | "filters") => {
      setControlSheetTab(tab);
      setControlSheetOpen(true);
    },
    [],
  );

  return (
    <div className="absolute inset-0">
      <ReactMap
        ref={mapRef}
        attributionControl={false}
        cursor="auto"
        initialViewState={{
          longitude: WALK_START[0],
          latitude: WALK_START[1],
          zoom: MAP_DEFAULT_ZOOM,
          pitch: MAP_DEFAULT_PITCH,
          bearing: MAP_DEFAULT_BEARING,
        }}
        mapStyle={MAP_STYLE_URL}
        mapboxAccessToken={MAPBOX_TOKEN}
        maxZoom={18}
        onClick={handleMapClick}
        onLoad={() => {
          const map = mapRef.current?.getMap();
          if (map) {
            appendCanvasToneOverlay(map);
            suppressAllMapText(map);
          }
          setMapReady(true);
          console.log(
            `[MapView] Map loaded — stable React marker system active (${MAP_MARKERS.length} POIs)`,
          );
        }}
        reuseMaps
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="user-location" type="geojson" data={userLocationGeoJSON}>
          <Layer {...userLocationHaloLayer} />
          <Layer {...userLocationRingLayer} />
          <Layer {...userLocationCoreLayer} />
        </Source>

        <Source id="debug-captures" type="geojson" data={debugCaptureGeoJSON}>
          <Layer {...debugCaptureCircleLayer} />
          <Layer {...debugCaptureLabelLayer} />
        </Source>

        {MAP_MARKERS.map((marker) => (
          <Marker
            key={marker.poiId}
            anchor="center"
            longitude={marker.coordinates[0]}
            latitude={marker.coordinates[1]}
            style={{
              zIndex:
                marker.poiId === selectedPoiId
                  ? 40
                  : marker.kind === "transit"
                    ? 24
                    : marker.kind === "food"
                      ? 20
                      : marker.kind === "event"
                        ? 18
                        : 14,
            }}
          >
            <MapMarkerBadge
              marker={marker}
              isSelected={marker.poiId === selectedPoiId}
              onSelect={(poiId) => handleSelectPoi(poiId)}
            />
          </Marker>
        ))}
      </ReactMap>

      {mapReady ? (
        <>
          {debugMode ? (
            <DebugPanel
              captures={debugCaptures}
              waitingForClick={debugWaiting}
              currentLabel={debugCurrentLabel}
              onStartCapture={handleStartCapture}
              onClearAll={handleClearCaptures}
              onCopyAll={handleCopyAll}
            />
          ) : null}

          <div
            className="absolute inset-x-0 z-20 flex items-start justify-between px-4 pointer-events-none"
            style={{ top: "max(env(safe-area-inset-top), 16px)" }}
          >
            <button
              type="button"
              onClick={() => openControlSheet("filters")}
              className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full bg-[rgba(255,255,255,0.9)] px-4 py-2.5 text-[14px] font-semibold tracking-[-0.02em] text-[#4f2d7f] shadow-[0_18px_34px_rgba(79,45,127,0.12)] ring-1 ring-white/80 backdrop-blur-xl"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4.5 w-4.5"
              >
                <path strokeLinecap="round" d="M4 7h16M7 12h10M10 17h4" />
              </svg>
              <span>Filters</span>
            </button>

            <button
              type="button"
              onClick={() => openControlSheet("search")}
              className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full bg-[rgba(255,255,255,0.9)] px-4 py-2.5 text-[14px] font-semibold tracking-[-0.02em] text-[#2a1f3b] shadow-[0_18px_34px_rgba(79,45,127,0.12)] ring-1 ring-white/80 backdrop-blur-xl"
            >
              <MapIcon name="search" className="h-4.5 w-4.5 text-[#6f48b2]" />
              <span>Search</span>
            </button>
          </div>

          {!controlSheetOpen && selectionPreview && !panelPoiId ? (
            <MapPreviewCard
              preview={selectionPreview}
              onClose={clearActiveSelection}
              onOpenDetails={() => {
                if (selectedPoiId) {
                  setPanelPoiId(selectedPoiId);
                }
              }}
            />
          ) : null}

          {!panelPoiId && !controlSheetOpen ? (
            <button
              type="button"
              onClick={startWalk}
              disabled={walking || walkDone}
              className={[
                "absolute right-4 z-30 flex min-h-11 items-center gap-2 rounded-full border border-white/70 px-4 py-2.5 text-[13px] font-semibold tracking-[-0.02em] shadow-[0_16px_30px_rgba(58,74,100,0.12)] backdrop-blur-xl transition",
                walking
                  ? "cursor-default bg-white/78 text-slate-500"
                  : walkDone
                    ? "cursor-default bg-white/84 text-emerald-600"
                    : "bg-white/88 text-slate-800",
              ].join(" ")}
              style={{ bottom: "calc(env(safe-area-inset-bottom) + 82px)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4.5 w-4.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 4 9.5 8.25l2 2L9 14l2.5 6M9.75 8h4.5" />
              </svg>
              <span>
                {walkDone
                  ? "Arrived at ACEB"
                  : walking
                    ? "Walking..."
                    : "Simulate Walk"}
              </span>
            </button>
          ) : null}

          {controlSheetOpen ? (
            <MapControlSheet
              initialTab={controlSheetTab}
              query={searchQuery}
              searchItems={searchItems}
              unlockedItems={unlockedSearchItems}
              activeFilters={activeFilters}
              onClose={() => setControlSheetOpen(false)}
              onQueryChange={setSearchQuery}
              onSelectPoi={(poiId) => handleSelectPoi(poiId, { focus: true })}
              onToggleFilter={(filterKey) =>
                setActiveFilters((current) => ({
                  ...current,
                  [filterKey]: !current[filterKey],
                }))
              }
            />
          ) : null}

          {panelPoiId ? (
            <BuildingPanel
              poiId={panelPoiId}
              resolver={resolver}
              events={ALL_EVENTS.filter((event) => event.date === DEMO_DATE)}
              allPois={allPois}
              onClose={clearActiveSelection}
            />
          ) : null}
        </>
      ) : null}

      {!MAPBOX_TOKEN.startsWith("pk.eyJ") ? (
        <div className="absolute inset-x-4 top-16 z-20 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Add your Mapbox token to <code>.env.local</code> to see the map.
        </div>
      ) : null}
    </div>
  );
}
