"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { BADGES, BadgeDefinition } from "./config";
import { canonicalizePoiId } from "./pois";

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  residenceTag: string;  // e.g. "PERTH"
  residencePoiId: string; // e.g. "perth"
  residenceLabel: string; // e.g. "Perth Hall"
  facultyTag: string;    // e.g. "SCI"
  facultyLabel: string;  // e.g. "Science"
}

// ─── App State ────────────────────────────────────────────────────────────────

interface AppState {
  profile: UserProfile | null;
  unlockedBuildings: Set<string>;
  savedEventIds: Set<string>;
  selectedPoiId: string | null;
  /** poi_id that should trigger the building panel to open */
  panelPoiId: string | null;
  earnedBadgeIds: string[];

  setProfile: (p: UserProfile) => void;
  unlockBuilding: (poiId: string) => void;
  toggleSavedEvent: (eventId: string) => void;
  setSelectedPoiId: (id: string | null) => void;
  setPanelPoiId: (id: string | null) => void;
}

const AppContext = createContext<AppState | null>(null);

// ─── Persistence helpers ──────────────────────────────────────────────────────

const LS_PROFILE    = "oweek_profile";
const LS_UNLOCKED   = "oweek_unlocked";
const LS_SAVED_EVTS = "oweek_saved_events";
const EMPTY_PERSISTED_STATE = {
  profile: null as UserProfile | null,
  unlockedBuildings: new Set<string>(),
  savedEventIds: new Set<string>(),
};

type PersistedState = typeof EMPTY_PERSISTED_STATE;

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function loadUnlockedPoiSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_UNLOCKED);
    const values = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(values.map((poiId) => canonicalizePoiId(poiId)));
  } catch {
    return new Set();
  }
}

function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") {
    return EMPTY_PERSISTED_STATE;
  }

  return {
    profile: loadProfile(),
    unlockedBuildings: loadUnlockedPoiSet(),
    savedEventIds: loadSet(LS_SAVED_EVTS),
  };
}

let persistedState = loadPersistedState();
const persistedListeners = new Set<() => void>();

function emitPersistedChange() {
  persistedState = loadPersistedState();
  for (const listener of persistedListeners) {
    listener();
  }
}

function subscribeToPersistedState(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || [LS_PROFILE, LS_UNLOCKED, LS_SAVED_EVTS].includes(event.key)) {
      emitPersistedChange();
    }
  };

  persistedListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    persistedListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getPersistedSnapshot(): PersistedState {
  return persistedState;
}

function getPersistedServerSnapshot(): PersistedState {
  return EMPTY_PERSISTED_STATE;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, unlockedBuildings, savedEventIds } = useSyncExternalStore(
    subscribeToPersistedState,
    getPersistedSnapshot,
    getPersistedServerSnapshot
  );
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [panelPoiId, setPanelPoiId] = useState<string | null>(null);
  const earnedBadgeIds = useMemo(
    () =>
      BADGES
      .filter((b: BadgeDefinition) => b.earned(unlockedBuildings))
      .map((b: BadgeDefinition) => b.id),
    [unlockedBuildings]
  );

  const setProfile = useCallback((p: UserProfile) => {
    localStorage.setItem(LS_PROFILE, JSON.stringify(p));
    emitPersistedChange();
  }, []);

  const unlockBuilding = useCallback((poiId: string) => {
    const canonicalPoiId = canonicalizePoiId(poiId);
    if (unlockedBuildings.has(canonicalPoiId)) return;

    const next = new Set(unlockedBuildings);
    next.add(canonicalPoiId);
    saveSet(LS_UNLOCKED, next);
    emitPersistedChange();
  }, [unlockedBuildings]);

  const toggleSavedEvent = useCallback((eventId: string) => {
    const next = new Set(savedEventIds);
    if (next.has(eventId)) next.delete(eventId);
    else next.add(eventId);
    saveSet(LS_SAVED_EVTS, next);
    emitPersistedChange();
  }, [savedEventIds]);

  return (
    <AppContext.Provider
      value={{
        profile,
        unlockedBuildings,
        savedEventIds,
        selectedPoiId,
        panelPoiId,
        earnedBadgeIds,
        setProfile,
        unlockBuilding,
        toggleSavedEvent,
        setSelectedPoiId,
        setPanelPoiId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
