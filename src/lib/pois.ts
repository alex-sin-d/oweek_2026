import mergedPoisGeoJson from "@/data/pois.merged-from-manual-captures.json";
import { TRACKED_POI_IDS, type PoiCategoryKey } from "@/lib/config";
import type {
  PoiFeature,
  PoiFeatureCollection,
} from "@/lib/resolveVenue";

const LEGACY_POI_ID_ALIASES: Record<string, string> = {
  alumni_staadium: "alumni_stadium",
  huron: "huron_quad",
};

export interface CampusPoi {
  id: string;
  name: string;
  shortCode: string | null;
  category: PoiCategoryKey;
  coordinates: [number, number];
  description: string | null;
  capturedName: string | null;
}

export const authoritativePoiGeoJson =
  mergedPoisGeoJson as unknown as PoiFeatureCollection;

const duplicatePoiIds = authoritativePoiGeoJson.features.reduce<string[]>(
  (duplicates, feature, index, features) => {
    const id = feature.properties.id;
    const firstIndex = features.findIndex(
      (candidate) => candidate.properties.id === id,
    );
    if (firstIndex !== index && !duplicates.includes(id)) {
      duplicates.push(id);
    }
    return duplicates;
  },
  [],
);

if (duplicatePoiIds.length > 0) {
  throw new Error(
    `Duplicate POI ids in authoritative dataset: ${duplicatePoiIds.join(", ")}`,
  );
}

export const authoritativePoiById = new Map<string, PoiFeature>(
  authoritativePoiGeoJson.features.map((feature) => [
    feature.properties.id,
    feature,
  ]),
);

const trackedPoiIdSet = new Set<string>(TRACKED_POI_IDS);

export const missingTrackedPoiIds = TRACKED_POI_IDS.filter(
  (poiId) => !authoritativePoiById.has(poiId),
);

if (missingTrackedPoiIds.length > 0) {
  throw new Error(
    `Tracked POI ids missing from authoritative dataset: ${missingTrackedPoiIds.join(", ")}`,
  );
}

export const authoritativePoiIdsByCategory = authoritativePoiGeoJson.features.reduce<
  Record<PoiCategoryKey, string[]>
>(
  (groups, feature) => {
    const category = feature.properties.category as PoiCategoryKey;
    groups[category].push(feature.properties.id);
    return groups;
  },
  {
    residence: [],
    academic: [],
    athletics: [],
    outdoor: [],
    affiliated: [],
    dining: [],
  },
);

export const trackedPoiGeoJson: PoiFeatureCollection = {
  type: "FeatureCollection",
  features: authoritativePoiGeoJson.features.filter((feature) =>
    trackedPoiIdSet.has(feature.properties.id),
  ),
};

export const trackedPoiById = new Map<string, PoiFeature>(
  trackedPoiGeoJson.features.map((feature) => [feature.properties.id, feature]),
);

function toCampusPoi(feature: PoiFeature): CampusPoi {
  return {
    id: feature.properties.id,
    name: feature.properties.name,
    shortCode: feature.properties.short_code ?? null,
    category: feature.properties.category as PoiCategoryKey,
    coordinates: feature.geometry.coordinates,
    description: feature.properties.description ?? null,
    capturedName: feature.properties.captured_name ?? null,
  };
}

export const allPois = authoritativePoiGeoJson.features.map(toCampusPoi);
export const trackedPois = trackedPoiGeoJson.features.map(toCampusPoi);

export const allPoiCoordinates = allPois.map(({ id, coordinates }) => ({
  poiId: id,
  coordinates,
}));

export const trackedPoiCoordinates = trackedPois.map(({ id, coordinates }) => ({
  poiId: id,
  coordinates,
}));

export function canonicalizePoiId(poiId: string): string {
  return LEGACY_POI_ID_ALIASES[poiId] ?? poiId;
}

export function getPoiById(poiId: string): PoiFeature | null {
  return authoritativePoiById.get(canonicalizePoiId(poiId)) ?? null;
}

export function getTrackedPoiById(poiId: string): PoiFeature | null {
  return trackedPoiById.get(canonicalizePoiId(poiId)) ?? null;
}
