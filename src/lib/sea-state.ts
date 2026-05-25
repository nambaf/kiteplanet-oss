// scala Douglas dello stato del mare (WMO 3700) su altezza onda significativa Hs (m).
// La tabella di soglie/label è TABLE qui sotto.
export type SeaStateLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SeaStateInfo {
  level: SeaStateLevel;
  labelIt: string;
  labelEn: string;
  bucket: "flat" | "chop" | "rough" | "storm"; // hint colore
}

const TABLE: ReadonlyArray<
  readonly [SeaStateLevel, number, string, string, SeaStateInfo["bucket"]]
> = [
  [0, 0.0, "calmo (specchio)", "calm (glassy)", "flat"],
  [1, 0.1, "quasi calmo", "calm (rippled)", "flat"],
  [2, 0.5, "poco mosso", "smooth", "chop"],
  [3, 1.25, "mosso", "slight", "chop"],
  [4, 2.5, "molto mosso", "moderate", "rough"],
  [5, 4.0, "agitato", "rough", "rough"],
  [6, 6.0, "molto agitato", "very rough", "storm"],
  [7, 9.0, "grosso", "high", "storm"],
  [8, 14.0, "molto grosso", "very high", "storm"],
  [9, Infinity, "tempestoso", "phenomenal", "storm"],
];

export function classifySeaState(waveHeightM: number | undefined): SeaStateInfo {
  if (waveHeightM === undefined || !Number.isFinite(waveHeightM) || waveHeightM < 0) {
    return {
      level: 0,
      labelIt: "n/d",
      labelEn: "n/a",
      bucket: "flat",
    };
  }
  for (const [level, max, it, en, bucket] of TABLE) {
    if (waveHeightM <= max) {
      return { level, labelIt: it, labelEn: en, bucket };
    }
  }
  return { level: 9, labelIt: "tempestoso", labelEn: "phenomenal", bucket: "storm" };
}

// periodo d'animazione (s) del roll onda: onde lunghe → lente, corte → veloci, clamp [1.6, 4.5]
export function animationPeriodSec(wavePeriodS: number | undefined): number {
  if (wavePeriodS === undefined || !Number.isFinite(wavePeriodS) || wavePeriodS <= 0) {
    return 3;
  }
  const sec = 1.5 + wavePeriodS * 0.22;
  return Math.min(4.5, Math.max(1.6, sec));
}
