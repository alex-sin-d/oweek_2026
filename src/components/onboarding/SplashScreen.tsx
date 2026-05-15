"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  /**
   * Called when the splash has finished (min time elapsed AND
   * preload promise settled).
   */
  onDone: () => void;
}

const MIN_SPLASH_MS = 1800;

function preloadCoreData(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.resolve();
  const tasks: Promise<unknown>[] = [];
  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    tasks.push(document.fonts.ready);
  }
  tasks.push(new Promise((res) => setTimeout(res, 600)));
  return Promise.allSettled(tasks);
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    void preloadCoreData().then(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => {
        if (cancelled) return;
        setExiting(true);
        setTimeout(() => {
          if (!cancelled) onDone();
        }, 280);
      }, remaining);
    });
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#090014] transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={exiting}
    >
      <Image
        src="/splash/oweek-loading.png"
        alt="OWeek 2026"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </div>
  );
}
