/**
 * Maps a POI id to runtime stamp assets in /public/stamps.
 * When a POI has no designed stamp, callers can fall back to placeholder art.
 */
export interface StampAssetBundle {
  frontImage: string;
  backImage?: string;
  spinGif?: string;
  spinDurationMs?: number;
}

const STAMP_ASSETS: Record<string, StampAssetBundle> = {
  aceb: {
    frontImage: "/stamps/aceb.png",
    backImage: "/stamps/aceb_back.png",
    spinGif: "/stamps/aceb_spin.gif",
    spinDurationMs: 8000,
  },
  alumni_hall: { frontImage: "/stamps/alumni_hall.png" },
  alumni_stadium: { frontImage: "/stamps/alumni_stadium.png" },
  concrete_beach: { frontImage: "/stamps/concrete_beach.png" },
  delaware: { frontImage: "/stamps/delaware.png" },
  education_building: { frontImage: "/stamps/education_building.png" },
  elgin: { frontImage: "/stamps/elgin.png" },
  fims: { frontImage: "/stamps/fims.png" },
  health_sci: { frontImage: "/stamps/health_sci.png" },
  health_sci_fields: { frontImage: "/stamps/health_sci_fields.png" },
  ivey: { frontImage: "/stamps/ivey.png" },
  london: { frontImage: "/stamps/london.png" },
  mcintosh_art: { frontImage: "/stamps/mcintosh_art.png" },
  medsyd: { frontImage: "/stamps/medsyd.png" },
  middlesex: { frontImage: "/stamps/middlesex.png" },
  nat_sci_building: { frontImage: "/stamps/nat_sci_building.png" },
  north_campus: { frontImage: "/stamps/north_campus.png" },
  ontario: { frontImage: "/stamps/ontario.png" },
  perth: { frontImage: "/stamps/perth.png" },
  physics_building: { frontImage: "/stamps/physics_building.png" },
  rec_centre: { frontImage: "/stamps/rec_centre.png" },
  saugeen: { frontImage: "/stamps/saugeen.png" },
  social_science_center: { frontImage: "/stamps/social_science_center.png" },
  somerville: { frontImage: "/stamps/somerville.png" },
  stevenson_hall: { frontImage: "/stamps/stevenson_hall.png" },
  talbot: { frontImage: "/stamps/talbot.png" },
  taylor_libary: { frontImage: "/stamps/taylor_libary.png" },
  thames: { frontImage: "/stamps/thames.png" },
  thompson_eng: { frontImage: "/stamps/thompson_eng.png" },
  ucc: { frontImage: "/stamps/ucc.png" },
  uc_hill: { frontImage: "/stamps/uc_hill.png" },
  university_college: { frontImage: "/stamps/university_college.png" },
  weldon: { frontImage: "/stamps/weldon.png" },
};

export function getStampAssets(poiId: string): StampAssetBundle | null {
  return STAMP_ASSETS[poiId] ?? null;
}

export function getStampImage(poiId: string): string | null {
  return STAMP_ASSETS[poiId]?.frontImage ?? null;
}

export function hasStampImage(poiId: string): boolean {
  return poiId in STAMP_ASSETS;
}
