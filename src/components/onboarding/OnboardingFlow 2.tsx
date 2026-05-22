"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import SplashScreen from "./SplashScreen";
import IntroScreen from "./IntroScreen";
import ProfileSetupScreen, { type ProfileDraft } from "./ProfileSetupScreen";
import FeatureIntroScreen from "./FeatureIntroScreen";

type Step = "splash" | "intro" | "profile" | "features" | "done";

// Routes that wrap the app in an iPhone preview frame and run their own
// onboarding inside an iframe. The host page must NOT also render the
// onboarding overlay — otherwise it covers the iPhone mockup.
const SKIP_ONBOARDING_PATHS = new Set(["/demo", "/preview"]);

/**
 * Full-screen onboarding flow. Mounted in the root layout. Renders nothing
 * once the user has completed onboarding (profile saved).
 *
 * Order:  splash → intro → profile → features → done
 *
 * Returning users (profile already saved) still see the splash for the
 * configured min-time, then unmount silently.
 */
export default function OnboardingFlow() {
  const { profile, setProfile, resetOnboarding } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const skipOnHost = SKIP_ONBOARDING_PATHS.has(pathname);

  // The flow starts at "splash" regardless of whether the user has onboarded.
  // After splash, if they're already onboarded we jump to "done".
  const [step, setStep] = useState<Step>("splash");
  const draftRef = useRef<ProfileDraft | null>(null);
  // Snapshot the profile *at splash-completion time* so a hydration race can't
  // make us skip onboarding for a user who just hit reset.
  const profileAtSplashEndRef = useRef<typeof profile | undefined>(undefined);

  // Dev-only reset hook so the user/demo can force re-onboarding.
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __oweekReset?: () => void }).__oweekReset = () => {
      resetOnboarding();
      // soft reload so all caches clear
      window.location.reload();
    };

    // Support ?reset=1 query param
    const url = new URL(window.location.href);
    if (url.searchParams.get("reset") === "1") {
      resetOnboarding();
      url.searchParams.delete("reset");
      window.history.replaceState(null, "", url.toString());
    }
  }, [resetOnboarding]);

  // Prefetch main routes during splash so post-onboarding nav is instant.
  useEffect(() => {
    if (step !== "splash") return;
    try {
      router.prefetch("/home");
      router.prefetch("/map");
      router.prefetch("/schedule");
      router.prefetch("/passport");
    } catch {
      // prefetch is best-effort
    }

    // Eagerly evaluate MapView's dynamic chunk so mapbox-gl + react-map-gl
    // are downloaded and parsed during onboarding rather than on first Map
    // tab tap. Mirrors next/dynamic in src/app/map/page.tsx.
    void import("@/components/MapView").catch(() => {});

    // Best-effort warm of the Mapbox style JSON. The SDK uses the
    // mapbox://styles/... URL form, which it resolves to this REST endpoint
    // — fetching the same URL puts the style JSON in the browser HTTP cache
    // so the SDK's request lands as a cache hit.
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (token) {
      const styleUrl = `https://api.mapbox.com/styles/v1/flyinglow/cmnzbx6e7008c01qv2evv4azd?access_token=${encodeURIComponent(
        token,
      )}`;
      void fetch(styleUrl, { mode: "cors", credentials: "omit" }).catch(
        () => {},
      );
    }
  }, [step, router]);

  function handleSplashDone() {
    // Re-check localStorage directly — `profile` could be stale due to
    // initial SSR snapshot vs. client hydration. We want the latest truth.
    profileAtSplashEndRef.current = profile;
    let stored: string | null = null;
    try {
      stored = typeof window !== "undefined"
        ? localStorage.getItem("oweek_profile_v2")
        : null;
    } catch {
      stored = null;
    }
    if (stored && profile) {
      setStep("done");
    } else {
      setStep("intro");
    }
  }

  function handleProfileContinue(draft: ProfileDraft) {
    draftRef.current = draft;
    setStep("features");
  }

  function handleFinish() {
    const draft = draftRef.current;
    if (!draft) {
      setStep("profile");
      return;
    }
    setProfile({
      name: draft.name,
      facultyTag: draft.faculty.tag,
      facultyLabel: draft.faculty.label,
      residenceTag: draft.residence.tag,
      residencePoiId: draft.residence.poiId,
      residenceLabel: draft.residence.label,
    });
    setStep("done");
  }

  // Mounted but at "done" — render nothing so the real app shows through.
  if (step === "done") return null;

  // Note: we intentionally do NOT bail out here just because `profile` is
  // non-null. The user might be mid-flow with a freshly-saved profile, and
  // we always want them to see the feature-intro screen before Home.

  switch (step) {
    case "splash":
      return <SplashScreen onDone={handleSplashDone} />;
    case "intro":
      return <IntroScreen onContinue={() => setStep("profile")} />;
    case "profile":
      return (
        <ProfileSetupScreen
          onContinue={handleProfileContinue}
          onBack={() => setStep("intro")}
        />
      );
    case "features":
      return (
        <FeatureIntroScreen
          onFinish={handleFinish}
          onBack={() => setStep("profile")}
        />
      );
    default:
      return null;
  }
}
