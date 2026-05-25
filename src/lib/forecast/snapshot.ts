import type { ForecastHour, SpotMatch } from "@/lib/types";

export type SpotEvent = "storm" | "big-swell" | "strong-wind";

export interface SpotSnapshot {
  spotId: string;
  windKn: number;
  gustKn: number;
  windDirDeg: number;
  waveHeightM?: number; // Hs in metri, se disponibile dalla marine API
  match: SpotMatch;
  events: SpotEvent[];
}

export type SnapshotMap = Record<string, SpotSnapshot>;

const STORM_PRECIP_MM = 2;
const BIG_SWELL_M = 2;
const STRONG_GUST_KN = 32;

// eventi notevoli per un'ora di forecast; conservativo: meglio falso negativo che positivo
export function computeEvents(hour: ForecastHour): SpotEvent[] {
  const events: SpotEvent[] = [];
  if (hour.precipMm > STORM_PRECIP_MM) events.push("storm");
  if (hour.waveHeightM !== undefined && hour.waveHeightM > BIG_SWELL_M) {
    events.push("big-swell");
  }
  if (hour.gustKn > STRONG_GUST_KN) events.push("strong-wind");
  return events;
}

export const EVENT_EMOJI: Record<SpotEvent, string> = {
  storm: "⚡",
  "big-swell": "🌊",
  "strong-wind": "🌬",
};

export const EVENT_LABEL: Record<SpotEvent, string> = {
  storm: "temporale",
  "big-swell": "swell grosso",
  "strong-wind": "raffiche forti",
};
