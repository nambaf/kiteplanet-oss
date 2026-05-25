import type { ForecastHour, SpotForecast } from "@/lib/types";

export type ProviderId =
  | "open-meteo"
  | "noaa-ndbc"
  | "stormglass"
  | "wikipedia"
  | "nhc";

export type ProviderCategory =
  | "wind"
  | "wave"
  | "sst"
  | "tide"
  | "observation"
  | "encyclopedia"
  | "storm";

export type ProviderStatus =
  | "live"
  | "cache"
  | "unavailable"
  | "requires-key"
  | "disabled"
  | "demo";

export type Lang = "it" | "en";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  categories: ProviderCategory[];
  requiresKey: boolean;
  envVars: string[]; // env lette dal provider, mostrate in /data-sources
  attribution: string;
  homeUrl: string;
  docsUrl: string;
  license: string;
  freeTier: string;
}

export interface ProviderAvailability {
  ok: boolean;
  reason?: "no-key" | "disabled";
}

export interface DataProvider extends ProviderMeta {
  available(): ProviderAvailability;
}

export interface ProviderResult<T> {
  data: T | null;
  source: ProviderStatus;
  fetchedAt: string;
  provider: ProviderId;
  error?: string;
}

// capability mixins
export interface WindWaveProvider extends DataProvider {
  fetchForecast(
    spotId: string,
    lat: number,
    lng: number,
    hours?: number,
  ): Promise<SpotForecast>;
}

export interface SeaTempSample {
  timeIso: string;
  sstC: number;
}
export interface SstProvider extends DataProvider {
  fetchSst(lat: number, lng: number): Promise<SeaTempSample | null>;
}

export interface TideExtreme {
  timeIso: string;
  type: "high" | "low";
  heightM: number; // sul livello medio
}
export interface TideProvider extends DataProvider {
  fetchTideExtremes(
    lat: number,
    lng: number,
    days?: number,
  ): Promise<TideExtreme[]>;
}

export interface BuoyObservation {
  stationId: string;
  observedAtIso: string;
  windKn?: number;
  gustKn?: number;
  windDirDeg?: number;
  waveHeightM?: number;
  wavePeriodS?: number;
  waterTempC?: number;
  airTempC?: number;
}
export interface ObservationProvider extends DataProvider {
  fetchBuoy(stationId: string): Promise<BuoyObservation | null>;
}

export interface WikiSummary {
  title: string;
  summary: string;
  url: string;
  thumbUrl?: string;
  lang: Lang;
}
export interface WikiProvider extends DataProvider {
  fetchSummary(title: string, lang: Lang): Promise<WikiSummary | null>;
}

export type StormCategory = "TD" | "TS" | "HU" | "MH" | "EX" | "PT";
export interface ActiveStorm {
  id: string;
  name: string;
  category: StormCategory;
  basin: string;
  lat: number;
  lng: number;
  windKn?: number; // vento sostenuto max (NHC: intensity)
  movementDir?: string;
  movementSpeedKn?: number;
  advisoryUrl?: string;
}
export interface StormProvider extends DataProvider {
  fetchActiveStorms(): Promise<ActiveStorm[]>;
}

// snapshot serializzabile per la UI (server → client)
export interface ProviderStatusSnapshot {
  id: ProviderId;
  name: string;
  categories: ProviderCategory[];
  status: ProviderStatus;
  reason?: "no-key" | "disabled";
}

export type { ForecastHour, SpotForecast };
