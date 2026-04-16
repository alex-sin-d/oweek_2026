/**
 * walkRoute.ts
 *
 * Echoe-style simulated Perth → ACEB walk helpers for the OWeek map.
 * The player starts from a fixed Perth position, stays stationary until the
 * walk is triggered, then follows a smoothed path toward ACEB.
 */

import { PERTH_START_COORDS } from "./config";
import { getPoiById } from "./pois";

export type Coordinate = [number, number];

const DEMO_WALK_PATH_RAW: { lat: number; lng: number }[] = [
  { lat: 43.000142254099956, lng: -81.27676819671778 },
  { lat: 43.00020508029888, lng: -81.27670681822416 },
  { lat: 43.00023646648194, lng: -81.27664512741713 },
  { lat: 43.00033454820061, lng: -81.2766585384621 },
  { lat: 43.0004188983533, lng: -81.27666926729816 },
  { lat: 43.00051109489979, lng: -81.27656197893762 },
  { lat: 43.000624869170366, lng: -81.27654588568332 },
  { lat: 43.00066799209495, lng: -81.27650798831422 },
  { lat: 43.0007405720724, lng: -81.27651067052311 },
  { lat: 43.00090927114718, lng: -81.27652408156807 },
  { lat: 43.00112504835914, lng: -81.2765401748224 },
  { lat: 43.00142909678027, lng: -81.2765911367938 },
  { lat: 43.001684103973986, lng: -81.27660454783876 },
  { lat: 43.00187045471512, lng: -81.27671988282651 },
  { lat: 43.00212926804295, lng: -81.2766948961235 },
  { lat: 43.00223788947062, lng: -81.27636633785717 },
  { lat: 43.002284190400644, lng: -81.27639553865829 },
  { lat: 43.00252350154392, lng: -81.27643040737486 },
  { lat: 43.00380848917831, lng: -81.2765600129167 },
  { lat: 43.003839873520604, lng: -81.27653587303567 },
];

function poiCoordinates(poiId: string): Coordinate {
  const coordinates = getPoiById(poiId)?.geometry.coordinates ?? null;
  if (!coordinates) {
    throw new Error(`Missing POI coordinates for walk route: ${poiId}`);
  }
  return coordinates;
}

export const WALK_START: Coordinate = PERTH_START_COORDS;

export const DEMO_WALK_PATH: Coordinate[] = [
  WALK_START,
  ...DEMO_WALK_PATH_RAW.slice(1).map(({ lng, lat }) => [lng, lat] as Coordinate),
  poiCoordinates("aceb"),
];

function totalRouteLength(route: Coordinate[]) {
  let length = 0;
  for (let index = 1; index < route.length; index += 1) {
    const dx = route[index][0] - route[index - 1][0];
    const dy = route[index][1] - route[index - 1][1];
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

export const DEMO_WALK_TOTAL_LENGTH = totalRouteLength(DEMO_WALK_PATH);
export const WALK_DURATION_MS = Math.min(
  24_000,
  Math.max(8_000, Math.round(DEMO_WALK_TOTAL_LENGTH * 2_000_000)),
);

export function easeInOutQuad(value: number) {
  if (value < 0.5) {
    return 2 * value * value;
  }
  return 1 - Math.pow(-2 * value + 2, 2) / 2;
}

export function interpolateRoute(
  route: Coordinate[],
  progress: number,
): Coordinate {
  const total = totalRouteLength(route);
  if (total <= 0) {
    return route[0] ?? [0, 0];
  }

  let target = progress * total;
  for (let index = 1; index < route.length; index += 1) {
    const dx = route[index][0] - route[index - 1][0];
    const dy = route[index][1] - route[index - 1][1];
    const segment = Math.sqrt(dx * dx + dy * dy);
    if (target <= segment) {
      const ratio = segment > 0 ? target / segment : 0;
      return [
        route[index - 1][0] + dx * ratio,
        route[index - 1][1] + dy * ratio,
      ];
    }
    target -= segment;
  }

  return route[route.length - 1];
}
