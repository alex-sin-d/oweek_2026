"use client";

import Image from "next/image";
import PlaceholderStampArtwork from "@/components/passport/PlaceholderStampArtwork";
import type { PassportStampDefinition, PassportTileState } from "@/data/passport";
import { getStampImage } from "@/lib/stampImages";

interface StampImageTileProps {
  definition: PassportStampDefinition;
  state: PassportTileState;
  size?: "sm" | "md" | "lg" | "hero";
  showLock?: boolean;
}

/**
 * Stamp badges are landscape ovals (~2:1 ratio). Containers that match that
 * shape let object-contain fill the frame; square containers waste ~50% of
 * the space with letterbox gaps.
 */
const SIZE_CLASSES: Record<NonNullable<StampImageTileProps["size"]>, string> = {
  sm:   "h-[44px] w-[84px]",   // small tiles in Next Stamps row
  md:   "h-[56px] w-[108px]",  // category card tiles
  lg:   "h-[68px] w-[128px]",  // larger tiles
  hero: "h-[80px] w-[152px]",  // standalone hero (beside text)
};

const PX_SIZE: Record<NonNullable<StampImageTileProps["size"]>, number> = {
  sm:   128,
  md:   256,
  lg:   256,
  hero: 512,
};

export default function StampImageTile({
  definition,
  state,
  size = "md",
  showLock = true,
}: StampImageTileProps) {
  const src = getStampImage(definition.poiId);
  const isLocked = state === "locked";
  const isNew = state === "new";
  const px = PX_SIZE[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]}`}
      aria-label={`${definition.name} ${state}`}
    >
      {src ? (
        <Image
          src={src}
          alt={definition.name}
          width={px}
          height={px}
          unoptimized
          className="h-full w-full object-contain transition-[filter,opacity] duration-200"
          style={
            isLocked
              ? { filter: "saturate(0.15) brightness(0.92)", opacity: 0.7 }
              : undefined
          }
        />
      ) : isLocked ? (
        // Unfinished location: dark silhouette — intentionally locked/unrevealed
        <div className="h-full w-full rounded-xl bg-gray-900/[0.13] ring-1 ring-inset ring-gray-700/[0.08]" />
      ) : (
        <div className="h-full w-full">
          <PlaceholderStampArtwork
            definition={definition}
            state={state}
            variant="preview"
          />
        </div>
      )}

      {isLocked && showLock && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
            src
              ? "bg-[rgba(79,29,150,0.12)] text-[rgba(79,29,150,0.78)] ring-1 ring-[rgba(79,29,150,0.22)]"
              : "bg-[rgba(60,40,90,0.1)] text-[rgba(60,40,90,0.55)] ring-1 ring-[rgba(60,40,90,0.18)]"
          }`}>
            <LockGlyph />
          </span>
        </span>
      )}

      {isNew && (
        <span className="absolute -right-1 -top-1 rounded-full bg-[#4F2D7F] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow">
          New
        </span>
      )}
    </div>
  );
}

function LockGlyph() {
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
        d="M8 10V7a4 4 0 1 1 8 0v3m-9 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}
