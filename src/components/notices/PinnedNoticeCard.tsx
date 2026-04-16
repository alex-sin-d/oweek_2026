"use client";

import type { Ref } from "react";
import type { NoticeItem } from "@/data/notices";

interface PinnedNoticeCardProps {
  notice: NoticeItem;
  onViewEvent: () => void;
  cardRef?: Ref<HTMLDivElement>;
  buttonRef?: Ref<HTMLButtonElement>;
}

export default function PinnedNoticeCard({
  notice,
  onViewEvent,
  cardRef,
  buttonRef,
}: PinnedNoticeCardProps) {
  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(248,243,252,0.98)_0%,rgba(238,231,246,0.98)_100%)] px-5 pb-5 pt-4 shadow-[0_26px_52px_rgba(79,45,127,0.12)] ring-1 ring-white/85"
    >
      <ScienceNoticeBackdrop />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#8752d9_0%,#6a39b9_100%)] px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_12px_26px_rgba(89,52,145,0.26)]">
          <PinIcon />
          Pinned
        </span>

        <div className="mt-4 max-w-[16ch]">
          <h2 className="text-[19px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#201730]">
            <span className="font-[750]">{`[${notice.category}] `}</span>
            <span>{notice.title}</span>
          </h2>
        </div>

        <div className="mt-4 space-y-2 text-[15px] leading-[1.35] text-[#4f4562]">
          <div className="flex items-center gap-2">
            <MetaIcon type="location" />
            <span>{notice.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <MetaIcon type="time" />
            <span>{notice.schedule}</span>
          </div>
        </div>

        <p className="mt-3 text-[15px] font-semibold tracking-[-0.01em] text-[#6636ae]">
          {notice.urgency}
        </p>

        <button
          ref={buttonRef}
          type="button"
          onClick={onViewEvent}
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] px-5 py-3 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_18px_34px_rgba(79,45,127,0.24)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
        >
          {notice.actionLabel}
        </button>
      </div>
    </div>
  );
}

function ScienceNoticeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden text-[#7d69a5]/24"
    >
      <div className="absolute -left-6 bottom-0 h-14 w-36 rounded-tr-[44px] bg-[#cdc1de]/55" />
      <div className="absolute left-14 bottom-0 h-12 w-28 rounded-tl-[32px] rounded-tr-[40px] bg-[#d8d0e4]/58" />
      <div className="absolute left-32 bottom-0 h-10 w-20 rounded-tl-[28px] rounded-tr-[32px] bg-[#cfc4de]/52" />
      <div className="absolute right-16 bottom-0 h-12 w-24 rounded-tl-[34px] rounded-tr-[34px] bg-[#d3c9e2]/52" />
      <div className="absolute right-0 bottom-0 h-14 w-28 rounded-tl-[48px] bg-[#c8bdd9]/54" />

      <div className="absolute right-5 top-5 rotate-[8deg]">
        <FlaskIcon className="h-12 w-12" />
      </div>
      <div className="absolute right-12 top-24 rotate-[-16deg]">
        <FlaskIcon className="h-10 w-10" />
      </div>
      <div className="absolute left-[58%] top-3 rotate-[8deg]">
        <DnaIcon className="h-12 w-12" />
      </div>
      <div className="absolute right-8 bottom-4">
        <TelescopeIcon className="h-16 w-16" />
      </div>
      <div className="absolute left-2 bottom-8">
        <MountainIcon className="h-20 w-24" />
      </div>
    </div>
  );
}

function MetaIcon({ type }: { type: "time" | "location" }) {
  if (type === "time") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-[18px] w-[18px] shrink-0 text-[#7d699f]"
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 7.5v5l3.5 2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-[18px] w-[18px] shrink-0 text-[#7d699f]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-3.5 w-3.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14 4 6 6-2.5.7-3 3L15 20l-3-3-3 3-.3-.3 3-3-6-6 4.2-1.4L11 4h3Z"
      />
    </svg>
  );
}

function DnaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className}>
      <path strokeLinecap="round" d="M7 3c0 4.5 10 4.5 10 9s-10 4.5-10 9" />
      <path strokeLinecap="round" d="M17 3c0 4.5-10 4.5-10 9s10 4.5 10 9" />
      <path strokeLinecap="round" d="M8.8 6.3h6.4M8.8 11.9h6.4M8.8 17.5h6.4" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3h4M10 3v4l-4.7 8.5A3 3 0 0 0 7.9 20h8.2a3 3 0 0 0 2.6-4.5L14 7V3" />
      <path strokeLinecap="round" d="M8.7 14.8h6.6" />
    </svg>
  );
}

function TelescopeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 14 7.5-5 3 4.2L7 18l-3-4Z" />
      <path strokeLinecap="round" d="m14.5 13.2 3-1.8 2.5 3.7-3 1.8" />
      <path strokeLinecap="round" d="M10 17.5 8.7 21M14.3 15.1 16 21M7.5 21h9" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2 20h20l-4.4-6.4-2.6 3.2L10.3 10 2 20Z" />
    </svg>
  );
}
