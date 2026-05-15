"use client";

import OnboardingShell from "./OnboardingShell";

interface FeatureIntroScreenProps {
  onFinish: () => void;
  onBack: () => void;
}

/** Compact map preview — purple street grid with park blobs and a glowing pin. */
function MapPreview() {
  return (
    <div
      className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-[16px]"
      style={{
        background:
          "linear-gradient(135deg, #3B1A66 0%, #1D0F33 100%)",
        border: "1px solid rgba(197,142,255,0.32)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 22px -10px rgba(10,4,25,0.7)",
      }}
    >
      <svg viewBox="0 0 88 72" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="map-pin-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D8B4FE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Land blobs */}
        <path d="M2 14 Q 22 4 38 14 Q 50 22 30 30 Q 12 38 6 28 Z" fill="#9D4EDD" opacity="0.22" />
        <path d="M52 44 Q 76 36 86 50 Q 80 66 60 64 Q 46 56 52 44 Z" fill="#9D4EDD" opacity="0.18" />
        {/* Streets */}
        <g stroke="#E9D5FF" strokeWidth="0.6" opacity="0.4" fill="none">
          <path d="M0 22 L88 22" />
          <path d="M0 46 L88 46" />
          <path d="M28 0 L28 72" />
          <path d="M60 0 L60 72" />
        </g>
        {/* Pin with glow */}
        <g transform="translate(52,32)">
          <circle cx="0" cy="0" r="12" fill="url(#map-pin-glow)" />
          <circle cx="0" cy="0" r="5" fill="#E9D5FF" stroke="#1A0A2E" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="1.6" fill="#5B2A8F" />
        </g>
      </svg>
    </div>
  );
}

/** Open-passport visual — booklet pages with stamp circles. */
function PassportPreview() {
  return (
    <div
      className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-[16px]"
      style={{
        background:
          "linear-gradient(135deg, #1D0F33 0%, #2A1340 100%)",
        border: "1px solid rgba(197,142,255,0.32)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 22px -10px rgba(10,4,25,0.7)",
      }}
    >
      <svg viewBox="0 0 88 72" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="page" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFAFF" />
            <stop offset="100%" stopColor="#E5DBFF" />
          </linearGradient>
        </defs>
        <rect x="6" y="12" width="36" height="48" rx="2.5" fill="url(#page)" />
        <rect x="46" y="12" width="36" height="48" rx="2.5" fill="url(#page)" />
        <line x1="44" y1="12" x2="44" y2="60" stroke="#1A0A2E" strokeWidth="0.6" opacity="0.45" />
        <g>
          <circle cx="15" cy="24" r="5" fill="#9D4EDD" opacity="0.65" />
          <circle cx="29" cy="24" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="15" cy="46" r="5" fill="#9D4EDD" opacity="0.65" />
          <circle cx="29" cy="46" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="55" cy="24" r="5" fill="#9D4EDD" opacity="0.65" />
          <circle cx="69" cy="24" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="55" cy="46" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
          <circle cx="69" cy="46" r="5" fill="none" stroke="#9D4EDD" strokeWidth="1.2" strokeDasharray="2 1.5" />
        </g>
      </svg>
    </div>
  );
}

/** Concert/stage event preview — silhouette crowd, stage lights, glowing horizon. */
function EventPreview() {
  return (
    <div
      className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-[16px]"
      style={{
        background:
          "linear-gradient(180deg, #2A1340 0%, #10071D 100%)",
        border: "1px solid rgba(197,142,255,0.32)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 22px -10px rgba(10,4,25,0.7)",
      }}
    >
      <svg viewBox="0 0 88 72" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="stage-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Stage light beams */}
        <g fill="url(#stage-beam)">
          <polygon points="22,0 26,0 32,38 16,38" />
          <polygon points="44,0 48,0 54,38 38,38" />
          <polygon points="66,0 70,0 76,38 60,38" />
        </g>
        {/* Stage horizon glow */}
        <rect x="0" y="44" width="88" height="14" fill="#5B2A8F" opacity="0.45" />
        <rect x="0" y="50" width="88" height="3" fill="#D8B4FE" opacity="0.6" />
        {/* Crowd silhouette */}
        <g fill="#08021A">
          <circle cx="10" cy="62" r="7" />
          <circle cx="22" cy="64" r="7" />
          <circle cx="34" cy="61" r="7" />
          <circle cx="46" cy="63" r="7" />
          <circle cx="58" cy="62" r="7" />
          <circle cx="70" cy="64" r="7" />
          <circle cx="82" cy="62" r="7" />
          <rect x="0" y="62" width="88" height="12" />
        </g>
      </svg>
    </div>
  );
}

const CARD_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(45,24,75,0.78) 0%, rgba(28,14,52,0.7) 100%)",
  border: "1px solid rgba(197,142,255,0.25)",
  boxShadow:
    "0 22px 48px rgba(10,4,25,0.55), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 32px -10px rgba(157,78,221,0.22)",
  backdropFilter: "blur(14px)",
};

export default function FeatureIntroScreen({ onFinish, onBack }: FeatureIntroScreenProps) {
  return (
    <OnboardingShell
      step={3}
      footer={
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onFinish}
            className="w-full rounded-[20px] py-[18px] text-[15px] font-bold tracking-tight text-[#1A0A2E] transition-transform active:scale-[0.985]"
            style={{
              background:
                "linear-gradient(180deg, #EFE2FF 0%, #D8B4FE 60%, #C8A3F9 100%)",
              boxShadow:
                "0 16px 36px -10px rgba(157,78,221,0.6), 0 0 24px -8px rgba(200,182,255,0.55), inset 0 1px 0 rgba(255,255,255,0.75)",
            }}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium tracking-tight text-[#CFC4DD] transition-colors hover:text-white"
          >
            Back
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Card 1: Campus Map */}
        <div
          className="oweek-fade-in flex items-center gap-4 rounded-[22px] p-4"
          style={{ ...CARD_STYLE, animationDelay: "0ms" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold tracking-tight text-[#F8F5FF]">
              Campus Map
            </h3>
            <p className="mt-1 text-[13.5px] leading-snug text-[#D8CDEC]">
              Find your way around Western.
            </p>
          </div>
          <MapPreview />
        </div>

        {/* Card 2: My Passport with stamp progress */}
        <div
          className="oweek-fade-in flex items-center gap-4 rounded-[22px] p-4"
          style={{ ...CARD_STYLE, animationDelay: "90ms" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold tracking-tight text-[#F8F5FF]">
              My Passport
            </h3>
            <p className="mt-1 text-[13.5px] leading-snug text-[#D8CDEC]">
              Collect building stamps as you explore campus!
            </p>
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="text-[12px] font-medium text-[#D8CDEC]">
                6 / 20 stamps
              </span>
              <div className="h-1.5 flex-1 max-w-[88px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "30%",
                    background:
                      "linear-gradient(90deg, #E9D5FF 0%, #9D4EDD 100%)",
                    boxShadow: "0 0 10px rgba(157,78,221,0.7)",
                  }}
                />
              </div>
            </div>
          </div>
          <PassportPreview />
        </div>

        {/* Card 3: Event Schedule */}
        <div
          className="oweek-fade-in flex items-center gap-4 rounded-[22px] p-4"
          style={{ ...CARD_STYLE, animationDelay: "180ms" }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-semibold tracking-tight text-[#F8F5FF]">
              Event Schedule
            </h3>
            <p className="mt-1 text-[13.5px] leading-snug text-[#D8CDEC]">
              See what&apos;s happening each day of OWeek.
            </p>
          </div>
          <EventPreview />
        </div>
      </div>

      <div className="mt-9 text-center">
        <h2
          className="text-[36px] leading-[1.02] tracking-tight text-[#F8F5FF]"
          style={{
            fontFamily:
              "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            textShadow: "0 6px 24px rgba(157,78,221,0.18)",
          }}
        >
          Explore, Collect,
          <br />
          and Go
        </h2>
        <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-[#D8CDEC]">
          Use the campus map, check the event schedule, and collect building stamps as you experience OWeek.
        </p>
      </div>
    </OnboardingShell>
  );
}
