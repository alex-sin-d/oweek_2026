"use client";

import { useEffect, useRef, useState } from "react";
import DemoAnnotationOverlay, {
  type DemoAnnotation,
} from "@/components/demo/DemoAnnotationOverlay";
import DemoScrollCue, {
  type DemoScrollCueConfig,
} from "@/components/demo/DemoScrollCue";

// External "scroll to see more" cues — one per long-form screen.
const EVENT_DETAIL_CUE: DemoScrollCueConfig = {
  id: "event-detail",
  screenSelector: '[data-demo-target="event-detail-screen"]',
  scrollerSelector: ".featured-overlay-scroll",
  hideTargetSelector: '[data-demo-target="event-detail-last-year"]',
  hideProgress: 0.7,
  title: "Scroll to see more",
  subtext: "Photos, notes, and what to know below",
};

const ACEB_CUE: DemoScrollCueConfig = {
  id: "aceb-panel",
  screenSelector: '[data-demo-target="aceb-panel"]',
  scrollerSelector: '[data-demo-scroll="aceb"]',
  hideTargetSelector: '[data-demo-target="aceb-later-today"]',
  hideProgress: 0.65,
  title: "Scroll to explore ACEB",
  subtext: "Nearby events, later plans, and stamp progress below",
};

const PASSPORT_CUE: DemoScrollCueConfig = {
  id: "passport",
  screenSelector: '[data-demo-target="passport-screen"]',
  scrollerSelector: '[data-demo-scroll="passport"]',
  hideTargetSelector: '[data-demo-target="passport-milestones"]',
  hideProgress: 0.65,
  title: "Scroll through Passport",
  subtext: "Collections, milestones, and next stamps below",
};

const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 844;
const TITLE_PHONE_GAP = 56;

const DEMO_STORAGE_KEYS = [
  "oweek_profile_v2",
  "oweek_profile",
  "oweek_unlocked",
  "oweek_saved_events",
  "oweek_demo_mode",
];

const ANNOTATIONS: DemoAnnotation[] = [
  {
    id: "ob-name",
    number: 1,
    title: "Enter any name",
    targetSelector: "#oweek-name",
    screenKey: "onboarding-profile",
  },
  {
    id: "ob-science",
    number: 2,
    title: "Select Science",
    targetSelector: '[data-demo-target="faculty-science"]',
    screenKey: "onboarding-profile",
  },
  {
    id: "ob-perth",
    number: 3,
    title: "Select Perth Hall",
    targetSelector: '[data-demo-target="residence-perth"]',
    screenKey: "onboarding-profile",
  },
  {
    id: "home-featured",
    number: 1,
    title: "Personalized first event",
    subtext:
      "The first thing students see is the most relevant event for them, based on onboarding choices like faculty and residence. This reduces the feeling of opening a huge schedule and not knowing where to start. Tap 'View Details' to go deeper.",
    shortSubtext:
      "Shows the most relevant event first based on faculty and residence, so students know what to do next. Tap 'View Details' to explore.",
    targetSelector: '[data-demo-target="featured-card"]',
    screenKey: "home",
  },
  {
    id: "home-quick",
    number: 2,
    title: "Key tools stay in-app",
    subtext:
      "These quick-access tools are designed as simple in-app experiences instead of sending students to external pages. It keeps the app smoother and lowers friction. Tap 'Shuttle' to see an example.",
    shortSubtext:
      "Common tools stay inside the app instead of becoming external links. Tap 'Shuttle' to see a simple utility.",
    targetSelector: '[data-demo-target="quick-access"]',
    screenKey: "home",
  },
  {
    id: "home-passport",
    number: 3,
    title: "Passport drives exploration",
    subtext:
      "Passport encourages students to explore campus, learn key buildings, and track their progress. It turns OWeek from only a schedule into a discovery experience.",
    shortSubtext:
      "Passport gives students a reason to explore campus, learn buildings, and feel progress through OWeek.",
    targetSelector: '[data-demo-target="passport-card"]',
    screenKey: "home",
  },

  // ── Event Detail overlay ─────────────────────────────────────────────
  {
    id: "event-detail-hero",
    number: 1,
    title: "More than an event title",
    subtext:
      "After the homepage recommends an event, the detail page gives students the confidence to actually go. They can quickly confirm what the event is, when it starts, and where it happens.",
    shortSubtext:
      "The detail page helps students understand the event before deciding to go.",
    targetSelector: '[data-demo-target="event-detail-hero"]',
    screenKey: "event-detail",
  },
  {
    id: "event-detail-actions",
    number: 2,
    title: "Turn interest into action",
    subtext:
      "Students can immediately open the event in Map or add it to their schedule. This connects discovery with action instead of making students jump between disconnected tools.",
    shortSubtext:
      "Open in Map and Add to Schedule turn event discovery into a clear next step.",
    targetSelector: '[data-demo-target="event-detail-actions"]',
    screenKey: "event-detail",
  },
  {
    id: "event-detail-location",
    number: 3,
    title: "Make the location clear",
    subtext:
      "First-years may not know campus building names yet. Showing the location visually helps students understand where the event is before they start walking.",
    shortSubtext:
      "Visual location context helps first-years understand where they need to go.",
    targetSelector: '[data-demo-target="event-detail-location-card"]',
    screenKey: "event-detail",
  },
  {
    id: "event-detail-description",
    number: 4,
    title: "Practical context before going",
    subtext:
      "This section gives students the details they need before showing up, like what to bring, where to check in, and whether anything has changed. It reduces uncertainty before they leave their residence.",
    shortSubtext:
      "Practical notes help students know what to bring, where to check in, and what to expect.",
    targetSelector: '[data-demo-target="event-detail-description"]',
    screenKey: "event-detail",
  },
  {
    id: "event-detail-last-year",
    number: 5,
    title: "Show the vibe, not just the title",
    subtext:
      "Photos and media from past years help students understand what an event actually feels like. For events with names that sound vague or unfamiliar, this can make the difference between skipping it and deciding it looks worth attending.",
    shortSubtext:
      "Past-year media helps students understand the energy of an event before choosing where to go.",
    targetSelector: '[data-demo-target="event-detail-last-year"]',
    screenKey: "event-detail",
  },

  // ── Map: initial state (fixed left-side slots, text locked) ─────────
  // Ordered top → middle → bottom so numeric order matches visual order.
  {
    id: "map-filters",
    number: 1,
    title: "Find what matters fast",
    subtext:
      "Students can filter or search by residence, faculty, food, services, or event locations instead of digging through a huge schedule. The goal is to reduce overwhelm and help them act quickly.",
    shortSubtext:
      "Filters and search help students narrow campus by residence, faculty, food, services, or events.",
    targetSelector: '[data-demo-target="map-filters"]',
    screenKey: "map-initial",
    fixedSlot: "top-left",
  },
  {
    id: "map-alumni",
    number: 2,
    title: "Campus starts to feel recognizable",
    subtext:
      "Instead of making first-years read building names in a long schedule, the map turns Western into places they can actually recognize and visit. A landmark like Alumni Hall becomes a visual starting point for understanding campus.",
    shortSubtext:
      "The map turns Western into recognizable places students can visit, not just names in a schedule.",
    targetSelector: '[data-demo-poi="alumni_hall"]',
    screenKey: "map-initial",
    fixedSlot: "middle-left",
  },
  {
    id: "map-simulate",
    number: 3,
    title: "Simulate a student journey",
    subtext:
      "Tap 'Simulate Walk' to preview a student traveling from Perth Hall to ACEB. This shows how the map can guide movement from residence to a meaningful campus stop.",
    shortSubtext:
      "Tap 'Simulate Walk' to preview a student route from Perth Hall to ACEB.",
    targetSelector: '[data-demo-target="simulate-walk"]',
    screenKey: "map-initial",
    fixedSlot: "bottom-left",
  },

  // ── Map: Alumni Hall detail panel ─────────────────────────────────────
  {
    id: "alumni-close",
    number: 2,
    title: "Start with a recognizable landmark",
    subtext:
      "Alumni Hall shows how the map turns Western into real places students can recognize, not just building names in a schedule. Close this stop, then tap Simulate Walk.",
    shortSubtext:
      "Alumni Hall introduces the map as a recognizable campus guide. Close this stop, then tap Simulate Walk.",
    targetSelector: '[data-demo-target="alumni-close"]',
    screenKey: "map-alumni-panel",
    fixedSlot: "top-right",
  },

  // ── Map: walking status (fixed middle-left slot, arrow to Walking button) ──
  {
    id: "map-walking-status",
    number: 4,
    title: "Walking from Perth Hall to ACEB",
    subtext:
      "This demo shows how the app could connect a student's residence, schedule, and campus movement into one flow.",
    shortSubtext:
      "The route previews how a student could move from residence to their next important stop.",
    targetSelector: '[data-demo-target="simulate-walk"]',
    screenKey: "map-walking",
    fixedSlot: "middle-left",
  },

  // ── Map: arrived at ACEB ─────────────────────────────────────────────
  {
    id: "map-arrived-aceb",
    number: 4,
    title: "Now open ACEB",
    subtext:
      "Once the student reaches ACEB, they can open the stop to see what the building is, what's happening there, and how Passport connects to campus exploration.",
    shortSubtext:
      "Open ACEB to see building context, upcoming events, and the Passport stamp system.",
    targetSelector: '[data-demo-poi="aceb"]',
    screenKey: "map-arrived",
  },

  // ── ACEB panel: scroll-aware, one callout at a time ─────────────────
  // 5 context · 6 events · 7 nearby · 8 later-today · 9 stamp
  {
    id: "aceb-context",
    number: 5,
    title: "Every stop has context",
    subtext:
      "Opening a building explains what it is and why it matters during OWeek, so first-years are not navigating to unfamiliar names with no context.",
    shortSubtext:
      "Each building has its own context so students understand why it matters.",
    targetSelector: '[data-demo-target="aceb-why"]',
    screenKey: "map-aceb-panel",
  },
  {
    id: "aceb-event",
    number: 6,
    title: "Events connect to places",
    subtext:
      "Students can see what is starting soon at this exact building without jumping between a separate schedule and map.",
    shortSubtext:
      "Students see what is starting soon right at this building.",
    targetSelector: '[data-demo-target="aceb-starting-soon"]',
    screenKey: "map-aceb-panel",
  },
  {
    id: "aceb-nearby",
    number: 7,
    title: "Nearby options stay visible",
    subtext:
      "Students can see what else is happening around them without backing out to search again. Nearby events help them keep moving through OWeek from their current location.",
    shortSubtext:
      "Nearby events help students choose their next stop without leaving the building page.",
    targetSelector: '[data-demo-target="aceb-nearby"]',
    screenKey: "map-aceb-panel",
  },
  {
    id: "aceb-later-today",
    number: 8,
    title: "Plan around this place",
    subtext:
      "Students can also see what is happening at this same location later in the day. This helps them decide whether to come back, save an event, or plan their route around one building.",
    shortSubtext:
      "Later Today shows what is coming up at this same location, so students can plan whether to return.",
    targetSelector: '[data-demo-target="aceb-later-today"]',
    screenKey: "map-aceb-panel",
  },
  {
    id: "aceb-stamp",
    number: 9,
    title: "Passport turns exploration into progress",
    subtext:
      "Movement gets students to the stop. Tapping 'Collect Stamp' confirms the discovery and adds the building to their Passport.",
    shortSubtext:
      "Movement gets students there. Tapping 'Collect Stamp' confirms the discovery.",
    targetSelector: '[data-demo-target="aceb-collect-stamp"]',
    screenKey: "map-aceb-panel",
  },

  // ── ACEB after stamp collected: same 5/6/7/8, plus 9 passport followup ──
  {
    id: "aceb-context-after",
    number: 5,
    title: "Every stop has context",
    subtext:
      "Opening a building explains what it is and why it matters during OWeek, so first-years are not navigating to unfamiliar names with no context.",
    shortSubtext:
      "Each building has its own context so students understand why it matters.",
    targetSelector: '[data-demo-target="aceb-why"]',
    screenKey: "map-aceb-collected",
  },
  {
    id: "aceb-event-after",
    number: 6,
    title: "Events connect to places",
    subtext:
      "Students can see what is starting soon at this exact building without jumping between a separate schedule and map.",
    shortSubtext:
      "Students see what is starting soon right at this building.",
    targetSelector: '[data-demo-target="aceb-starting-soon"]',
    screenKey: "map-aceb-collected",
  },
  {
    id: "aceb-nearby-after",
    number: 7,
    title: "Nearby options stay visible",
    subtext:
      "Students can see what else is happening around them without backing out to search again. Nearby events help them keep moving through OWeek from their current location.",
    shortSubtext:
      "Nearby events help students choose their next stop without leaving the building page.",
    targetSelector: '[data-demo-target="aceb-nearby"]',
    screenKey: "map-aceb-collected",
  },
  {
    id: "aceb-later-today-after",
    number: 8,
    title: "Plan around this place",
    subtext:
      "Students can also see what is happening at this same location later in the day. This helps them decide whether to come back, save an event, or plan their route around one building.",
    shortSubtext:
      "Later Today shows what is coming up at this same location, so students can plan whether to return.",
    targetSelector: '[data-demo-target="aceb-later-today"]',
    screenKey: "map-aceb-collected",
  },
  {
    id: "aceb-passport-followup",
    number: 9,
    title: "Progress carries into Passport",
    subtext:
      "Collected stamps save into Passport, giving students a visual record of where they explored during OWeek.",
    shortSubtext:
      "Collected stamps save into Passport — a visual record of where students explored.",
    targetSelector: 'nav a[href="/passport"]',
    screenKey: "map-aceb-collected",
  },

  // ── Schedule: scroll-aware, one callout at a time ───────────────────
  // Priority order keeps the Science card on top whenever it's visible;
  // when scrolled off, "For Me" or the list fallback takes over.
  {
    id: "schedule-browse",
    number: 1,
    title: "Browse the full schedule",
    subtext:
      "The schedule keeps the familiar OWeek event list students expect, but makes it cleaner to scan by day and time. Students can quickly see what is happening without feeling buried in a messy list.",
    shortSubtext:
      "The familiar OWeek schedule stays, but the layout is cleaner and easier to scan by day and time.",
    targetSelector: '[data-demo-target="schedule-event-list"]',
    screenKey: "schedule",
  },
  {
    id: "schedule-for-me",
    number: 2,
    title: "Filter for you",
    subtext:
      "Students can narrow the schedule based on onboarding choices like faculty and residence, so they do not have to scroll through every event to find what applies to them.",
    shortSubtext:
      "'For Me' filters the schedule around the student's faculty and residence.",
    targetSelector: '[data-demo-target="schedule-for-me"]',
    screenKey: "schedule",
  },
  {
    id: "schedule-science-card",
    number: 3,
    title: "Save or tap for details",
    subtext:
      "Students can bookmark events to build their own agenda, or tap an event card to open deeper details like location, what to know, and media from previous years.",
    shortSubtext:
      "Bookmark events for My Agenda, or tap an event to open details.",
    targetSelector: '[data-demo-target="schedule-science-card"]',
    screenKey: "schedule",
  },

  // ── Schedule: empty My Agenda state ─────────────────────────────────
  // Single callout — the empty state is the only meaningful target here.
  {
    id: "schedule-my-agenda-empty",
    number: 1,
    title: "My Agenda fills as students save events",
    subtext:
      "Students can bookmark events from the full schedule, then come back here to see their personal plan for the day.",
    shortSubtext:
      "Saved events appear here once students bookmark them from the schedule.",
    targetSelector: '[data-demo-target="schedule-my-agenda-empty"]',
    screenKey: "schedule-my-agenda-empty",
  },

  // ── Passport — long-scroll exploration page ─────────────────────────
  // Single-active with priority: as the user scrolls, the active callout
  // swaps to whichever passport section is currently in view.
  {
    id: "passport-progress",
    number: 1,
    title: "Exploration becomes progress",
    subtext:
      "Passport turns campus discovery into visible progress. Students can track the places they have visited and build familiarity with Western throughout OWeek.",
    shortSubtext:
      "Passport turns campus discovery into visible progress students can track throughout OWeek.",
    targetSelector: '[data-demo-target="passport-progress"]',
    screenKey: "passport",
  },
  {
    id: "passport-recently-collected",
    number: 2,
    title: "Collected stamps feel earned",
    subtext:
      "Recently collected stamps give students a visual record of where they have been, turning each campus stop into a small memory from the week.",
    shortSubtext:
      "Recently collected stamps make each campus stop feel remembered and earned.",
    targetSelector: '[data-demo-target="passport-recently-collected"]',
    screenKey: "passport",
  },
  {
    id: "passport-collection",
    number: 3,
    title: "Campus is easier to understand",
    subtext:
      "Collections organize stamps into categories like landmarks, residences, academic buildings, and student life, helping first-years learn Western in a more structured way.",
    shortSubtext:
      "Stamp categories help students understand Western as types of places, not one confusing campus map.",
    targetSelector: '[data-demo-target="passport-collection"]',
    screenKey: "passport",
  },
  {
    id: "passport-milestones",
    number: 4,
    title: "Milestones keep students exploring",
    subtext:
      "Milestones create lightweight motivation to keep discovering new places. Rewards can connect exploration to real OWeek moments without relying on a points-heavy system.",
    shortSubtext:
      "Milestones give students a reason to keep exploring without turning the app into a points-heavy game.",
    targetSelector: '[data-demo-target="passport-milestones"]',
    screenKey: "passport",
  },
  {
    id: "passport-next-stamps",
    number: 5,
    title: "Passport suggests the next move",
    subtext:
      "Next Stamps turns progress into action. Students can see nearby places they have not collected yet, then open the map to keep exploring.",
    shortSubtext:
      "Next Stamps shows nearby uncollected places and connects students back to the map.",
    targetSelector: '[data-demo-target="passport-next-stamps"]',
    screenKey: "passport",
  },
];

export default function DemoPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  // Scale the phone down on viewports shorter than the full composition height.
  // Total needed: 112px top padding + 868px phone + 24px bottom gap = 1004px.
  const [demoScale, setDemoScale] = useState(1);
  useEffect(() => {
    function computeScale() {
      const available = window.innerHeight - 112 - 24;
      setDemoScale(Math.min(1, available / (FRAME_HEIGHT + 24)));
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  function resetDemo() {
    if (typeof window === "undefined") return;
    for (const key of DEMO_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore privacy-mode / quota errors
      }
    }
    setIframeKey((k) => k + 1);
  }

  return (
    <main
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-hidden px-6 pb-6 pt-9"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #2A1340 0%, #15082A 55%, #090014 100%)",
      }}
    >
      {/* Western crest background — real logo, tonal lavender, large and subtle */}
      <img
        src="/western_logo.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: "absolute",
          left: "calc(75% - min(480px, 39vw))",
          right: "auto",
          top: "50%",
          transform: "translateY(-50%)",
          width: "min(960px, 78vw)",
          height: "auto",
          opacity: 0.085,
          filter: "blur(0.3px)",
          pointerEvents: "none",
          zIndex: 0,
          userSelect: "none",
        }}
      />

      <div
        className="flex flex-col items-center"
        style={{ width: FRAME_WIDTH + 24, gap: TITLE_PHONE_GAP }}
      >
        <div className="pointer-events-none z-[220] text-center">
          <span className="flex items-center justify-center gap-4 whitespace-nowrap text-[13px] font-semibold uppercase leading-[20px] tracking-[0.34em] text-[#F5EEFF]/90">
            <span className="text-[#C8B6FF]/65">✦</span>
            OWeek 2026 — Guided Demo
            <span className="text-[#C8B6FF]/65">✦</span>
          </span>
        </div>

        <div
          className="relative rounded-[48px] bg-black p-[12px] shadow-[0_40px_120px_-20px_rgba(157,78,221,0.45),0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
          style={{
            width: FRAME_WIDTH + 24,
            height: FRAME_HEIGHT + 24,
            transformOrigin: "top center",
            transform: demoScale < 1 ? `scale(${demoScale})` : undefined,
          }}
        >
          <div
            className="relative overflow-hidden rounded-[38px] bg-[#090014]"
            style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
          >
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src="/?demo=1"
              title="OWeek 2026 Guided Demo"
              className="block h-full w-full border-0 outline-none focus:outline-none focus-visible:outline-none"
              style={{ border: "none" }}
              allow="geolocation; clipboard-read; clipboard-write"
            />
          </div>

          <div className="absolute bottom-[10px] left-1/2 z-20 h-[5px] w-[130px] -translate-x-1/2 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Reset button — independently anchored top-right */}
      <button
        type="button"
        onClick={resetDemo}
        className="absolute right-6 top-6 z-[220] flex items-center gap-1.5 rounded-full border border-[#C8B6FF]/40 bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-[#E5DBFF]/85 backdrop-blur-sm transition-colors hover:bg-white/5"
        title="Wipes profile + stamps and replays splash + onboarding"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M10 6a4 4 0 1 1-1.07-2.72" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M10 2.5V5.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Reset Demo
      </button>

      <DemoAnnotationOverlay
        iframeRef={iframeRef}
        iframeKey={iframeKey}
        annotations={ANNOTATIONS}
      />

      <DemoScrollCue
        iframeRef={iframeRef}
        iframeKey={iframeKey}
        config={EVENT_DETAIL_CUE}
      />
      <DemoScrollCue
        iframeRef={iframeRef}
        iframeKey={iframeKey}
        config={ACEB_CUE}
      />
      <DemoScrollCue
        iframeRef={iframeRef}
        iframeKey={iframeKey}
        config={PASSPORT_CUE}
      />
    </main>
  );
}
