"use client";

import Image from "next/image";
import type { ShuttleRoute } from "@/data/shuttle";

interface ShuttleRouteCardProps {
  route: ShuttleRoute;
  onExpandMap: () => void;
  onSeeStops: () => void;
}

export default function ShuttleRouteCard({
  route,
  onExpandMap,
  onSeeStops,
}: ShuttleRouteCardProps) {
  const routeChipClass =
    route.id === "purple"
      ? "bg-[#ece0ff] text-[#5c30a0]"
      : "bg-[#edf0f4] text-[#5f6675]";

  const previewFrameClass =
    route.id === "purple"
      ? "bg-[linear-gradient(180deg,#faf7ff_0%,#f4eefc_100%)]"
      : "bg-[linear-gradient(180deg,#fbfbfc_0%,#f2f4f7_100%)]";

  return (
    <section className="home-card-shadow overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.94),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,244,252,0.98)_100%)] p-4 ring-1 ring-white/85">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.06em] ${routeChipClass}`}
          >
            {route.name}
          </span>

          <h2 className="mt-3 text-[29px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#211931]">
            {route.name}
          </h2>

          <p className="mt-1 max-w-[28ch] text-[14px] leading-[1.45] text-[#635675]">
            {route.description}
          </p>
        </div>
      </div>

      <div
        className={`mt-4 overflow-hidden rounded-[26px] border border-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${previewFrameClass}`}
      >
        <div className="relative aspect-[1.15] min-h-[230px] overflow-hidden rounded-[20px] bg-white/70">
          <Image
            src={route.image}
            alt={route.imageAlt}
            fill
            priority
            className="object-contain p-2.5"
            sizes="(max-width: 768px) 100vw, 420px"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onExpandMap}
          className="flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_18px_34px_rgba(79,45,127,0.24)] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.98]"
        >
          Expand Map
        </button>

        <button
          type="button"
          onClick={onSeeStops}
          className="flex min-h-12 items-center justify-center rounded-full border border-[#dacced] bg-white/92 px-4 py-3 text-[15px] font-semibold text-[#5d3196] shadow-[0_12px_24px_rgba(79,45,127,0.08)] transition-colors duration-150 hover:bg-[#faf7ff] active:scale-[0.98]"
        >
          See Stops / Streets
        </button>
      </div>
    </section>
  );
}
