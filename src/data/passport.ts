import {
  CATEGORY_LABELS,
  POI_CATEGORY_ORDER,
  type PoiCategoryKey,
} from "@/lib/config";
import { allPois, type CampusPoi } from "@/lib/pois";

export type PassportCategoryKey = Exclude<PoiCategoryKey, "dining">;

export type PassportTileState = "locked" | "collected" | "new";

export interface PassportStampDefinition {
  poiId: string;
  name: string;
  shortLabel: string;
  category: PassportCategoryKey;
  categoryLabel: string;
}

export interface PassportPreviewItem extends PassportStampDefinition {
  state: PassportTileState;
}

export interface PassportProgressSummary {
  effectiveUnlocked: Set<string>;
  collectedCount: number;
  totalCount: number;
  completionPercent: number;
}

export const PASSPORT_CATEGORY_ORDER = POI_CATEGORY_ORDER.filter(
  (category): category is PassportCategoryKey => category !== "dining",
);

function createShortLabel(name: string, shortCode: string | null): string {
  if (shortCode && shortCode.trim().length > 0) {
    return shortCode.trim().slice(0, 4).toUpperCase();
  }

  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "POI";
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export const PASSPORT_STAMP_DEFINITIONS: PassportStampDefinition[] = allPois
  .filter(
    (poi): poi is CampusPoi & { category: PassportCategoryKey } =>
      poi.category !== "dining",
  )
  .map((poi) => ({
    poiId: poi.id,
    name: poi.name,
    shortLabel: createShortLabel(poi.name, poi.shortCode),
    category: poi.category,
    categoryLabel: CATEGORY_LABELS[poi.category],
  }));

export const PASSPORT_DEFINITION_BY_ID = new Map(
  PASSPORT_STAMP_DEFINITIONS.map((definition) => [definition.poiId, definition]),
);

export const PASSPORT_POI_IDS = PASSPORT_STAMP_DEFINITIONS.map(
  (definition) => definition.poiId,
);

const PASSPORT_POI_ID_SET = new Set(PASSPORT_POI_IDS);

export const PASSPORT_POIS_BY_CATEGORY = PASSPORT_CATEGORY_ORDER.reduce<
  Record<PassportCategoryKey, PassportStampDefinition[]>
>(
  (groups, category) => {
    groups[category] = PASSPORT_STAMP_DEFINITIONS.filter(
      (definition) => definition.category === category,
    );
    return groups;
  },
  {
    residence: [],
    academic: [],
    athletics: [],
    outdoor: [],
    affiliated: [],
  },
);

export const TOTAL_PASSPORT_POIS = PASSPORT_POI_IDS.length;

export const PASSPORT_SEEDED_UNLOCKED_IDS = [
  "university_college",
  "ucc",
  "health_sci",
  "concrete_beach",
  "aceb",
  "somerville",
  "talbot",
  "thames",
  "weldon",
  "lawson_hall",
  "medical_science_building",
  "social_science_center",
  "visual_art_centre",
  "education_building",
  "delaware",
  "elgin",
  "medsyd",
  "ivey",
] as const;

const PASSPORT_SEEDED_UNLOCKED_SET = new Set<string>(PASSPORT_SEEDED_UNLOCKED_IDS);

export const HOME_PASSPORT_PREVIEW_IDS = [
  "university_college",
  "ucc",
  "health_sci",
  "concrete_beach",
  "kings",
  "rec_centre",
  "alumni_stadium",
  "perth",
  "saugeen",
  "western_science_centre",
] as const;

export function getEffectivePassportUnlocked(
  unlockedBuildings: Set<string>,
): Set<string> {
  const effectiveUnlocked = new Set<string>();

  for (const poiId of PASSPORT_SEEDED_UNLOCKED_SET) {
    if (PASSPORT_POI_ID_SET.has(poiId)) {
      effectiveUnlocked.add(poiId);
    }
  }

  for (const poiId of unlockedBuildings) {
    if (PASSPORT_POI_ID_SET.has(poiId)) {
      effectiveUnlocked.add(poiId);
    }
  }

  return effectiveUnlocked;
}

export function getPassportProgress(
  unlockedBuildings: Set<string>,
): PassportProgressSummary {
  const effectiveUnlocked = getEffectivePassportUnlocked(unlockedBuildings);
  const collectedCount = effectiveUnlocked.size;

  return {
    effectiveUnlocked,
    collectedCount,
    totalCount: TOTAL_PASSPORT_POIS,
    completionPercent: Math.round((collectedCount / TOTAL_PASSPORT_POIS) * 100),
  };
}

export function getHomePassportPreviewItems(
  unlockedBuildings: Set<string>,
): PassportPreviewItem[] {
  const effectiveUnlocked = getEffectivePassportUnlocked(unlockedBuildings);

  return HOME_PASSPORT_PREVIEW_IDS.map((poiId) => {
    const definition = PASSPORT_DEFINITION_BY_ID.get(poiId);

    if (!definition) {
      throw new Error(`Missing passport definition for preview POI: ${poiId}`);
    }

    return {
      ...definition,
      state: effectiveUnlocked.has(poiId) ? "collected" : "locked",
    };
  });
}
