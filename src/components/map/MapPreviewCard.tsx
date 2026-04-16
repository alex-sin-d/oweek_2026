"use client";

import Image from "next/image";
import { MapIcon } from "@/components/map/mapIcons";
import type { MapSelectionPreview } from "@/lib/mapPresentation";

interface Props {
  preview: MapSelectionPreview;
  onClose: () => void;
  onOpenDetails: () => void;
}

export default function MapPreviewCard({
  preview,
  onClose,
  onOpenDetails,
}: Props) {
  return (
    <div
      className="absolute inset-x-0 z-30 flex justify-center px-4 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 148px)" }}
    >
      <div className="pointer-events-auto relative w-full max-w-md">
        <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[5px] bg-white shadow-[0_10px_18px_rgba(79,45,127,0.08)] ring-1 ring-white/80" />

        <div className="relative overflow-hidden rounded-[30px] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_30px_48px_rgba(79,45,127,0.14)] ring-1 ring-white/85 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_72%)]" />
          <div className="pointer-events-none absolute -right-8 top-4 h-24 w-24 rounded-full bg-[#eadffd]/70 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close selected location"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eefb] text-[#6941aa] shadow-[0_10px_22px_rgba(79,45,127,0.08)] ring-1 ring-white/80"
          >
            <MapIcon name="close" className="h-4 w-4" />
          </button>

          <div className="relative z-10 flex items-start gap-3 pr-11">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d72b4]">
                {preview.eyebrow}
              </p>
              <h3 className="mt-2 text-[28px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#241836]">
                {preview.title}
              </h3>

              <div className="mt-3 space-y-2 text-[13px] font-medium text-[#65597a]">
                <div className="flex items-center gap-2">
                  <MapIcon name="location" className="h-4 w-4 shrink-0 text-[#7d64a4]" />
                  <span>{preview.locationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapIcon name="time" className="h-4 w-4 shrink-0 text-[#7d64a4]" />
                  <span>{preview.statusText}</span>
                </div>
              </div>
            </div>

            {preview.thumbnail ? (
              <div className="relative h-[108px] w-[96px] shrink-0 overflow-hidden rounded-[22px] shadow-[0_16px_28px_rgba(79,45,127,0.14)] ring-1 ring-white/80">
                <Image
                  src={preview.thumbnail.src}
                  alt={preview.thumbnail.alt}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>

          {preview.summary ? (
            <p className="relative z-10 mt-3 line-clamp-2 text-[13px] leading-5 text-[#605474]">
              {preview.summary}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onOpenDetails}
            className="relative z-10 mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] px-5 py-3 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[0_18px_34px_rgba(79,45,127,0.24)] transition-transform duration-150 active:scale-[0.988]"
          >
            <span>{preview.ctaLabel}</span>
            <MapIcon name="chevron-right" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
