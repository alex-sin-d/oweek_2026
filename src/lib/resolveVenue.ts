/**
 * resolveVenue.ts
 *
 * Resolves an event's venue_id (or raw location string) to:
 *   - the matched venue record
 *   - the parent poi_id
 *   - the matching POI feature from the authoritative POI collection
 *   - the subvenue display label if relevant
 *
 * Fallback chain:
 *   1. Direct id match           ("perth_fireside")
 *   2. Alias match               ("Perth Fireside")
 *   3. raw_label match           ("Perth Fireside Lounge")
 *   4. Normalized string match   ("perth fireside lounge")
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type VenueKind = "building" | "residence" | "landmark" | "subvenue";

export type PoiCategory =
  | "academic"
  | "residence"
  | "athletics"
  | "outdoor"
  | "affiliated"
  | "dining";

export interface Venue {
  id: string;
  poi_id: string;
  name: string;
  kind: VenueKind;
  is_parent: boolean;
  aliases: string[];
  raw_labels: string[];
  search_terms: string[];
  display_label?: string;
  short_code?: string;
  parent_name?: string;
  location_hint?: string;
  is_outdoor?: boolean;
}

export interface VenuesData {
  venues: Venue[];
}

export interface PoiProperties {
  id: string;
  name: string;
  category: PoiCategory;
  short_code?: string | null;
  osm_ref?: string;
  description?: string;
  captured_name?: string;
  coordinate_source?: string;
  _note?: string;
}

export interface PoiGeometry {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface PoiFeature {
  type: "Feature";
  id: string;
  geometry: PoiGeometry;
  properties: PoiProperties;
}

export interface PoiFeatureCollection {
  type: "FeatureCollection";
  features: PoiFeature[];
}

export interface ResolvedVenue {
  /** Whether resolution succeeded */
  found: boolean;
  /** The resolved venue id, or null if unmatched */
  venueId: string | null;
  /** The parent POI id, or null if unmatched */
  poiId: string | null;
  /** Display label for event cards and detail sheets */
  displayLabel: string;
  /** Sub-location hint for the detail panel (e.g. "Room 56") */
  locationHint: string | null;
  /** Whether this venue is a child of a parent POI */
  isSubvenue: boolean;
  /** Whether this venue is outdoors */
  isOutdoor: boolean;
  /** Full venue record, or null if unmatched */
  venue: Venue | null;
  /** Full GeoJSON Feature for the parent POI, or null if unmatched */
  poi: PoiFeature | null;
  /** [lng, lat] for map centering / pin highlighting, or null if unmatched */
  coordinates: [number, number] | null;
  /** Set when matched via alias or raw_label rather than direct id. Null on clean match. */
  fallbackReason: string | null;
}

export interface VenueResolver {
  resolve: (input: string) => ResolvedVenue;
  /** Exposed for debugging only */
  _venueIndex: Map<string, Venue>;
  _poiIndex: Map<string, PoiFeature>;
}

// ─── Normalization ────────────────────────────────────────────────────────────

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ") // strip punctuation
    .replace(/\s+/g, " ")         // collapse whitespace
    .trim();
}

// ─── Index builders ──────────────────────────────────────────────────────────

function buildVenueIndex(venues: Venue[]): Map<string, Venue> {
  const index = new Map<string, Venue>();

  for (const venue of venues) {
    const register = (key: string | undefined | null): void => {
      if (!key) return;
      const k = normalize(String(key));
      if (!index.has(k)) index.set(k, venue); // first match wins
    };

    register(venue.id);
    for (const alias of venue.aliases ?? []) register(alias);
    for (const label of venue.raw_labels ?? []) register(label);
    register(venue.name);
    if (venue.display_label) register(venue.display_label);
    if (venue.short_code) register(venue.short_code);
  }

  return index;
}

function buildPoiIndex(geojson: PoiFeatureCollection): Map<string, PoiFeature> {
  const index = new Map<string, PoiFeature>();
  for (const feature of geojson.features ?? []) {
    index.set(feature.properties.id, feature);
  }
  return index;
}

// ─── Core resolver ────────────────────────────────────────────────────────────

function resolveVenue(
  input: string,
  venueIndex: Map<string, Venue>,
  poiIndex: Map<string, PoiFeature>
): ResolvedVenue {
  const key = normalize(input);
  const venue = venueIndex.get(key);

  if (!venue) {
    return {
      found: false,
      venueId: null,
      poiId: null,
      displayLabel: input,
      locationHint: null,
      isSubvenue: false,
      isOutdoor: false,
      venue: null,
      poi: null,
      coordinates: null,
      fallbackReason: `No venue matched: "${input}"`,
    };
  }

  const poi = poiIndex.get(venue.poi_id) ?? null;
  const coordinates = poi?.geometry?.coordinates ?? null;
  const displayLabel = venue.display_label ?? venue.name;
  const isDirectIdMatch = normalize(input) === normalize(venue.id);

  return {
    found: true,
    venueId: venue.id,
    poiId: venue.poi_id,
    displayLabel,
    locationHint: venue.location_hint ?? null,
    isSubvenue: !venue.is_parent,
    isOutdoor: venue.is_outdoor ?? false,
    venue,
    poi,
    coordinates,
    fallbackReason: isDirectIdMatch
      ? null
      : `Matched via alias/raw_label: "${input}" → "${venue.id}"`,
  };
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Creates a bound resolver from data objects.
 * Call once at app startup, then use resolve() everywhere.
 *
 * @example
 * import venuesData from './venues.json';
 * import poisGeoJson from './pois.merged-from-manual-captures.json';
 *
 * const resolver = createVenueResolver(venuesData, poisGeoJson);
 * const resolved = resolver.resolve(event.venue_id);
 *
 * resolved.displayLabel   // "Room 56, UCC"
 * resolved.locationHint   // "Room 56"
 * resolved.poiId          // "ucc"
 * resolved.coordinates    // [-81.2762, 43.0088]
 */
export function createVenueResolver(
  venuesData: VenuesData,
  poisGeoJson: PoiFeatureCollection
): VenueResolver {
  const venueIndex = buildVenueIndex(venuesData.venues);
  const poiIndex = buildPoiIndex(poisGeoJson);

  return {
    resolve: (input: string): ResolvedVenue =>
      resolveVenue(input, venueIndex, poiIndex),
    _venueIndex: venueIndex,
    _poiIndex: poiIndex,
  };
}
