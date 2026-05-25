import { providerFetch } from "./resilience";
import type {
  ActiveStorm,
  ProviderAvailability,
  StormCategory,
  StormProvider,
} from "./types";

const NHC_URL =
  process.env.NHC_GEOJSON ?? "https://www.nhc.noaa.gov/CurrentStorms.json";

// shape parziale del feed NHC (https://www.nhc.noaa.gov/CurrentStorms.json)
interface NhcResponse {
  activeStorms?: Array<{
    id: string;
    binNumber?: string;
    name: string;
    classification?: string; // "TD", "TS", "HU", "MH" ...
    intensity?: string; // wind in kt as string
    pressure?: string;
    latitude?: string; // "12.3N" o numero
    latitudeNumeric?: number;
    longitude?: string; // "45.6W"
    longitudeNumeric?: number;
    movementDir?: number;
    movementSpeed?: number;
    publicAdvisory?: { url?: string };
    forecastAdvisory?: { url?: string };
  }>;
}

function parseCoord(value: number | string | undefined): number | null {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || !value) return null;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return null;
  if (/S$/i.test(value) || /W$/i.test(value)) return -num;
  return num;
}

function normalizeCategory(c: string | undefined): StormCategory {
  const v = (c ?? "").toUpperCase();
  if (v === "TD" || v === "TS" || v === "HU" || v === "MH" || v === "EX" || v === "PT") {
    return v;
  }
  return "TS";
}

function bearingToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((deg % 360) / 45)) % 8;
  return dirs[idx];
}

function available(): ProviderAvailability {
  return { ok: true };
}

export const nhc: StormProvider = {
  id: "nhc",
  name: "NHC (NOAA)",
  categories: ["storm"],
  requiresKey: false,
  envVars: ["NHC_GEOJSON"],
  attribution: "Tropical cyclone data: National Hurricane Center (NOAA, public domain)",
  homeUrl: "https://www.nhc.noaa.gov",
  docsUrl: "https://www.nhc.noaa.gov/aboutnhcprod.shtml",
  license: "Public domain (U.S. Government work)",
  freeTier: "Illimitato",
  available,
  async fetchActiveStorms(): Promise<ActiveStorm[]> {
    const res = await providerFetch(NHC_URL, AbortSignal.timeout(5000), {
      revalidateSec: 60 * 30,
    });
    if (!res.ok) throw new Error(`NHC HTTP ${res.status}`);
    const data = (await res.json()) as NhcResponse;
    const storms = data.activeStorms ?? [];
    const out: ActiveStorm[] = [];
    for (const s of storms) {
      const lat = s.latitudeNumeric ?? parseCoord(s.latitude);
      const lng = s.longitudeNumeric ?? parseCoord(s.longitude);
      if (lat === null || lng === null) continue;
      out.push({
        id: s.id,
        name: s.name,
        category: normalizeCategory(s.classification),
        basin: s.binNumber?.slice(0, 2) ?? "",
        lat,
        lng,
        windKn: s.intensity ? Number(s.intensity) : undefined,
        movementDir:
          typeof s.movementDir === "number"
            ? bearingToCompass(s.movementDir)
            : undefined,
        movementSpeedKn:
          typeof s.movementSpeed === "number" ? s.movementSpeed : undefined,
        advisoryUrl: s.publicAdvisory?.url ?? s.forecastAdvisory?.url,
      });
    }
    return out;
  },
};

// distanza great-circle in km (Haversine)
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
