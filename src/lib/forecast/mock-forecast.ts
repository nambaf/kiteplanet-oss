import { MOCK_SNAPSHOT_MAP } from "./mock-events";
import type { ForecastHour, Spot, SpotForecast } from "@/lib/types";

// forecast demo 72h derivato da MOCK_SNAPSHOT_MAP[spot.id] con modulazione diurna ±25% del vento.
// A h=0 ritorna esattamente lo snapshot, così il "now" della spot page combacia col pin della home.
export function buildMockForecast(spot: Spot, hours: number = 72): SpotForecast {
  const snap = MOCK_SNAPSHOT_MAP[spot.id];
  const baseWind = snap?.windKn ?? 0;
  const baseGust = snap?.gustKn ?? baseWind + 4;
  const baseDir = snap?.windDirDeg ?? 0;
  const baseHs = snap?.waveHeightM;
  const baseT = baseHs !== undefined ? 4 + baseHs * 2 : undefined;
  const baseWaveDir =
    baseHs !== undefined ? (baseDir + 20) % 360 : undefined;
  const gustDelta = Math.max(0, baseGust - baseWind);

  const now = new Date();
  now.setMinutes(0, 0, 0);
  const fetchedAt = now.toISOString();
  const tempBase = climateBase(spot.lat);

  const hourly: ForecastHour[] = [];
  for (let h = 0; h < hours; h++) {
    const t = new Date(now.getTime() + h * 3600_000);
    const localHour = h % 24;
    // a h=0 sin=0 → fattore 1 → windKn = baseWind (corrisponde allo snapshot)
    const windFactor = 1 + 0.25 * Math.sin((2 * Math.PI * h) / 24);
    const windKn = Math.max(0, baseWind * windFactor);
    const gustKn = windKn + gustDelta;
    const tempC =
      tempBase + 4 * Math.sin((2 * Math.PI * (localHour - 9)) / 24);
    const hour: ForecastHour = {
      timeIso: t.toISOString(),
      windKn,
      gustKn,
      windDirDeg: baseDir,
      tempC,
      precipMm: 0,
    };
    if (baseHs !== undefined) {
      hour.waveHeightM = Math.max(
        0,
        baseHs * (1 + 0.1 * Math.sin((2 * Math.PI * h) / 36)),
      );
      hour.wavePeriodS = baseT;
      hour.waveDirDeg = baseWaveDir;
    }
    hourly.push(hour);
  }

  return { spotId: spot.id, fetchedAt, hourly };
}

function climateBase(lat: number): number {
  const a = Math.abs(lat);
  if (a < 23.5) return 26;
  if (a < 35) return 22;
  if (a < 50) return 18;
  return 12;
}
