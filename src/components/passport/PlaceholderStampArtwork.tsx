import type {
  PassportStampDefinition,
  PassportTileState,
} from "@/data/passport";

export type PassportArtworkVariant = "preview" | "compact";

interface PlaceholderStampArtworkProps {
  definition: PassportStampDefinition;
  state: PassportTileState;
  variant?: PassportArtworkVariant;
}

const SPECIAL_ARTWORK_BY_POI: Record<string, ArtworkKind> = {
  university_college: "tower",
  ucc: "hall",
  health_sci: "seal",
  concrete_beach: "key",
  kings: "crest",
  rec_centre: "arena",
  alumni_stadium: "arena",
  perth: "residence",
  saugeen: "residence",
  western_science_centre: "science",
};

type ArtworkKind =
  | "arena"
  | "court"
  | "crest"
  | "hall"
  | "key"
  | "residence"
  | "science"
  | "seal"
  | "tower";

function getArtworkKind(definition: PassportStampDefinition): ArtworkKind {
  const specialKind = SPECIAL_ARTWORK_BY_POI[definition.poiId];

  if (specialKind) {
    return specialKind;
  }

  switch (definition.category) {
    case "academic":
      return "hall";
    case "athletics":
      return "arena";
    case "outdoor":
      return "court";
    case "affiliated":
      return "crest";
    case "residence":
      return "residence";
    default:
      return "seal";
  }
}

function getSizeClass(variant: PassportArtworkVariant): string {
  return variant === "preview" ? "h-7 w-7" : "h-6 w-6";
}

export default function PlaceholderStampArtwork({
  definition,
  state,
  variant = "preview",
}: PlaceholderStampArtworkProps) {
  const kind = getArtworkKind(definition);
  const sizeClass = getSizeClass(variant);
  const muted = state === "locked";
  const toneClass = muted ? "opacity-[0.22]" : "opacity-100";

  if (kind === "seal") {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center ${toneClass}`}
      >
        <div
          className={`flex items-center justify-center rounded-full border-[1.8px] border-current ${sizeClass}`}
        >
          <span className="text-[9px] font-semibold tracking-[0.12em]">
            {definition.shortLabel.slice(0, 2)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={toneClass}>
      {kind === "tower" && <TowerGlyph className={sizeClass} />}
      {kind === "hall" && <HallGlyph className={sizeClass} />}
      {kind === "key" && <KeyGlyph className={sizeClass} />}
      {kind === "crest" && <CrestGlyph className={sizeClass} />}
      {kind === "arena" && <ArenaGlyph className={sizeClass} />}
      {kind === "residence" && <ResidenceGlyph className={sizeClass} />}
      {kind === "science" && <ScienceGlyph className={sizeClass} />}
      {kind === "court" && <CourtGlyph className={sizeClass} />}
    </div>
  );
}

function TowerGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2 3h-4l2-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 21V7h7v14" />
      <path strokeLinecap="round" d="M8.5 10.2h7M8.5 14.3h7" />
      <circle cx="12" cy="12.1" r="1.6" />
    </svg>
  );
}

function HallGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16L12 4 4 9Z" />
      <path strokeLinecap="round" d="M6 20h12M7 10v8M12 10v8M17 10v8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 20v-3.5h5V20" />
    </svg>
  );
}

function KeyGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <circle cx="8.5" cy="12" r="3.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.7 12H20v2h-2v2h-2v-2h-4.3" />
    </svg>
  );
}

function CrestGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 6.5 5v5.4c0 4 2.3 7.2 5.5 9.6 3.2-2.4 5.5-5.6 5.5-9.6V5L12 3Z" />
      <path strokeLinecap="round" d="M9.4 10.5h5.2M12 8v5" />
    </svg>
  );
}

function ArenaGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5 12 5l7 4.5v5L12 19l-7-4.5v-5Z" />
      <path strokeLinecap="round" d="M8 11.5h8M9.5 14h5" />
    </svg>
  );
}

function ResidenceGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 5l7.5 5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 10v9h11v-9" />
      <path strokeLinecap="round" d="M10 19v-5h4v5M9 12h.01M15 12h.01" />
    </svg>
  );
}

function ScienceGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4M10 4v4l-4.2 7.6A2.8 2.8 0 0 0 8.2 20h7.6a2.8 2.8 0 0 0 2.4-4.4L14 8V4" />
      <path strokeLinecap="round" d="M8.8 14.6h6.4" />
    </svg>
  );
}

function CourtGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      className={className}
    >
      <rect x="5" y="5" width="14" height="14" rx="2.5" />
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
