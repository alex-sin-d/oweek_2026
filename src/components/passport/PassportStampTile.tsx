import type { ReactNode } from "react";
import type {
  PassportStampDefinition,
  PassportTileState,
} from "@/data/passport";
import PlaceholderStampArtwork, {
  type PassportArtworkVariant,
} from "@/components/passport/PlaceholderStampArtwork";

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
    ? "bg-[linear-gradient(180deg,rgba(240,236,246,0.94)_0%,rgba(233,227,242,0.92)_100%)] text-[#b8acce] ring-[#ece5f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,245,253,0.98)_100%)] text-[#4c2f79] ring-[rgba(233,224,243,0.9)] shadow-[0_12px_24px_rgba(83,53,123,0.12),inset_0_1px_0_rgba(255,255,255,0.92)]";

  const glowClass = isNew
    ? "ring-[#b48cf0] shadow-[0_0_0_1px_rgba(180,140,240,0.35),0_16px_28px_rgba(98,59,148,0.18)]"
    : "";

  return (
    <div
      aria-label={`${definition.name} ${state}`}
      className={`relative flex items-center justify-center overflow-hidden ring-1 ${sizeClass} ${surfaceClass} ${glowClass} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.68),transparent_65%)]" />
      <div className="relative flex items-center justify-center">
        {resolveArtwork(artwork, definition, state, variant)}
      </div>

      {isLocked && (
        <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[#b9acca] ring-1 ring-white/90">
          <LockGlyph />
        </span>
      )}

      {isNew && (
        <span className="absolute right-2 top-2 rounded-full bg-[#6f3cc5] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
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
