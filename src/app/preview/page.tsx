"use client";

import { useState } from "react";

const FRAME_WIDTH = 390;
const FRAME_HEIGHT = 844;

export default function PreviewPage() {
  // Bumping `iframeKey` remounts the iframe — useful for "reset / replay
  // onboarding" during a live demo without reloading the host page.
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <main
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-auto p-6"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #2A1340 0%, #15082A 55%, #090014 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* iPhone-style frame */}
        <div
          className="relative rounded-[48px] bg-black p-[12px] shadow-[0_40px_120px_-20px_rgba(157,78,221,0.45),0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
          style={{ width: FRAME_WIDTH + 24, height: FRAME_HEIGHT + 24 }}
        >
          {/* Screen — no Dynamic Island so the greeting / status area
              isn't covered. */}
          <div
            className="relative overflow-hidden rounded-[38px] bg-[#090014]"
            style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
          >
            <iframe
              key={iframeKey}
              src="/"
              title="OWeek 2026 App Preview"
              className="block h-full w-full border-0 outline-none focus:outline-none focus-visible:outline-none"
              style={{ border: "none" }}
              allow="geolocation; clipboard-read; clipboard-write"
            />
          </div>

          {/* Home indicator — sits in the bottom bezel, below the screen,
              so it never overlaps content. */}
          <div className="absolute bottom-[10px] left-1/2 z-20 h-[5px] w-[130px] -translate-x-1/2 rounded-full bg-white/80" />
        </div>

        {/* Demo controls (host-page only, never reaches the iframe) */}
        <div className="flex items-center gap-3 text-[12px] text-white/65">
          <span className="font-medium tracking-[0.18em] uppercase text-white/45">
            Demo preview
          </span>
          <span className="h-3 w-px bg-white/20" />
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            Reset iframe
          </button>
        </div>
      </div>
    </main>
  );
}
