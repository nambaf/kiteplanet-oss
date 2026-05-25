import { providerFetch } from "@/lib/providers/resilience";
import type { ForecastHour, SpotForecast } from "@/lib/types";

const FORECAST_BASE =
  process.env.OPEN_METEO_BASE ?? "https://api.open-meteo.com/v1";
const MARINE_BASE =
  process.env.OPEN_METEO_MARINE_BASE ?? "https://marine-api.open-meteo.com/v1";

// timeout per uso standalone (senza signal da withResilience). Default 8s, override via env
const TIMEOUT_MS = Number(process.env.OPEN_METEO_TIMEOUT_MS ?? 8000);

const REVALIDATE_SEC = 60 * 15;

const HOURLY_VARS = [
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "temperature_2m",
  "precipitation",
];

const MARINE_VARS = ["wave_height", "wave_period", "wave_direction"];

// variabili ridotte per la snapshot home: niente temperature/marine (big-swell non scatta, ok qui)
const HOURLY_VARS_SLIM = [
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "precipitation",
];

interface OpenMeteoForecastResponse {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    temperature_2m: number[];
    precipitation: number[];
  };
}

interface OpenMeteoMarineResponse {
  hourly: {
    time: string[];
    wave_height: (number | null)[];
    wave_period: (number | null)[];
    wave_direction: (number | null)[];
  };
}

const MS_TO_KN = 1.94384;

// previsioni 72h: forecast atmosferico + marine opzionale (laguna chiusa = niente onda)
export async function fetchSpotForecast(
  spotId: string,
  lat: number,
  lng: number,
  hours = 72,
  signal?: AbortSignal,
): Promise<SpotForecast> {
  const days = Math.ceil(hours / 24);
  const effectiveSignal = signal ?? AbortSignal.timeout(TIMEOUT_MS);

  const forecastUrl = new URL(`${FORECAST_BASE}/forecast`);
  forecastUrl.searchParams.set("latitude", lat.toString());
  forecastUrl.searchParams.set("longitude", lng.toString());
  forecastUrl.searchParams.set("hourly", HOURLY_VARS.join(","));
  forecastUrl.searchParams.set("wind_speed_unit", "ms");
  forecastUrl.searchParams.set("forecast_days", days.toString());
  forecastUrl.searchParams.set("timezone", "auto");

  const marineUrl = new URL(`${MARINE_BASE}/marine`);
  marineUrl.searchParams.set("latitude", lat.toString());
  marineUrl.searchParams.set("longitude", lng.toString());
  marineUrl.searchParams.set("hourly", MARINE_VARS.join(","));
  marineUrl.searchParams.set("forecast_days", days.toString());
  marineUrl.searchParams.set("timezone", "auto");

  const [forecastRes, marineRes] = await Promise.all([
    providerFetch(forecastUrl.toString(), effectiveSignal, {
      revalidateSec: REVALIDATE_SEC,
    }),
    // marine può fallire (laguna chiusa, timeout): non deve affossare il forecast
    providerFetch(marineUrl.toString(), effectiveSignal, {
      revalidateSec: REVALIDATE_SEC,
    }).catch(() => null),
  ]);

  if (!forecastRes.ok) {
    throw new Error(
      `Open-Meteo forecast failed: ${forecastRes.status} ${forecastRes.statusText}`,
    );
  }

  const forecast = (await forecastRes.json()) as OpenMeteoForecastResponse;
  const marine =
    marineRes && marineRes.ok
      ? ((await marineRes.json()) as OpenMeteoMarineResponse)
      : null;

  const hourly: ForecastHour[] = forecast.hourly.time
    .slice(0, hours)
    .map((iso, i) => {
      const marineIdx = marine?.hourly.time.indexOf(iso) ?? -1;
      const waveOk = marine && marineIdx >= 0;

      return {
        timeIso: iso,
        windKn: forecast.hourly.wind_speed_10m[i] * MS_TO_KN,
        gustKn: forecast.hourly.wind_gusts_10m[i] * MS_TO_KN,
        windDirDeg: forecast.hourly.wind_direction_10m[i],
        tempC: forecast.hourly.temperature_2m[i],
        precipMm: forecast.hourly.precipitation[i],
        waveHeightM: waveOk
          ? (marine!.hourly.wave_height[marineIdx] ?? undefined)
          : undefined,
        wavePeriodS: waveOk
          ? (marine!.hourly.wave_period[marineIdx] ?? undefined)
          : undefined,
        waveDirDeg: waveOk
          ? (marine!.hourly.wave_direction[marineIdx] ?? undefined)
          : undefined,
      };
    });

  return {
    spotId,
    fetchedAt: new Date().toISOString(),
    hourly,
  };
}

interface OpenMeteoForecastResponseSlim {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    precipitation: number[];
  };
}

export interface SpotSnapshotHour {
  timeIso: string;
  windKn: number;
  gustKn: number;
  windDirDeg: number;
  precipMm: number;
}

// una sola chiamata HTTP per N coordinate (lat/lng comma-separated); slot non risolvibili → null
export async function fetchSpotSnapshotHoursBulk(
  coords: Array<{ lat: number; lng: number }>,
  signal?: AbortSignal,
): Promise<Array<SpotSnapshotHour | null>> {
  if (coords.length === 0) return [];
  const effectiveSignal = signal ?? AbortSignal.timeout(TIMEOUT_MS);

  const url = new URL(`${FORECAST_BASE}/forecast`);
  url.searchParams.set("latitude", coords.map((c) => c.lat).join(","));
  url.searchParams.set("longitude", coords.map((c) => c.lng).join(","));
  url.searchParams.set("hourly", HOURLY_VARS_SLIM.join(","));
  url.searchParams.set("wind_speed_unit", "ms");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  const res = await providerFetch(url.toString(), effectiveSignal, {
    revalidateSec: REVALIDATE_SEC,
  });
  if (!res.ok) {
    throw new Error(
      `Open-Meteo bulk failed: ${res.status} ${res.statusText}`,
    );
  }
  const raw = (await res.json()) as
    | OpenMeteoForecastResponseSlim
    | OpenMeteoForecastResponseSlim[];
  // Open-Meteo ritorna un oggetto con 1 coordinata, un array con N: normalizzo
  const entries: Array<OpenMeteoForecastResponseSlim | null> = Array.isArray(raw)
    ? raw
    : [raw];

  return coords.map((_, i) => {
    const data = entries[i];
    if (!data?.hourly?.time?.length) return null;
    return {
      timeIso: data.hourly.time[0],
      windKn: data.hourly.wind_speed_10m[0] * MS_TO_KN,
      gustKn: data.hourly.wind_gusts_10m[0] * MS_TO_KN,
      windDirDeg: data.hourly.wind_direction_10m[0],
      precipMm: data.hourly.precipitation[0],
    };
  });
}
