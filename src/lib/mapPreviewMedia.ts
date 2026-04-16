import type { StaticImageData } from "next/image";
import { SCIENCE_FEATURED_EVENT } from "@/data/featuredEventExperience";
import sciWelcomeImage from "@/design/images/sci_welcome.png";

export interface MapPreviewMedia {
  src: StaticImageData;
  alt: string;
}

const MAP_MEDIA_BY_EVENT_ID: Record<string, MapPreviewMedia> = {
  [SCIENCE_FEATURED_EVENT.id]: {
    src: sciWelcomeImage,
    alt: "Students gathered at the Science Home Base + Meetup event",
  },
};

const MAP_MEDIA_BY_POI_ID: Record<string, MapPreviewMedia> = {
  health_sci: {
    src: sciWelcomeImage,
    alt: "Students inside the Health Sciences Building during OWeek",
  },
};

export function getMapPreviewMedia(
  poiId: string,
  eventId?: string | null,
): MapPreviewMedia | null {
  if (eventId && MAP_MEDIA_BY_EVENT_ID[eventId]) {
    return MAP_MEDIA_BY_EVENT_ID[eventId];
  }

  return MAP_MEDIA_BY_POI_ID[poiId] ?? null;
}
