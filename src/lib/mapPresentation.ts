import type { OWeekEvent } from "@/components/BuildingPanel";
import { SCIENCE_FEATURED_EVENT } from "@/data/featuredEventExperience";
import { SHUTTLE_PICKUP_POI_ID } from "@/data/shuttle";
import { CATEGORY_LABELS, DEMO_DATE, type PoiCategoryKey } from "@/lib/config";
import type { CampusPoi } from "@/lib/pois";
import type { VenueResolver } from "@/lib/resolveVenue";
import type { MapPreviewMedia } from "@/lib/mapPreviewMedia";

export type MapFilterKey = "events" | "buildings" | "food" | "transit";
export type MapMarkerKind = "building" | "event" | "food" | "transit";

export interface MapPoiPresentation {
  poiId: string;
  name: string;
  shortCode: string | null;
  category: PoiCategoryKey;
  coordinates: [number, number];
  description: string | null;
  eventCount: number;
  primaryEvent: OWeekEvent | null;
  primaryEventHint: string | null;
  foodVenueLabel: string | null;
  foodLocationHint: string | null;
  hasTransitStop: boolean;
  transitLabel: string | null;
}

export interface MapMarkerPresentation {
  poiId: string;
  kind: MapMarkerKind;
  label: string;
  coordinates: [number, number];
  shortCode: string | null;
}

export interface MapSelectionPreview {
  poiId: string;
  markerKind: MapMarkerKind;
  eyebrow: string;
  title: string;
  locationLabel: string;
  statusText: string;
  summary: string | null;
  thumbnail: MapPreviewMedia | null;
  ctaLabel: string;
  eventId: string | null;
}

export interface MapSearchItem {
  poiId: string;
  name: string;
  shortCode: string | null;
  kind: MapMarkerKind;
  supportingText: string;
  isUnlocked: boolean;
}

const FOOD_VENUE_IDS = [
  "the_wave",
  "elgin_cafeteria",
  "essex_cafeteria",
  "perth_cafeteria",
  "saugeen_dining",
] as const;

const MARKER_PRIORITY: Record<MapMarkerKind, number> = {
  transit: 4,
  food: 3,
  event: 2,
  building: 1,
};

const FILTER_TO_MARKER_KIND: Record<MapFilterKey, MapMarkerKind> = {
  events: "event",
  buildings: "building",
  food: "food",
  transit: "transit",
};

const DEFAULT_TRANSIT_LABEL = "Night shuttle pickup";

export const MAP_PREVIEW_BASELINE_MINUTES = 10 * 60 + 30;

export function timeLabelToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeLabel(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
}

function trimSummary(value: string | null | undefined, maxLength = 84): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function compareEvents(a: OWeekEvent, b: OWeekEvent): number {
  return timeLabelToMinutes(a.start_time) - timeLabelToMinutes(b.start_time);
}

function pickPrimaryEvent(events: OWeekEvent[]): OWeekEvent | null {
  if (events.length === 0) return null;

  const sorted = [...events].sort(compareEvents);
  const liveEvent =
    sorted.find((event) => {
      const start = timeLabelToMinutes(event.start_time);
      const end = timeLabelToMinutes(event.end_time);
      return MAP_PREVIEW_BASELINE_MINUTES >= start && MAP_PREVIEW_BASELINE_MINUTES < end;
    }) ?? null;

  if (liveEvent) return liveEvent;

  const nextEvent =
    sorted.find(
      (event) => timeLabelToMinutes(event.start_time) >= MAP_PREVIEW_BASELINE_MINUTES,
    ) ?? null;

  if (nextEvent) return nextEvent;

  return (
    sorted.find((event) => event.id === SCIENCE_FEATURED_EVENT.id) ??
    null
  );
}

export function getRelativeEventStatusText(
  event: OWeekEvent,
  baselineMinutes = MAP_PREVIEW_BASELINE_MINUTES,
): string {
  const start = timeLabelToMinutes(event.start_time);
  const end = timeLabelToMinutes(event.end_time);

  if (baselineMinutes < start) {
    const diff = start - baselineMinutes;
    if (diff < 60) {
      return `Starts in ${diff} minute${diff === 1 ? "" : "s"}`;
    }

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (mins === 0) {
      return `Starts in ${hours} hour${hours === 1 ? "" : "s"}`;
    }

    return `Starts in ${hours} hr ${mins} min`;
  }

  if (baselineMinutes < end) {
    return "Happening now";
  }

  return `Ended at ${formatTimeLabel(end)}`;
}

export function getPreferredMarkerKind(
  poi: MapPoiPresentation,
  activeFilters: Record<MapFilterKey, boolean>,
): MapMarkerKind | null {
  const kind = getStableMarkerKind(poi);
  const filterKey = getFilterKeyForMarkerKind(kind);
  return activeFilters[filterKey] ? kind : null;
}

export function getStableMarkerKind(poi: MapPoiPresentation): MapMarkerKind {
  const availableKinds: MapMarkerKind[] = ["building"];

  if (poi.hasTransitStop) {
    availableKinds.push("transit");
  }
  if (poi.foodVenueLabel) {
    availableKinds.push("food");
  }
  if (poi.eventCount > 0) {
    availableKinds.push("event");
  }

  return availableKinds.sort((left, right) => MARKER_PRIORITY[right] - MARKER_PRIORITY[left])[0]!;
}

export function createMapPoiPresentations({
  pois,
  events,
  resolver,
}: {
  pois: CampusPoi[];
  events: OWeekEvent[];
  resolver: VenueResolver;
}): MapPoiPresentation[] {
  const byPoiId = new Map<string, MapPoiPresentation>(
    pois.map((poi) => [
      poi.id,
      {
        poiId: poi.id,
        name: poi.name,
        shortCode: poi.shortCode,
        category: poi.category,
        coordinates: poi.coordinates,
        description: poi.description,
        eventCount: 0,
        primaryEvent: null,
        primaryEventHint: null,
        foodVenueLabel: null,
        foodLocationHint: null,
        hasTransitStop: poi.id === SHUTTLE_PICKUP_POI_ID,
        transitLabel: poi.id === SHUTTLE_PICKUP_POI_ID ? DEFAULT_TRANSIT_LABEL : null,
      },
    ]),
  );

  const eventsByPoi = new Map<
    string,
    { event: OWeekEvent; hint: string | null }[]
  >();

  for (const event of events) {
    if (event.date !== DEMO_DATE) continue;
    const resolved = resolver.resolve(event.venue_id);
    if (!resolved.poiId) continue;

    const existing = eventsByPoi.get(resolved.poiId) ?? [];
    existing.push({ event, hint: resolved.locationHint });
    eventsByPoi.set(resolved.poiId, existing);
  }

  for (const [poiId, entries] of eventsByPoi.entries()) {
    const item = byPoiId.get(poiId);
    if (!item) continue;

    const sortedEvents = entries.map((entry) => entry.event).sort(compareEvents);
    const primaryEvent = pickPrimaryEvent(sortedEvents);
    const primaryEntry =
      entries.find((entry) => entry.event.id === primaryEvent?.id) ?? null;

    item.eventCount = sortedEvents.length;
    item.primaryEvent = primaryEvent;
    item.primaryEventHint = primaryEntry?.hint ?? null;
  }

  for (const venueId of FOOD_VENUE_IDS) {
    const resolved = resolver.resolve(venueId);
    if (!resolved.poiId) continue;

    const item = byPoiId.get(resolved.poiId);
    if (!item) continue;

    item.foodVenueLabel = resolved.displayLabel;
    item.foodLocationHint = resolved.locationHint;
  }

  return [...byPoiId.values()];
}

export function getVisibleMapMarkers({
  presentations,
  activeFilters: _activeFilters,
}: {
  presentations: MapPoiPresentation[];
  activeFilters: Record<MapFilterKey, boolean>;
}): MapMarkerPresentation[] {
  void _activeFilters;
  // The mobile map always renders the full stable marker set.
  // Filters only scope supporting UI such as search and unlocked lists.
  return presentations
    .map((poi) => {
      return {
        poiId: poi.poiId,
        kind: getStableMarkerKind(poi),
        label: poi.name,
        coordinates: poi.coordinates,
        shortCode: poi.shortCode,
      };
    })
    .filter((marker): marker is MapMarkerPresentation => Boolean(marker));
}

export function buildMapSearchItems({
  presentations,
  unlockedPoiIds,
}: {
  presentations: MapPoiPresentation[];
  unlockedPoiIds: Set<string>;
}): MapSearchItem[] {
  return [...presentations]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((poi) => {
      const kind = getStableMarkerKind(poi);

      let supportingText = `${CATEGORY_LABELS[poi.category]} location`;
      if (kind === "event" && poi.eventCount > 0) {
        supportingText = `${poi.eventCount} event${poi.eventCount === 1 ? "" : "s"} today`;
      } else if (kind === "food" && poi.foodVenueLabel) {
        supportingText = poi.foodLocationHint
          ? `${poi.foodVenueLabel} · ${poi.foodLocationHint}`
          : poi.foodVenueLabel;
      } else if (kind === "transit") {
        supportingText = poi.transitLabel ?? DEFAULT_TRANSIT_LABEL;
      }

      return {
        poiId: poi.poiId,
        name: poi.name,
        shortCode: poi.shortCode,
        kind,
        supportingText,
        isUnlocked: unlockedPoiIds.has(poi.poiId),
      };
    });
}

export function buildMapSelectionPreview({
  poi,
  markerKind,
  getPreviewMedia,
}: {
  poi: MapPoiPresentation;
  markerKind: MapMarkerKind;
  getPreviewMedia: (poiId: string, eventId?: string | null) => MapPreviewMedia | null;
}): MapSelectionPreview {
  const previewEvent = poi.primaryEvent;
  const thumbnail = getPreviewMedia(poi.poiId, previewEvent?.id ?? null);

  if (previewEvent) {
    return {
      poiId: poi.poiId,
      markerKind,
      eyebrow:
        previewEvent.id === SCIENCE_FEATURED_EVENT.id
          ? "Featured event"
          : "Upcoming event",
      title: previewEvent.title,
      locationLabel: poi.name,
      statusText: getRelativeEventStatusText(previewEvent),
      summary: trimSummary(poi.primaryEventHint, 54),
      thumbnail,
      ctaLabel: "View Details",
      eventId: previewEvent.id,
    };
  }

  const placeEyebrow =
    markerKind === "transit"
      ? "Shuttle & transit"
      : markerKind === "food"
        ? "Food & beverage"
        : `${CATEGORY_LABELS[poi.category]} location`;

  const placeStatus =
    markerKind === "transit"
      ? "Night shuttle pickup during OWeek"
      : markerKind === "food"
        ? poi.foodLocationHint ?? poi.foodVenueLabel ?? "Campus dining highlight"
        : trimSummary(poi.description, 68) ?? "Explore this stop during OWeek";

  const placeSummary =
    markerKind === "food"
      ? trimSummary(poi.description, 72)
      : null;

  return {
    poiId: poi.poiId,
    markerKind,
    eyebrow: placeEyebrow,
    title: poi.name,
    locationLabel:
      markerKind === "food"
        ? poi.foodVenueLabel ?? poi.name
        : poi.category === "outdoor"
          ? "Campus outdoor stop"
          : CATEGORY_LABELS[poi.category],
    statusText: placeStatus,
    summary: placeSummary,
    thumbnail,
    ctaLabel: "View Details",
    eventId: null,
  };
}

export function getFilterMarkerKind(filterKey: MapFilterKey): MapMarkerKind {
  return FILTER_TO_MARKER_KIND[filterKey];
}

function getFilterKeyForMarkerKind(kind: MapMarkerKind): MapFilterKey {
  if (kind === "event") return "events";
  if (kind === "food") return "food";
  if (kind === "transit") return "transit";
  return "buildings";
}
