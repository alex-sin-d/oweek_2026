"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import type { ShuttleRoute } from "@/data/shuttle";

interface ShuttleMapSheetProps {
  route: ShuttleRoute;
  onClose: () => void;
}

export default function ShuttleMapSheet({
  route,
  onClose,
}: ShuttleMapSheetProps) {
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
    <div className="fixed inset-0 z-[110]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(23,16,34,0.36)] backdrop-blur-[10px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 mx-auto flex max-w-lg flex-col overflow-hidden bg-[linear-gradient(180deg,#f9f5fc_0%,#f3eef8_100%)] shadow-[0_32px_80px_rgba(27,18,40,0.3)]"
      >
        <div
          className="border-b border-white/75 px-4 pb-4"
          style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
        >
          <div className="relative flex min-h-[52px] items-center justify-center">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close expanded route map"
              className="absolute left-0 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/92 text-[#2f2447] shadow-[0_16px_36px_rgba(24,16,39,0.14)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
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
                className="mt-2 text-[29px] font-semibold tracking-[-0.045em] text-[#211931]"
              >
                Expanded Map
              </h2>
            </div>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 pb-6 pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
        >
          <div className="overflow-auto rounded-[28px] bg-white/92 p-3 shadow-[0_28px_56px_rgba(79,45,127,0.1)] ring-1 ring-white/80">
            <div className="min-w-full">
              <Image
                src={route.image}
                alt={route.imageAlt}
                priority
                className="block max-w-none rounded-[20px]"
                style={{ width: "760px", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
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
