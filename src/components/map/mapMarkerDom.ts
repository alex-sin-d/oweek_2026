import type { MapMarkerPresentation, MapMarkerKind } from "@/lib/mapPresentation";

interface MarkerPalette {
  fillStart: string;
  fillEnd: string;
  ink: string;
  glow: string;
  shadow: string;
}

const MARKER_PALETTES: Record<MapMarkerKind | "selected", MarkerPalette> = {
  building: {
    fillStart: "#f0e2ff",
    fillEnd: "#ceb3fb",
    ink: "#6f42ba",
    glow: "rgba(141, 99, 214, 0.2)",
    shadow: "0 18px 28px rgba(111, 66, 186, 0.2)",
  },
  event: {
    fillStart: "#eddcfe",
    fillEnd: "#ba98f7",
    ink: "#6939b2",
    glow: "rgba(130, 87, 209, 0.22)",
    shadow: "0 18px 28px rgba(105, 57, 178, 0.22)",
  },
  food: {
    fillStart: "#ffe9b3",
    fillEnd: "#f4bf53",
    ink: "#a16500",
    glow: "rgba(234, 176, 54, 0.2)",
    shadow: "0 18px 28px rgba(186, 135, 23, 0.22)",
  },
  transit: {
    fillStart: "#d9ebff",
    fillEnd: "#a8c6ff",
    ink: "#4467b2",
    glow: "rgba(112, 151, 230, 0.22)",
    shadow: "0 18px 28px rgba(84, 124, 206, 0.2)",
  },
  selected: {
    fillStart: "#8d55e5",
    fillEnd: "#5d2da6",
    ink: "#ffffff",
    glow: "rgba(125, 71, 211, 0.35)",
    shadow: "0 24px 38px rgba(79, 45, 127, 0.3)",
  },
};

export function createMapMarkerElement({
  marker,
  isSelected,
  onSelect,
}: {
  marker: MapMarkerPresentation;
  isSelected: boolean;
  onSelect: (poiId: string) => void;
}): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "map-marker";
  button.innerHTML = `
    <span class="map-marker__glow" aria-hidden="true"></span>
    <span class="map-marker__tail" aria-hidden="true"></span>
    <span class="map-marker__bubble" aria-hidden="true">
      <span class="map-marker__icon" data-map-marker-icon="true"></span>
    </span>
  `;

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(marker.poiId);
  });

  updateMapMarkerElement(button, marker, isSelected);
  return button;
}

export function updateMapMarkerElement(
  element: HTMLElement,
  marker: MapMarkerPresentation,
  isSelected: boolean,
) {
  const palette = isSelected
    ? MARKER_PALETTES.selected
    : MARKER_PALETTES[marker.kind];
  const iconNode = element.querySelector<HTMLElement>("[data-map-marker-icon]");

  element.className = `map-marker${isSelected ? " is-selected" : ""}`;
  element.setAttribute(
    "aria-label",
    `${isSelected ? "Selected " : ""}${marker.kind} marker for ${marker.label}`,
  );
  element.style.setProperty("--marker-fill-start", palette.fillStart);
  element.style.setProperty("--marker-fill-end", palette.fillEnd);
  element.style.setProperty("--marker-ink", palette.ink);
  element.style.setProperty("--marker-glow", palette.glow);
  element.style.setProperty("--marker-shadow", palette.shadow);
  element.style.zIndex = isSelected ? "40" : String(getMarkerZIndex(marker.kind));

  if (iconNode) {
    iconNode.innerHTML = getMarkerIconMarkup(marker.kind);
  }
}

function getMarkerZIndex(kind: MapMarkerKind): number {
  if (kind === "transit") return 24;
  if (kind === "food") return 20;
  if (kind === "event") return 18;
  return 14;
}

function getMarkerIconMarkup(kind: MapMarkerKind): string {
  if (kind === "event") {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95">
        <circle cx="9" cy="9" r="2.3"></circle>
        <circle cx="15.3" cy="9.4" r="2.1"></circle>
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.7 18c.42-2.38 2.37-4.05 4.8-4.05h5c2.43 0 4.38 1.67 4.8 4.05"></path>
      </svg>
    `;
  }

  if (kind === "food") {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" d="M8 4v7M5.5 4v4.5M10.5 4v4.5M8 11v9"></path>
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 4c-1.33 0-2.5 1.33-2.5 3v5h5V7c0-1.67-1.17-3-2.5-3ZM16.5 12v8"></path>
      </svg>
    `;
  }

  if (kind === "transit") {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 17h10M8.25 19.5 7 17m10 2.5L15.75 17M7 8.5h10M8 5h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 20V8.7a1.8 1.8 0 0 1 .92-1.57l5.7-3.2a1.8 1.8 0 0 1 1.76 0l5.7 3.2A1.8 1.8 0 0 1 19.5 8.7V20"></path>
      <path stroke-linecap="round" d="M9 20v-4h6v4M9.25 10.5h.01M14.75 10.5h.01"></path>
    </svg>
  `;
}
