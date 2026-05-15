import type { OWeekEvent } from "@/components/BuildingPanel";
import type { CampusPoi } from "@/lib/pois";
import type { VenueResolver } from "@/lib/resolveVenue";
import { MAP_PREVIEW_BASELINE_MINUTES, timeLabelToMinutes } from "@/lib/mapPresentation";
import { DEMO_DATE } from "@/lib/config";

export interface NearbyEvent {
  eventTitle: string;
  startTime: string;
  endTime: string;
  venueName: string;
  poiId: string;
  poiName: string;
}

function haversineMetres(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number],
): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isLiveOrSoon(event: OWeekEvent): boolean {
  const start = timeLabelToMinutes(event.start_time);
  const end = timeLabelToMinutes(event.end_time);
  const baseline = MAP_PREVIEW_BASELINE_MINUTES;
  const isLive = baseline >= start && baseline < end;
  const isSoon = baseline < start && start - baseline <= 60;
  return isLive || isSoon;
}

export function getNearbyEvents(
  centerPoiId: string,
  allPois: CampusPoi[],
  events: OWeekEvent[],
  resolver: VenueResolver,
  radiusM = 400,
): NearbyEvent[] {
  const center = allPois.find((p) => p.id === centerPoiId);
  if (!center) return [];

  const nearbyPoiIds = new Set(
    allPois
      .filter(
        (p) =>
          p.id !== centerPoiId &&
          haversineMetres(center.coordinates, p.coordinates) <= radiusM,
      )
      .map((p) => p.id),
  );

  const results: (NearbyEvent & { distance: number; startMinutes: number })[] = [];

  for (const event of events) {
    if (event.date !== DEMO_DATE) continue;
    if (!isLiveOrSoon(event)) continue;

    const resolved = resolver.resolve(event.venue_id);
    if (!resolved.poiId || !nearbyPoiIds.has(resolved.poiId)) continue;

    const poi = allPois.find((p) => p.id === resolved.poiId);
    if (!poi) continue;

    results.push({
      eventTitle: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
      venueName: resolved.locationHint
        ? `${resolved.displayLabel} · ${resolved.locationHint}`
        : resolved.displayLabel,
      poiId: resolved.poiId,
      poiName: poi.name,
      distance: haversineMetres(center.coordinates, poi.coordinates),
      startMinutes: timeLabelToMinutes(event.start_time),
    });
  }

  results.sort((a, b) => a.distance - b.distance || a.startMinutes - b.startMinutes);

  return results.slice(0, 4).map(({ distance: _d, startMinutes: _s, ...rest }) => rest);
}
