import { WIND_DIRECTIONS, type WindDirection } from "@/lib/types";

interface Props {
  highlight: WindDirection[]; // direzioni "ON" per lo spot
  currentDeg?: number; // vento attuale in gradi
  size?: number;
}

const STEP = 360 / WIND_DIRECTIONS.length;

export function Windrose({ highlight, currentDeg, size = 180 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const innerR = r * 0.55;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="rosa dei venti"
    >
      <circle
        cx={cx}
        cy={cy}
        r={r + 4}
        fill="rgb(var(--paper))"
        stroke="rgb(var(--ink) / 0.7)"
        strokeWidth={1.5}
      />

      {WIND_DIRECTIONS.map((dir, i) => {
        const angle = i * STEP - 90;
        const isOn = highlight.includes(dir);
        const a = (angle * Math.PI) / 180;
        const aNext = ((angle + STEP) * Math.PI) / 180;
        const x1 = cx + innerR * Math.cos(a);
        const y1 = cy + innerR * Math.sin(a);
        const x2 = cx + r * Math.cos(a);
        const y2 = cy + r * Math.sin(a);
        const x3 = cx + r * Math.cos(aNext);
        const y3 = cy + r * Math.sin(aNext);
        const x4 = cx + innerR * Math.cos(aNext);
        const y4 = cy + innerR * Math.sin(aNext);

        return (
          <path
            key={dir}
            d={`M${x1},${y1} L${x2},${y2} A${r},${r} 0 0 1 ${x3},${y3} L${x4},${y4} Z`}
            fill={isOn ? "rgb(var(--accent) / 0.65)" : "rgb(var(--ink) / 0.06)"}
            stroke="rgb(var(--ink) / 0.4)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Etichette cardinali principali */}
      {(["N", "E", "S", "W"] as const).map((label) => {
        const idx = WIND_DIRECTIONS.indexOf(label);
        const angle = (idx * STEP - 90) * (Math.PI / 180);
        const lr = r + 10;
        const x = cx + lr * Math.cos(angle);
        const y = cy + lr * Math.sin(angle) + 4;
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize={11}
            fill="rgb(var(--ink))"
            fontFamily="var(--font-mono)"
          >
            {label}
          </text>
        );
      })}

      {/* Freccia vento corrente */}
      {currentDeg !== undefined && (
        <g
          transform={`translate(${cx} ${cy}) rotate(${currentDeg})`}
        >
          <line
            x1={0}
            y1={innerR - 4}
            x2={0}
            y2={-(r - 4)}
            stroke="rgb(var(--warm))"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <polygon
            points={`0,-${r - 4} -5,-${r - 12} 5,-${r - 12}`}
            fill="rgb(var(--warm))"
          />
        </g>
      )}
    </svg>
  );
}
