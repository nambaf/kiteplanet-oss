// SVG dei pin del globo: a 20px chiari prima che belli, animazioni in CSS (non SMIL),
// pointer-events none così non rubano i click al wrapper
import type { OnStatus } from "@/lib/types";

const SVG_NS = "http://www.w3.org/2000/svg";

function svgFromString(svgString: string): SVGElement {
  const tpl = document.createElement("template");
  tpl.innerHTML = svgString.trim();
  return tpl.content.firstElementChild as SVGElement;
}

// freccia weather-map nella direzione verso cui soffia il vento; colore = stato
export function makeWindStreamer(
  windDirDeg: number,
  _windKn: number,
  status: OnStatus | undefined,
): SVGElement {
  const rot = Math.round((windDirDeg + 180) % 360);
  const color = status === "on" ? "rgb(var(--warm))" : "rgb(var(--wind))";

  const svgString = `
<svg xmlns="${SVG_NS}" viewBox="0 0 24 24" width="22" height="22"
     class="kp-wind-arrow"
     style="transform: rotate(${rot}deg); color: ${color};
            pointer-events: none; flex-shrink: 0;">
  <g fill="none" stroke="currentColor" stroke-width="2.4"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M 12 21 L 12 4 M 6 10 L 12 4 L 18 10" />
  </g>
</svg>`;

  return svgFromString(svgString);
}

export function makeStrongWindIcon(
  windDirDeg: number,
  _windKn: number,
): SVGElement {
  const rot = Math.round((windDirDeg + 180) % 360);

  const svgString = `
<svg xmlns="${SVG_NS}" viewBox="0 0 32 24" width="28" height="22"
     class="kp-wind-arrow kp-wind-arrow-strong"
     style="transform: rotate(${rot}deg); color: rgb(var(--warm));
            pointer-events: none; flex-shrink: 0;">
  <g fill="none" stroke="currentColor" stroke-width="2.6"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M 10 21 L 10 4 M 5 10 L 10 4 L 15 10" />
    <path d="M 22 21 L 22 4 M 17 10 L 22 4 L 27 10" opacity="0.85" />
  </g>
</svg>`;

  return svgFromString(svgString);
}

export function makeWaveIcon(waveHeightM: number): SVGElement {
  // ampiezza scala con l'altezza onda, cap 3px per restare nel viewBox 14
  const amp = Math.min(3, 0.8 + waveHeightM * 0.7).toFixed(2);

  // sinusoide period 8 estesa da -8 a 32 così translateX 0→8 loopa pulito
  const wavePath = (y: number, sign: 1 | -1) =>
    `M -8 ${y} Q -4 ${(y - sign * +amp).toFixed(2)}, 0 ${y} ` +
    `T 8 ${y} T 16 ${y} T 24 ${y} T 32 ${y}`;

  const svgString = `
<svg xmlns="${SVG_NS}" viewBox="0 0 24 14" width="28" height="16"
     class="kp-wave"
     style="color: rgb(var(--wave)); pointer-events: none; flex-shrink: 0;
            overflow: hidden;">
  <g fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
    <path class="kp-wave-roll-1" d="${wavePath(5, 1)}" />
    <path class="kp-wave-roll-2" opacity="0.65" d="${wavePath(11, -1)}" />
  </g>
</svg>`;

  return svgFromString(svgString);
}

export function makeStormIcon(): SVGElement {
  // path cloud da lucide-react + fulmine lampeggiante
  const svgString = `
<svg xmlns="${SVG_NS}" viewBox="0 0 24 26" width="22" height="24"
     class="kp-storm"
     style="pointer-events: none; flex-shrink: 0;">
  <path d="M17.5 16 H 9 a 6 6 0 1 1 5.74 -7.7 h 1.76 a 4 4 0 1 1 0 8 Z"
        fill="rgb(var(--paper))"
        stroke="rgb(var(--ink))" stroke-width="1.4"
        stroke-linejoin="round" />
  <path class="kp-bolt"
        d="M 12 14 L 9 19 L 13 19 L 11 25 L 16 17 L 12 17 L 14 14 Z"
        fill="#fbbf24"
        stroke="rgb(var(--ink))" stroke-width="0.7"
        stroke-linejoin="round"
        opacity="0" />
</svg>`;

  return svgFromString(svgString);
}
