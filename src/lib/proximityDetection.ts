/**
 * proximityDetection.ts
 * Haversine-based distance check — returns metres between two [lng, lat] coords.
 */

const EARTH_RADIUS_M = 6371000;

export function distanceMetres(
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Returns poi_ids of any buildings that enter the radius and haven't been unlocked yet */
export function detectUnlocks(
  userPos: [number, number],
  poiCoords: { poiId: string; coordinates: [number, number] }[],
  alreadyUnlocked: Set<string>,
  radiusM: number
): string[] {
  return poiCoords
    .filter(
      ({ poiId, coordinates }) =>
        !alreadyUnlocked.has(poiId) &&
        distanceMetres(userPos, coordinates) <= radiusM
    )
    .map(({ poiId }) => poiId);
}
