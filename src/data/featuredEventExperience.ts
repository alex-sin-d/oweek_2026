import type { StaticImageData } from "next/image";
import type { OWeekEvent } from "@/components/EventCard";
import sciWelcomeImage from "@/design/images/sci_welcome.png";

export interface FeaturedEventExperienceData {
  badge: string;
  startsIn: string;
  timeLabel: string;
  locationLabel: string;
  facultyTag: string;
  heroImage: StaticImageData;
  recapImage: StaticImageData;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  savedActionLabel: string;
  mapHelperText: string;
  description: string;
  whatToKnowTitle: string;
  whatToKnow: string[];
  recapEyebrow: string;
  recapTitle: string;
  recapCaption: string;
}

export const SCIENCE_FEATURED_EVENT: OWeekEvent = {
  id: "2026-09-08_science_home_base_major_meetup",
  title: "Science Home Base + Major Meetup",
  venue_id: "nat_sci_building",
  raw_location_label: "Natural Sciences Centre",
  date: "2026-09-08",
  day_label: "Tuesday",
  start_time: "11:00",
  end_time: "12:30",
  audience_tags: ["SCI"],
};

export const SCIENCE_FEATURED_EXPERIENCE: FeaturedEventExperienceData = {
  badge: "ABOUT TO HAPPEN",
  startsIn: "Starts in 30 minutes",
  timeLabel: "Tuesday, 11:00 AM – 12:30 PM",
  locationLabel: "Natural Sciences Centre",
  facultyTag: "SCI",
  heroImage: sciWelcomeImage,
  recapImage: sciWelcomeImage,
  primaryActionLabel: "Open in Map",
  secondaryActionLabel: "Add to Schedule",
  savedActionLabel: "Added to Schedule",
  mapHelperText: "Find us in the Natural Sciences Centre, Main Lobby",
  description:
    "Join us for your dedicated OWeek Science Home Base! Get to know your future classmates, meet with key faculty advisors for your major (Biology, Chemistry, Physics, and more), and discover all the support resources and student clubs waiting for you. It’s the perfect start to your academic journey at Western. Coffee and snacks provided!",
  whatToKnowTitle: "What to Know",
  whatToKnow: [
    "Bring your OWeek wristband and student ID",
    "Check the app for minor schedule changes",
    "Find the check-in table near the main entrance",
  ],
  recapEyebrow: "FROM LAST YEAR",
  recapTitle: "From last year",
  recapCaption: "Students enjoying the major breakout sessions",
};
