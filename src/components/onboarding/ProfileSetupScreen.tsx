"use client";

import { useState, type ReactElement } from "react";
import OnboardingShell from "./OnboardingShell";
import { FACULTY_TAGS, RESIDENCE_TAGS } from "@/lib/config";

export interface ProfileDraft {
  name: string;
  faculty: (typeof FACULTY_TAGS)[number];
  residence: (typeof RESIDENCE_TAGS)[number];
}

interface ProfileSetupScreenProps {
  onContinue: (draft: ProfileDraft) => void;
  onBack: () => void;
}

// Curated, ordered residence list for the onboarding screen.
// Includes a synthetic "Off-Campus / Commuter" option that maps to no POI
// (residencePoiId left blank in that case). We widen the type to plain
// strings here so the curated labels override the `as const` master list.
interface ResidenceChoice {
  tag: string;
  label: string;
  poiId: string;
}

const OFF_CAMPUS_TAG: ResidenceChoice = {
  tag: "OFFCAMPUS",
  label: "Off-Campus / Commuter",
  poiId: "",
};

function tagBy(tag: string, labelOverride?: string): ResidenceChoice {
  const base = RESIDENCE_TAGS.find((r) => r.tag === tag);
  if (!base) {
    return { tag, label: labelOverride ?? tag, poiId: "" };
  }
  return {
    tag: base.tag,
    label: labelOverride ?? base.label,
    poiId: base.poiId,
  };
}

const RESIDENCE_PICKLIST: ResidenceChoice[] = [
  tagBy("OHALL"),
  tagBy("SAUG", "Saugeen-Maitland Hall"),
  tagBy("MDSYD", "Medway-Sydenham Hall"),
  tagBy("ESSX"),
  tagBy("PERTH"),
  OFF_CAMPUS_TAG,
];

const FACULTY_PICKLIST = FACULTY_TAGS.filter((f) =>
  ["SCI", "SS", "ENG", "HELSC", "ARTS", "FIMS", "MUSIC"].includes(f.tag),
);

const FACULTY_ICONS: Record<string, ReactElement> = {
  SCI: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M10 3v6.5L5 19a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9.5V3" />
    </svg>
  ),
  ENG: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
  SS: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 1 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-9 9a4 4 0 0 1 6-3.5M21 20a4 4 0 0 0-6-3.5" />
    </svg>
  ),
  HELSC: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s-8-5-8-12a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 7-8 12-8 12Z" />
    </svg>
  ),
  ARTS: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Zm0 0A2.5 2.5 0 0 0 6.5 22H20" />
    </svg>
  ),
  FIMS: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" d="M7 9h10M7 13h6" />
    </svg>
  ),
  MUSIC: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
};

const HouseIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" />
  </svg>
);

const CheckCircleIcon = (
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9D4EDD] shadow-[0_0_12px_rgba(157,78,221,0.7)]">
    <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 7" />
    </svg>
  </span>
);

const cardBase: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.035) 100%)",
  border: "1px solid rgba(210,170,255,0.22)",
  boxShadow:
    "0 12px 32px rgba(10,4,25,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const cardSelected: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(157,78,221,0.22) 0%, rgba(157,78,221,0.08) 100%)",
  border: "1px solid rgba(216,180,254,0.7)",
  boxShadow:
    "0 0 0 1px rgba(216,180,254,0.4), 0 0 28px -4px rgba(157,78,221,0.55), inset 0 1px 0 rgba(255,255,255,0.1)",
};

export default function ProfileSetupScreen({ onContinue, onBack }: ProfileSetupScreenProps) {
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState<(typeof FACULTY_TAGS)[number] | null>(null);
  const [residence, setResidence] = useState<ResidenceChoice | null>(null);

  const canContinue =
    name.trim().length > 0 && faculty !== null && residence !== null;

  function submit() {
    if (!canContinue || !faculty || !residence) return;
    // For Off-Campus we still store a profile — just with an empty poiId.
    onContinue({
      name: name.trim(),
      faculty,
      // The downstream consumer reads tag/label/poiId — a widened object is fine.
      residence: residence as unknown as (typeof RESIDENCE_TAGS)[number],
    });
  }

  return (
    <OnboardingShell
      step={2}
      footer={
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={!canContinue}
            className="w-full rounded-2xl py-[18px] text-[15px] font-semibold tracking-tight transition-transform active:scale-[0.98]"
            style={{
              background: canContinue
                ? "linear-gradient(180deg, #E9D5FF 0%, #D8B4FE 100%)"
                : "rgba(216,180,254,0.18)",
              color: canContinue ? "#1A0A2E" : "rgba(248,245,255,0.4)",
              boxShadow: canContinue
                ? "0 12px 32px -8px rgba(157,78,221,0.55), inset 0 1px 0 rgba(255,255,255,0.7)"
                : "none",
              cursor: canContinue ? "pointer" : "not-allowed",
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
      <div>
        <h2
          className="text-[28px] leading-[1.1] tracking-tight text-[#F8F5FF]"
          style={{
            fontFamily:
              "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            fontWeight: 500,
          }}
        >
          Let&apos;s get to know you!
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#CFC4DD]">
          Your info helps us personalize your OWeek experience.
        </p>
      </div>

      {/* Name */}
      <div className="mt-7">
        <label
          htmlFor="oweek-name"
          className="text-[13px] font-medium text-[#CFC4DD]"
        >
          What&apos;s your name?
        </label>
        <div className="relative mt-2">
          <input
            id="oweek-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="given-name"
            placeholder="e.g. Alex"
            className="w-full rounded-2xl px-4 py-[14px] pr-11 text-[15px] text-[#F8F5FF] outline-none transition-colors placeholder:text-[#CFC4DD]/45"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(210,170,255,0.25)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(216,180,254,0.7)";
              e.currentTarget.style.boxShadow =
                "0 0 0 4px rgba(157,78,221,0.18), inset 0 1px 0 rgba(255,255,255,0.06)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(210,170,255,0.25)";
              e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.04)";
            }}
          />
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CFC4DD]/65"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="12" cy="8" r="4" />
            <path strokeLinecap="round" d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </div>
      </div>

      {/* Faculty */}
      <div className="mt-6">
        <p className="text-[13px] font-medium text-[#CFC4DD]">
          What&apos;s your faculty or major?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {FACULTY_PICKLIST.map((f) => {
            const selected = faculty?.tag === f.tag;
            return (
              <button
                key={f.tag}
                type="button"
                onClick={() => setFaculty(f)}
                className="relative flex items-center gap-2 rounded-2xl px-3.5 py-3 text-left text-[13px] font-medium text-[#F8F5FF] transition-all"
                style={selected ? cardSelected : cardBase}
              >
                <span className="text-[#D8B4FE]">
                  {FACULTY_ICONS[f.tag] ?? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </span>
                <span className="truncate">{f.label}</span>
                {selected && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {CheckCircleIcon}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Residence — stacked full-width, per the reference */}
      <div className="mt-6">
        <p className="text-[13px] font-medium text-[#CFC4DD]">
          Where are you living?
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          {RESIDENCE_PICKLIST.map((r) => {
            const selected = residence?.tag === r.tag;
            return (
              <button
                key={r.tag}
                type="button"
                onClick={() => setResidence(r)}
                className="relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[14px] font-medium text-[#F8F5FF] transition-all"
                style={selected ? cardSelected : cardBase}
              >
                <span className="text-[#D8B4FE]">{HouseIcon}</span>
                <span className="flex-1 truncate">{r.label}</span>
                {selected && CheckCircleIcon}
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingShell>
  );
}
