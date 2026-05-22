"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StampImageTile from "@/components/passport/StampImageTile";
import StampDetailOverlay, {
  type CollectionContext,
  type StampDetailContent,
  type StampOverlayPhase,
  type StampRectSnapshot,
} from "@/components/passport/StampDetailOverlay";
import {
  getPassportProgress,
  PASSPORT_DEFINITION_BY_ID,
  type PassportStampDefinition,
} from "@/data/passport";
import {
  PASSPORT_GROUPS,
  NEXT_STAMPS_TO_DISCOVER,
  type PassportGroupKey,
} from "@/data/passportGroups";
import { useApp } from "@/lib/AppContext";
import { getPoiDisplayName } from "@/lib/poiDisplayNames";
import { getStampImage, hasStampImage } from "@/lib/stampImages";

// ─── Stamp detail content (extendable per-POI) ──────────────────────────────
const STAMP_DETAIL_CONTENT: Record<string, Omit<StampDetailContent, "displayName">> = {
  ucc: {
    shortTag: "Student Hub",
    stateChip: "Collected",
    contextChip: "Starting Soon",
    whyMatters:
      "UCC is Western's beating heart — the student activity centre where clubs host pop-ups, lounges fill between classes, and OWeek programming runs from sunrise to midnight. If it's happening on campus, it probably started here.",
    bullets: [
      "40+ clubs & student services under one roof",
      "The Wave pub, food court, and quiet lounges",
      "Central hub for OWeek pop-ups all week",
    ],
  },
  concrete_beach: {
    shortTag: "Outdoors",
    stateChip: "Collected",
    whyMatters:
      "The iconic stretch between the engineering buildings where Western students have gathered between classes for decades — sun, frisbees, food trucks during OWeek, and the kind of social energy that defines a Western afternoon.",
    bullets: [
      "Sun-soaked strip between Engineering and Science",
      "Food trucks and pop-ups running all OWeek",
      "Classic Western social gathering ground",
    ],
  },
  uc_hill: {
    shortTag: "Outdoors",
    stateChip: "Collected",
    whyMatters:
      "The gentle slope in front of University College is one of Western's most iconic gathering spots — perfect for hammocking, studying in the sun, and watching the whole campus flow past.",
    bullets: [
      "Open lawn ideal for sun and studying",
      "Central campus location near UCC and UC",
      "One of Western's most photographed spots",
    ],
  },
  huron_quad: {
    shortTag: "Outdoors",
    stateChip: "Collected",
    whyMatters:
      "The leafy quad at the heart of the Huron College grounds — a quiet counterpoint to the busier main campus, beloved by students who want green space without the crowd.",
    bullets: [],
  },
  weldon: {
    shortTag: "Academic",
    stateChip: "Collected",
    whyMatters:
      "Weldon Library is Western's main research library and a campus institution — open late, stacked with study rooms, and home to the quiet hum of essays being written under deadline.",
    bullets: [
      "Main research and study library on campus",
      "Group study rooms bookable by students",
      "Extended hours during exam season",
    ],
  },
  saugeen: {
    shortTag: "Residence",
    stateChip: "Collected",
    whyMatters:
      "Saugeen-Maitland Hall is Western's largest and most legendary residence — a rite of passage for thousands of first-years, known for its energy, its density, and its place in campus folklore.",
    bullets: [
      "Western's largest and most storied residence",
      "Home to thousands of first-year students",
      "Famous for its social scene and community energy",
    ],
  },
  perth: {
    shortTag: "Residence",
    stateChip: "Collected",
    whyMatters:
      "Perth Hall is one of Western's smaller, quieter residences tucked near Brescia University College — a more intimate experience compared to the sprawling mega-dorms elsewhere on campus.",
    bullets: [],
  },
  health_sci: {
    shortTag: "Academic",
    stateChip: "Collected",
    whyMatters:
      "The Health Sciences Building is home to Western's medicine, nursing, and health sciences programs — a modern complex that bridges research and clinical training right on campus.",
    bullets: [],
  },
  alumni_stadium: {
    shortTag: "Athletics",
    stateChip: "Collected",
    whyMatters:
      "Alumni Stadium is where the Western Mustangs take the field under the lights — one of the most electric atmospheres in university football, and a mandatory OWeek stadium experience.",
    bullets: [
      "Home of Western Mustangs football",
      "Major OWeek events and Shinerama held here",
      "Iconic stadium atmosphere under the lights",
    ],
  },
};

function getStampDetail(stamp: PassportStampDefinition): StampDetailContent {
  const base = STAMP_DETAIL_CONTENT[stamp.poiId];
  const name = getPoiDisplayName(stamp.poiId, stamp.name);
  return {
    displayName: name,
    shortTag: base?.shortTag ?? stamp.categoryLabel,
    stateChip: base?.stateChip ?? "Collected",
    contextChip: base?.contextChip,
    whyMatters:
      base?.whyMatters ??
      `${name} is part of your Western OWeek passport — one of ${stamp.categoryLabel.toLowerCase()} spots worth finding across campus.`,
    bullets: base?.bullets ?? [],
  };
}

// ─── Palette ────────────────────────────────────────────────────────────────
const PURPLE = "#4F2D7F";
const PURPLE_DARK = "#3A1F63";
const LAVENDER = "#F1EAF6";
const LAVENDER_DEEP = "#E6DBEF";
const CREAM = "#FAF7F2";
const GOLD = "#C9A961";

function displayName(poiId: string, fallback: string): string {
  return getPoiDisplayName(poiId, fallback);
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PassportPage() {
  const { unlockedBuildings } = useApp();

  const progress = useMemo(
    () => getPassportProgress(unlockedBuildings),
    [unlockedBuildings],
  );
  const collected = progress.effectiveUnlocked;
  const remaining = progress.totalCount - progress.collectedCount;

  const uccStamp = PASSPORT_DEFINITION_BY_ID.get("ucc");

  const [overlayStamp, setOverlayStamp] = useState<PassportStampDefinition | null>(null);
  const [overlayPhase, setOverlayPhase] = useState<StampOverlayPhase>("opening");
  const [originRect, setOriginRect] = useState<StampRectSnapshot | null>(null);
  const [collectionContext, setCollectionContext] = useState<CollectionContext | undefined>();

  const openStamp = useCallback(
    (stamp: PassportStampDefinition, rect: StampRectSnapshot) => {
      // Build collection context for category progress + journey cards
      const group = PASSPORT_GROUPS.find((g) =>
        g.stamps.some((s) => s.poiId === stamp.poiId),
      );
      const groupStamps = group?.stamps ?? [];
      const categoryCollected = groupStamps.filter((s) => collected.has(s.poiId)).length;
      const siblings = groupStamps
        .filter((s) => s.poiId !== stamp.poiId)
        .map((s) => ({ stamp: s, isCollected: collected.has(s.poiId) }));

      setCollectionContext({
        totalCollected: progress.collectedCount,
        totalStamps: progress.totalCount,
        categoryCollected,
        categoryTotal: groupStamps.length,
        categoryLabel: group?.label ?? stamp.categoryLabel,
        siblings,
      });
      setOverlayStamp(stamp);
      setOriginRect(rect);
      setOverlayPhase("opening");
    },
    [collected, progress],
  );

  useEffect(() => {
    if (overlayStamp && overlayPhase === "opening") {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setOverlayPhase("open"));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [overlayStamp, overlayPhase]);

  const closeOverlay = useCallback(() => {
    setOverlayPhase("closing");
    window.setTimeout(() => {
      setOverlayStamp(null);
      setOriginRect(null);
    }, 360);
  }, []);
  const nextStamps: { definition: PassportStampDefinition; distance: string }[] =
    NEXT_STAMPS_TO_DISCOVER.flatMap((entry) => {
      const def = PASSPORT_DEFINITION_BY_ID.get(entry.poiId);
      return def ? [{ definition: def, distance: entry.distance }] : [];
    });

  const router = useRouter();
  const handleViewOnMap = useCallback(() => {
    router.push("/map");
  }, [router]);

  return (
    <div
      className="scrollbar-none h-full overflow-y-auto pb-10"
      style={{ backgroundColor: CREAM }}
      data-demo-target="passport-screen"
      data-demo-scroll="passport"
    >
      <PassportHeader />

      <div className="px-4 mt-3 space-y-5">
        <ProgressCard
          collected={progress.collectedCount}
          total={progress.totalCount}
          percent={progress.completionPercent}
          remaining={remaining}
        />

        {uccStamp && (
          <RecentlyCollected stamp={uccStamp} onOpen={openStamp} />
        )}

        <CollectionSection collected={collected} onOpen={openStamp} />

        <MilestonesSection current={progress.collectedCount} />

        {nextStamps.length > 0 && (
          <NextStampsSection items={nextStamps} onViewOnMap={handleViewOnMap} />
        )}
      </div>

      {overlayStamp && (
        <StampDetailOverlay
          stamp={overlayStamp}
          detail={getStampDetail(overlayStamp)}
          phase={overlayPhase}
          originRect={originRect}
          collectionContext={collectionContext}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

function PassportHeader() {
  return (
    <header className="px-4 pt-6 pb-1">
      <div className="flex items-center gap-3">
        <CrestBookIcon />
        <div className="flex-1 min-w-0">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-gray-900">
            My Passport
          </h1>
          <p className="text-[13px] text-gray-500 leading-snug">
            Your OWeek journey across Western
          </p>
        </div>
        <button
          type="button"
          aria-label="Share passport"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition active:scale-95"
        >
          <ShareIcon />
        </button>
      </div>
    </header>
  );
}

function CrestBookIcon() {
  return (
    <div
      className="relative flex h-14 w-12 items-center justify-center rounded-[10px] shadow-[0_4px_12px_rgba(79,45,127,0.32)]"
      style={{
        background: `linear-gradient(145deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
      }}
    >
      {/* gold border frame */}
      <span
        className="pointer-events-none absolute inset-1 rounded-[7px] border"
        style={{ borderColor: GOLD, opacity: 0.55 }}
      />
      {/* stylized rampant lion glyph */}
      <svg viewBox="0 0 24 28" className="h-7 w-6" fill={GOLD}>
        <path d="M5 7c1 0 2-1 3-1s1 1 2 1 2-2 3-2 2 1 2 2-1 2-2 2 0 2 1 3 3 1 4 2-1 3-2 3-2-1-3-1-1 2-2 3-3 1-4 0-1-2-2-3-2-1-2-2 1-2 2-3-1-2-1-3 1-1 1-1z" />
      </svg>
      {/* stacked book pages */}
      <span className="absolute -right-0.5 top-1 bottom-1 w-[3px] rounded-r bg-white/25" />
      <span className="absolute -right-1 top-2 bottom-2 w-[2px] rounded-r bg-white/15" />
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-[18px] w-[18px]"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
    </svg>
  );
}

// ─── Progress card ──────────────────────────────────────────────────────────

function ProgressCard({
  collected,
  total,
  percent,
  remaining,
}: {
  collected: number;
  total: number;
  percent: number;
  remaining: number;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[22px] border px-5 py-5 shadow-[0_2px_8px_rgba(79,45,127,0.06)]"
      style={{
        background: `linear-gradient(135deg, ${LAVENDER} 0%, #EDE3F4 55%, #E3D5EE 100%)`,
        borderColor: "rgba(79,45,127,0.10)",
      }}
      data-demo-target="passport-progress"
    >
      {/* Watermark crest on right */}
      <div
        className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 opacity-[0.13]"
        aria-hidden
      >
        <WesternCrestWatermark />
      </div>

      <div className="relative flex items-center gap-4">
        {/* Wax seal on left */}
        <div className="shrink-0">
          <WaxSealIcon />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className="text-[38px] font-bold leading-none tracking-tight"
              style={{ color: PURPLE }}
            >
              {collected}
            </span>
            <span className="text-[14px] font-medium text-gray-600">
              of {total} locations collected
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(79,45,127,0.14)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${PURPLE} 0%, #7A4AB8 100%)`,
                  boxShadow: "0 0 6px rgba(79,45,127,0.35)",
                }}
              />
            </div>
            <span
              className="text-[13px] font-semibold"
              style={{ color: PURPLE }}
            >
              {percent}%
            </span>
          </div>

          <p className="mt-2 text-[12px] text-gray-600">
            {remaining} stamp{remaining === 1 ? "" : "s"} left to complete your passport
          </p>
        </div>
      </div>
    </section>
  );
}

function WaxSealIcon() {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/passport-seal.png"
        alt=""
        aria-hidden
        width={76}
        height={41}
        className="select-none"
        style={{
          height: "auto",
          transform: "scale(3.5)",
          filter: "drop-shadow(0 3px 7px rgba(79,45,127,0.24))",
        }}
      />
    </span>
  );
}

function WesternCrestWatermark() {
  return (
    <svg viewBox="0 0 120 140" width="130" height="150">
      {/* Shield outline */}
      <path
        d="M10 20 L60 10 L110 20 L110 85 Q110 115 60 135 Q10 115 10 85 Z"
        fill="none"
        stroke={PURPLE}
        strokeWidth="2"
      />
      {/* Inner shield */}
      <path
        d="M22 30 L60 23 L98 30 L98 82 Q98 106 60 122 Q22 106 22 82 Z"
        fill="none"
        stroke={PURPLE}
        strokeWidth="1"
      />
      {/* Lion silhouette */}
      <g fill={PURPLE}>
        <path d="M40 55 Q44 48 52 50 Q56 45 64 47 Q72 45 76 52 Q82 55 80 65 Q85 70 80 78 Q75 82 68 80 Q64 85 58 82 Q52 86 46 82 Q40 80 38 72 Q34 66 38 58 Z" />
      </g>
      {/* Banner */}
      <rect x="25" y="95" width="70" height="10" fill={PURPLE} opacity="0.6" />
      <text
        x="60"
        y="103"
        textAnchor="middle"
        fontSize="7"
        fill="#FFFFFF"
        fontWeight="700"
        letterSpacing="1"
      >
        1878
      </text>
    </svg>
  );
}

// ─── Recently Collected ─────────────────────────────────────────────────────

function RecentlyCollected({
  stamp,
  onOpen,
}: {
  stamp: PassportStampDefinition;
  onOpen: (stamp: PassportStampDefinition, rect: StampRectSnapshot) => void;
}) {
  const src = getStampImage(stamp.poiId);
  const sectionRef = useRef<HTMLElement>(null);

  const handleOpen = () => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    onOpen(stamp, { top: r.top, left: r.left, width: r.width, height: r.height });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-[22px] border bg-white px-5 pt-3 pb-4 shadow-[0_4px_14px_rgba(79,45,127,0.08)]"
      style={{ borderColor: "rgba(79,45,127,0.08)" }}
      data-demo-target="passport-recently-collected"
    >
      {/* Top row: label */}
      <div className="relative flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <SparkleIcon />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: PURPLE }}
          >
            Recently Collected
          </span>
        </div>
      </div>

      {/* Title + subtitle */}
      <h3 className="text-[22px] font-bold leading-tight text-gray-900">
        {displayName(stamp.poiId, stamp.name)}
      </h3>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <p className="text-[12px] font-medium text-emerald-600">Collected today</p>
      </div>

      {/* Full-width stamp — the star of the card */}
      <div className="relative mt-2 -mx-5">
        {/* Decorative sparkles around the stamp */}
        <Sparkle className="absolute -top-1 left-[20%]" size={9} />
        <Sparkle className="absolute -top-2 right-[25%]" size={7} />
        <Sparkle className="absolute bottom-0 left-[10%]" size={6} />

        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={displayName(stamp.poiId, stamp.name)}
            className="block w-full"
            style={{ height: "auto", transform: "scale(1.15)" }}
          />
        ) : (
          <StampImageTile
            definition={stamp}
            state="collected"
            size="hero"
            showLock={false}
          />
        )}
      </div>

      {/* View Details CTA */}
      <button
        type="button"
        onClick={handleOpen}
        className="mt-2 inline-flex items-center gap-1 rounded-full border bg-white px-4 py-2 text-[13px] font-semibold shadow-sm transition active:scale-[0.97]"
        style={{
          color: PURPLE,
          borderColor: "rgba(79,45,127,0.25)",
        }}
      >
        View Details
        <ChevronRight />
      </button>
    </section>
  );
}

function Sparkle({ className, size = 8 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      className={className}
      fill={GOLD}
      opacity="0.7"
      aria-hidden
    >
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill={PURPLE} aria-hidden>
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

// ─── Collection (4 categories) ──────────────────────────────────────────────

function CollectionSection({
  collected,
  onOpen,
}: {
  collected: Set<string>;
  onOpen: (stamp: PassportStampDefinition, rect: StampRectSnapshot) => void;
}) {
  return (
    <section data-demo-target="passport-collection">
      <div className="flex items-baseline justify-between px-1 mb-3">
        <h2 className="text-[17px] font-bold text-gray-900">My Collection</h2>
        <button
          type="button"
          className="inline-flex items-center gap-0.5 text-[12px] font-semibold"
          style={{ color: PURPLE }}
        >
          See all
          <ChevronRight />
        </button>
      </div>

      <div className="space-y-3">
        {PASSPORT_GROUPS.map((group) => {
          const unlockedCount = group.stamps.filter((s) =>
            collected.has(s.poiId),
          ).length;
          return (
            <CategoryCard
              key={group.key}
              groupKey={group.key}
              label={group.label}
              stamps={group.stamps}
              collected={collected}
              unlockedCount={unlockedCount}
              onOpen={onOpen}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryCard({
  groupKey,
  label,
  stamps,
  collected,
  unlockedCount,
  onOpen,
}: {
  groupKey: PassportGroupKey;
  label: string;
  stamps: PassportStampDefinition[];
  collected: Set<string>;
  unlockedCount: number;
  onOpen: (stamp: PassportStampDefinition, rect: StampRectSnapshot) => void;
}) {
  // Sort: collected first, then locked-with-artwork, then unfinished (no artwork)
  const sorted = [...stamps].sort((a, b) => {
    const priority = (s: PassportStampDefinition) => {
      if (collected.has(s.poiId)) return 0;
      if (hasStampImage(s.poiId)) return 1;
      return 2;
    };
    return priority(a) - priority(b);
  });

  return (
    <div
      className="rounded-[20px] border bg-white p-4 shadow-[0_2px_6px_rgba(79,45,127,0.04)]"
      style={{ borderColor: "rgba(79,45,127,0.08)" }}
    >
      <div className="flex items-center gap-3 mb-3.5">
        <CategoryIcon groupKey={groupKey} />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
            {label}
          </h3>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
            {unlockedCount} / {stamps.length}
          </p>
        </div>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory">
        {sorted.map((stamp) => {
          const isCollected = collected.has(stamp.poiId);
          const label = (
            <span
              className={`mt-2 w-full text-center text-[10px] font-medium leading-[1.15] ${
                isCollected ? "text-gray-700" : "text-gray-400"
              }`}
              title={displayName(stamp.poiId, stamp.name)}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {displayName(stamp.poiId, stamp.name)}
            </span>
          );

          if (isCollected) {
            return (
              <button
                key={stamp.poiId}
                type="button"
                className="stamp-collectible flex w-[108px] shrink-0 snap-start flex-col items-center"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  onOpen(stamp, {
                    top: r.top,
                    left: r.left,
                    width: r.width,
                    height: r.height,
                  });
                }}
                aria-label={`View ${displayName(stamp.poiId, stamp.name)} stamp details`}
              >
                <div className="stamp-collectible-art">
                  <StampImageTile
                    definition={stamp}
                    state="collected"
                    size="md"
                  />
                </div>
                {label}
              </button>
            );
          }

          return (
            <div
              key={stamp.poiId}
              className="flex w-[108px] shrink-0 snap-start flex-col items-center"
            >
              <StampImageTile
                definition={stamp}
                state="locked"
                size="md"
              />
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryIcon({ groupKey }: { groupKey: PassportGroupKey }) {
  const iconPaths: Record<PassportGroupKey, React.ReactNode> = {
    landmarks: (
      <path d="M12 3 L6 9 v11 h3 v-6 h6 v6 h3 V9 Z M10 6.5 l2-2 2 2" />
    ),
    residences: (
      <path d="M4 11 L12 4 L20 11 v9 a1 1 0 0 1 -1 1 h-4 v-6 h-6 v6 h-4 a1 1 0 0 1 -1 -1 Z" />
    ),
    academic: (
      <path d="M12 3 L2 8 L12 13 L22 8 Z M6 10.5 v4 a6 6 0 0 0 12 0 v-4" />
    ),
    student_life: (
      <path d="M12 2 a5 5 0 0 1 5 5 v2 a5 5 0 0 1 -10 0 V7 a5 5 0 0 1 5 -5 Z M4 22 v-2 a6 6 0 0 1 6 -6 h4 a6 6 0 0 1 6 6 v2" />
    ),
  };

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `linear-gradient(145deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
        boxShadow: "0 2px 4px rgba(79,45,127,0.18)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        {iconPaths[groupKey]}
      </svg>
    </div>
  );
}

// ─── Passport Milestones ────────────────────────────────────────────────────

const TOTAL_MILESTONE = 51;
const MIDWAY_MILESTONE = 25;

function MilestonesSection({ current }: { current: number }) {
  const clamped = Math.max(0, Math.min(TOTAL_MILESTONE, current));
  const reached25 = clamped >= MIDWAY_MILESTONE;
  const reached51 = clamped >= TOTAL_MILESTONE;
  const segmentAFill = Math.min(1, clamped / MIDWAY_MILESTONE) * 100;
  const segmentBFill =
    Math.min(1, Math.max(0, (clamped - MIDWAY_MILESTONE) / (TOTAL_MILESTONE - MIDWAY_MILESTONE))) * 100;

  return (
    <section
      className="relative overflow-hidden rounded-[22px] border p-5 pb-6 shadow-[0_4px_18px_rgba(79,45,127,0.06)]"
      style={{
        background:
          "linear-gradient(160deg, #FBF8FD 0%, #F6F0FA 55%, #F1EAF6 100%)",
        borderColor: "rgba(79,45,127,0.10)",
      }}
      data-demo-target="passport-milestones"
    >
      {/* Decorative crest watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-6 opacity-[0.07]"
        style={{ transform: "rotate(8deg)" }}
      >
        <WesternCrestWatermark />
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] shadow-[0_4px_10px_rgba(79,45,127,0.28)]"
            style={{
              background: `linear-gradient(145deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M6 3h11a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2Z"
                stroke={GOLD}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="11" r="2.5" fill={GOLD} />
            </svg>
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight">
              Passport Milestones
            </h2>
            <p className="mt-0.5 text-[12.5px] text-gray-500 leading-snug">
              Collect stamps. Hit milestones. Unlock rewards.
            </p>
          </div>
        </div>
        <span
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            backgroundColor: "rgba(79,45,127,0.09)",
            color: PURPLE,
          }}
        >
          <span className="tabular-nums">{clamped}</span>
          <span className="opacity-50">/</span>
          <span className="tabular-nums">{TOTAL_MILESTONE}</span>
        </span>
      </div>

      {/* Journey rail */}
      <div className="relative mb-6 px-1 pt-7 pb-6">
        {/* Midway flag (above midpoint node) */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center"
          aria-hidden
        >
          <div
            className="rounded-[4px] px-1.5 py-0.5 text-[8.5px] font-bold tracking-[0.12em] text-white shadow-[0_2px_5px_rgba(79,45,127,0.25)]"
            style={{
              background: `linear-gradient(135deg, ${PURPLE} 0%, #6B3FA0 100%)`,
            }}
          >
            MIDWAY
          </div>
          <div
            className="h-2 w-px"
            style={{ backgroundColor: "rgba(79,45,127,0.35)" }}
          />
        </div>

        {/* Rail background */}
        <div className="relative h-[5px]">
          {/* Segment A (0 → 25) background */}
          <div
            className="absolute left-0 top-0 h-full rounded-l-full"
            style={{
              width: "50%",
              backgroundColor: LAVENDER_DEEP,
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(79,45,127,0.22) 0 2px, transparent 2px 7px)",
            }}
          />
          {/* Segment B (25 → 51) background */}
          <div
            className="absolute right-0 top-0 h-full rounded-r-full"
            style={{
              width: "50%",
              backgroundColor: LAVENDER_DEEP,
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(79,45,127,0.22) 0 2px, transparent 2px 7px)",
            }}
          />
          {/* Segment A fill */}
          <div
            className="absolute left-0 top-0 h-full transition-all duration-700 ease-out"
            style={{
              width: `${segmentAFill / 2}%`,
              background: `linear-gradient(90deg, ${PURPLE} 0%, #7A4AB8 100%)`,
              boxShadow: "0 1px 6px rgba(79,45,127,0.35)",
              borderRadius: segmentAFill > 0 ? "999px 2px 2px 999px" : "999px",
            }}
          />
          {/* Segment B fill */}
          <div
            className="absolute top-0 h-full transition-all duration-700 ease-out"
            style={{
              left: "50%",
              width: `${segmentBFill / 2}%`,
              background: `linear-gradient(90deg, #7A4AB8 0%, ${PURPLE} 100%)`,
              boxShadow: "0 1px 6px rgba(79,45,127,0.35)",
              borderRadius: segmentBFill >= 100 ? "2px 999px 999px 2px" : "2px",
            }}
          />
        </div>

        {/* Nodes */}
        <div className="relative -mt-[18px] flex items-start justify-between">
          <MilestoneNode
            value={0}
            label="Start"
            variant="start"
            state={clamped > 0 ? "reached" : "current"}
          />
          <MilestoneNode
            value={MIDWAY_MILESTONE}
            label="25 Stamps"
            variant="midway"
            state={reached25 ? "reached" : clamped > 0 ? "current" : "locked"}
          />
          <MilestoneNode
            value={TOTAL_MILESTONE}
            label="Final"
            variant="final"
            state={reached51 ? "reached" : reached25 ? "current" : "locked"}
          />
        </div>
      </div>

      {/* Reward panels */}
      <div className="relative space-y-3">
        <RewardPanel
          variant="midway"
          reached={reached25}
          remaining={Math.max(0, MIDWAY_MILESTONE - clamped)}
          ribbon="MIDWAY REWARD · 25 STAMPS"
          title="One of 54 Physical Stamp Sets"
          tagline="Collectible. Limited. Yours."
          image="/rewards/stamp-set-reward.png"
        />
        <RewardPanel
          variant="final"
          reached={reached51}
          remaining={Math.max(0, TOTAL_MILESTONE - clamped)}
          ribbon="FINAL REWARD · 51 STAMPS"
          title="Raffle Entry to Win a PurpleFest Ticket"
          tagline="One ticket. Unforgettable OWeek."
          image="/rewards/purplefest-ticket.png"
        />
      </div>
    </section>
  );
}

type NodeVariant = "start" | "midway" | "final";
type NodeState = "locked" | "current" | "reached";

function MilestoneNode({
  value,
  label,
  variant,
  state,
}: {
  value: number;
  label: string;
  variant: NodeVariant;
  state: NodeState;
}) {
  const sizes = {
    start: { circle: 24, font: 10 },
    midway: { circle: 38, font: 13 },
    final: { circle: 30, font: 11 },
  }[variant];

  const reached = state === "reached";
  const filled = reached;

  const ringColor =
    variant === "final" && reached
      ? GOLD
      : variant === "midway" && reached
      ? "rgba(79,45,127,0.18)"
      : "transparent";

  return (
    <div
      className="relative z-10 flex flex-col items-center"
      style={{ width: sizes.circle + 4 }}
    >
      <span
        className="relative flex items-center justify-center rounded-full font-bold tabular-nums transition-all"
        style={{
          width: sizes.circle,
          height: sizes.circle,
          fontSize: sizes.font,
          background: filled
            ? `linear-gradient(145deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`
            : "#FFFFFF",
          color: filled ? "#FFFFFF" : PURPLE,
          boxShadow: filled
            ? `0 0 0 3px ${ringColor}, 0 4px 10px rgba(79,45,127,0.25)`
            : state === "current" && variant === "midway"
            ? `inset 0 0 0 2.5px ${PURPLE}, 0 2px 6px rgba(79,45,127,0.14)`
            : `inset 0 0 0 2px ${PURPLE}`,
        }}
      >
        {value}
        {variant === "final" && reached && (
          <svg
            viewBox="0 0 10 10"
            width="7"
            height="7"
            className="absolute -right-0.5 -top-0.5"
            fill={GOLD}
            aria-hidden
          >
            <path d="M5 0l1.3 3.2L10 4l-3 2.5L7.8 10 5 8l-2.8 2L3 6.5 0 4l3.7-.8L5 0z" />
          </svg>
        )}
      </span>
      <span
        className="mt-2 text-center text-[9.5px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap"
        style={{
          color: variant === "midway" && reached ? PURPLE : "rgba(79,45,127,0.62)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function RewardPanel({
  variant,
  reached,
  remaining,
  ribbon,
  title,
  tagline,
  image,
}: {
  variant: "midway" | "final";
  reached: boolean;
  remaining: number;
  ribbon: string;
  title: string;
  tagline: string;
  image: string;
}) {
  const isFinal = variant === "final";

  const panelBg = isFinal
    ? "linear-gradient(135deg, #2E1A52 0%, #4F2D7F 55%, #3A1F63 100%)"
    : "linear-gradient(135deg, #FFFFFF 0%, #F6EEFB 100%)";

  const textColor = isFinal ? "text-white" : "text-gray-900";
  const taglineColor = isFinal ? "text-white/75" : "";
  const taglineStyle = !isFinal ? { color: PURPLE } : undefined;

  const ribbonBg = isFinal
    ? `linear-gradient(135deg, ${GOLD} 0%, #E4C16F 100%)`
    : `linear-gradient(135deg, ${PURPLE} 0%, #6B3FA0 100%)`;
  const ribbonColor = isFinal ? PURPLE_DARK : "#FFFFFF";

  const borderColor = reached
    ? isFinal
      ? GOLD
      : "rgba(201,169,97,0.7)"
    : isFinal
    ? "rgba(79,45,127,0.45)"
    : "rgba(79,45,127,0.10)";

  return (
    <button
      type="button"
      className="group relative block w-full overflow-hidden rounded-[20px] border text-left shadow-[0_6px_20px_rgba(79,45,127,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(79,45,127,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F2D7F]/50"
      style={{
        background: panelBg,
        borderColor,
        borderWidth: reached ? 1.5 : 1,
      }}
    >
      {/* Status badge */}
      <div className="absolute right-3 top-3 z-20">
        {reached ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #E4C16F 100%)`,
              color: PURPLE_DARK,
              boxShadow: "0 2px 6px rgba(201,169,97,0.35)",
            }}
          >
            <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden>
              <path
                d="M1.5 5.2L4 7.5 8.5 2.5"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Unlocked
          </span>
        ) : (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: isFinal
                ? "rgba(255,255,255,0.14)"
                : "rgba(79,45,127,0.10)",
              color: isFinal ? "#FFFFFF" : PURPLE,
              backdropFilter: isFinal ? "blur(4px)" : undefined,
            }}
          >
            {remaining} to unlock
          </span>
        )}
      </div>

      {/* Soft hero glow behind imagery (final only) */}
      {isFinal && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-20px] top-1/2 h-[180px] w-[180px] -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(247,181,0,0.22) 0%, rgba(247,181,0,0) 70%)",
          }}
        />
      )}

      {/* Decorative sparkles */}
      <Sparkles variant={variant} />

      <div className="relative flex min-h-[176px] items-stretch">
        {/* Text column */}
        <div className="flex flex-1 flex-col justify-center p-4 pr-2">
          <div>
            <span
              className="inline-block rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.11em]"
              style={{
                background: ribbonBg,
                color: ribbonColor,
                boxShadow: isFinal
                  ? "0 2px 6px rgba(201,169,97,0.35)"
                  : "0 2px 6px rgba(79,45,127,0.22)",
              }}
            >
              {ribbon}
            </span>
            <h3
              className={`mt-2.5 text-[15px] font-bold leading-[1.2] ${textColor}`}
            >
              {title}
            </h3>
            <p
              className={`mt-1 text-[11.5px] italic leading-snug ${taglineColor}`}
              style={taglineStyle}
            >
              {tagline}
            </p>
          </div>
        </div>

        {/* Image column */}
        <div className="relative w-[48%] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden
            className="pointer-events-none absolute select-none"
            style={
              isFinal
                ? {
                    right: "-8%",
                    top: "50%",
                    width: "150%",
                    transform: "translateY(-50%) rotate(8deg)",
                    filter:
                      "drop-shadow(0 10px 18px rgba(0,0,0,0.35)) drop-shadow(0 2px 4px rgba(247,181,0,0.25))",
                  }
                : {
                    right: "-8%",
                    top: "50%",
                    width: "162%",
                    transform: "translateY(-50%) rotate(-4deg)",
                    filter: reached
                      ? "drop-shadow(0 10px 18px rgba(79,45,127,0.3))"
                      : "drop-shadow(0 10px 18px rgba(79,45,127,0.22)) saturate(0.9)",
                  }
            }
          />
        </div>
      </div>
    </button>
  );
}

function Sparkles({ variant }: { variant: "midway" | "final" }) {
  const color = variant === "final" ? GOLD : GOLD;
  const opacity = variant === "final" ? 0.55 : 0.45;
  const positions =
    variant === "final"
      ? [
          { top: "18%", right: "38%", size: 7 },
          { top: "60%", right: "30%", size: 5 },
          { top: "30%", right: "8%", size: 9 },
          { top: "78%", right: "50%", size: 4 },
        ]
      : [
          { top: "22%", right: "42%", size: 6 },
          { top: "68%", right: "28%", size: 5 },
          { top: "40%", right: "4%", size: 7 },
        ];

  return (
    <>
      {positions.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 10 10"
          width={p.size}
          height={p.size}
          className="pointer-events-none absolute z-10"
          style={{ top: p.top, right: p.right, opacity }}
          fill={color}
          aria-hidden
        >
          <path d="M5 0l1.3 3.2L10 4l-3 2.5L7.8 10 5 8l-2.8 2L3 6.5 0 4l3.7-.8L5 0z" />
        </svg>
      ))}
    </>
  );
}

// ─── Next Stamps to Discover ────────────────────────────────────────────────

function NextStampsSection({
  items,
  onViewOnMap,
}: {
  items: { definition: PassportStampDefinition; distance: string }[];
  onViewOnMap?: () => void;
}) {
  return (
    <section
      className="rounded-[20px] border bg-white p-5 shadow-[0_2px_6px_rgba(79,45,127,0.04)]"
      style={{ borderColor: "rgba(79,45,127,0.08)" }}
      data-demo-target="passport-next-stamps"
    >
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <NavigationIcon />
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
              Next Stamps to Discover
            </h2>
            <p className="text-[11px] text-gray-500 leading-snug">
              Places nearby waiting for you!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewOnMap}
          className="inline-flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap"
          style={{ color: PURPLE }}
          data-demo-target="passport-view-map"
        >
          <MapIcon />
          View on Map
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {items.map(({ definition, distance }) => (
          <div
            key={definition.poiId}
            className="flex items-center gap-3 rounded-[14px] border px-3 py-2.5"
            style={{
              backgroundColor: "#FBF7FD",
              borderColor: "rgba(79,45,127,0.08)",
            }}
          >
            <StampImageTile
              definition={definition}
              state="locked"
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                {displayName(definition.poiId, definition.name)}
              </p>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                Visit to collect this stamp
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-[12px] font-bold"
                style={{ color: PURPLE }}
              >
                {distance}
              </p>
              <ArrowUpRight />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NavigationIcon() {
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full"
      style={{ backgroundColor: LAVENDER }}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={PURPLE}>
        <path d="M2 11 L22 3 L14 22 L11 13 Z" />
      </svg>
    </span>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4 L3 6 v14 l6 -2 6 2 6 -2 V4 l-6 2 Z M9 4 v14 M15 6 v14" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={PURPLE}
      strokeWidth={2}
      className="ml-auto mt-0.5 h-3 w-3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 L17 7 M8 7 h9 v9" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      className="h-3 w-3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}
