import { providerFetch } from "./resilience";
import type {
  ProviderAvailability,
  TideExtreme,
  TideProvider,
} from "./types";

const BASE =
  process.env.STORMGLASS_BASE ?? "https://api.stormglass.io/v2";

function getKey(): string | undefined {
  const k = process.env.STORMGLASS_API_KEY?.trim();
  return k && k.length > 0 ? k : undefined;
}

interface TideExtremeResp {
  data: Array<{
    time: string;
    type: "high" | "low";
    height: number;
  }>;
}

function available(): ProviderAvailability {
  if (!getKey()) return { ok: false, reason: "no-key" };
  return { ok: true };
}

export const stormglass: TideProvider = {
  id: "stormglass",
  name: "Stormglass",
  categories: ["tide"],
  requiresKey: true,
  envVars: ["STORMGLASS_API_KEY", "STORMGLASS_BASE"],
  attribution: "Tide data: Stormglass.io",
  homeUrl: "https://stormglass.io",
  docsUrl: "https://docs.stormglass.io",
  license: "Stormglass Terms of Service",
  freeTier: "10 chiamate/giorno con registrazione",
  available,
  async fetchTideExtremes(lat, lng, days = 5): Promise<TideExtreme[]> {
    const key = getKey();
    if (!key) return [];

    const start = new Date();
    const end = new Date(start.getTime() + days * 24 * 3600 * 1000);
    const url = new URL(`${BASE}/tide/extremes/point`);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lng", lng.toString());
    url.searchParams.set("start", String(Math.floor(start.getTime() / 1000)));
    url.searchParams.set("end", String(Math.floor(end.getTime() / 1000)));

    // cache 24h: le maree astronomiche cambiano poco e il free tier è risicato
    const res = await providerFetch(url.toString(), AbortSignal.timeout(6000), {
      revalidateSec: 60 * 60 * 24,
      headers: { Authorization: key },
    });
    if (!res.ok) throw new Error(`Stormglass HTTP ${res.status}`);
    const json = (await res.json()) as TideExtremeResp;
    return (json.data ?? []).map((d) => ({
      timeIso: d.time,
      type: d.type,
      heightM: d.height,
    }));
  },
};
