"use client";

import Image from "next/image";
import OnboardingShell from "./OnboardingShell";
import sciWelcomeImage from "@/design/images/sci_welcome.png";
import yourNextStopImage from "@/design/images/your_next_stop.png";

interface IntroScreenProps {
  onContinue: () => void;
}

const CARDS = [
  {
    title: "Welcome to Western!",
    body: "Your OWeek adventure starts here.",
    image: yourNextStopImage,
    kind: "tower" as const,
  },
  {
    title: "Events & Activities",
    body: "Explore concerts, socials, and campus traditions.",
    image: sciWelcomeImage,
    kind: "people" as const,
  },
  {
    title: "Get Important Info",
    body: "Schedules, FAQs, and everything you need for a great first week.",
    image: null,
    kind: "info" as const,
  },
];

function CardThumbnail({
  image,
  alt,
}: {
  image: typeof sciWelcomeImage | null;
  alt: string;
}) {
  if (image) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] ring-1 ring-[rgba(210,170,255,0.3)]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="56px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A2E]/30 to-[#5B2A8F]/40" />
      </div>
    );
  }
  // Info card: glowing 'i' icon
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3A1A66] to-[#1A0A2E] ring-1 ring-[rgba(210,170,255,0.4)] shadow-[0_0_24px_-2px_rgba(157,78,221,0.55)]">
      <span className="text-2xl font-serif italic text-[#E9D5FF]">i</span>
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#9D4EDD]/40" />
    </div>
  );
}

export default function IntroScreen({ onContinue }: IntroScreenProps) {
  return (
    <OnboardingShell
      step={1}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-2xl py-[18px] text-[15px] font-semibold tracking-tight text-[#1A0A2E] transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(180deg, #E9D5FF 0%, #D8B4FE 100%)",
            boxShadow:
              "0 12px 32px -8px rgba(157,78,221,0.55), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          Continue
        </button>
      }
    >
      {/* Decorative botanical line art (subtle, matches reference vibe) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[120px] h-32 w-24 opacity-30"
        viewBox="0 0 100 140"
        fill="none"
        stroke="#C8B6FF"
        strokeWidth="0.8"
      >
        <path d="M10 20 Q 30 30 50 20 M10 40 Q 35 50 60 35 M10 60 Q 40 70 70 50 M10 80 Q 45 90 75 65" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[120px] h-32 w-24 opacity-30"
        viewBox="0 0 100 140"
        fill="none"
        stroke="#C8B6FF"
        strokeWidth="0.8"
      >
        <path d="M90 20 Q 70 30 50 20 M90 40 Q 65 50 40 35 M90 60 Q 60 70 30 50 M90 80 Q 55 90 25 65" />
      </svg>

      <div className="relative flex flex-col gap-3.5">
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            className="oweek-fade-in flex items-center gap-3.5 rounded-[20px] p-3.5"
            style={{
              animationDelay: `${i * 90}ms`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.04) 100%)",
              border: "1px solid rgba(210,170,255,0.22)",
              boxShadow:
                "0 18px 44px rgba(10,4,25,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 28px -8px rgba(157,78,221,0.18)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[15.5px] font-semibold tracking-tight text-[#F8F5FF]">
                {card.title}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-[#CFC4DD]">
                {card.body}
              </p>
            </div>
            <CardThumbnail image={card.image} alt="" />
          </div>
        ))}
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
          Start Your
          <br />
          OWeek Journey
        </h2>
        <p className="mx-auto mt-3 max-w-[300px] text-[13.5px] leading-relaxed text-[#CFC4DD]">
          Discover events, campus traditions, and important first-week info — all in one place.
        </p>
      </div>
    </OnboardingShell>
  );
}
