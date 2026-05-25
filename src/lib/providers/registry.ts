import { openMeteoForecast } from "./open-meteo";
import { ndbc } from "./noaa-ndbc";
import { stormglass } from "./stormglass";
import { wikipedia } from "./wikipedia";
import { nhc } from "./nhc";
import type {
  DataProvider,
  ProviderId,
  ProviderStatusSnapshot,
} from "./types";

// un provider multi-categoria compare una volta sola: la meta è la stessa, prendiamo una variante
const PROVIDERS: Record<ProviderId, DataProvider> = {
  "open-meteo": openMeteoForecast,
  "noaa-ndbc": ndbc,
  stormglass,
  wikipedia,
  nhc,
};

export const PROVIDER_IDS: ProviderId[] = [
  "open-meteo",
  "noaa-ndbc",
  "stormglass",
  "wikipedia",
  "nhc",
];

export function getProvider(id: ProviderId): DataProvider {
  return PROVIDERS[id];
}

export function getAllProviders(): DataProvider[] {
  return PROVIDER_IDS.map((id) => PROVIDERS[id]);
}

// snapshot serializzabile dello stato provider, calcolato server-side (no process.env nel browser)
export function getProviderStatusSnapshot(): ProviderStatusSnapshot[] {
  return PROVIDER_IDS.map((id) => {
    const p = PROVIDERS[id];
    const a = p.available();
    return {
      id,
      name: p.name,
      categories: p.categories,
      status: a.ok ? "live" : a.reason === "disabled" ? "disabled" : "requires-key",
      reason: a.reason,
    } satisfies ProviderStatusSnapshot;
  });
}

