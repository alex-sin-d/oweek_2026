"use client";

import Image, { type StaticImageData } from "next/image";
import OnboardingShell from "./OnboardingShell";
import getInvolvedImage from "@/design/images/get_involved.jpg";
import sciWelcomeImage from "@/design/images/sci_welcome.png";

interface IntroScreenProps {
  onContinue: () => void;
}

type CardDef =
  | {
      kind: "image";
      title: string;
      body: string;
      image: StaticImageData;
      alt: string;
    }
  | {
      kind: "info";
      title: string;
      body: string;
    };

const CARDS: CardDef[] = [
  {
    kind: "image",
    title: "Welcome to Western!",
    body: "Your OWeek adventure starts here.",
    image: getInvolvedImage,
    alt: "Western students gathered at a campus event",
  },
  {
    kind: "image",
    title: "Events & Activities",
    body: "Explore concerts, socials, and campus traditions.",
    image: sciWelcomeImage,
    alt: "Students enjoying a Western OWeek activity",
  },
  {
    kind: "info",
    title: "Get Important Info",
    body: "Schedules, FAQs, and everything you need for a great first week.",
  },
];

function CardVisual({ card }: { card: CardDef }) {
  if (card.kind === "image") {
    return (
      <div
        className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[16px]"
        style={{
          border: "1px solid rgba(210,170,255,0.28)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 22px -10px rgba(10,4,25,0.7)",
        }}
      >
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="72px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A2E]/15 via-transparent to-[#5B2A8F]/25" />
      </div>
    );
  }
  return (
    <div
      className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full"
      style={{
        background:
          "radial-gradient(80% 80% at 30% 25%, #5B2A8F 0%, #2A1340 60%, #170B2B 100%)",
        border: "1px solid rgba(210,170,255,0.45)",
        boxShadow:
          "0 0 26px -4px rgba(157,78,221,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      <span
        className="text-[28px] leading-none text-[#F4ECFF]"
        style={{
          fontFamily:
            "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
          fontWeight: 500,
          fontStyle: "italic",
        }}
      >
        i
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-[#C8B6FF]/35" />
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
      }
    >
      {/* Decorative botanical line art — purely visual */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -left-2 top-[80px] h-32 w-24 opacity-25"
        viewBox="0 0 100 140"
        fill="none"
        stroke="#C8B6FF"
        strokeWidth="0.8"
      >
        <path d="M10 20 Q 30 30 50 20 M10 40 Q 35 50 60 35 M10 60 Q 40 70 70 50 M10 80 Q 45 90 75 65" />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-[80px] h-32 w-24 opacity-25"
        viewBox="0 0 100 140"
        fill="none"
        stroke="#C8B6FF"
        strokeWidth="0.8"
      >
        <path d="M90 20 Q 70 30 50 20 M90 40 Q 65 50 40 35 M90 60 Q 60 70 30 50 M90 80 Q 55 90 25 65" />
      </svg>

      <div className="relative flex flex-col gap-3">
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            className="oweek-fade-in flex items-center gap-4 rounded-[22px] p-4"
            style={{
              animationDelay: `${i * 90}ms`,
              background:
                "linear-gradient(180deg, rgba(45,24,75,0.78) 0%, rgba(28,14,52,0.7) 100%)",
              border: "1px solid rgba(197,142,255,0.25)",
              boxShadow:
                "0 22px 48px rgba(10,4,25,0.55), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 32px -10px rgba(157,78,221,0.22)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[17px] font-semibold tracking-tight text-[#F8F5FF]">
                {card.title}
              </h3>
              <p className="mt-1 text-[13.5px] leading-snug text-[#D8CDEC]">
                {card.body}
              </p>
            </div>
            <CardVisual card={card} />
          </div>
        ))}
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
          Start Your
          <br />
          OWeek Journey
        </h2>
        <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-[#D8CDEC]">
          Discover events, campus traditions, and important first-week info — all in one place.
        </p>
      </div>
    </OnboardingShell>
  );
}
