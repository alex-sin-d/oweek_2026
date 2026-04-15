"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
  return (
    <Suspense>
      <MapView />
    </Suspense>
  );
}
