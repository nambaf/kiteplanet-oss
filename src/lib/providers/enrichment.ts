import { cache } from "react";
import { withResilience } from "./resilience";
import { openMeteoSst } from "./open-meteo";
import { ndbc } from "./noaa-ndbc";
import { stormglass } from "./stormglass";
import { wikipedia } from "./wikipedia";
import { distanceKm } from "./nhc";
import { loadHomeBundle } from "./home-bundle";
import type { Spot } from "@/lib/types";
import type {
  ActiveStorm,
  BuoyObservation,
  Lang,
  ProviderResult,
  SeaTempSample,
  TideExtreme,
  WikiSummary,
} from "./types";

export interface SpotBundle {
  sst: ProviderResult<SeaTempSample | null>;
  tides: ProviderResult<TideExtreme[]>;
  observation: ProviderResult<BuoyObservation | null>;
  wiki: ProviderResult<WikiSummary | null>;
  nearbyStorms: ActiveStorm[];
}

const STORM_PROXIMITY_KM = 800;

// fetcher per-provider, memoizzati per-request via cache(): esposti singolarmente così
// ogni sezione della spot page può avvolgerli in una propria <Suspense> e streamare appena pronta
const isoNow = () => new Date().toISOString();

export const loadSst = cache(
  (spot: Spot): Promise<ProviderResult<SeaTempSample | null>> =>
    withResilience<SeaTempSample | null>(
      () => openMeteoSst.fetchSst(spot.lat, spot.lng),
      {
        provider: { id: "open-meteo", available: openMeteoSst.available },
        timeoutMs: 5000,
      },
    ),
);

export const loadTides = cache(
  (spot: Spot): Promise<ProviderResult<TideExtreme[]>> => {
    if (spot.refs?.stormglassEnabled !== true) {
      return Promise.resolve<ProviderResult<TideExtreme[]>>({
        data: null,
        source: "disabled",
        fetchedAt: isoNow(),
        provider: "stormglass",
      });
    }
    return withResilience<TideExtreme[]>(
      () => stormglass.fetchTideExtremes(spot.lat, spot.lng, 5),
      {
        provider: { id: "stormglass", available: stormglass.available },
        timeoutMs: 7000,
      },
    );
  },
);

export const loadObservation = cache(
  (spot: Spot): Promise<ProviderResult<BuoyObservation | null>> => {
    const buoyId = spot.refs?.ndbcBuoyId;
    if (!buoyId) {
      return Promise.resolve<ProviderResult<BuoyObservation | null>>({
        data: null,
        source: "unavailable",
        fetchedAt: isoNow(),
        provider: "noaa-ndbc",
        error: "Nessuna boa NDBC configurata per questo spot",
      });
    }
    return withResilience<BuoyObservation | null>(
      () => ndbc.fetchBuoy(buoyId),
      {
        provider: { id: "noaa-ndbc", available: ndbc.available },
        timeoutMs: 6000,
      },
    );
  },
);

export const loadWiki = cache(
  (spot: Spot, lang: Lang): Promise<ProviderResult<WikiSummary | null>> => {
    const wikiTitle = spot.refs?.wikipediaTitle?.[lang];
    if (!wikiTitle) {
      return Promise.resolve<ProviderResult<WikiSummary | null>>({
        data: null,
        source: "unavailable",
        fetchedAt: isoNow(),
        provider: "wikipedia",
        error: "Nessun titolo Wikipedia configurato",
      });
    }
    return withResilience<WikiSummary | null>(
      () => wikipedia.fetchSummary(wikiTitle, lang),
      {
        provider: { id: "wikipedia", available: wikipedia.available },
        timeoutMs: 5000,
      },
    );
  },
);

// aggregatore per SpotDataSourcesPanel: compone i fetcher in parallelo; essendo cache()-ati
// per-request, se le sezioni della pagina li hanno già chiamati qui è gratis
export const loadSpotEnrichment = cache(
  async (spot: Spot, lang: Lang): Promise<SpotBundle> => {
    const [sst, tides, observation, wiki, home] = await Promise.all([
      loadSst(spot),
      loadTides(spot),
      loadObservation(spot),
      loadWiki(spot, lang),
      loadHomeBundle(),
    ]);

    const nearbyStorms = (home.storms.data ?? []).filter(
      (s) => distanceKm(spot.lat, spot.lng, s.lat, s.lng) <= STORM_PROXIMITY_KM,
    );

    return {
      sst,
      tides,
      observation,
      wiki,
      nearbyStorms,
    };
  },
);
