"use client";

import { SHUTTLE_ROUTE_ORDER, SHUTTLE_ROUTES, type ShuttleRouteId } from "@/data/shuttle";

interface ShuttleRouteSelectorProps {
  value: ShuttleRouteId;
  onChange: (routeId: ShuttleRouteId) => void;
}

export default function ShuttleRouteSelector({
  value,
  onChange,
}: ShuttleRouteSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Shuttle route selector"
      className="home-card-shadow inline-flex w-full rounded-full bg-[rgba(255,255,255,0.76)] p-1 ring-1 ring-white/80"
    >
      {SHUTTLE_ROUTE_ORDER.map((routeId) => {
        const route = SHUTTLE_ROUTES[routeId];
        const selected = value === routeId;
        return (
          <button
            key={route.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(route.id)}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold transition-all duration-150 ${
              selected
                ? route.id === "purple"
                  ? "bg-[#e6d8fa] text-[#4f2d7f] shadow-[0_14px_28px_rgba(79,45,127,0.12)]"
                  : "bg-[#eef0f4] text-[#535968] shadow-[0_14px_28px_rgba(82,87,96,0.12)]"
                : "text-[#736980] hover:text-[#4b425e]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${
                route.id === "purple" ? "bg-[#7b4ad1]" : "bg-[#88909e]"
              }`}
            />
            <span>{route.name}</span>
          </button>
        );
      })}
    </div>
  );
}
