import { SEED_SPOTS } from "@/data/spots";
import type { OnStatus, Spot, WindDirection } from "@/lib/types";
import type { SnapshotMap, SpotEvent, SpotSnapshot } from "./snapshot";

// override hero per il globo in demo mode (snapshot reali: /api/snapshots, raw Open-Meteo)
const MOCK_OVERRIDES: Record<string, Partial<SpotSnapshot>> = {
  // --- Mediterraneo ---
  "es-tarifa": {
    windKn: 28,
    gustKn: 38,
    windDirDeg: 90, // Levante
    waveHeightM: 2.5,
    events: ["storm", "strong-wind"],
    match: {
      status: "on",
      score: 95,
      reasons: ["levante a 28kn", "onda 2.5m"],
      recommendedKiteSize: 6,
    },
  },
  "gr-prasonisi": {
    windKn: 24,
    gustKn: 33,
    windDirDeg: 315, // NW (meltemi)
    waveHeightM: 1.2,
    events: ["strong-wind"],
    match: {
      status: "on",
      score: 90,
      reasons: ["meltemi 24kn"],
      recommendedKiteSize: 7,
    },
  },
  "it-stagnone": {
    windKn: 14,
    gustKn: 18,
    windDirDeg: 270, // W
    events: [],
    match: {
      status: "on",
      score: 85,
      reasons: ["ponente termico 14kn"],
      recommendedKiteSize: 11,
    },
  },
  // --- Mar Rosso ---
  "eg-elgouna": {
    windKn: 18,
    gustKn: 22,
    windDirDeg: 0, // N
    waveHeightM: 1.6,
    events: ["big-swell"],
    match: {
      status: "on",
      score: 92,
      reasons: ["tramontana 18kn", "swell 1.6m"],
      recommendedKiteSize: 9,
    },
  },
  // --- Caraibi ---
  "do-cabarete": {
    windKn: 22,
    gustKn: 28,
    windDirDeg: 60, // ENE trades
    waveHeightM: 1.4,
    events: ["strong-wind"],
    match: {
      status: "on",
      score: 91,
      reasons: ["alisei 22kn", "side-onshore"],
      recommendedKiteSize: 8,
    },
  },
  // --- Brasile ---
  "br-cumbuco": {
    windKn: 26,
    gustKn: 32,
    windDirDeg: 100, // E
    waveHeightM: 1.0,
    events: ["strong-wind"],
    match: {
      status: "on",
      score: 93,
      reasons: ["alisei costanti 26kn"],
      recommendedKiteSize: 7,
    },
  },
  // --- Hawaii ---
  "us-kanaha": {
    windKn: 23,
    gustKn: 30,
    windDirDeg: 60, // ENE trades
    waveHeightM: 2.0,
    events: ["strong-wind", "big-swell"],
    match: {
      status: "on",
      score: 94,
      reasons: ["trade winds 23kn", "swell North Pacific"],
      recommendedKiteSize: 7,
    },
  },
  // --- Oceano Indiano ---
  "mu-lemorne": {
    windKn: 20,
    gustKn: 25,
    windDirDeg: 130, // SE trades
    waveHeightM: 1.8,
    events: ["big-swell"],
    match: {
      status: "on",
      score: 90,
      reasons: ["alisei SE 20kn", "reef break"],
      recommendedKiteSize: 9,
    },
  },
  // --- SE Asia ---
  "vn-muine": {
    windKn: 19,
    gustKn: 24,
    windDirDeg: 60, // NE monsoon
    waveHeightM: 0.8,
    events: [],
    match: {
      status: "on",
      score: 88,
      reasons: ["monsone NE 19kn"],
      recommendedKiteSize: 9,
    },
  },
  // --- Oceania ---
  "au-lancelin": {
    windKn: 25,
    gustKn: 31,
    windDirDeg: 200, // SSW Fremantle Doctor
    waveHeightM: 1.3,
    events: ["strong-wind"],
    match: {
      status: "on",
      score: 92,
      reasons: ["Fremantle Doctor 25kn"],
      recommendedKiteSize: 7,
    },
  },
};

// generatore procedurale deterministico (hash FNV-1a su spot.id): in demo TUTTI gli spot hanno dati
const WIND_DEG: Record<WindDirection, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
  E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
  W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

function strHash(s: string): number {
  // FNV-1a 32-bit: deterministico e dependency-free
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function recommendedSize(windKn: number): number | undefined {
  if (windKn < 8) return undefined;
  if (windKn < 12) return 12;
  if (windKn < 16) return 10;
  if (windKn < 22) return 9;
  if (windKn < 28) return 7;
  return 5;
}

function generateMockSnapshot(spot: Spot): SpotSnapshot {
  const h = strHash(spot.id);
  // distribuzione 70% on / 20% marginal / 10% off: vario ma credibile
  const tier = h % 10;
  const status: OnStatus = tier < 7 ? "on" : tier < 9 ? "marginal" : "off";

  const range = Math.max(2, spot.windMaxKn - spot.windMinKn);
  let windKn: number;
  if (status === "on") {
    windKn = spot.windMinKn + 2 + ((h >> 4) % range);
  } else if (status === "marginal") {
    windKn = spot.windMinKn - 2 + ((h >> 4) % 4);
  } else {
    windKn = Math.max(2, spot.windMinKn - 8 + ((h >> 4) % 6));
  }
  windKn = Math.max(0, Math.min(45, windKn));

  const gustKn = windKn + 3 + ((h >> 8) % 6);

  // direzione dalle optimal dello spot se on/marginal (cardinal coerente), random altrimenti
  const windDirDeg =
    spot.optimalDirections.length > 0 && status !== "off"
      ? WIND_DEG[spot.optimalDirections[(h >> 12) % spot.optimalDirections.length]]
      : (h >> 12) % 360;

  // onda coerente col waterType dello spot
  const waveHeightM =
    spot.waterType === "lagoon"
      ? undefined
      : spot.waterType === "wave"
        ? 1.2 + ((h >> 16) % 14) / 10
        : spot.waterType === "chop"
          ? 0.5 + ((h >> 16) % 8) / 10
          : 0.3 + ((h >> 16) % 5) / 10;

  const events: SpotEvent[] = [];
  if (gustKn > 32) events.push("strong-wind");
  if (waveHeightM !== undefined && waveHeightM > 2) events.push("big-swell");

  const score =
    status === "on"
      ? 72 + (h % 24)
      : status === "marginal"
        ? 50 + (h % 18)
        : 22 + (h % 22);

  const reasons: string[] = [];
  if (status === "on") reasons.push(`vento ${Math.round(windKn)}kn (demo)`);
  if (waveHeightM !== undefined && waveHeightM > 1) {
    reasons.push(`onda ${waveHeightM.toFixed(1)}m`);
  }

  return {
    spotId: spot.id,
    windKn,
    gustKn,
    windDirDeg,
    waveHeightM,
    events,
    match: {
      status,
      score,
      reasons,
      recommendedKiteSize: recommendedSize(windKn),
    },
  };
}

function mergeOverride(base: SpotSnapshot, override: Partial<SpotSnapshot>): SpotSnapshot {
  const events = override.events
    ? (Array.from(new Set([...base.events, ...override.events])) as SpotEvent[])
    : base.events;
  return { ...base, ...override, events };
}

function buildMockSnapshotMap(): SnapshotMap {
  const map: SnapshotMap = {};
  for (const spot of SEED_SPOTS) {
    const base = generateMockSnapshot(spot);
    const override = MOCK_OVERRIDES[spot.id];
    map[spot.id] = override ? mergeOverride(base, override) : base;
  }
  return map;
}

// snapshot demo per la home: hero curati + resto procedurale, calcolati una volta al load del modulo
export const MOCK_SNAPSHOT_MAP: SnapshotMap = buildMockSnapshotMap();

// back-compat: in demo mode preferire direttamente MOCK_SNAPSHOT_MAP
export function applyMocks(snaps: SnapshotMap): SnapshotMap {
  return { ...snaps, ...MOCK_SNAPSHOT_MAP };
}
