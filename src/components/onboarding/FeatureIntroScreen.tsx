"use client";

import OnboardingShell from "./OnboardingShell";

interface FeatureIntroScreenProps {
  onFinish: () => void;
  onBack: () => void;
}

/** Tiny inline map preview — purple-tinted abstract street grid + pin. */
function MapPreview() {
  return (
    <div
      className="relative h-16 w-[88px] shrink-0 overflow-hidden rounded-[14px]"
      style={{
        background:
          "linear-gradient(135deg, #3B1A66 0%, #1D0F33 100%)",
        border: "1px solid rgba(210,170,255,0.3)",
      }}
    >
      <svg viewBox="0 0 88 64" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Park / blob */}
        <path d="M2 12 Q 22 4 38 12 Q 50 20 30 28 Q 12 36 6 26 Z" fill="#9D4EDD" opacity="0.18" />
        <path d="M52 38 Q 76 30 86 44 Q 80 60 60 58 Q 46 50 52 38 Z" fill="#9D4EDD" opacity="0.14" />
        {/* Streets */}
        <g stroke="#E9D5FF" strokeWidth="0.6" opacity="0.35" fill="none">
          <path d="M0 22 L88 22" />
          <path d="M0 42 L88 42" />
          <path d="M28 0 L28 64" />
          <path d="M60 0 L60 64" />
        </g>
        {/* Pin */}
        <g transform="translate(52,28)">
          <circle cx="0" cy="0" r="9" fill="#D8B4FE" opacity="0.3" />
          <circle cx="0" cy="0" r="5" fill="#E9D5FF" stroke="#1A0A2E" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

/** Tiny passport visual — open booklet with stamp circles. */
function PassportPreview() {
  return (
    <div
      className="relative h-16 w-[88px] shrink-0 overflow-hidden rounded-[14px]"
      style={{
        background:
          "linear-gradient(135deg, #1D0F33 0%, #2A1340 100%)",
        border: "1px solid rgba(210,170,255,0.3)",
      }}
    >
      <svg viewBox="0 0 88 64" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Booklet pages */}
        <rect x="6" y="10" width="36" height="44" rx="2" fill="#F8F5FF" opacity="0.92" />
        <rect x="46" y="10" width="36" height="44" rx="2" fill="#F8F5FF" opacity="0.92" />
        {/* Spine */}
        <line x1="44" y1="10" x2="44" y2="54" stroke="#1A0A2E" strokeWidth="0.6" opacity="0.4" />
        {/* Stamps */}
        <g>
          <circle cx="15" cy="22" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="29" cy="22" r="5" fill="#9D4EDD" opacity="0.6" />
          <circle cx="15" cy="42" r="5" fill="#9D4EDD" opacity="0.6" />
          <circle cx="29" cy="42" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="55" cy="22" r="5" fill="#9D4EDD" opacity="0.6" />
          <circle cx="69" cy="22" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="55" cy="42" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="69" cy="42" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
        </g>
      </svg>
    </div>
  );
}

/** Tiny event card visual — concert stage silhouette with stage lights. */
function EventPreview() {
  return (
    <div
      className="relative h-16 w-[88px] shrink-0 overflow-hidden rounded-[14px]"
      style={{
        background:
          "linear-gradient(180deg, #2A1340 0%, #10071D 100%)",
        border: "1px solid rgba(210,170,255,0.3)",
      }}
    >
      <svg viewBox="0 0 88 64" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Stage lights */}
        <g fill="#D8B4FE" opacity="0.55">
          <polygon points="22,0 26,0 30,28 18,28" />
          <polygon points="44,0 48,0 52,28 40,28" />
          <polygon points="66,0 70,0 74,28 62,28" />
        </g>
        {/* Crowd silhouette */}
        <g fill="#0A031A">
          <circle cx="14" cy="56" r="6" />
          <circle cx="28" cy="58" r="6" />
          <circle cx="42" cy="55" r="6" />
          <circle cx="56" cy="57" r="6" />
          <circle cx="70" cy="56" r="6" />
          <rect x="0" y="56" width="88" height="10" />
        </g>
        {/* Stage horizon */}
        <rect x="0" y="44" width="88" height="14" fill="#1D0F33" opacity="0.8" />
      </svg>
    </div>
  );
}

export default function FeatureIntroScreen({ onFinish, onBack }: FeatureIntroScreenProps) {
  const cardBase: React.CSSProperties = {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.04) 100%)",
    border: "1px solid rgba(210,170,255,0.22)",
    boxShadow:
      "0 18px 44px rgba(10,4,25,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 28px -8px rgba(157,78,221,0.18)",
    backdropFilter: "blur(14px)",
  };

  return (
    <OnboardingShell
      step={3}
      footer={
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onFinish}
            className="w-full rounded-2xl py-[18px] text-[15px] font-semibold tracking-tight text-[#1A0A2E] transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(180deg, #E9D5FF 0%, #D8B4FE 100%)",
              boxShadow:
                "0 12px 32px -8px rgba(157,78,221,0.55), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium text-[#CFC4DD] transition-colors hover:text-white"
          >
            Back
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5">
        {/* Card 1: Campus Map */}
        <div
          className="oweek-fade-in flex items-center gap-3.5 rounded-[20px] p-3.5"
          style={{ ...cardBase, animationDelay: "0ms" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[15.5px] font-semibold tracking-tight text-[#F8F5FF]">
              Campus Map
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-[#CFC4DD]">
              Find your way around Western.
            </p>
          </div>
          <MapPreview />
        </div>

        {/* Card 2: My Passport (with stamp progress) */}
        <div
          className="oweek-fade-in flex items-center gap-3.5 rounded-[20px] p-3.5"
          style={{ ...cardBase, animationDelay: "90ms" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[15.5px] font-semibold tracking-tight text-[#F8F5FF]">
              My Passport
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-[#CFC4DD]">
              Collect building stamps as you explore campus!
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#CFC4DD]">6 / 20 stamps</span>
              <div className="h-1 flex-1 max-w-[80px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "30%",
                    background:
                      "linear-gradient(90deg, #D8B4FE 0%, #9D4EDD 100%)",
                    boxShadow: "0 0 8px rgba(157,78,221,0.6)",
                  }}
                />
              </div>
            </div>
          </div>
          <PassportPreview />
        </div>

        {/* Card 3: Event Schedule */}
        <div
          className="oweek-fade-in flex items-center gap-3.5 rounded-[20px] p-3.5"
          style={{ ...cardBase, animationDelay: "180ms" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[15.5px] font-semibold tracking-tight text-[#F8F5FF]">
              Event Schedule
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-[#CFC4DD]">
              See what&apos;s happening each day of OWeek.
            </p>
          </div>
          <EventPreview />
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2
          className="text-[34px] leading-[1.05] tracking-tight text-[#F8F5FF]"
          style={{
            fontFamily:
              "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            fontWeight: 500,
          }}
        >
          Explore, Collect,
          <br />
          and Go
        </h2>
        <p className="mx-auto mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-[#CFC4DD]">
          Use the campus map, check the event schedule, and collect building stamps as you experience OWeek.
        </p>
      </div>
    </OnboardingShell>
  );
}
