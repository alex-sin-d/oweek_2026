#!/usr/bin/env node
/**
 * geocode-pois.mjs
 *
 * Legacy helper that fetches OSM centroids and updates src/data/pois.json.
 * The app runtime now uses src/data/pois.merged-from-manual-captures.json
 * as the authoritative POI dataset for map placement.
 *
 * Run: node scripts/geocode-pois.mjs
 *
 * Keep this script for reference data generation only. Do not treat the
 * output file as the source of truth for the app's coordinates.
 *
 * For POIs that don't have OSM building footprints (outdoor areas,
 * rooms inside other buildings), fallback coordinates are defined
 * inline with clear documentation of why.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFERENCE_POIS_PATH = join(__dirname, "..", "src", "data", "pois.json");

// ─── OSM Overpass query ──────────────────────────────────────────────────────

async function queryOverpass(q) {
  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(q),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Overpass returned non-JSON:", text.substring(0, 200));
    return { elements: [] };
  }
}

// ─── POI → OSM mapping ──────────────────────────────────────────────────────
// Each entry: { osmQuery: Overpass name filter, fallback?: [lng,lat], fallbackReason?: string }

const POI_OSM_MAP = {
  // Residences
  bayfield:  { osmName: "Bayfield Hall" },
  clare:     { osmName: null, fallback: [-81.2766, 43.0048], fallbackReason: "No OSM building footprint. Address-geocoded: 1274 Western Road." },
  delaware:  { osmName: "Delaware Hall" },
  elgin:     { osmName: "Elgin Hall" },
  essex:     { osmName: "Essex Hall" },
  lambton:   { osmName: "Lambton Hall" },
  medsyd:    { osmName: "Sydenham Hall" },  // OSM has separate Medway/Sydenham; Sydenham is the main building
  ontario:   { osmName: "Ontario Hall" },
  perth:     { osmName: "Perth Hall" },
  saugeen:   { osmName: "Saugeen Maitland Hall" },

  // Academic
  aceb:       { osmName: "Amit Chakma Engineering Building" },
  health_sci: { osmName: "Health Sciences Building" },
  mckellar:   { osmName: null, fallback: [-81.2706, 43.0074], fallbackReason: "McKellar Theatre is inside Talbot College. Using Talbot's centroid." },
  schmeichel: { osmName: "Ronald D. Schmeichel Building" },
  somerville: { osmName: "Somerville House" },
  talbot:     { osmName: "Talbot College" },
  thames:     { osmName: "Thames Hall" },
  ucc:        { osmName: "University Community Center" },  // Note: OSM spells it "Center"

  // Athletics
  rec_centre:     { osmName: "Western Student Recreation Centre" },
  alumni_stadium: { osmName: "Western Alumni Stadium" },

  // Outdoor
  concrete_beach: { osmName: "Concrete Beach", fallback: [-81.2754, 43.0085], fallbackReason: "Outdoor plaza. Coordinate from Mapbox tile feature query." },
  huron_quad:     { osmName: "Huron University College" },  // Quad is at the college
  uc_hill:        { osmName: null, fallback: [-81.2741, 43.0080], fallbackReason: "UC Hill is an unnamed grassy area. Positioned between University College and Somerville House." },

  // Affiliated
  kings: { osmName: null, fallback: [-81.2570, 43.0116], fallbackReason: "King's University College. OSM amenity node at [-81.2570, 43.0116]." },
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching building coordinates from OpenStreetMap...\n");

  // Build a single Overpass query for all named buildings in the campus area
  const overpassQuery = `[out:json][timeout:30];
(
  way["building"]["name"](42.99,-81.30,43.02,-81.25);
  relation["building"]["name"](42.99,-81.30,43.02,-81.25);
  way["leisure"]["name"](42.99,-81.30,43.02,-81.25);
  way["amenity"]["name"](42.99,-81.30,43.02,-81.25);
);
out center;`;

  const data = await queryOverpass(overpassQuery);
  const osmElements = data.elements || [];

  // Build name → centroid index from OSM
  const osmIndex = new Map();
  for (const el of osmElements) {
    const name = el.tags?.name;
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    if (name && lat && lon) {
      osmIndex.set(name, [lon, lat]);
      // Also index without " (Residence)" suffix
      if (name.endsWith(" (Residence)")) {
        osmIndex.set(name.replace(" (Residence)", ""), [lon, lat]);
      }
    }
  }

  console.log(`OSM returned ${osmElements.length} named features.\n`);

  // Resolve each POI
  const resolved = {};
  let fromOsm = 0;
  let fromFallback = 0;

  for (const [poiId, config] of Object.entries(POI_OSM_MAP)) {
    if (config.osmName) {
      // Try exact match, then fuzzy substring
      let coords = osmIndex.get(config.osmName);
      if (!coords) {
        // Try with "(Residence)" suffix
        coords = osmIndex.get(config.osmName + " (Residence)");
      }
      if (!coords) {
        // Fuzzy: find first OSM name containing our target
        for (const [name, c] of osmIndex) {
          if (name.includes(config.osmName)) {
            coords = c;
            break;
          }
        }
      }

      if (coords) {
        resolved[poiId] = { coords, source: "osm", osmName: config.osmName };
        fromOsm++;
      } else if (config.fallback) {
        resolved[poiId] = { coords: config.fallback, source: "fallback", reason: config.fallbackReason };
        fromFallback++;
      } else {
        console.warn(`  WARNING: ${poiId} (${config.osmName}) — not found in OSM and no fallback defined!`);
      }
    } else {
      // Explicit fallback
      resolved[poiId] = { coords: config.fallback, source: "fallback", reason: config.fallbackReason };
      fromFallback++;
    }
  }

  console.log(`Resolved: ${fromOsm} from OSM, ${fromFallback} from fallback\n`);

  // Update the legacy OSM reference snapshot.
  const pois = JSON.parse(readFileSync(REFERENCE_POIS_PATH, "utf-8"));

  for (const feature of pois.features) {
    const id = feature.properties.id;
    const res = resolved[id];
    if (res) {
      const [lng, lat] = res.coords;
      const old = feature.geometry.coordinates;
      const changed = old[0] !== lng || old[1] !== lat;
      feature.geometry.coordinates = [
        Math.round(lng * 1e7) / 1e7,
        Math.round(lat * 1e7) / 1e7,
      ];
      if (changed) {
        console.log(
          `  ${id.padEnd(18)} ${res.source.padEnd(9)} [${feature.geometry.coordinates}]` +
            (res.reason ? `  (${res.reason})` : "")
        );
      }
    }
  }

  writeFileSync(REFERENCE_POIS_PATH, JSON.stringify(pois, null, 2) + "\n");
  console.log(`\nWrote legacy reference snapshot ${REFERENCE_POIS_PATH}`);
}

main().catch(console.error);
