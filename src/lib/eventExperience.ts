import type { OWeekEvent } from "@/components/EventCard";
import type { FeaturedEventExperienceData } from "@/data/featuredEventExperience";
import {
  SCIENCE_FEATURED_EVENT,
  SCIENCE_FEATURED_EXPERIENCE,
} from "@/data/featuredEventExperience";
import getInvolvedImage from "@/design/images/get_involved.jpg";
import sciEventImage from "@/design/images/sci_event.webp";
import {
  DEMO_DATE,
  FACULTY_TAGS,
  RESIDENCE_TAGS,
} from "@/lib/config";
import {
  getRelativeEventStatusText,
  timeLabelToMinutes,
  MAP_PREVIEW_BASELINE_MINUTES,
} from "@/lib/mapPresentation";
import type { ResolvedVenue } from "@/lib/resolveVenue";

export interface EventExperienceResult {
  detail: FeaturedEventExperienceData;
  missingFields: string[];
}

export function buildEventExperience(
  event: OWeekEvent,
  resolved: ResolvedVenue,
): EventExperienceResult {
  if (event.id === SCIENCE_FEATURED_EVENT.id) {
    return {
      detail: SCIENCE_FEATURED_EXPERIENCE,
      missingFields: [],
    };
  }

  const missingFields = [
    "event-specific hero image",
    "event-specific recap image",
    "authored long-form description",
    "authored what-to-know list",
  ];
  const locationLabel = resolved.displayLabel || event.raw_location_label;
  const locationSummary = resolved.locationHint
    ? `${locationLabel} · ${resolved.locationHint}`
    : locationLabel;
  const primaryTag = getPrimaryAudienceTag(event.audience_tags);
  const badge = buildStatusBadge(event);
  const startsIn = buildStatusLine(event);
  const poiDescription = resolved.poi?.properties.description?.trim() ?? null;
  const description =
    poiDescription ??
    `${event.title} is scheduled at ${locationSummary}. Use the map preview below for directions and save it to keep it in My Agenda.`;

  return {
    detail: {
      badge,
      startsIn,
      timeLabel: `${event.day_label}, ${formatTimeRange(event.start_time, event.end_time)}`,
      locationLabel,
      facultyTag: primaryTag,
      heroImage: sciEventImage,
      recapImage: getInvolvedImage,
      primaryActionLabel: "Open in Map",
      secondaryActionLabel: "Add to Schedule",
      savedActionLabel: "Added to Schedule",
      mapHelperText: `Find this event at ${locationSummary}.`,
      description,
      whatToKnowTitle: "What to Know",
      whatToKnow: [
        `Head to ${locationSummary} a few minutes early to get settled.`,
        "Save this event to keep it in My Agenda.",
        "Use Open in Map for turn-by-turn campus context before you go.",
      ],
      recapEyebrow: "AT THIS LOCATION",
      recapTitle: `At ${locationLabel}`,
      recapCaption:
        poiDescription ??
        `${event.title} is one of this stop's OWeek activities.`,
    },
    missingFields,
  };
}

function buildStatusBadge(event: OWeekEvent): string {
  if (event.date > DEMO_DATE) {
    return "UP NEXT";
  }

  if (event.date < DEMO_DATE) {
    return "EARLIER THIS WEEK";
  }

  const status = getRelativeEventStatusText(
    event,
    MAP_PREVIEW_BASELINE_MINUTES,
  );
  if (status === "Happening now") {
    return "HAPPENING NOW";
  }
  if (status.startsWith("Ended")) {
    return "EARLIER TODAY";
  }
  return "UP NEXT";
}

function buildStatusLine(event: OWeekEvent): string {
  if (event.date !== DEMO_DATE) {
    return `${event.day_label} at ${formatTime(event.start_time)}`;
  }

  return getRelativeEventStatusText(event, MAP_PREVIEW_BASELINE_MINUTES);
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

function formatTime(value: string): string {
  const totalMinutes = timeLabelToMinutes(value);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getPrimaryAudienceTag(tags: string[]): string {
  const primaryTag = tags.find((tag) => tag !== "ALL") ?? "ALL";
  if (primaryTag === "ALL") {
    return primaryTag;
  }

  const knownTag =
    FACULTY_TAGS.find((entry) => entry.tag === primaryTag) ??
    RESIDENCE_TAGS.find((entry) => entry.tag === primaryTag);

  return knownTag?.tag ?? primaryTag;
}
