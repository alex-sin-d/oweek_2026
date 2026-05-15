import type { OWeekEvent } from "@/components/BuildingPanel";
import {
  buildMapSelectionPreview,
  createMapPoiPresentations,
  getPreferredMarkerKind,
  getStableMarkerKind,
  getRelativeEventStatusText,
  getVisibleMapMarkers,
  type MapPoiPresentation,
} from "@/lib/mapPresentation";
import type { CampusPoi } from "@/lib/pois";
import { createVenueResolver, type PoiFeatureCollection } from "@/lib/resolveVenue";

const POIS: CampusPoi[] = [
  {
    id: "health_sci",
    name: "Health Sciences Building",
    shortCode: "HSB",
    category: "academic",
    coordinates: [-81.275, 43.009],
    description: "Health sciences hub on the north side of campus.",
    capturedName: null,
  },
  {
    id: "ucc",
    name: "University Community Centre",
    shortCode: "UCC",
    category: "academic",
    coordinates: [-81.276, 43.008],
    description: "Student hub with food and services.",
    capturedName: null,
  },
  {
    id: "alumni_hall",
    name: "Alumni Hall",
    shortCode: "AH",
    category: "academic",
    coordinates: [-81.277, 43.007],
    description: "Main event and shuttle pickup point.",
    capturedName: null,
  },
  {
    id: "nat_sci_building",
    name: "Nat Sci building",
    shortCode: null,
    category: "academic",
    coordinates: [-81.274, 43.01],
    description: "Science building with placeholder map copy.",
    capturedName: "Nat Sci building",
  },
  {
    id: "ivey",
    name: "ivey",
    shortCode: null,
    category: "academic",
    coordinates: [-81.277418, 43.004593],
    description: "Business school POI with lowercase captured name.",
    capturedName: "ivey",
  },
];

const EVENTS: OWeekEvent[] = [
  {
    id: "science_home_base",
    title: "Science Home Base + Meetup",
    venue_id: "health_sci",
    raw_location_label: "Health Sciences Building",
    date: "2026-09-08",
    day_label: "Tuesday",
    start_time: "11:00",
    end_time: "12:30",
    audience_tags: ["SCI"],
  },
  {
    id: "ucc_welcome",
    title: "Welcome Lounge",
    venue_id: "ucc",
    raw_location_label: "University Community Centre",
    date: "2026-09-08",
    day_label: "Tuesday",
    start_time: "12:00",
    end_time: "13:00",
    audience_tags: ["ALL"],
  },
];

const VENUES = {
  venues: [
    {
      id: "health_sci",
      poi_id: "health_sci",
      name: "Health Sciences Building",
      kind: "building",
      is_parent: true,
      aliases: [],
      raw_labels: ["Health Sciences Building"],
      search_terms: [],
    },
    {
      id: "ucc",
      poi_id: "ucc",
      name: "University Community Centre",
      kind: "building",
      is_parent: true,
      aliases: ["UCC"],
      raw_labels: ["University Community Centre"],
      search_terms: [],
    },
    {
      id: "the_wave",
      poi_id: "ucc",
      name: "The Wave",
      kind: "subvenue",
      is_parent: false,
      aliases: ["Wave"],
      raw_labels: ["The Wave"],
      search_terms: [],
      location_hint: "2nd floor",
    },
    {
      id: "alumni_hall",
      poi_id: "alumni_hall",
      name: "Alumni Hall",
      kind: "building",
      is_parent: true,
      aliases: [],
      raw_labels: ["Alumni Hall"],
      search_terms: [],
    },
  ],
};

const POI_COLLECTION: PoiFeatureCollection = {
  type: "FeatureCollection",
  features: POIS.map((poi) => ({
    type: "Feature",
    id: poi.id,
    geometry: {
      type: "Point",
      coordinates: poi.coordinates,
    },
    properties: {
      id: poi.id,
      name: poi.name,
      category: poi.category,
      short_code: poi.shortCode ?? undefined,
      description: poi.description ?? undefined,
    },
  })),
};

const resolver = createVenueResolver(VENUES, POI_COLLECTION);
const presentations = createMapPoiPresentations({
  pois: POIS,
  events: EVENTS,
  resolver,
});

let passed = 0;
let failed = 0;

function assert<T>(label: string, actual: T, expected: T): void {
  if (actual === expected) {
    console.log(`  ✓ ${label}`);
    passed += 1;
    return;
  }

  console.error(`  ✗ ${label}`);
  console.error(`    expected: ${JSON.stringify(expected)}`);
  console.error(`    received: ${JSON.stringify(actual)}`);
  failed += 1;
}

function section(title: string) {
  console.log(`\n${title}`);
}

section("relative status");
assert(
  "11:00 event resolves to 30 minute lead",
  getRelativeEventStatusText(EVENTS[0]),
  "Starts in 30 minutes",
);

section("presentation derivation");
const ucc = presentations.find((item) => item.poiId === "ucc") as MapPoiPresentation;
assert("UCC becomes a food stop", ucc.foodVenueLabel, "The Wave");
assert("UCC keeps its event count", ucc.eventCount, 1);
assert("UCC keeps a stable food marker kind", getStableMarkerKind(ucc), "food");

section("stable marker logic");
assert(
  "event filter off hides event-led markers instead of converting them to buildings",
  getPreferredMarkerKind(
    presentations.find((item) => item.poiId === "health_sci") as MapPoiPresentation,
    {
      events: false,
      buildings: true,
      food: true,
      transit: true,
    },
  ),
  null,
);
assert(
  "food filter off hides food-led markers instead of converting them to buildings",
  getPreferredMarkerKind(ucc, {
    events: true,
    buildings: true,
    food: false,
    transit: true,
  }),
  null,
);

section("marker density");
const visibleMarkers = getVisibleMapMarkers({
  presentations,
  activeFilters: {
    events: true,
    buildings: true,
    food: true,
    transit: true,
  },
});
assert("all default markers remain visible", visibleMarkers.length, presentations.length);
assert("health sci stays visible with default filters", visibleMarkers.some((item) => item.poiId === "health_sci"), true);
assert("UCC stays visible with default filters", visibleMarkers.some((item) => item.poiId === "ucc"), true);

const fullyScopedMarkers = getVisibleMapMarkers({
  presentations,
  activeFilters: {
    events: false,
    buildings: false,
    food: false,
    transit: false,
  },
});
assert(
  "map marker rendering ignores filter toggles and stays fixed",
  fullyScopedMarkers.length,
  presentations.length,
);
assert(
  "food-led markers stay rendered even when food scope is off",
  fullyScopedMarkers.some((item) => item.poiId === "ucc"),
  true,
);

section("selection preview");
const preview = buildMapSelectionPreview({
  poi: presentations.find((item) => item.poiId === "health_sci") as MapPoiPresentation,
  markerKind: "event",
  getPreviewMedia: () => null,
});
assert("preview uses event-first title", preview.title, "Science Home Base + Meetup");
assert("preview keeps building location", preview.locationLabel, "Health Sciences Building");

const natSciPreview = buildMapSelectionPreview({
  poi: presentations.find((item) => item.poiId === "nat_sci_building") as MapPoiPresentation,
  markerKind: "building",
  getPreviewMedia: () => null,
});
assert("building preview upgrades rough placeholder names", natSciPreview.title, "Natural Science");

const iveyPreview = buildMapSelectionPreview({
  poi: presentations.find((item) => item.poiId === "ivey") as MapPoiPresentation,
  markerKind: "building",
  getPreviewMedia: () => null,
});
assert("building preview upgrades ivey to the shared formal name", iveyPreview.title, "Ivey Business School");

if (failed > 0) {
  console.error(`\n${failed} assertion${failed === 1 ? "" : "s"} failed`);
  process.exit(1);
}

console.log(`\n${passed} assertions passed`);
