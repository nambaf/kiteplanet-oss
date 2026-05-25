"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  MAP_MODE_COOKIE,
  MAP_MODE_DEFAULT,
  isMapMode,
  type MapMode,
} from "./map-mode-shared";

// toggle live/demo della mappa home. Persistenza su cookie (idrata server-side, no flash) +
// localStorage (fallback private mode); sync cross-istanza via custom event + storage.
// Parti pure (tipo/costanti/guard) in map-mode-shared.ts, importabili server-side.
export { MAP_MODE_COOKIE, MAP_MODE_DEFAULT, isMapMode };
export type { MapMode };

const STORAGE_KEY = MAP_MODE_COOKIE;
const CHANGE_EVENT = "kp-map-mode-change";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 anno: è pura preferenza UI

// valore iniziale server-fetched dal cookie, senza prop drilling
const InitialModeCtx = createContext<MapMode>(MAP_MODE_DEFAULT);

export function MapModeProvider({
  value,
  children,
}: {
  value: MapMode;
  children: ReactNode;
}) {
  return createElement(InitialModeCtx.Provider, { value }, children);
}

export function useMapMode(): [MapMode, (next: MapMode) => void] {
  const initial = useContext(InitialModeCtx);
  const [mode, setModeState] = useState<MapMode>(initial);

  useEffect(() => {
    // fallback localStorage se il cookie è stato strippato (private mode)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isMapMode(stored) && stored !== mode) setModeState(stored);
    } catch {
      // localStorage non disponibile: ignora
    }

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<MapMode>).detail;
      if (isMapMode(detail)) setModeState(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (isMapMode(e.newValue)) setModeState(e.newValue);
    };
    window.addEventListener(CHANGE_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (next: MapMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${MAP_MODE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent<MapMode>(CHANGE_EVENT, { detail: next }));
    } catch {
      // ignora
    }
  };

  return [mode, setMode];
}
