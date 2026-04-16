"use client";

import type { ShuttleServiceFact } from "@/data/shuttle";

interface ShuttleServiceCardProps {
  facts: ShuttleServiceFact[];
  onViewRoutes: () => void;
  onGetToPickup: () => void;
}

export default function ShuttleServiceCard({
  facts,
  onViewRoutes,
  onGetToPickup,
}: ShuttleServiceCardProps) {
  return (
    <section className="home-card-shadow overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top_right,rgba(228,215,247,0.44),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,244,252,0.98)_100%)] p-4 ring-1 ring-white/85">
      <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-[#20172e]">
        Pick-up &amp; Service
      </h2>

      <div className="mt-3.5 space-y-3">
        {facts.map((fact) => (
          <div
            key={fact.id}
            className="flex items-start gap-3 rounded-[20px] bg-[rgba(246,241,251,0.72)] px-3 py-3 ring-1 ring-white/75"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#6d43a8] shadow-[0_10px_18px_rgba(79,45,127,0.08)]">
              <ServiceFactIcon icon={fact.icon} />
            </div>

            <p className="min-w-0 text-[14px] leading-[1.35] text-[#57486d]">
              <span className="font-semibold text-[#231933]">{fact.label}:</span>{" "}
              <span className="font-medium text-[#5d4f73]">{fact.value}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onViewRoutes}
          className="flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#7d47d3_0%,#5e2ba6_100%)] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_18px_34px_rgba(79,45,127,0.24)] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.98]"
        >
          View Routes
        </button>

        <button
          type="button"
          onClick={onGetToPickup}
          className="flex min-h-12 items-center justify-center rounded-full border border-[#d8c7ed] bg-white/90 px-4 py-3 text-[15px] font-semibold text-[#5e2ba6] shadow-[0_12px_24px_rgba(79,45,127,0.08)] transition-colors duration-150 hover:bg-[#faf7ff] active:scale-[0.98]"
        >
          Get to Alumni Hall
        </button>
      </div>
    </section>
  );
}

function ServiceFactIcon({
  icon,
}: {
  icon: ShuttleServiceFact["icon"];
}) {
  if (icon === "pickup") {
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

  if (icon === "hours") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 7.8v4.8l3.1 1.9" />
      </svg>
    );
  }

  if (icon === "dropoff") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20s5.5-3.25 5.5-8.25a5.5 5.5 0 10-11 0C6.5 16.75 12 20 12 20z"
        />
        <path strokeLinecap="round" d="M12 8.75v5.5" />
        <path strokeLinecap="round" d="m9.8 12.1 2.2 2.15 2.2-2.15" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 14.5V8.25A2.25 2.25 0 017.75 6h8.5a2.25 2.25 0 012.25 2.25v6.25"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14.5h16v1.25A2.25 2.25 0 0117.75 18h-11.5A2.25 2.25 0 014 15.75V14.5z" />
      <circle cx="8" cy="18" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
