"use client";

import type { CSSProperties } from "react";
import { MapIcon } from "@/components/map/mapIcons";
import type { MapMarkerKind, MapMarkerPresentation } from "@/lib/mapPresentation";

interface MarkerPalette {
  fillStart: string;
  fillEnd: string;
  ink: string;
  halo: string;
  shadow: string;
}

const MARKER_PALETTES: Record<MapMarkerKind | "selected", MarkerPalette> = {
  building: {
    fillStart: "#f3ebff",
    fillEnd: "#d6bef9",
    ink: "#6d43b4",
    halo: "rgba(144, 103, 214, 0.22)",
    shadow: "0 10px 22px rgba(83, 56, 134, 0.2)",
  },
  event: {
    fillStart: "#efe2ff",
    fillEnd: "#c39ff8",
    ink: "#6b38b3",
    halo: "rgba(130, 87, 209, 0.24)",
    shadow: "0 10px 24px rgba(97, 55, 167, 0.22)",
  },
  food: {
    fillStart: "#fff0bf",
    fillEnd: "#f0c86a",
    ink: "#a56b00",
    halo: "rgba(227, 182, 82, 0.22)",
    shadow: "0 10px 24px rgba(182, 129, 13, 0.2)",
  },
  transit: {
    fillStart: "#e1eeff",
    fillEnd: "#b6d0ff",
    ink: "#4c70b7",
    halo: "rgba(103, 144, 224, 0.22)",
    shadow: "0 10px 24px rgba(72, 105, 173, 0.2)",
  },
  selected: {
    fillStart: "#8d55e5",
    fillEnd: "#5d2da6",
    ink: "#ffffff",
    halo: "rgba(126, 73, 214, 0.34)",
    shadow: "0 14px 30px rgba(79, 45, 127, 0.3)",
  },
};

function getMarkerZIndex(kind: MapMarkerKind): number {
  if (kind === "transit") return 24;
  if (kind === "food") return 20;
  if (kind === "event") return 18;
  return 14;
}

export default function MapMarkerBadge({
  marker,
  isSelected,
  onSelect,
  demoArrived = false,
}: {
  marker: MapMarkerPresentation;
  isSelected: boolean;
  onSelect: (poiId: string) => void;
  /** When true, render the demo-only "ACEB" label and post-walk pulse. */
  demoArrived?: boolean;
}) {
  const palette = isSelected
    ? MARKER_PALETTES.selected
    : MARKER_PALETTES[marker.kind];

  const style = {
    "--marker-fill-start": palette.fillStart,
    "--marker-fill-end": palette.fillEnd,
    "--marker-ink": palette.ink,
    "--marker-halo": palette.halo,
    "--marker-shadow": palette.shadow,
    zIndex: demoArrived ? 41 : isSelected ? 40 : getMarkerZIndex(marker.kind),
  } as CSSProperties;

  return (
    <button
      type="button"
      aria-label={`${isSelected ? "Selected " : ""}${marker.kind} marker for ${marker.label}`}
      data-demo-poi={marker.poiId}
      data-demo-arrived={demoArrived ? "true" : undefined}
      className={`map-marker${isSelected ? " is-selected" : ""}${
        demoArrived ? " demo-arrived" : ""
      }`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(marker.poiId);
      }}
      style={style}
    >
      <span className="map-marker__halo" aria-hidden="true" />
      <span className="map-marker__shadow" aria-hidden="true" />
      <span className="map-marker__badge" aria-hidden="true">
        <span className="map-marker__icon">
          <MapIcon name={marker.kind} className="h-[18px] w-[18px]" />
        </span>
      </span>
      {demoArrived ? (
        <span className="map-marker__demo-label" aria-hidden="true">
          {marker.poiId === "aceb" ? "ACEB" : marker.label}
        </span>
      ) : null}
    </button>
  );
}
