import { createVenueResolver } from "@/lib/resolveVenue";
import { authoritativePoiGeoJson } from "@/lib/pois";
import venuesJson from "@/data/venues.json";

export const venueResolver = createVenueResolver(
  venuesJson as Parameters<typeof createVenueResolver>[0],
  authoritativePoiGeoJson,
);
