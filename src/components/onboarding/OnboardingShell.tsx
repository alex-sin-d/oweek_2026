"use client";

import Image from "next/image";
import { ReactNode } from "react";
import oweekLogo from "@/design/images/oweek_logo.png";

interface OnboardingShellProps {
  /** 1-based step index (1, 2, or 3). */
  step: 1 | 2 | 3;
  totalSteps?: number;
  children: ReactNode;
  /** Optional footer (Continue button etc.) — sticks to the bottom. */
  footer?: ReactNode;
}

export default function OnboardingShell({
  step,
  totalSteps = 3,
  children,
  footer,
}: OnboardingShellProps) {
  return (
    <div
      data-onboarding-step={step}
      className="scrollbar-none fixed inset-0 z-[90] overflow-y-auto text-white"
      style={{
        background:
          "radial-gradient(140% 90% at 50% -10%, #2A1340 0%, #1D0F33 30%, #170B2B 60%, #10071D 100%)",
      }}
    >
      {/* Faint ambient glow at the top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 0%, rgba(157,78,221,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col px-6 pb-10 pt-14">
        {/* Step indicator + crest */}
        <div className="mb-9 flex flex-col items-center gap-5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className="h-1 w-8 rounded-full transition-colors"
                style={{
                  background:
                    i + 1 === step
                      ? "linear-gradient(90deg, #D8B4FE 0%, #9D4EDD 100%)"
                      : i + 1 < step
                      ? "rgba(200,182,255,0.55)"
                      : "rgba(255,255,255,0.12)",
                  boxShadow:
                    i + 1 === step
                      ? "0 0 12px rgba(157,78,221,0.6)"
                      : undefined,
                }}
              />
            ))}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl p-1.5"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
              border: "1px solid rgba(210,170,255,0.22)",
              boxShadow: "0 0 18px -4px rgba(157,78,221,0.45)",
            }}
          >
            <Image
              src={oweekLogo}
              alt="OWeek 2026"
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col oweek-fade-in">
          {children}
        </div>

        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </div>
  );
}
