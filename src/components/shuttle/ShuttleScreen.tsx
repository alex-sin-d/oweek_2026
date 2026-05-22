"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ShuttleMapSheet from "@/components/shuttle/ShuttleMapSheet";
import ShuttleNotesCard from "@/components/shuttle/ShuttleNotesCard";
import ShuttleRouteCard from "@/components/shuttle/ShuttleRouteCard";
import ShuttleRouteSelector from "@/components/shuttle/ShuttleRouteSelector";
import ShuttleServiceCard from "@/components/shuttle/ShuttleServiceCard";
import ShuttleStopsSheet from "@/components/shuttle/ShuttleStopsSheet";
import ShuttleSupportCard from "@/components/shuttle/ShuttleSupportCard";
import {
  SHUTTLE_IMPORTANT_NOTES,
  SHUTTLE_PICKUP_POI_ID,
  SHUTTLE_ROUTES,
  SHUTTLE_ROUTE_ORDER,
  SHUTTLE_SERVICE_FACTS,
  SHUTTLE_STATUS,
  SHUTTLE_SUPPORT_EMAIL,
  type ShuttleRouteId,
} from "@/data/shuttle";
import { useApp } from "@/lib/AppContext";

export default function ShuttleScreen() {
  const router = useRouter();
  const { setPanelPoiId, setSelectedPoiId } = useApp();
  const routesSectionRef = useRef<HTMLElement>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<ShuttleRouteId>(
    SHUTTLE_ROUTE_ORDER[0],
  );
  const [expandedRouteId, setExpandedRouteId] = useState<ShuttleRouteId | null>(
    null,
  );
  const [streetsRouteId, setStreetsRouteId] = useState<ShuttleRouteId | null>(
    null,
  );

  const selectedRoute = useMemo(
    () => SHUTTLE_ROUTES[selectedRouteId],
    [selectedRouteId],
  );

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/home");
  };

  const handleViewRoutes = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    routesSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleGetToPickup = () => {
    setSelectedPoiId(SHUTTLE_PICKUP_POI_ID);
    setPanelPoiId(SHUTTLE_PICKUP_POI_ID);
    router.push("/map");
  };

  return (
    <div className="scrollbar-none h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-28" style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}>
        <header className="relative flex min-h-[52px] items-center justify-center">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="absolute left-0 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[rgba(242,235,248,0.88)] text-[#6a3aa6] shadow-[0_14px_30px_rgba(79,45,127,0.08)] ring-1 ring-white/80 backdrop-blur transition-transform duration-200 active:scale-[0.97]"
          >
            <BackIcon />
          </button>

          <h1 className="text-[33px] font-semibold tracking-[-0.045em] text-[#1f1830]">
            Shuttle
          </h1>
        </header>

        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center rounded-full bg-[#efe4fb] px-4 py-1.5 text-[12px] font-semibold tracking-[0.03em] text-[#6a3aa6] shadow-[0_10px_22px_rgba(79,45,127,0.07)] ring-1 ring-white/80">
            {SHUTTLE_STATUS}
          </span>
        </div>

        <section className="mt-5">
          <ShuttleServiceCard
            facts={SHUTTLE_SERVICE_FACTS}
            onViewRoutes={handleViewRoutes}
            onGetToPickup={handleGetToPickup}
          />
        </section>

        <section ref={routesSectionRef} className="mt-5 space-y-3">
          <ShuttleRouteSelector
            value={selectedRouteId}
            onChange={setSelectedRouteId}
          />

          <ShuttleRouteCard
            route={selectedRoute}
            onExpandMap={() => setExpandedRouteId(selectedRoute.id)}
            onSeeStops={() => setStreetsRouteId(selectedRoute.id)}
          />
        </section>

        <section className="mt-4">
          <ShuttleNotesCard notes={SHUTTLE_IMPORTANT_NOTES} />
        </section>

        <section className="mt-4">
          <ShuttleSupportCard email={SHUTTLE_SUPPORT_EMAIL} />
        </section>
      </div>

      {expandedRouteId ? (
        <ShuttleMapSheet
          route={SHUTTLE_ROUTES[expandedRouteId]}
          onClose={() => setExpandedRouteId(null)}
        />
      ) : null}

      {streetsRouteId ? (
        <ShuttleStopsSheet
          route={SHUTTLE_ROUTES[streetsRouteId]}
          onClose={() => setStreetsRouteId(null)}
        />
      ) : null}
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 6.5-5 5 5 5" />
    </svg>
  );
}
