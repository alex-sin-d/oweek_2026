import { allPois } from "@/lib/pois";
import {
  PASSPORT_DEFINITION_BY_ID,
  type PassportStampDefinition,
} from "@/data/passport";

export type PassportGroupKey =
  | "landmarks"
  | "residences"
  | "academic"
  | "student_life";

export interface PassportGroup {
  key: PassportGroupKey;
  label: string;
  stamps: PassportStampDefinition[];
}

/**
 * Explicit poi_id → category assignment.
 * Every one of the 51 non-dining POIs must map to exactly one of the 4 groups.
 */
const GROUP_BY_POI: Record<string, PassportGroupKey> = {
  // ── Landmarks (iconic, outdoor, crest/gateway buildings) ────────────────
  concrete_beach: "landmarks",
  uc_hill: "landmarks",
  huron_quad: "landmarks",
  health_sci_fields: "landmarks",
  north_campus: "landmarks",
  alumni_hall: "landmarks",
  university_college: "landmarks",
  middlesex: "landmarks",
  mcintosh_art: "landmarks",
  stevenson_hall: "landmarks",

  // ── Residences ──────────────────────────────────────────────────────────
  bayfield: "residences",
  clare: "residences",
  delaware: "residences",
  elgin: "residences",
  essex: "residences",
  lambton: "residences",
  medsyd: "residences",
  ontario: "residences",
  perth: "residences",
  saugeen: "residences",
  london: "residences",

  // ── Academic ────────────────────────────────────────────────────────────
  aceb: "academic",
  health_sci: "academic",
  mckellar: "academic",
  schmeichel: "academic",
  somerville: "academic",
  talbot: "academic",
  thames: "academic",
  weldon: "academic",
  taylor_libary: "academic",
  social_science_center: "academic",
  medical_science_building: "academic",
  nat_sci_building: "academic",
  bio_and_geo_scie: "academic",
  western_science_centre: "academic",
  visual_art_centre: "academic",
  music_building: "academic",
  art_n_humanitites: "academic",
  int_and_grad_affairs_building: "academic",
  physics_building: "academic",
  lawson_hall: "academic",
  thompson_eng: "academic",
  fims: "academic",
  education_building: "academic",
  law_school: "academic",
  spencer_engineering_building: "academic",
  ivey: "academic",

  // ── Student Life (social, athletic, community hubs, affiliated) ─────────
  ucc: "student_life",
  rec_centre: "student_life",
  alumni_stadium: "student_life",
  kings: "student_life",
};

const GROUP_LABELS: Record<PassportGroupKey, string> = {
  landmarks: "Landmarks",
  residences: "Residences",
  academic: "Academic",
  student_life: "Student Life",
};

export const PASSPORT_GROUP_ORDER: PassportGroupKey[] = [
  "landmarks",
  "residences",
  "academic",
  "student_life",
];

export const PASSPORT_GROUPS: PassportGroup[] = (() => {
  const buckets: Record<PassportGroupKey, PassportStampDefinition[]> = {
    landmarks: [],
    residences: [],
    academic: [],
    student_life: [],
  };

  for (const poi of allPois) {
    if (poi.category === "dining") continue;
    const definition = PASSPORT_DEFINITION_BY_ID.get(poi.id);
    if (!definition) continue;
    const groupKey = GROUP_BY_POI[poi.id] ?? "academic";
    buckets[groupKey].push(definition);
  }

  return PASSPORT_GROUP_ORDER.map((key) => ({
    key,
    label: GROUP_LABELS[key],
    stamps: buckets[key],
  }));
})();

export const NEXT_STAMPS_TO_DISCOVER = [
  { poiId: "london", distance: "300 m" },
  { poiId: "alumni_hall", distance: "450 m" },
  { poiId: "middlesex", distance: "600 m" },
] as const;
