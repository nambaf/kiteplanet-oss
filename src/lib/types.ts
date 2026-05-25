export type WaterType = "flat" | "chop" | "wave" | "lagoon";

export type WindDirection =
  | "N" | "NNE" | "NE" | "ENE"
  | "E" | "ESE" | "SE" | "SSE"
  | "S" | "SSW" | "SW" | "WSW"
  | "W" | "WNW" | "NW" | "NNW";

export const WIND_DIRECTIONS: WindDirection[] = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW",
  "W", "WNW", "NW", "NNW",
];

export interface SpotExternalRefs {
  ndbcBuoyId?: string;
  // opt-in: Stormglass costa 10 req/giorno sul free tier
  stormglassEnabled?: boolean;
  wikipediaTitle?: { it?: string; en?: string };
}

export interface Spot {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  // direzione verso cui guarda la spiaggia: 0=N, 90=E, 180=S, 270=W
  beachAzimuth: number;
  waterType: WaterType;
  windMinKn: number;
  windMaxKn: number;
  optimalDirections: WindDirection[];
  hazards?: string;
  seasonMonths: number[]; // mesi 1-12 della stagione consigliata
  description: string;
  refs?: SpotExternalRefs;
}

export interface ForecastHour {
  timeIso: string;
  windKn: number;
  gustKn: number;
  windDirDeg: number;
  tempC: number;
  precipMm: number;
  // campi marine opzionali: undefined se non disponibili per lo spot
  waveHeightM?: number;
  wavePeriodS?: number;
  waveDirDeg?: number;
}

export interface SpotForecast {
  spotId: string;
  fetchedAt: string;
  hourly: ForecastHour[];
}

export type OnStatus = "on" | "marginal" | "off";

export interface SpotMatch {
  status: OnStatus;
  score: number; // 0-100 per ranking
  reasons: string[];
  recommendedKiteSize?: number; // m², undefined se vento fuori range
}
