import { providerFetch } from "./resilience";
import type {
  BuoyObservation,
  ObservationProvider,
  ProviderAvailability,
} from "./types";

const NDBC_BASE =
  process.env.NDBC_BASE ?? "https://www.ndbc.noaa.gov/data/realtime2";

const MS_TO_KN = 1.94384;

// NDBC: testo fixed-width, righe `#` = header/unità, prima riga dati = più recente, mancanti = `MM`.
// Schema: #YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS PTDY TIDE
export function parseNdbcLatest(text: string): BuoyObservation | null {
  const lines = text.split(/\r?\n/);
  let headerCols: string[] | null = null;
  for (const line of lines) {
    if (line.startsWith("#")) {
      if (!headerCols && line.startsWith("#YY")) {
        headerCols = line.replace(/^#/, "").trim().split(/\s+/);
      }
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cols = trimmed.split(/\s+/);
    if (!headerCols || cols.length < 5) continue;

    const get = (col: string): string | undefined => {
      const idx = headerCols!.indexOf(col);
      if (idx < 0 || idx >= cols.length) return undefined;
      const v = cols[idx];
      if (!v || v === "MM" || v === "99.0" || v === "999.0") return undefined;
      return v;
    };

    const num = (col: string): number | undefined => {
      const v = get(col);
      if (v === undefined) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const yyyy = get("YY") ?? "1970";
    const mm = (get("MM") ?? "01").padStart(2, "0");
    const dd = (get("DD") ?? "01").padStart(2, "0");
    const hh = (get("hh") ?? "00").padStart(2, "0");
    const mn = (get("mm") ?? "00").padStart(2, "0");
    const observedAtIso = `${yyyy}-${mm}-${dd}T${hh}:${mn}:00Z`;

    const wspd = num("WSPD"); // m/s
    const gst = num("GST"); // m/s
    return {
      stationId: "",
      observedAtIso,
      windKn: wspd === undefined ? undefined : wspd * MS_TO_KN,
      gustKn: gst === undefined ? undefined : gst * MS_TO_KN,
      windDirDeg: num("WDIR"),
      waveHeightM: num("WVHT"),
      wavePeriodS: num("DPD") ?? num("APD"),
      waterTempC: num("WTMP"),
      airTempC: num("ATMP"),
    };
  }
  return null;
}

function available(): ProviderAvailability {
  return { ok: true };
}

export const ndbc: ObservationProvider = {
  id: "noaa-ndbc",
  name: "NOAA NDBC",
  categories: ["observation"],
  requiresKey: false,
  envVars: ["NDBC_BASE"],
  attribution:
    "Observations: National Data Buoy Center (NOAA, public domain)",
  homeUrl: "https://www.ndbc.noaa.gov",
  docsUrl: "https://www.ndbc.noaa.gov/measdes.shtml",
  license: "Public domain (U.S. Government work)",
  freeTier: "No key, nessun rate limit formale (uso responsabile richiesto)",
  available,
  async fetchBuoy(stationId: string) {
    if (!stationId) return null;
    const url = `${NDBC_BASE}/${encodeURIComponent(stationId)}.txt`;
    const res = await providerFetch(url, AbortSignal.timeout(5000), {
      revalidateSec: 60 * 30,
      headers: { Accept: "text/plain" },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`NDBC HTTP ${res.status}`);
    const text = await res.text();
    const obs = parseNdbcLatest(text);
    if (!obs) return null;
    return { ...obs, stationId };
  },
};
