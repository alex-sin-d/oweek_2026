"use client";

import { useEffect, useId, useRef } from "react";
import type { ShuttleRoute, ShuttleRouteDetailItem } from "@/data/shuttle";

interface ShuttleStopsSheetProps {
  route: ShuttleRoute;
  onClose: () => void;
}

export default function ShuttleStopsSheet({
  route,
  onClose,
}: ShuttleStopsSheetProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const chipClass =
    route.id === "purple"
      ? "bg-[#ece0ff] text-[#5d3196]"
      : "bg-[#edf0f4] text-[#5f6675]";

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[105]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(23,16,34,0.28)] backdrop-blur-[8px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 mx-auto max-w-lg overflow-hidden rounded-t-[32px] bg-[linear-gradient(180deg,#fbf9ff_0%,#f5f0fa_100%)] shadow-[0_-20px_56px_rgba(27,18,40,0.24)] ring-1 ring-white/85"
        style={{ maxHeight: "76vh" }}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1.5 w-12 rounded-full bg-[#d7cee3]" />
        </div>

        <div className="border-b border-white/75 px-4 pb-4">
          <div className="relative flex min-h-[52px] items-center justify-center">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close stops and streets"
              className="absolute right-0 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/92 text-[#2f2447] shadow-[0_12px_30px_rgba(24,16,39,0.12)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <CloseIcon />
            </button>

            <div className="text-center">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.06em] ${chipClass}`}
              >
                {route.name}
              </span>
              <h2
                id={titleId}
                className="mt-2 text-[28px] font-semibold tracking-[-0.045em] text-[#211931]"
              >
                Stops / Streets
              </h2>
            </div>
          </div>
        </div>

        <div
          className="overflow-y-auto px-4 pb-6 pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
        >
          <div className="space-y-3">
            {route.streets.map((item) => (
              <article
                key={item.id}
                className="flex items-start gap-3 rounded-[22px] bg-white/88 px-4 py-3.5 shadow-[0_14px_28px_rgba(79,45,127,0.06)] ring-1 ring-white/80"
              >
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(243,235,251,0.92)] text-[#6b42a9]">
                  <StopsIcon kind={item.kind} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold leading-[1.3] text-[#241b35]">
                      {item.label}
                    </p>
                    {item.kind === "pickup" && (
                      <span className="inline-flex items-center rounded-full bg-[#ece0ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5d3196]">
                        Pickup
                      </span>
                    )}
                  </div>

                  {item.detail ? (
                    <p className="mt-1 text-[13px] font-medium text-[#6a5c80]">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StopsIcon({
  kind,
}: {
  kind: ShuttleRouteDetailItem["kind"];
}) {
  if (kind === "pickup") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    );
  }

  if (kind === "coverage") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" />
      </svg>
    );
  }

  if (kind === "intersection") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
        <circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 18 18 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12v12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} className="h-5 w-5">
      <path strokeLinecap="round" d="m7 7 10 10" />
      <path strokeLinecap="round" d="m17 7-10 10" />
    </svg>
  );
}
