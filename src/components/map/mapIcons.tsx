"use client";

import type { MapFilterKey, MapMarkerKind } from "@/lib/mapPresentation";

type IconName =
  | MapMarkerKind
  | MapFilterKey
  | "search"
  | "close"
  | "time"
  | "location"
  | "chevron-right";

interface MapIconProps {
  name: IconName;
  className?: string;
}

export function MapIcon({ name, className }: MapIconProps) {
  const resolvedName =
    name === "events"
      ? "event"
      : name === "buildings"
        ? "building"
        : name;

  if (resolvedName === "event") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        className={className}
      >
        <circle cx="9" cy="9" r="2.25" />
        <circle cx="15.25" cy="9.5" r="2.15" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.75 18c.4-2.35 2.33-4 4.75-4h5c2.42 0 4.35 1.65 4.75 4"
        />
      </svg>
    );
  }

  if (resolvedName === "building") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        className={className}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 20V8.7a1.8 1.8 0 0 1 .92-1.57l5.7-3.2a1.8 1.8 0 0 1 1.76 0l5.7 3.2A1.8 1.8 0 0 1 19.5 8.7V20"
        />
        <path strokeLinecap="round" d="M9 20v-4h6v4M9.25 10.5h.01M14.75 10.5h.01" />
      </svg>
    );
  }

  if (resolvedName === "food") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        className={className}
      >
        <path strokeLinecap="round" d="M8 4v7M5.5 4v4.5M10.5 4v4.5M8 11v9" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 4c-1.33 0-2.5 1.33-2.5 3v5h5V7c0-1.67-1.17-3-2.5-3ZM16.5 12v8"
        />
      </svg>
    );
  }

  if (resolvedName === "transit") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        className={className}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 17h10M8.25 19.5 7 17m10 2.5L15.75 17M7 8.5h10M8 5h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        />
      </svg>
    );
  }

  if (resolvedName === "search") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={className}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-4.35-4.35" />
        <circle cx="10.5" cy="10.5" r="5.5" />
      </svg>
    );
  }

  if (resolvedName === "close") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.15}
        className={className}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6 18 18M18 6 6 18" />
      </svg>
    );
  }

  if (resolvedName === "time") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        className={className}
      >
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 7.5v4.5l3 1.75" />
      </svg>
    );
  }

  if (resolvedName === "location") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        className={className}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.5s6.5-4.04 6.5-10a6.5 6.5 0 1 0-13 0c0 5.96 6.5 10 6.5 10Z"
        />
        <circle cx="12" cy="10.5" r="2.15" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.05}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6 15 12 9 18" />
    </svg>
  );
}
