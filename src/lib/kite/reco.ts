import type {
  ForecastHour,
  Spot,
  SpotMatch,
  WindDirection,
} from "@/lib/types";
import { WIND_DIRECTIONS } from "@/lib/types";

const DIR_STEP = 360 / WIND_DIRECTIONS.length; // 22.5°

export function degToCardinal(deg: number): WindDirection {
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalized / DIR_STEP) % WIND_DIRECTIONS.length;
  return WIND_DIRECTIONS[idx];
}

export function cardinalToDeg(card: WindDirection): number {
  return WIND_DIRECTIONS.indexOf(card) * DIR_STEP;
}

export function angleDelta(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

// vento meteo = da DOVE viene; onshore = opposto al beach azimuth. offshore = porta al largo (pericoloso)
export function windRelativeToBeach(
  windFromDeg: number,
  beachAzimuthDeg: number,
): "onshore" | "side-on" | "side" | "side-off" | "offshore" {
  const onshoreDir = (beachAzimuthDeg + 180) % 360;
  const delta = angleDelta(windFromDeg, onshoreDir);

  if (delta <= 30) return "onshore";
  if (delta <= 60) return "side-on";
  if (delta <= 120) return "side";
  if (delta <= 150) return "side-off";
  return "offshore";
}

// taglia stimata in m² per kiter ~75 kg, formula empirica. undefined fuori range
export function kiteSize(windKn: number): number | undefined {
  if (windKn < 6 || windKn > 50) return undefined;
  const raw = (75 / windKn) * 2.2;
  return Math.max(5, Math.min(17, Math.round(raw)));
}

interface MatchInputs {
  spot: Spot;
  hour: ForecastHour;
}

export function matchHour({ spot, hour }: MatchInputs): SpotMatch {
  const reasons: string[] = [];
  let score = 100;

  const wind = hour.windKn;
  const cardinal = degToCardinal(hour.windDirDeg);

  const directionOk = spot.optimalDirections.includes(cardinal);
  if (!directionOk) {
    score -= 50;
    reasons.push(`direzione ${cardinal} non ottimale`);
  } else {
    reasons.push(`direzione ${cardinal} ✓`);
  }

  if (wind < spot.windMinKn) {
    score -= 60;
    reasons.push(`vento debole (${Math.round(wind)} kn < ${spot.windMinKn})`);
  } else if (wind > spot.windMaxKn) {
    score -= 30;
    reasons.push(`vento forte (${Math.round(wind)} kn > ${spot.windMaxKn})`);
  } else {
    reasons.push(`${Math.round(wind)} kn nel range`);
  }

  const rel = windRelativeToBeach(hour.windDirDeg, spot.beachAzimuth);
  if (rel === "offshore") {
    score -= 70;
    reasons.push("vento offshore (rischio)");
  } else if (rel === "side-off") {
    score -= 15;
    reasons.push("vento side-off");
  }

  score = Math.max(0, Math.min(100, score));
  const status: SpotMatch["status"] =
    score >= 75 ? "on" : score >= 45 ? "marginal" : "off";

  return { status, score, reasons, recommendedKiteSize: kiteSize(wind) };
}
