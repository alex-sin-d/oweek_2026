"use client";

import { useEffect, useState } from "react";

export const LS_DEMO_MODE = "oweek_demo_mode";

function readInitialDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") return true;
    return localStorage.getItem(LS_DEMO_MODE) === "1";
  } catch {
    return false;
  }
}

export function useDemoMode(): boolean {
  const [enabled, setEnabled] = useState<boolean>(readInitialDemoMode);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1") {
        localStorage.setItem(LS_DEMO_MODE, "1");
        setEnabled(true);
        return;
      }
      setEnabled(localStorage.getItem(LS_DEMO_MODE) === "1");
    } catch {
      // privacy mode / quota — best-effort only
    }
  }, []);

  return enabled;
}
