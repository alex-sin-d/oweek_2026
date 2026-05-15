import Image from "next/image";
import type { ReactNode } from "react";
import type {
  PassportStampDefinition,
  PassportTileState,
} from "@/data/passport";
import PlaceholderStampArtwork, {
  type PassportArtworkVariant,
} from "@/components/passport/PlaceholderStampArtwork";
import { getStampImage } from "@/lib/stampImages";

export type PassportArtworkRenderer = (args: {
  definition: PassportStampDefinition;
  state: PassportTileState;
  variant: PassportArtworkVariant;
}) => ReactNode;

interface PassportStampTileProps {
  definition: PassportStampDefinition;
  state: PassportTileState;
  variant?: PassportArtworkVariant;
  artwork?: ReactNode | PassportArtworkRenderer;
  className?: string;
}

function resolveArtwork(
  artwork: PassportStampTileProps["artwork"],
  definition: PassportStampDefinition,
  state: PassportTileState,
  variant: PassportArtworkVariant,
) {
  if (typeof artwork === "function") {
    return artwork({ definition, state, variant });
  }

  if (artwork) {
    return artwork;
  }

  const src = getStampImage(definition.poiId);
  if (src) {
    const isLocked = state === "locked";
    return (
      <Image
        src={src}
        alt={definition.name}
        fill
        unoptimized
        className="object-contain transition-[filter,opacity] duration-200"
        style={
          isLocked
            ? { filter: "saturate(0.15) brightness(0.92)", opacity: 0.7 }
            : undefined
        }
      />
    );
  }

  return (
    <PlaceholderStampArtwork
      definition={definition}
      state={state}
      variant={variant}
    />
  );
}

export default function PassportStampTile({
  definition,
  state,
  variant = "preview",
  artwork,
  className = "",
}: PassportStampTileProps) {
  const isLocked = state === "locked";
  const isNew = state === "new";

  const sizeClass =
    variant === "preview"
      ? "aspect-[1.06] rounded-[20px]"
      : "aspect-square rounded-[18px]";

  const surfaceClass = isLocked
    ? "bg-[linear-gradient(180deg,rgba(238,232,248,0.96)_0%,rgba(226,217,238,0.94)_100%)] text-[#5a4a78] ring-[rgba(196,182,222,0.7)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-8px_18px_rgba(79,45,127,0.07)]"
    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,245,253,0.98)_100%)] text-[#4c2f79] ring-[rgba(233,224,243,0.9)] shadow-[0_12px_24px_rgba(83,53,123,0.12),inset_0_1px_0_rgba(255,255,255,0.92)]";

  const glowClass = isNew
    ? "ring-[#b48cf0] shadow-[0_0_0_1px_rgba(180,140,240,0.35),0_16px_28px_rgba(98,59,148,0.18)]"
    : "";

  return (
    <div
      aria-label={`${definition.name} ${state}`}
      className={`relative overflow-hidden ring-1 ${sizeClass} ${surfaceClass} ${glowClass} ${className}`}
    >
      {/* Artwork — inset keeps stamp from bleeding to tile edges */}
      <div className="absolute inset-[5px] flex items-center justify-center">
        {resolveArtwork(artwork, definition, state, variant)}
      </div>

      {/* Top-glow overlay — sits above artwork so it applies to real stamps too */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.68),transparent_65%)]" />

      {isLocked && (
        <span className="absolute bottom-2 right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(79,29,150,0.1)] text-[rgba(79,29,150,0.72)] ring-1 ring-[rgba(79,29,150,0.18)]">
          <LockGlyph />
        </span>
      )}

      {isNew && (
        <span className="absolute right-2 top-2 z-20 rounded-full bg-[#6f3cc5] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
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
      className="h-2.5 w-2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10V7a4 4 0 1 1 8 0v3m-9 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}
