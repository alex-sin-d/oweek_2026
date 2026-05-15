const POI_DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  london: "London Hall",
  ivey: "Ivey Business School",
  rec_centre: "WSRC",
  taylor_libary: "Taylor Library",
  nat_sci_building: "Natural Sciences Centre",
  social_science_center: "Social Science",
  mcintosh_art: "McIntosh Gallery",
  university_college: "University College",
  health_sci_fields: "Health Sci Fields",
  north_campus: "North Campus",
  middlesex: "Middlesex College",
  thompson_eng: "Thompson Engineering",
  physics_building: "Physics & Astronomy",
  fims: "FIMS & Nursing",
  education_building: "Althouse (FEB)",
  art_n_humanitites: "Arts & Humanities",
  int_and_grad_affairs_building: "Int'l & Grad Affairs",
  medsyd: "Med-Syd",
  weldon: "Weldon Library",
  ucc: "University Community Centre",
  kings: "King's College",
  perth: "Perth Hall",
  ontario: "Ontario Hall",
  essex: "Essex Hall",
  delaware: "Delaware Hall",
  elgin: "Elgin Hall",
  saugeen: "Saugeen Hall",
  stevenson_hall: "Stevenson Hall",
  bayfield: "Bayfield Hall",
  clare: "Clare Hall",
  lambton: "Lambton Hall",
  alumni_hall: "Alumni Hall",
  alumni_stadium: "Alumni Stadium",
  rec_centre_alias: "Recreation Centre",
  health_sci: "Health Sciences",
  concrete_beach: "Concrete Beach",
  uc_hill: "UC Hill",
  huron_quad: "Huron Quad",
  aceb: "Amit Chakma (ACEB)",
  mckellar: "McKellar Theatre",
  schmeichel: "Schmeichel Building",
  somerville: "Somerville House",
  talbot: "Talbot College",
  thames: "Thames Hall",
  medical_science_building: "Medical Science",
  bio_and_geo_scie: "Bio & Geo",
  western_science_centre: "Western Science",
  visual_art_centre: "Visual Arts",
  music_building: "Music Building",
  lawson_hall: "Lawson Hall",
  law_school: "Law School",
  spencer_engineering_building: "Spencer Engineering",
};

const MAP_POPUP_OVERRIDE_POI_IDS = new Set([
  "art_n_humanitites",
  "education_building",
  "int_and_grad_affairs_building",
  "ivey",
  "law_school",
  "middlesex",
  "nat_sci_building",
  "physics_building",
  "taylor_libary",
  "weldon",
]);

export function getPoiDisplayName(poiId: string, fallback: string): string {
  return POI_DISPLAY_NAME_OVERRIDES[poiId] ?? fallback;
}

export function getMapPopupDisplayName(poiId: string, fallback: string): string {
  if (!MAP_POPUP_OVERRIDE_POI_IDS.has(poiId)) {
    return fallback;
  }

  return getPoiDisplayName(poiId, fallback);
}
