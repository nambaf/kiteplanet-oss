import { cache } from "react";
import { withResilience } from "./resilience";
import { nhc } from "./nhc";
import { getProviderStatusSnapshot } from "./registry";
import type {
  ActiveStorm,
  ProviderResult,
  ProviderStatusSnapshot,
} from "./types";

export interface HomeBundle {
  storms: ProviderResult<ActiveStorm[]>;
  providerStatus: ProviderStatusSnapshot[];
}

// bundle leggero per la home: cicloni globali (1 chiamata NHC) + status provider (no I/O).
// Memoizzato per-request, più Suspense boundary lo chiamano gratis.
export const loadHomeBundle = cache(async (): Promise<HomeBundle> => {
  const storms = await withResilience(
    () => nhc.fetchActiveStorms(),
    {
      provider: { id: "nhc", available: nhc.available },
      timeoutMs: 6000,
    },
  );

  return {
    storms,
    providerStatus: getProviderStatusSnapshot(),
  };
});
