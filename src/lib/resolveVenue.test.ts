/**
 * resolveVenue.test.ts
 *
 * Tests the full resolution chain:
 *   event.venue_id / raw label → venues.json → poi_id → authoritative POI feature
 */

import { createVenueResolver, normalize, VenuesData, PoiFeatureCollection } from "./resolveVenue";

// ─── Stub data ────────────────────────────────────────────────────────────────

const VENUES: VenuesData = {
  venues: [
    {
      id: "ucc", poi_id: "ucc", name: "University Community Centre",
      short_code: "UCC", kind: "building", is_parent: true,
      aliases: ["UCC"], raw_labels: ["University Community Centre", "UCC"],
      search_terms: ["university community centre", "ucc"],
    },
    {
      id: "ucc_56", poi_id: "ucc", parent_name: "University Community Centre",
      name: "UCC 56", display_label: "Room 56, UCC", kind: "subvenue",
      is_parent: false, aliases: ["Room 56, UCC"], raw_labels: ["UCC 56"],
      search_terms: ["ucc 56", "room 56 ucc"], location_hint: "Room 56",
    },
    {
      id: "ucc_atrium", poi_id: "ucc", parent_name: "University Community Centre",
      name: "UCC Atrium", display_label: "UCC Atrium", kind: "subvenue",
      is_parent: false, aliases: ["UCC Main Atrium"], raw_labels: ["UCC Atrium"],
      search_terms: ["ucc atrium"], location_hint: "Main atrium",
    },
    {
      id: "ucc_community_room", poi_id: "ucc", parent_name: "University Community Centre",
      name: "UCC Community Room (269)", display_label: "Community Room 269, UCC",
      kind: "subvenue", is_parent: false,
      aliases: ["Community Room 269", "UCC 269"],
      raw_labels: ["UCC Community Room (269)", "UCC Community Room", "Community Room 269", "UCC 269"],
      search_terms: ["ucc community room", "ucc 269", "community room 269"],
      location_hint: "Room 269, 2nd floor",
    },
    {
      id: "the_spoke", poi_id: "ucc", name: "The Spoke",
      kind: "building", is_parent: true,
      aliases: ["Spoke", "The Spoke & Rim Tavern"],
      raw_labels: ["The Spoke", "Spoke", "The Spoke & Rim Tavern"],
      search_terms: ["the spoke", "spoke"], location_hint: "Main floor, UCC",
    },
    {
      id: "perth", poi_id: "perth", name: "Perth Hall",
      kind: "residence", is_parent: true, aliases: ["Perth"],
      raw_labels: ["Perth Hall", "Perth", "Perth Hall Residence"],
      search_terms: ["perth hall", "perth"],
    },
    {
      id: "perth_fireside", poi_id: "perth", parent_name: "Perth Hall",
      name: "Perth Fireside Lounge", display_label: "Perth Fireside Lounge",
      kind: "subvenue", is_parent: false, aliases: ["Perth Fireside"],
      raw_labels: ["Perth Fireside Lounge", "Perth Fireside"],
      search_terms: ["perth fireside lounge", "perth fireside"],
      location_hint: "Inside Perth Hall",
    },
    {
      id: "perth_cafeteria", poi_id: "perth", parent_name: "Perth Hall",
      name: "Perth Cafeteria", display_label: "Perth Dining Hall",
      kind: "subvenue", is_parent: false,
      aliases: ["Perth Dining Hall", "Perth Dining"],
      raw_labels: ["Perth Cafeteria", "Perth Dining Hall", "Perth Dining"],
      search_terms: ["perth cafeteria", "perth dining hall", "perth dining"],
      location_hint: "Dining hall, ground floor",
    },
    {
      id: "somerville", poi_id: "somerville", name: "Somerville House",
      short_code: "SH", kind: "building", is_parent: true, aliases: ["Somerville"],
      raw_labels: ["Somerville House", "Somerville"],
      search_terms: ["somerville house", "somerville"],
    },
    {
      id: "somerville_great_hall", poi_id: "somerville", parent_name: "Somerville House",
      name: "Great Hall, Somerville House", display_label: "Great Hall",
      kind: "subvenue", is_parent: false,
      aliases: ["Great Hall", "Somerville Great Hall"],
      raw_labels: ["Great Hall, Somerville House", "Great Hall Somerville", "Great Hall"],
      search_terms: ["great hall somerville house", "great hall somerville", "great hall"],
      location_hint: "Great Hall, main floor",
    },
    {
      id: "thames", poi_id: "thames", name: "Thames Hall",
      short_code: "TH", kind: "building", is_parent: true, aliases: ["Thames"],
      raw_labels: ["Thames Hall", "Thames"],
      search_terms: ["thames hall", "thames"],
    },
    {
      id: "thames_atrium", poi_id: "thames", parent_name: "Thames Hall",
      name: "Thames Hall Atrium", display_label: "Thames Hall Atrium",
      kind: "subvenue", is_parent: false, aliases: ["Thames Atrium"],
      raw_labels: ["Thames Hall Atrium", "Thames Atrium"],
      search_terms: ["thames hall atrium", "thames atrium"],
      location_hint: "Atrium, main floor",
    },
    {
      id: "saugeen", poi_id: "saugeen", name: "Saugeen Hall",
      kind: "residence", is_parent: true,
      aliases: ["Saugeen", "Saugeen-Maitland", "Saugeen Maitland Hall", "The Zoo"],
      raw_labels: ["Saugeen", "Saugeen Hall", "Saugeen-Maitland Hall", "Saugeen Maitland Hall"],
      search_terms: ["saugeen hall", "saugeen", "saugeen maitland hall"],
    },
  ],
};

const POIS: PoiFeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", id: "ucc",        geometry: { type: "Point", coordinates: [-81.2762, 43.0088] }, properties: { id: "ucc",        name: "University Community Centre", category: "academic"  } },
    { type: "Feature", id: "perth",      geometry: { type: "Point", coordinates: [-81.2779, 43.0044] }, properties: { id: "perth",      name: "Perth Hall",                  category: "residence" } },
    { type: "Feature", id: "somerville", geometry: { type: "Point", coordinates: [-81.2758, 43.0088] }, properties: { id: "somerville", name: "Somerville House",             category: "academic"  } },
    { type: "Feature", id: "thames",     geometry: { type: "Point", coordinates: [-81.2764, 43.0092] }, properties: { id: "thames",     name: "Thames Hall",                 category: "academic"  } },
    { type: "Feature", id: "saugeen",    geometry: { type: "Point", coordinates: [-81.2852, 43.0128] }, properties: { id: "saugeen",    name: "Saugeen Hall",                category: "residence" } },
  ],
};

// ─── Runner ───────────────────────────────────────────────────────────────────

const resolver = createVenueResolver(VENUES, POIS);

let passed = 0;
let failed = 0;

function assert<T>(label: string, actual: T, expected: T): void {
  if (actual === expected) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    console.error(`       expected: ${JSON.stringify(expected)}`);
    console.error(`       received: ${JSON.stringify(actual)}`);
    failed++;
  }
}

function section(title: string): void {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 55 - title.length))}`);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

section("1. Direct venue_id resolution");
{
  const r = resolver.resolve("ucc_56");
  assert("found",                r.found,        true);
  assert("venueId",              r.venueId,      "ucc_56");
  assert("poiId",                r.poiId,        "ucc");
  assert("displayLabel",         r.displayLabel, "Room 56, UCC");
  assert("locationHint",         r.locationHint, "Room 56");
  assert("isSubvenue",           r.isSubvenue,   true);
  assert("has poi",              !!r.poi,        true);
  assert("poi name",             r.poi!.properties.name, "University Community Centre");
  assert("coordinates lng",      r.coordinates![0], -81.2762);
  assert("fallbackReason null",  r.fallbackReason, null);
}

section("2. Raw label: 'UCC 56' (normalizes same as id)");
{
  const r = resolver.resolve("UCC 56");
  assert("found",                      r.found,   true);
  assert("venueId",                    r.venueId, "ucc_56");
  assert("poiId",                      r.poiId,   "ucc");
  assert("fallbackReason null (same normalize)", r.fallbackReason, null);
}

section("3. UCC Atrium (raw label, mixed case)");
{
  const r = resolver.resolve("UCC Atrium");
  assert("found",        r.found,        true);
  assert("venueId",      r.venueId,      "ucc_atrium");
  assert("poiId",        r.poiId,        "ucc");
  assert("locationHint", r.locationHint, "Main atrium");
  assert("displayLabel", r.displayLabel, "UCC Atrium");
}

section("4. Perth Fireside Lounge -> Perth Hall");
{
  const r = resolver.resolve("Perth Fireside Lounge");
  assert("found",        r.found,        true);
  assert("venueId",      r.venueId,      "perth_fireside");
  assert("poiId",        r.poiId,        "perth");
  assert("locationHint", r.locationHint, "Inside Perth Hall");
  assert("isSubvenue",   r.isSubvenue,   true);
  assert("poi name",     r.poi!.properties.name, "Perth Hall");
  assert("coordinates lat", r.coordinates![1], 43.0044);
}

section("5. Alias: 'Perth Fireside'");
{
  const r = resolver.resolve("Perth Fireside");
  assert("found",   r.found,   true);
  assert("venueId", r.venueId, "perth_fireside");
  assert("poiId",   r.poiId,   "perth");
}

section("6. Perth Dining Hall alias -> Perth Cafeteria");
{
  const r = resolver.resolve("Perth Dining Hall");
  assert("found",        r.found,        true);
  assert("venueId",      r.venueId,      "perth_cafeteria");
  assert("poiId",        r.poiId,        "perth");
  assert("displayLabel", r.displayLabel, "Perth Dining Hall");
  assert("locationHint", r.locationHint, "Dining hall, ground floor");
}

section("7. Great Hall, Somerville House -> Somerville House");
{
  const r = resolver.resolve("Great Hall, Somerville House");
  assert("found",        r.found,        true);
  assert("venueId",      r.venueId,      "somerville_great_hall");
  assert("poiId",        r.poiId,        "somerville");
  assert("displayLabel", r.displayLabel, "Great Hall");
  assert("locationHint", r.locationHint, "Great Hall, main floor");
  assert("poi name",     r.poi!.properties.name, "Somerville House");
}

section("8. Thames Hall Atrium -> Thames Hall");
{
  const r = resolver.resolve("Thames Hall Atrium");
  assert("found",        r.found,        true);
  assert("venueId",      r.venueId,      "thames_atrium");
  assert("poiId",        r.poiId,        "thames");
  assert("locationHint", r.locationHint, "Atrium, main floor");
}

section("9. The Spoke -> UCC pin");
{
  const r = resolver.resolve("The Spoke");
  assert("found",          r.found,   true);
  assert("venueId",        r.venueId, "the_spoke");
  assert("poiId -> ucc",   r.poiId,   "ucc");
  assert("poi name",       r.poi!.properties.name, "University Community Centre");
  assert("locationHint",   r.locationHint, "Main floor, UCC");
}

section("10. Alias: 'Spoke'");
{
  const r = resolver.resolve("Spoke");
  assert("found",  r.found,  true);
  assert("poiId",  r.poiId,  "ucc");
}

section("11. UCC Community Room (269) with punctuation");
{
  const r = resolver.resolve("UCC Community Room (269)");
  assert("found",        r.found,        true);
  assert("venueId",      r.venueId,      "ucc_community_room");
  assert("displayLabel", r.displayLabel, "Community Room 269, UCC");
  assert("locationHint", r.locationHint, "Room 269, 2nd floor");
}

section("12. Short alias: 'UCC 269'");
{
  const r = resolver.resolve("UCC 269");
  assert("found",   r.found,   true);
  assert("venueId", r.venueId, "ucc_community_room");
}

section("13. Saugeen alias: 'Saugeen-Maitland Hall'");
{
  const r = resolver.resolve("Saugeen-Maitland Hall");
  assert("found",   r.found,   true);
  assert("venueId", r.venueId, "saugeen");
  assert("poiId",   r.poiId,   "saugeen");
}

section("14. Normalization: extra spaces + mixed case");
{
  const r = resolver.resolve("  THAMES   HALL  ATRIUM  ");
  assert("found",   r.found,   true);
  assert("venueId", r.venueId, "thames_atrium");
}

section("15. No match -> graceful fallback");
{
  const r = resolver.resolve("Some Unknown Room");
  assert("found",              r.found,         false);
  assert("venueId null",       r.venueId,       null);
  assert("poi null",           r.poi,           null);
  assert("coordinates null",   r.coordinates,   null);
  assert("displayLabel = raw", r.displayLabel,  "Some Unknown Room");
  assert("fallbackReason set", typeof r.fallbackReason === "string", true);
}

section("16. normalize() helper");
{
  assert("strips punctuation",    normalize("UCC (269)"),        "ucc 269");
  assert("collapses whitespace",  normalize("Perth  Fireside"),  "perth fireside");
  assert("lowercases",            normalize("THAMES HALL"),      "thames hall");
  assert("strips underscores",    normalize("ucc_56"),           "ucc 56");
}

section("17. Return shape completeness");
{
  const r = resolver.resolve("Perth Fireside Lounge");
  const keys: (keyof typeof r)[] = [
    "found", "venueId", "poiId", "displayLabel",
    "locationHint", "isSubvenue", "isOutdoor",
    "venue", "poi", "coordinates", "fallbackReason",
  ];
  for (const key of keys) {
    assert(`has key: ${key}`, key in r, true);
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(60)}`);
console.log(`  ${passed} passed   ${failed} failed   ${passed + failed} total`);
console.log(`${"═".repeat(60)}\n`);

if (failed > 0) process.exit(1);
