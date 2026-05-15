// ─── Demo Constants ───────────────────────────────────────────────────────────

/** The active demo date. All "today" logic resolves against this. */
export const DEMO_DATE = "2026-09-08"; // Tuesday

/** Human-readable day label for the demo date */
export const DEMO_DAY_LABEL = "Tuesday";

/** Fixed demo player start near Perth Hall [lng, lat], aligned with the Echoe walk origin */
export const PERTH_START_COORDS: [number, number] = [-81.27676819671778, 43.000142254099956];

/** Default camera zoom level on map load — closer-in 3D campus view */
export const MAP_DEFAULT_ZOOM = 16.0;

/** Default camera pitch (tilt) in degrees — matches Echoes 3D view */
export const MAP_DEFAULT_PITCH = 52;

/** Default camera bearing (rotation) in degrees */
export const MAP_DEFAULT_BEARING = 18;

/** Proximity radius in metres — a building unlocks when the user enters this range */
export const PROXIMITY_RADIUS_M = 70;

// ─── OWeek Schedule ───────────────────────────────────────────────────────────

export const OWEEK_DAYS: { date: string; label: string; short: string }[] = [
  { date: "2026-09-07", label: "Monday",    short: "Mon" },
  { date: "2026-09-08", label: "Tuesday",   short: "Tue" },
  { date: "2026-09-09", label: "Wednesday", short: "Wed" },
  { date: "2026-09-10", label: "Thursday",  short: "Thu" },
  { date: "2026-09-11", label: "Friday",    short: "Fri" },
];

// ─── POI Categories ───────────────────────────────────────────────────────────

export const POI_CATEGORY_ORDER = [
  "residence",
  "academic",
  "athletics",
  "outdoor",
  "affiliated",
  "dining",
] as const;

export type PoiCategoryKey = (typeof POI_CATEGORY_ORDER)[number];

/** Core OWeek POIs tracked by the passport/badge demo flows. */
export const TRACKED_POI_CATEGORIES = {
  residence: [
    "bayfield", "clare", "delaware", "elgin", "essex",
    "lambton", "medsyd", "ontario", "perth", "saugeen",
  ],
  academic: [
    "aceb", "health_sci", "mckellar", "schmeichel",
    "somerville", "talbot", "thames", "ucc",
  ],
  athletics: ["rec_centre", "alumni_stadium"],
  outdoor:   ["concrete_beach", "huron_quad", "uc_hill"],
  affiliated: ["kings"],
} as const satisfies Record<
  Exclude<PoiCategoryKey, "dining">,
  readonly string[]
>;

export const TRACKED_POI_IDS = Object.values(TRACKED_POI_CATEGORIES).flat();
export const TOTAL_TRACKED_POIS = TRACKED_POI_IDS.length;

/** Display labels for each category */
export const CATEGORY_LABELS: Record<PoiCategoryKey, string> = {
  residence:  "Residences",
  academic:   "Academic",
  athletics:  "Athletics",
  outdoor:    "Outdoors",
  affiliated: "Affiliated",
  dining:     "Dining",
};

/** Tailwind colour classes per category (bg + text pair) */
export const CATEGORY_COLOURS: Record<PoiCategoryKey, { bg: string; text: string; stamp: string }> = {
  residence:  { bg: "bg-yellow-100",  text: "text-yellow-800",  stamp: "bg-yellow-400"  },
  academic:   { bg: "bg-purple-100",  text: "text-purple-800",  stamp: "bg-purple-500"  },
  athletics:  { bg: "bg-green-100",   text: "text-green-800",   stamp: "bg-green-500"   },
  outdoor:    { bg: "bg-sky-100",     text: "text-sky-800",     stamp: "bg-sky-500"     },
  affiliated: { bg: "bg-orange-100",  text: "text-orange-800",  stamp: "bg-orange-400"  },
  dining:     { bg: "bg-rose-100",    text: "text-rose-800",    stamp: "bg-rose-500"    },
};

// ─── Campus Passport Badges ───────────────────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  /** Returns true when badge is earned given current unlocked poi_ids */
  earned: (unlocked: Set<string>) => boolean;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_steps",
    label: "First Steps",
    description: "Unlock your first building.",
    earned: (u) => u.size >= 1,
  },
  {
    id: "residence_explorer",
    label: "Residence Explorer",
    description: "Unlock all residence buildings.",
    earned: (u) => TRACKED_POI_CATEGORIES.residence.every((id) => u.has(id)),
  },
  {
    id: "scholars_path",
    label: "Scholar's Path",
    description: "Unlock all academic buildings.",
    earned: (u) => TRACKED_POI_CATEGORIES.academic.every((id) => u.has(id)),
  },
  {
    id: "full_circuit",
    label: "Full Circuit",
    description: "Unlock all athletics and outdoor locations.",
    earned: (u) =>
      [...TRACKED_POI_CATEGORIES.athletics, ...TRACKED_POI_CATEGORIES.outdoor].every((id) => u.has(id)),
  },
  {
    id: "campus_complete",
    label: "Campus Complete",
    description: "Unlock all tracked OWeek buildings on campus.",
    earned: (u) =>
      TRACKED_POI_IDS.every((id) => u.has(id)),
  },
];

// ─── Audience Tags ────────────────────────────────────────────────────────────

/** Faculty tags — used for faculty filter in schedule + onboarding */
export const FACULTY_TAGS = [
  { tag: "SCI",   label: "Science" },
  { tag: "ENG",   label: "Engineering" },
  { tag: "SS",    label: "Social Science" },
  { tag: "HELSC", label: "Health Sciences" },
  { tag: "ARTS",  label: "Arts & Humanities" },
  { tag: "FIMS",  label: "Info & Media Studies" },
  { tag: "MUSIC", label: "Music" },
  { tag: "KINGS", label: "King's College" },
  { tag: "HURON", label: "Huron College" },
] as const;

/** Residence tags — used for residence filter in schedule + onboarding */
export const RESIDENCE_TAGS = [
  { tag: "PERTH", label: "Perth Hall",        poiId: "perth"    },
  { tag: "SAUG",  label: "Saugeen-Maitland",  poiId: "saugeen"  },
  { tag: "MDSYD", label: "Med-Syd",           poiId: "medsyd"   },
  { tag: "ELG",   label: "Elgin Hall",        poiId: "elgin"    },
  { tag: "DEL",   label: "Delaware Hall",     poiId: "delaware" },
  { tag: "ESSX",  label: "Essex Hall",        poiId: "essex"    },
  { tag: "LAMB",  label: "Lambton Hall",      poiId: "lambton"  },
  { tag: "BAY",   label: "Bayfield Hall",     poiId: "bayfield" },
  { tag: "OHALL", label: "Ontario Hall",      poiId: "ontario"  },
  { tag: "CLARE", label: "Clare Hall",        poiId: "clare"    },
] as const;

// ─── Residence Discovery Board (static demo data) ────────────────────────────

/**
 * Sample residence progress data for the demo.
 * In production this would be aggregated from real user unlock data per residence.
 */
export const SAMPLE_RESIDENCE_PROGRESS: { label: string; tag: string; poiId: string; discovered: number; total: number }[] = [
  { label: "Saugeen-Maitland", tag: "SAUG",  poiId: "saugeen",  discovered: 19, total: TOTAL_TRACKED_POIS },
  { label: "Perth Hall",       tag: "PERTH", poiId: "perth",    discovered: 17, total: TOTAL_TRACKED_POIS },
  { label: "Med-Syd",          tag: "MDSYD", poiId: "medsyd",   discovered: 16, total: TOTAL_TRACKED_POIS },
  { label: "Delaware Hall",    tag: "DEL",   poiId: "delaware", discovered: 14, total: TOTAL_TRACKED_POIS },
  { label: "Essex Hall",       tag: "ESSX",  poiId: "essex",    discovered: 13, total: TOTAL_TRACKED_POIS },
  { label: "Elgin Hall",       tag: "ELG",   poiId: "elgin",    discovered: 11, total: TOTAL_TRACKED_POIS },
  { label: "Ontario Hall",     tag: "OHALL", poiId: "ontario",  discovered: 10, total: TOTAL_TRACKED_POIS },
  { label: "Lambton Hall",     tag: "LAMB",  poiId: "lambton",  discovered: 9,  total: TOTAL_TRACKED_POIS },
  { label: "Bayfield Hall",    tag: "BAY",   poiId: "bayfield", discovered: 8,  total: TOTAL_TRACKED_POIS },
  { label: "Clare Hall",       tag: "CLARE", poiId: "clare",    discovered: 7,  total: TOTAL_TRACKED_POIS },
];
