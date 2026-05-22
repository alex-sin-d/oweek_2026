"use client";

import { useEffect, useRef, useState } from "react";
import DemoAnnotationOverlay, {
  type DemoAnnotation,
} from "@/components/demo/DemoAnnotationOverlay";
import EventDetailScrollCue from "@/components/demo/EventDetailScrollCue";

const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 844;

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

  // ── ACEB panel: building context, events, nearby, stamp ─────────────
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
      "Students can also see what else is happening nearby, making it easier to choose their next stop without backing out and searching again.",
    shortSubtext:
      "Nearby activity keeps exploration going without backing out.",
    targetSelector: '[data-demo-target="aceb-nearby"]',
    screenKey: "map-aceb-panel",
  },
  {
    id: "aceb-stamp",
    number: 8,
    title: "Passport turns exploration into progress",
    subtext:
      "Movement gets students to the stop. Tapping 'Collect Stamp' confirms the discovery and adds the building to their Passport.",
    shortSubtext:
      "Movement gets students there. Tapping 'Collect Stamp' confirms the discovery.",
    targetSelector: '[data-demo-target="aceb-collect-stamp"]',
    screenKey: "map-aceb-panel",
  },

  // ── ACEB panel after stamp collected: context, events, nearby + passport ──
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
      "Students can also see what else is happening nearby, making it easier to choose their next stop without backing out and searching again.",
    shortSubtext:
      "Nearby activity keeps exploration going without backing out.",
    targetSelector: '[data-demo-target="aceb-nearby"]',
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
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-hidden px-6 pb-6 pt-[112px]"
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
        className="flex flex-col items-center gap-6"
        style={{
          transformOrigin: "top center",
          transform: demoScale < 1 ? `scale(${demoScale})` : undefined,
        }}
      >
        <div
          className="relative rounded-[48px] bg-black p-[12px] shadow-[0_40px_120px_-20px_rgba(157,78,221,0.45),0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
          style={{ width: FRAME_WIDTH + 24, height: FRAME_HEIGHT + 24 }}
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

      {/*
        Centered heading — sits above the phone with optical-balance offset.
        The right-side watermark pulls visual weight rightward, so we nudge the
        heading ~28px left of mathematical center for true optical centering.
      */}
      <div
        className="pointer-events-none absolute top-9 z-[220]"
        style={{ left: "calc(50% - 28px)", transform: "translateX(-50%)" }}
      >
        <span className="flex items-center gap-4 whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.34em] text-[#F5EEFF]/90">
          <span className="text-[#C8B6FF]/65">✦</span>
          OWeek 2026 — Guided Demo
          <span className="text-[#C8B6FF]/65">✦</span>
        </span>
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

      <EventDetailScrollCue iframeRef={iframeRef} iframeKey={iframeKey} />
    </main>
  );
}
