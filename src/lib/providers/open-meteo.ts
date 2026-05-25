import { fetchSpotForecast } from "@/lib/forecast/open-meteo";
import { providerFetch } from "./resilience";
import type {
  ProviderAvailability,
  SeaTempSample,
  SstProvider,
  WindWaveProvider,
} from "./types";

const MARINE_BASE =
  process.env.OPEN_METEO_MARINE_BASE ?? "https://marine-api.open-meteo.com/v1";

const META = {
  id: "open-meteo" as const,
  name: "Open-Meteo",
  categories: ["wind", "wave", "sst"] as Array<"wind" | "wave" | "sst">,
  requiresKey: false,
  envVars: [
    "OPEN_METEO_BASE",
    "OPEN_METEO_MARINE_BASE",
    "OPEN_METEO_TIMEOUT_MS",
  ],
  attribution: "Weather data by Open-Meteo.com",
  homeUrl: "https://open-meteo.com",
  docsUrl: "https://open-meteo.com/en/docs",
  license: "CC BY 4.0",
  freeTier: "<10.000 chiamate/giorno, uso non-commerciale, no API key",
};

function available(): ProviderAvailability {
  return { ok: true };
}

export const openMeteoForecast: WindWaveProvider = {
  ...META,
  available,
  async fetchForecast(spotId, lat, lng, hours = 72) {
    return fetchSpotForecast(spotId, lat, lng, hours);
  },
};

// sea surface temperature via marine API
interface SstResponse {
  current?: {
    time: string;
    sea_surface_temperature?: number;
  };
}

export const openMeteoSst: SstProvider = {
  ...META,
  available,
  async fetchSst(lat, lng) {
    const url = new URL(`${MARINE_BASE}/marine`);
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("current", "sea_surface_temperature");
    url.searchParams.set("timezone", "auto");
    const res = await providerFetch(url.toString(), AbortSignal.timeout(4000), {
      revalidateSec: 60 * 60,
    });
    if (!res.ok) throw new Error(`Open-Meteo SST HTTP ${res.status}`);
    const data = (await res.json()) as SstResponse;
    if (!data.current || data.current.sea_surface_temperature === undefined) {
      return null;
    }
    return {
      timeIso: data.current.time,
      sstC: data.current.sea_surface_temperature,
    } satisfies SeaTempSample;
  },
};
