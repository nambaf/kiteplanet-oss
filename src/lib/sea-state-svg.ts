import { classifySeaState, animationPeriodSec, type SeaStateInfo } from "./sea-state";

// SVG string per il mini wave del globo: Globe.tsx inietta via innerHTML, animazione in CSS (no SMIL)
const BUCKET_STROKE: Record<SeaStateInfo["bucket"], string> = {
  flat: "rgb(var(--wave) / 0.6)",
  chop: "rgb(var(--wave))",
  rough: "rgb(var(--wave))",
  storm: "rgb(var(--storm))",
};

// mini wave (~18-24px) per la card del pin: 2 sinusoidi che rotolano, ampiezza scalata su Hs
export function seaStateMiniSvgString(
  waveHeightM: number | undefined,
  wavePeriodS: number | undefined,
  opts: { width?: number; height?: number } = {},
): string {
  const w = opts.width ?? 22;
  const h = opts.height ?? 13;
  const info = classifySeaState(waveHeightM);
  const hs = waveHeightM ?? 0;
  const periodSec = animationPeriodSec(wavePeriodS).toFixed(2);
  const stroke = BUCKET_STROKE[info.bucket];

  // ampiezza in unità viewBox (24x14), cap 3.2 per non sforare
  const amp = Math.min(3.2, 0.6 + hs * 0.55).toFixed(2);

  // sinusoide estesa -8→32 (loop pulito con translateX 0→-8), wavelength 8
  const wavePath = (y: number, sign: 1 | -1) =>
    `M -8 ${y} Q -4 ${(y - sign * +amp).toFixed(2)} 0 ${y} ` +
    `T 8 ${y} T 16 ${y} T 24 ${y} T 32 ${y}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 14" width="${w}" height="${h}" style="overflow:hidden; flex-shrink:0; pointer-events:none;">
  <g fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${wavePath(5, 1)}" style="animation: kp-sea-roll ${periodSec}s linear infinite;" />
    <path d="${wavePath(10, -1)}" opacity="0.6" style="animation: kp-sea-roll-rev ${(Number(periodSec) * 1.3).toFixed(2)}s linear infinite;" />
  </g>
</svg>`;
}
