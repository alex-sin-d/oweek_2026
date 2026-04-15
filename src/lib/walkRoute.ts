/**
 * walkRoute.ts
 *
 * Simulated walk route for the OWeek demo.
 * Starts at Perth Hall, winds through southern campus, then north through
 * the central quad, past residences, and up to the northwest.
 *
 * Each waypoint is [lng, lat]. The route interpolation advances at
 * WALK_SPEED_MPS metres/second, ticking every WALK_TICK_MS ms.
 */

import { PERTH_START_COORDS, WALK_SPEED_MPS, WALK_TICK_MS } from "./config";
import { distanceMetres } from "./proximityDetection";
import { getPoiById } from "./pois";

// ─── Waypoints ────────────────────────────────────────────────────────────────
// Route: Perth → Kings → Clare → Ontario → Essex → Talbot/McKellar →
//        RecCentre → Alumni Stadium → UCC/Concrete Beach → Thames →
//        Somerville → Schmeichel → UC Hill → ACEB → MedSyd →
//        Health Sci → Huron Quad → Saugeen → Bayfield → Lambton →
//        Delaware → Elgin

// POI stop coordinates are sourced from the merged manual-capture dataset.
// Intermediate path waypoints remain hand-authored to keep the demo route smooth.
function poiCoordinates(poiId: string): [number, number] {
  const coordinates = getPoiById(poiId)?.geometry.coordinates ?? null;
  if (!coordinates) {
    throw new Error(`Missing POI coordinates for walk route: ${poiId}`);
  }
  return coordinates;
}

export const WALK_WAYPOINTS: [number, number][] = [
  PERTH_START_COORDS,              // Perth Hall
  [-81.2755, 42.9998],             // path east toward Kings
  poiCoordinates("kings"),         // King's University College
  [-81.2700, 43.0040],             // path back north-west
  poiCoordinates("clare"),         // Clare Hall
  [-81.2780, 43.0020],             // path west
  poiCoordinates("ontario"),       // Ontario Hall
  poiCoordinates("essex"),         // Essex Hall
  poiCoordinates("alumni_stadium"),// Alumni Stadium
  poiCoordinates("rec_centre"),    // Rec Centre
  poiCoordinates("talbot"),        // Talbot College / McKellar
  poiCoordinates("thames"),        // Thames Hall
  poiCoordinates("ucc"),           // UCC
  poiCoordinates("concrete_beach"),// Concrete Beach
  poiCoordinates("somerville"),    // Somerville House
  poiCoordinates("schmeichel"),    // Schmeichel
  poiCoordinates("uc_hill"),       // UC Hill
  poiCoordinates("aceb"),          // ACEB
  poiCoordinates("health_sci"),    // Health Sciences
  poiCoordinates("medsyd"),        // MedSyd / Sydenham Hall
  [-81.2700, 43.0085],             // path west
  poiCoordinates("huron_quad"),    // Huron Quad
  poiCoordinates("saugeen"),       // Saugeen
  poiCoordinates("bayfield"),      // Bayfield
  poiCoordinates("lambton"),       // Lambton
  [-81.2730, 43.0110],             // path east
  poiCoordinates("delaware"),      // Delaware
  poiCoordinates("elgin"),         // Elgin
];

// ─── Interpolation ────────────────────────────────────────────────────────────

interface RouteState {
  segmentIndex: number;  // which waypoint pair we're in
  segmentProgress: number; // 0–1 fraction along the current segment
}

/** Compute the position [lng, lat] given the route state */
export function interpolatePosition(state: RouteState): [number, number] {
  const { segmentIndex, segmentProgress } = state;
  if (segmentIndex >= WALK_WAYPOINTS.length - 1) {
    return WALK_WAYPOINTS[WALK_WAYPOINTS.length - 1];
  }
  const [lng1, lat1] = WALK_WAYPOINTS[segmentIndex];
  const [lng2, lat2] = WALK_WAYPOINTS[segmentIndex + 1];
  return [
    lng1 + (lng2 - lng1) * segmentProgress,
    lat1 + (lat2 - lat1) * segmentProgress,
  ];
}

/** Advance the route state by one tick. Returns new state and current position. */
export function advanceRoute(state: RouteState): {
  state: RouteState;
  position: [number, number];
  finished: boolean;
} {
  if (state.segmentIndex >= WALK_WAYPOINTS.length - 1) {
    return {
      state,
      position: WALK_WAYPOINTS[WALK_WAYPOINTS.length - 1],
      finished: true,
    };
  }

  const metersPerTick = WALK_SPEED_MPS * (WALK_TICK_MS / 1000);
  const segStart = WALK_WAYPOINTS[state.segmentIndex];
  const segEnd = WALK_WAYPOINTS[state.segmentIndex + 1];
  const segLenM = distanceMetres(segStart, segEnd);

  // Fraction of this segment covered by one tick
  const tickFraction = segLenM > 0 ? metersPerTick / segLenM : 1;
  let newProgress = state.segmentProgress + tickFraction;
  let newSegIndex = state.segmentIndex;

  // Advance through multiple short segments if tick covers more than one
  while (newProgress >= 1 && newSegIndex < WALK_WAYPOINTS.length - 2) {
    newProgress -= 1;
    newSegIndex++;
    const nextSegLen = distanceMetres(
      WALK_WAYPOINTS[newSegIndex],
      WALK_WAYPOINTS[newSegIndex + 1]
    );
    if (nextSegLen > 0) {
      newProgress = (newProgress * metersPerTick) / nextSegLen;
    }
  }

  const newState: RouteState = {
    segmentIndex: Math.min(newSegIndex, WALK_WAYPOINTS.length - 2),
    segmentProgress: Math.min(newProgress, 1),
  };

  return {
    state: newState,
    position: interpolatePosition(newState),
    finished: newState.segmentIndex >= WALK_WAYPOINTS.length - 2 && newState.segmentProgress >= 1,
  };
}

export const INITIAL_ROUTE_STATE: RouteState = {
  segmentIndex: 0,
  segmentProgress: 0,
};

export type { RouteState };
