"use client";

import type { CSSProperties } from "react";

export interface CalloutGeometry {
  /** Top-left corner of the callout text block, in host viewport coordinates. */
  textTop: number;
  textLeft: number;
  /** Width allocated for the text block. */
  textWidth: number;
  /** Side of the iPhone this callout sits on. Determines which edge the leader anchors to. */
  side: "left" | "right";
  /** Endpoint of the leader line at the target element, in host viewport coordinates. */
  arrowEndX: number;
  arrowEndY: number;
  /** Start of the leader line on the callout side (a small dot beside the title text). */
  arrowStartX: number;
  arrowStartY: number;
}

export type DemoCalloutVariant = "pointer" | "status";

interface DemoCalloutProps {
  number: number;
  title: string;
  subtext?: string;
  geometry: CalloutGeometry;
  /** When true, fades the callout to opacity 0 instead of unmounting. */
  hidden?: boolean;
  /**
   * "pointer" (default): numbered callout with endpoint dot. Used with an SVG
   * leader line drawn by the parent overlay.
   *
   * "status": no number, no dot, no leader. A centered text block above the
   * iPhone for transient state messages (e.g., "Walking from Perth Hall to
   * ACEB"). Geometry only uses textTop/textLeft/textWidth.
   */
  variant?: DemoCalloutVariant;
}

/**
 * A single guided-demo callout: number + title + (optional subtext), with a
 * small endpoint dot rendered inline. The leader line and arrowhead live in
 * the parent SVG so they can pass over the iframe.
 */
export default function DemoCallout({
  number,
  title,
  subtext,
  geometry,
  hidden = false,
  variant = "pointer",
}: DemoCalloutProps) {
  const containerStyle: CSSProperties = {
    position: "absolute",
    top: geometry.textTop,
    left: geometry.textLeft,
    width: geometry.textWidth,
    pointerEvents: "none",
    opacity: hidden ? 0 : 1,
    transition: "opacity 0.2s ease",
  };

  if (variant === "status") {
    return (
      <div style={containerStyle}>
        <div
          style={{
            color: "#F5EEFF",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {title}
        </div>
        {subtext ? (
          <p
            style={{
              marginTop: 8,
              color: "rgba(229, 219, 255, 0.82)",
              fontSize: 12,
              lineHeight: 1.5,
              textAlign: "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {subtext}
          </p>
        ) : null}
      </div>
    );
  }

  const isLeft = geometry.side === "left";

  // The endpoint dot is rendered as an SVG <circle> by the parent overlay so it
  // shares the exact same coordinate system as the arrow path. That guarantees
  // the dot center sits precisely on the arrow start with no sub-pixel drift.
  // The title row uses an explicit 20px line-height so the parent overlay can
  // place the dot at `textTop + 10` (the title's true vertical center).

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "block",
          textAlign: isLeft ? "right" : "left",
        }}
      >
        <div
          style={{
            color: "#F5EEFF",
            fontSize: 14,
            fontWeight: 600,
            lineHeight: "20px",
            letterSpacing: "-0.01em",
            textAlign: isLeft ? "right" : "left",
            // Reserve 18 px of breathing room on the dot/arrow-facing edge so
            // the title text never touches the SVG dot at the container edge.
            paddingLeft: isLeft ? 0 : 18,
            paddingRight: isLeft ? 18 : 0,
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          <span style={{ color: "#C8B6FF", marginRight: 6, fontWeight: 700 }}>
            {String(number).padStart(1, "0")}.
          </span>
          {title}
        </div>
      </div>
      {subtext ? (
        <p
          style={{
            marginTop: 6,
            color: "rgba(229, 219, 255, 0.78)",
            fontSize: 12,
            lineHeight: 1.45,
            textAlign: isLeft ? "right" : "left",
            // Match the title's 18px breathing room on the dot side.
            paddingLeft: isLeft ? 0 : 18,
            paddingRight: isLeft ? 18 : 0,
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          {subtext}
        </p>
      ) : null}
    </div>
  );
}
