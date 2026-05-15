"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FeaturedEventOverlay, {
  type FeaturedOverlayPhase,
  type RectSnapshot,
} from "@/components/FeaturedEventOverlay";
import HomePassportCard from "@/components/passport/HomePassportCard";
import type { OWeekEvent } from "@/components/EventCard";
import { SCIENCE_FEATURED_EXPERIENCE } from "@/data/featuredEventExperience";
import {
  getHomePassportPreviewItems,
  getPassportProgress,
} from "@/data/passport";
import { useApp } from "@/lib/AppContext";
import { venueResolver as resolver } from "@/lib/venueResolver";
import oweekLogo from "@/design/images/oweek_logo.png";
import nextStopImage from "@/design/images/your_next_stop.png";

const FEATURED_EVENT: OWeekEvent = {
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

const NEXT_STOP_PROMO = {
  overline: "YOUR NEXT STOP",
  title: "The Wave at UCC",
  body:
    "Show your OWeek wristband on the 2nd floor and get a 20% student promotion. Perfect for a burger and milkshake break.",
  cta: "View Offer",
};

type QuickAccessItem = {
  label: string;
  href?: string;
  icon: ReactNode;
};

const QUICK_ACCESS_ITEMS: readonly QuickAccessItem[] = [
  {
    label: "Notices",
    href: "/notices",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    label: "Shuttle",
    href: "/shuttle",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 17h8M8 17l-2 2m2-2V5a2 2 0 012-2h4a2 2 0 012 2v12m0 0l2 2M3 11h18"
        />
      </svg>
    ),
  },
  {
    label: "Safety",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    label: "Wellness",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    label: "OWeek Links",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 11-5.656-5.656l1.5-1.5m7.156-1.5l1.5-1.5a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656 0"
        />
      </svg>
    ),
  },
  {
    label: "FAQs",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
] as const;

const FEATURED_RESOLVED = resolver.resolve(FEATURED_EVENT.venue_id);
const OVERLAY_CLOSE_DURATION_MS = 380;

export default function HomePage() {
  const router = useRouter();
  const {
    profile,
    unlockedBuildings,
    savedEventIds,
    toggleSavedEvent,
    setSelectedPoiId,
    setPanelPoiId,
  } = useApp();
  const cardRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [overlayPhase, setOverlayPhase] = useState<
    FeaturedOverlayPhase | "closed"
  >("closed");
  const [originRect, setOriginRect] = useState<RectSnapshot | null>(null);
  const [cardPressed, setCardPressed] = useState(false);
  const overlayActive = overlayPhase !== "closed";
  const isFeaturedSaved = savedEventIds.has(FEATURED_EVENT.id);
  const passportProgress = useMemo(
    () => getPassportProgress(unlockedBuildings),
    [unlockedBuildings],
  );
  const passportPreviewItems = useMemo(
    () => getHomePassportPreviewItems(unlockedBuildings),
    [unlockedBuildings],
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const openFeaturedDetails = (trigger?: HTMLButtonElement | null) => {
    if (overlayActive) return;

    const nextOrigin = snapshotRect(cardRef.current);
    if (nextOrigin) {
      setOriginRect(nextOrigin);
    }

    lastTriggerRef.current = trigger ?? cardRef.current;
    setCardPressed(false);
    setOverlayPhase("opening");

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        setOverlayPhase("open");
      });
    });
  };

  const closeFeaturedDetails = () => {
    if (overlayPhase === "closed" || overlayPhase === "closing") {
      return;
    }

    const nextOrigin = snapshotRect(cardRef.current);
    if (nextOrigin) {
      setOriginRect(nextOrigin);
    }

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setCardPressed(false);
    setOverlayPhase("closing");
    closeTimerRef.current = window.setTimeout(() => {
      setOverlayPhase("closed");
      closeTimerRef.current = null;
      lastTriggerRef.current?.focus({ preventScroll: true });
    }, OVERLAY_CLOSE_DURATION_MS);
  };

  const handleOpenInMap = () => {
    if (FEATURED_RESOLVED.poiId) {
      setSelectedPoiId(FEATURED_RESOLVED.poiId);
      setPanelPoiId(FEATURED_RESOLVED.poiId);
    }
    router.push("/map");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div
        aria-hidden={overlayActive}
        className={`home-screen-shell ${overlayActive ? "is-dimmed pointer-events-none" : ""}`}
      >
        <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-28 pt-6">
          <header className="mb-5 flex items-start gap-3.5">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-white/86 p-2 shadow-[0_18px_40px_rgba(79,45,127,0.12)] ring-1 ring-white/70 backdrop-blur">
              <Image
                src={oweekLogo}
                alt="OWeek 2026 logo"
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="min-w-0 pt-0.5">
              <p className="text-[15px] font-medium leading-5 text-[#4c4460]">
                Good morning, {profile?.name ?? "Alex"}{" "}
                <span aria-hidden="true">👋</span>
              </p>
              <h1 className="mt-0.5 text-[31px] font-semibold leading-[1.02] tracking-[-0.03em] text-[#1f1830]">
                Welcome to OWeek
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#736a87]">
                Western University OWeek, Day 3
              </p>
            </div>
          </header>

          <section className="mb-6">
            <button
              ref={cardRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={overlayActive}
              aria-label={`View details for ${FEATURED_EVENT.title}`}
              onClick={(event) => openFeaturedDetails(event.currentTarget)}
              onPointerDown={() => setCardPressed(true)}
              onPointerUp={() => setCardPressed(false)}
              onPointerCancel={() => setCardPressed(false)}
              onPointerLeave={() => setCardPressed(false)}
              className={`home-hero-shadow relative block w-full overflow-hidden rounded-[30px] bg-[#23162f] text-left transition-[transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7d47d3]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4eef9] ${
                cardPressed
                  ? "scale-[0.992] shadow-[0_28px_58px_rgba(44,27,65,0.22),0_12px_24px_rgba(44,27,65,0.14)]"
                  : ""
              }`}
            >
              <Image
                src={SCIENCE_FEATURED_EXPERIENCE.heroImage}
                alt={FEATURED_EVENT.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 480px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,20,39,0.12)_0%,rgba(29,20,39,0.36)_36%,rgba(21,16,31,0.86)_100%)]" />
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_68%)]" />

              <div className="relative flex min-h-[300px] flex-col justify-end p-4">
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-[rgba(249,241,255,0.92)] px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#3d2263] shadow-[0_10px_24px_rgba(20,12,29,0.16)]">
                  {SCIENCE_FEATURED_EXPERIENCE.badge}
                </span>

                <h2 className="max-w-[14ch] text-[34px] font-semibold leading-[1.03] tracking-[-0.04em] text-white">
                  {FEATURED_EVENT.title}
                </h2>

                <p className="mt-2 text-[17px] font-semibold text-white/94">
                  {SCIENCE_FEATURED_EXPERIENCE.startsIn}
                </p>

                <div className="mt-3 space-y-1.5 text-[14px] text-white/82">
                  <div className="flex items-center gap-2">
                    <MetaIcon type="time" />
                    <span>{SCIENCE_FEATURED_EXPERIENCE.timeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MetaIcon type="location" />
                    <span>{SCIENCE_FEATURED_EXPERIENCE.locationLabel}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white backdrop-blur">
                    {SCIENCE_FEATURED_EXPERIENCE.facultyTag}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-1 rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_16px_32px_rgba(73,29,127,0.42)]"
                  >
                    View Details
                  </span>
                </div>
              </div>
            </button>
          </section>

          <section className="mb-4">
            <div className="mb-2.5 px-0.5">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.24em] text-[#736b86]">
                Quick Access
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACCESS_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[#e9dff2] bg-[rgba(255,255,255,0.76)] px-2.5 py-2 text-center text-[12px] font-semibold tracking-[-0.02em] text-[#2f2447] shadow-[0_6px_16px_rgba(79,45,127,0.05)] transition-colors hover:border-[#dfd1ed] hover:bg-[rgba(255,255,255,0.92)]"
                >
                  <span className="flex shrink-0 items-center justify-center text-[#6c6086]">
                    {item.icon}
                  </span>
                  <span className="truncate whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <HomePassportCard
            href="/passport"
            collectedCount={passportProgress.collectedCount}
            totalCount={passportProgress.totalCount}
            completionPercent={passportProgress.completionPercent}
            previewItems={passportPreviewItems}
          />

          <SectionHeading title="Your Next Stop" />
          <section className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(167,130,242,0.34),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_22%),linear-gradient(135deg,#2a0f45_0%,#4a2084_46%,#7040b8_100%)] px-[22px] py-6 text-white shadow-[0_28px_56px_rgba(70,31,116,0.26)]">
            <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]" />

            <div className="relative grid grid-cols-[minmax(0,1fr)_142px] items-start gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                  {NEXT_STOP_PROMO.overline}
                </p>

                <h2 className="mt-3 max-w-[9ch] text-[30px] font-semibold leading-[0.97] tracking-[-0.045em] text-white">
                  {NEXT_STOP_PROMO.title}
                </h2>

                <p className="mt-3 max-w-[16ch] text-[14px] leading-[1.45] text-white/90">
                  {NEXT_STOP_PROMO.body}
                </p>

                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border-[1.5px] border-white/82 bg-white/[0.07] px-[18px] py-[11px] text-[15px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_28px_rgba(26,9,48,0.2)] backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
                >
                  {NEXT_STOP_PROMO.cta}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-1 h-[170px] overflow-hidden rounded-[30px] border border-white/18 bg-[#f6efe8] shadow-[0_18px_34px_rgba(21,7,40,0.24)] ring-1 ring-white/10">
                <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_52%)]" />
                <Image
                  src={nextStopImage}
                  alt="Burger and fries offer"
                  fill
                  className="object-cover object-center scale-[1.04]"
                  sizes="142px"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {overlayActive && (
        <FeaturedEventOverlay
          event={FEATURED_EVENT}
          detail={SCIENCE_FEATURED_EXPERIENCE}
          resolved={FEATURED_RESOLVED}
          phase={overlayPhase}
          originRect={originRect}
          isSaved={isFeaturedSaved}
          onClose={closeFeaturedDetails}
          onOpenInMap={handleOpenInMap}
          onToggleSaved={() => toggleSavedEvent(FEATURED_EVENT.id)}
        />
      )}
    </div>
  );
}

function snapshotRect(element: HTMLElement | null): RectSnapshot | null {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-2 px-0.5">
      <h2 className="text-[25px] font-semibold tracking-[-0.03em] text-[#211931]">
        {title}
      </h2>
    </div>
  );
}

function MetaIcon({ type }: { type: "time" | "location" }) {
  if (type === "time") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-[18px] w-[18px] shrink-0 text-white/72"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 7.5v5l3.5 2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-[18px] w-[18px] shrink-0 text-white/72"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}
