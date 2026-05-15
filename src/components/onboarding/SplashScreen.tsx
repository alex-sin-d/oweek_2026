"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import oweekLogo from "@/design/images/oweek_logo.png";

interface SplashScreenProps {
  /**
   * Called when the splash has finished (min time elapsed AND
   * preload promise settled).
   */
  onDone: () => void;
}

const MIN_SPLASH_MS = 1800;

function preloadCoreData(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.resolve();
  const tasks: Promise<unknown>[] = [];
  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    tasks.push(document.fonts.ready);
  }
  tasks.push(new Promise((res) => setTimeout(res, 600)));
  return Promise.allSettled(tasks);
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    void preloadCoreData().then(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => {
        if (cancelled) return;
        setExiting(true);
        setTimeout(() => {
          if (!cancelled) onDone();
        }, 280);
      }, remaining);
    });
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(130% 90% at 50% 0%, #3A1A66 0%, #1D0F33 38%, #170B2B 70%, #10071D 100%)",
      }}
      aria-hidden={exiting}
    >
      {/* Optional tower photograph — fades in if `/splash/oweek-tower.jpg` is present. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/splash/oweek-tower.jpg"
        alt=""
        aria-hidden="true"
        onLoad={() => setHeroLoaded(true)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          heroLoaded ? "opacity-55" : "opacity-0"
        }`}
      />

      {/* CSS-only fallback: an inline tower silhouette so the screen never looks empty. */}
      {!heroLoaded && (
        <svg
          aria-hidden="true"
          viewBox="0 0 390 844"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B1A66" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#2A1340" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0A031A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B0833" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0A0218" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="20%" r="50%">
              <stop offset="0%" stopColor="#C8B6FF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C8B6FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="390" height="844" fill="url(#sky)" />
          <circle cx="195" cy="180" r="240" fill="url(#glow)" />

          {/* Decorative leaves left */}
          <g opacity="0.35" fill="none" stroke="#C8B6FF" strokeWidth="1">
            <path d="M-20 120 q 60 -10 100 30 q -60 -5 -100 -30 Z" />
            <path d="M0 200 q 80 -20 130 30 q -75 -8 -130 -30 Z" />
            <path d="M-10 280 q 70 -15 110 25 q -65 -7 -110 -25 Z" />
          </g>
          {/* Decorative leaves right */}
          <g opacity="0.35" fill="none" stroke="#C8B6FF" strokeWidth="1">
            <path d="M410 130 q -60 -10 -100 30 q 60 -5 100 -30 Z" />
            <path d="M390 210 q -80 -20 -130 30 q 75 -8 130 -30 Z" />
            <path d="M400 290 q -70 -15 -110 25 q 65 -7 110 -25 Z" />
          </g>

          {/* University College tower silhouette, centered */}
          <g fill="url(#tower)">
            {/* base */}
            <rect x="130" y="500" width="130" height="220" />
            {/* lower roof */}
            <polygon points="125,500 265,500 245,470 145,470" />
            {/* mid section */}
            <rect x="160" y="380" width="70" height="90" />
            <polygon points="155,380 235,380 220,360 170,360" />
            {/* upper tower */}
            <rect x="175" y="240" width="40" height="120" />
            <polygon points="170,240 220,240 220,220 170,220" />
            {/* spire */}
            <polygon points="170,220 220,220 195,150" />
            {/* small windows (cutouts as lighter overlay) */}
          </g>
          <g fill="#C8B6FF" opacity="0.22">
            <rect x="184" y="270" width="4" height="10" rx="1" />
            <rect x="202" y="270" width="4" height="10" rx="1" />
            <rect x="184" y="295" width="4" height="10" rx="1" />
            <rect x="202" y="295" width="4" height="10" rx="1" />
            <rect x="170" y="400" width="6" height="12" rx="1" />
            <rect x="186" y="400" width="6" height="12" rx="1" />
            <rect x="202" y="400" width="6" height="12" rx="1" />
            <rect x="218" y="400" width="6" height="12" rx="1" />
            <rect x="142" y="540" width="6" height="14" rx="1" />
            <rect x="158" y="540" width="6" height="14" rx="1" />
            <rect x="174" y="540" width="6" height="14" rx="1" />
            <rect x="210" y="540" width="6" height="14" rx="1" />
            <rect x="226" y="540" width="6" height="14" rx="1" />
            <rect x="242" y="540" width="6" height="14" rx="1" />
          </g>
        </svg>
      )}

      {/* Vignette overlay so the title pops on any background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#1A0A2E]/35 to-[#08021A]/95" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 pb-14 pt-16 text-white">
        {/* Logo shield */}
        <div className="oweek-fade-in flex w-full flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/12 p-2 ring-1 ring-white/25 backdrop-blur-sm">
            <Image
              src={oweekLogo}
              alt="OWeek 2026"
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Title block — drives the visual brand */}
        <div
          className="oweek-fade-in flex flex-col items-center text-center"
          style={{ animationDelay: "120ms" }}
        >
          <h1
            className="leading-[0.92] tracking-tight"
            style={{
              fontSize: "82px",
              fontFamily:
                "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
              fontWeight: 500,
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F8F5FF 50%, #E9D5FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 6px 28px rgba(200,182,255,0.45))",
              letterSpacing: "-0.02em",
            }}
          >
            OWEEK
            <br />
            2026
          </h1>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F8F5FF]/85">
            Welcome to the
            <br />
            best week of the year
          </p>
        </div>

        {/* Loading + branding lockup */}
        <div className="oweek-fade-in w-full" style={{ animationDelay: "240ms" }}>
          <div className="mx-auto mb-3 h-[3px] w-44 overflow-hidden rounded-full bg-white/15">
            <div className="oweek-splash-bar h-full rounded-full bg-[var(--lavender-accent)] shadow-[0_0_18px_rgba(200,182,255,0.7)]" />
          </div>
          <p className="mb-7 text-center text-[11px] font-medium tracking-[0.22em] text-white/70 uppercase">
            Loading…
          </p>

          <div className="flex items-center justify-center gap-5 opacity-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 text-[9px] font-bold text-white/90">
              USC
            </div>
            <span className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-serif italic text-white/95 leading-none">
                Western
              </span>
              <span className="text-[var(--lavender-accent)] text-[14px]">◆</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
