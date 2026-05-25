import { classifySeaState, animationPeriodSec, type SeaStateInfo } from "@/lib/sea-state";

interface Props {
  waveHeightM?: number; // Hs in metri
  wavePeriodS?: number; // secondi, regola la velocità del roll
  waveDirDeg?: number; // gradi (0 = da N), ruota la freccia
  size?: number; // lato del riquadro in px
  showLabel?: boolean;
  lang?: "it" | "en";
  className?: string;
}

const BUCKET_FILL: Record<SeaStateInfo["bucket"], string> = {
  flat: "rgb(var(--ocean) / 0.55)",
  chop: "rgb(var(--ocean) / 0.85)",
  rough: "rgb(var(--wave) / 0.85)",
  storm: "rgb(var(--wave))",
};

const BUCKET_STROKE: Record<SeaStateInfo["bucket"], string> = {
  flat: "rgb(var(--wave) / 0.75)",
  chop: "rgb(var(--wave))",
  rough: "rgb(var(--ink) / 0.85)",
  storm: "rgb(var(--storm))",
};

// icona animata dello stato del mare per la spot page (~64-96px): 3 layer sinusoidali,
// ampiezza scalata su Hs, spruzzi sopra Hs≥2m, boa che galleggia
export function SeaStateIcon({
  waveHeightM,
  wavePeriodS,
  waveDirDeg,
  size = 80,
  showLabel = false,
  lang = "it",
  className,
}: Props) {
  const info = classifySeaState(waveHeightM);
  const hs = waveHeightM ?? 0;

  // ampiezza in unità SVG (viewBox 100x100), cap a Hs=6m → amp 14
  const amp = Math.min(14, 2 + hs * 2);
  const periodSec = animationPeriodSec(wavePeriodS);
  // onde brevi (T basso) → più fitte sul viewBox
  const wavelengthUnits =
    wavePeriodS && wavePeriodS > 0
      ? Math.max(33, Math.min(100, wavePeriodS * 6.5))
      : 50;

  const fill = BUCKET_FILL[info.bucket];
  const stroke = BUCKET_STROKE[info.bucket];
  const showSpray = hs >= 2;
  const showStorm = info.bucket === "storm";

  // ID univoci per pattern/clip (più icone sulla stessa pagina)
  const uid = `${Math.round((waveHeightM ?? 0) * 100)}-${Math.round(amp)}`;
  const clipId = `sea-clip-${uid}`;
  const gradId = `sea-grad-${uid}`;

  // path esteso oltre il viewBox: la traslazione 0→wavelengthUnits loopa senza scoperture
  const wavePath = (
    baseY: number,
    waveAmp: number,
    extend: number,
  ): string => {
    const half = wavelengthUnits / 2;
    const quarter = wavelengthUnits / 4;
    const points: string[] = [`M ${-extend} ${baseY}`];
    for (let x = -extend; x <= 100 + extend; x += half) {
      points.push(
        `Q ${x + quarter} ${baseY - waveAmp} ${x + half} ${baseY}`,
      );
    }
    return points.join(" ");
  };

  const sizePx = `${size}px`;
  const labelText = lang === "it" ? info.labelIt : info.labelEn;
  const hsLabel =
    waveHeightM === undefined ? "n/d" : `${waveHeightM.toFixed(1)} m`;

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        userSelect: "none",
      }}
      aria-label={`Sea state: ${labelText}, Hs ${hsLabel}`}
    >
      <svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 100 100"
        role="img"
        style={{ display: "block", overflow: "hidden" }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={50} cy={50} r={46} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="rgb(var(--paper))"
              stopOpacity="0.0"
            />
            <stop
              offset="60%"
              stopColor={fill}
              stopOpacity="0.35"
            />
            <stop offset="100%" stopColor={fill} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Cerchio "oblò": carta + bordo */}
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="rgb(var(--paper))"
          stroke="rgb(var(--ink) / 0.85)"
          strokeWidth={1.6}
        />

        {/* Sea fill base + onde sotto clip circolare */}
        <g clipPath={`url(#${clipId})`}>
          {/* Sky / sfondo */}
          <rect x="0" y="0" width="100" height="55" fill="rgb(var(--paper))" />
          {showStorm && (
            <>
              {/* nuvolosa diffusa */}
              <ellipse
                cx="35"
                cy="22"
                rx="22"
                ry="7"
                fill="rgb(var(--ink) / 0.18)"
              />
              <ellipse
                cx="68"
                cy="18"
                rx="18"
                ry="6"
                fill="rgb(var(--ink) / 0.14)"
              />
              {/* fulmine intermittente */}
              <path
                className="kp-bolt"
                d="M 55 24 L 50 36 L 55 36 L 51 46 L 60 33 L 55 33 L 58 24 Z"
                fill="#fbbf24"
                stroke="rgb(var(--ink))"
                strokeWidth="0.6"
                strokeLinejoin="round"
                opacity="0"
              />
            </>
          )}

          {/* Acqua di fondo */}
          <rect x="0" y="55" width="100" height="45" fill={fill} />
          <rect x="0" y="55" width="100" height="45" fill={`url(#${gradId})`} />

          {/* Onda layer 3 (più profonda, lenta, attenuata) */}
          <g
            style={{
              animation: `kp-sea-roll ${periodSec * 1.5}s linear infinite`,
            }}
          >
            <path
              d={wavePath(72, amp * 0.55, wavelengthUnits)}
              fill="none"
              stroke={stroke}
              strokeOpacity={0.35}
              strokeWidth={1.0}
              strokeLinecap="round"
            />
          </g>

          {/* Onda layer 2 (intermedia, fase opposta) */}
          <g
            style={{
              animation: `kp-sea-roll-rev ${periodSec * 1.15}s linear infinite`,
            }}
          >
            <path
              d={wavePath(62, amp * 0.85, wavelengthUnits)}
              fill="none"
              stroke={stroke}
              strokeOpacity={0.6}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          </g>

          {/* Onda layer 1 (superficie, ampiezza piena, veloce) */}
          <g
            style={{
              animation: `kp-sea-roll ${periodSec}s linear infinite`,
            }}
          >
            <path
              d={wavePath(54, amp, wavelengthUnits)}
              fill="none"
              stroke={stroke}
              strokeOpacity={0.95}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            {/* Boa che galleggia: ancorata sulla path → bob naturale via offsetMotion (fallback statico) */}
            <g style={{ animation: `kp-buoy-bob ${periodSec}s ease-in-out infinite` }}>
              <circle cx={50} cy={54} r={2.2} fill="rgb(var(--warm))" stroke="rgb(var(--ink))" strokeWidth={0.8} />
              <line x1={50} y1={51.8} x2={50} y2={48} stroke="rgb(var(--ink))" strokeWidth={0.7} />
            </g>
          </g>

          {/* Spruzzi (foam) sopra il crest per mare agitato+ */}
          {showSpray && (
            <g
              style={{
                animation: `kp-sea-roll ${periodSec * 0.85}s linear infinite`,
              }}
              fill="rgb(var(--paper))"
              stroke="rgb(var(--ink) / 0.6)"
              strokeWidth={0.5}
            >
              <circle cx={20} cy={50} r={1.6} />
              <circle cx={45} cy={48} r={1.2} />
              <circle cx={70} cy={50} r={1.8} />
              <circle cx={92} cy={49} r={1.4} />
            </g>
          )}

          {/* Linea orizzonte sottile a riferimento */}
          <line
            x1={4}
            y1={55}
            x2={96}
            y2={55}
            stroke="rgb(var(--ink) / 0.35)"
            strokeWidth={0.6}
            strokeDasharray="2 3"
          />
        </g>

        {/* Freccia direzione onda (se nota), in alto a destra fuori clip */}
        {waveDirDeg !== undefined && (
          <g
            transform={`translate(82 18) rotate(${(waveDirDeg + 180) % 360})`}
            style={{ color: stroke }}
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 0 6 L 0 -6 M -3 -2 L 0 -6 L 3 -2" />
            </g>
          </g>
        )}
      </svg>

      {showLabel && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            lineHeight: 1.15,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontWeight: 700,
              fontSize: 11,
              color: "rgb(var(--warm))",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {hsLabel}
          </span>
          <span
            style={{
              fontFamily: "var(--font-scribble, 'Caveat'), cursive",
              fontSize: 14,
              color: "rgb(var(--ink))",
            }}
          >
            {labelText}
          </span>
        </div>
      )}
    </div>
  );
}
