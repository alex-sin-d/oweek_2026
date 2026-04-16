import type { OWeekEvent } from "@/components/EventCard";
import { SCIENCE_FEATURED_EVENT } from "@/data/featuredEventExperience";

export type NoticeIconKey = "palette" | "microphone" | null;

export interface NoticeItem {
  id: string;
  source: string;
  category: string;
  title: string;
  subtitle: string;
  timestamp: string;
  unread: boolean;
  pinned: boolean;
  icon: NoticeIconKey;
  actionLabel?: string;
  event?: OWeekEvent;
  location?: string;
  schedule?: string;
  urgency?: string;
}

export const PINNED_NOTICE: NoticeItem = {
  id: "science-home-base-pinned",
  source: "OWeek 2026",
  category: "UP NEXT",
  title: "Science Home Base + Major Meetup",
  subtitle: "Health Sciences Building",
  timestamp: "Now",
  unread: true,
  pinned: true,
  icon: null,
  actionLabel: "View Event",
  event: SCIENCE_FEATURED_EVENT,
  location: "Health Sciences Building",
  schedule: "Tuesday, 11:00 AM – 12:30 PM",
  urgency: "Starts in 30 min.",
};

export const SEEDED_NOTICES: NoticeItem[] = [
  {
    id: "usc-clubs-fair",
    source: "OWeek 2026",
    category: "EVENT",
    title: "USC Clubs Fair starts at 11:30 AM.",
    subtitle: "Concrete Beach.",
    timestamp: "5m ago",
    unread: true,
    pinned: false,
    icon: null,
  },
  {
    id: "paint-the-sciences",
    source: "OWeek 2026",
    category: "SCI",
    title: "Paint the Sciences at 2:00 PM.",
    subtitle: "Renaissance Square. Science event later today.",
    timestamp: "10m ago",
    unread: true,
    pinned: false,
    icon: "palette",
  },
  {
    id: "perth-social",
    source: "OWeek 2026",
    category: "PERTH",
    title: "Perth Social + Free Treats at 7:00 PM.",
    subtitle: "Perth Dining Residence event tonight.",
    timestamp: "1h ago",
    unread: false,
    pinned: false,
    icon: null,
  },
  {
    id: "science-karaoke",
    source: "OWeek 2026",
    category: "SCI TONIGHT",
    title: "Science Karaoke at 10:00 PM.",
    subtitle: "The Late-night science event.",
    timestamp: "2h ago",
    unread: true,
    pinned: false,
    icon: "microphone",
  },
  {
    id: "low-sensory-room",
    source: "OWeek 2026",
    category: "INFO",
    title: "Low Sensory Room open 7:00 PM – 9:00 PM.",
    subtitle: "Health Sciences Building Room 9.",
    timestamp: "3h ago",
    unread: false,
    pinned: false,
    icon: null,
  },
];
