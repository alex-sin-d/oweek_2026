"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FeaturedEventOverlay, {
  type FeaturedOverlayPhase,
  type RectSnapshot,
} from "@/components/FeaturedEventOverlay";
import NoticeCard from "@/components/notices/NoticeCard";
import PinnedNoticeCard from "@/components/notices/PinnedNoticeCard";
import SegmentedToggle from "@/components/notices/SegmentedToggle";
import { SCIENCE_FEATURED_EVENT, SCIENCE_FEATURED_EXPERIENCE } from "@/data/featuredEventExperience";
import { PINNED_NOTICE, SEEDED_NOTICES } from "@/data/notices";
import { useApp } from "@/lib/AppContext";
import { venueResolver as resolver } from "@/lib/venueResolver";

const OVERLAY_CLOSE_DURATION_MS = 380;
const FEATURED_RESOLVED = resolver.resolve(SCIENCE_FEATURED_EVENT.venue_id);

export default function NoticesScreen() {
  const router = useRouter();
  const {
    savedEventIds,
    toggleSavedEvent,
    setSelectedPoiId,
    setPanelPoiId,
  } = useApp();
  const pinnedCardRef = useRef<HTMLDivElement>(null);
  const pinnedButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [overlayPhase, setOverlayPhase] = useState<
    FeaturedOverlayPhase | "closed"
  >("closed");
  const [originRect, setOriginRect] = useState<RectSnapshot | null>(null);
  const overlayActive = overlayPhase !== "closed";
  const isSaved = savedEventIds.has(SCIENCE_FEATURED_EVENT.id);

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

  const filteredNotices = useMemo(() => {
    if (filter === "unread") {
      return SEEDED_NOTICES.filter((notice) => notice.unread);
    }

    return SEEDED_NOTICES;
  }, [filter]);
  const showPinnedNotice = filter === "all" || PINNED_NOTICE.unread;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/home");
  };

  const openPinnedEvent = () => {
    if (overlayActive) return;

    const nextOrigin = snapshotRect(pinnedCardRef.current);
    if (nextOrigin) {
      setOriginRect(nextOrigin);
    }

    lastTriggerRef.current = pinnedButtonRef.current;
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

  const closePinnedEvent = () => {
    if (overlayPhase === "closed" || overlayPhase === "closing") {
      return;
    }

    const nextOrigin = snapshotRect(pinnedCardRef.current);
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
    <div className="scrollbar-none h-full overflow-y-auto">
      <div
        aria-hidden={overlayActive}
        className={`home-screen-shell ${overlayActive ? "is-dimmed pointer-events-none" : ""}`}
      >
        <div
          className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-28"
          style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
        >
          <header className="relative flex min-h-[52px] items-center justify-center">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className="absolute left-0 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[rgba(242,235,248,0.88)] text-[#6a3aa6] shadow-[0_14px_30px_rgba(79,45,127,0.08)] ring-1 ring-white/80 backdrop-blur transition-transform duration-200 active:scale-[0.97]"
            >
              <BackIcon />
            </button>

            <h1 className="text-[33px] font-semibold tracking-[-0.045em] text-[#1f1830]">
              Notices
            </h1>
          </header>

          <div className="mt-5">
            <SegmentedToggle value={filter} onChange={setFilter} />
          </div>

          {showPinnedNotice && (
            <section className="mt-5">
              <PinnedNoticeCard
                notice={PINNED_NOTICE}
                cardRef={pinnedCardRef}
                buttonRef={pinnedButtonRef}
                onViewEvent={openPinnedEvent}
              />
            </section>
          )}

          <section className="mt-5 space-y-4">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onPress={() => {}} />
            ))}
          </section>
        </div>
      </div>

      {overlayActive && (
        <FeaturedEventOverlay
          event={SCIENCE_FEATURED_EVENT}
          detail={SCIENCE_FEATURED_EXPERIENCE}
          resolved={FEATURED_RESOLVED}
          phase={overlayPhase as FeaturedOverlayPhase}
          originRect={originRect}
          isSaved={isSaved}
          onClose={closePinnedEvent}
          onOpenInMap={handleOpenInMap}
          onToggleSaved={() => toggleSavedEvent(SCIENCE_FEATURED_EVENT.id)}
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

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 6.5-5 5 5 5" />
    </svg>
  );
}
