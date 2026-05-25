import type { Spot } from "@/lib/types";
import type { SpotSnapshot } from "@/lib/forecast/snapshot";

export type FilterKey = "tutti" | "vento" | "wave" | "flat" | "storm";

export const FILTER_KEYS: FilterKey[] = [
  "tutti",
  "vento",
  "wave",
  "flat",
  "storm",
];

const WIND_THRESHOLD_KN = 15; // soglia del chip "vento": sopra è vento "vero"
const WAVE_THRESHOLD_M = 0.8;

export function spotMatchesFilter(
  spot: Spot,
  snap: SpotSnapshot | undefined,
  filter: FilterKey,
): boolean {
  switch (filter) {
    case "tutti":
      return true;
    case "vento":
      return (snap?.windKn ?? 0) >= WIND_THRESHOLD_KN;
    case "wave":
      return (
        spot.waterType === "wave" ||
        (snap?.waveHeightM ?? 0) > WAVE_THRESHOLD_M ||
        (snap?.events.includes("big-swell") ?? false)
      );
    case "flat":
      return spot.waterType === "flat" || spot.waterType === "lagoon";
    case "storm":
      return snap?.events.includes("storm") ?? false;
  }
}
