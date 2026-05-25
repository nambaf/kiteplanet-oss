import { seaStateMiniSvgString } from "@/lib/sea-state-svg";
import { classifySeaState, type SeaStateLevel } from "@/lib/sea-state";

// riga di 10 mini-icone (Douglas 0–9) come legenda sotto l'icona principale, livello corrente evidenziato.
// Hs/T scelti appena sopra la soglia di classifySeaState così bucket/colore e mini-onda sono corretti.
const LEVELS: ReadonlyArray<{ level: SeaStateLevel; hs: number; t: number }> = [
  { level: 0, hs: 0.0, t: 0 },
  { level: 1, hs: 0.08, t: 3 },
  { level: 2, hs: 0.35, t: 4 },
  { level: 3, hs: 0.9, t: 6 },
  { level: 4, hs: 1.8, t: 8 },
  { level: 5, hs: 3.2, t: 10 },
  { level: 6, hs: 4.8, t: 11 },
  { level: 7, hs: 7.5, t: 13 },
  { level: 8, hs: 11.0, t: 14 },
  { level: 9, hs: 16.0, t: 16 },
];

interface Props {
  currentLevel: SeaStateLevel;
  lang?: "it" | "en";
}

export function SeaStateDouglasStrip({ currentLevel, lang = "it" }: Props) {
  return (
    <div className="mt-4 border-t border-ink/10 pt-3">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
        {lang === "it" ? "scala Douglas (Hs)" : "Douglas scale (Hs)"}
      </div>
      <div className="flex flex-wrap items-end gap-1">
        {LEVELS.map((cell) => {
          const active = cell.level === currentLevel;
          const info = classifySeaState(cell.hs);
          const label = lang === "it" ? info.labelIt : info.labelEn;
          return (
            <div
              key={cell.level}
              className={`flex flex-col items-center gap-0.5 rounded-md px-1 py-1 ${
                active ? "bg-accent/15 ring-1 ring-accent/60" : ""
              }`}
              title={`${cell.level} · ${label} · Hs ${cell.hs}m`}
            >
              <span
                aria-hidden
                dangerouslySetInnerHTML={{
                  __html: seaStateMiniSvgString(cell.hs, cell.t, {
                    width: 28,
                    height: 16,
                  }),
                }}
              />
              <span
                className={`font-mono text-[9px] ${
                  active ? "font-bold text-accent" : "text-ink/60"
                }`}
              >
                {cell.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
