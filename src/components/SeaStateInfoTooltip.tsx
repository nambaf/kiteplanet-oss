"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SeaStateIcon } from "./SeaStateIcon";

interface Props {
  waveHeightM?: number;
  wavePeriodS?: number;
  waveDirDeg?: number;
  size?: number;
  showLabel?: boolean;
  lang?: "it" | "en";
}

const LEGEND: Record<
  "it" | "en",
  { title: string; items: string[]; hint: string; aria: string }
> = {
  it: {
    title: "come leggere l'icona",
    items: [
      "tre sinusoidi sovrapposte → senso di profondità",
      "velocità roll ∝ periodo onda T",
      "ampiezza ∝ altezza Hs",
      "spruzzi compaiono con Hs ≥ 2m",
      "nuvole + fulmine = stato \"storm\" (Hs ≥ 4m)",
      "freccia in alto a destra = direzione swell",
      "boa = riferimento di scala",
    ],
    hint: "esc per chiudere",
    aria: "Mostra legenda icona stato del mare",
  },
  en: {
    title: "how to read the icon",
    items: [
      "three stacked sinusoids → depth feel",
      "roll speed ∝ wave period T",
      "amplitude ∝ height Hs",
      "spray appears when Hs ≥ 2m",
      "clouds + lightning = \"storm\" state (Hs ≥ 4m)",
      "top-right arrow = swell direction",
      "buoy = scale reference",
    ],
    hint: "esc to close",
    aria: "Show sea state icon legend",
  },
};

// wrap client di <SeaStateIcon> con popover esplicativo: hover su desktop, tap su touch (chiude con tap fuori/Esc)
export function SeaStateInfoTooltip(props: Props) {
  const lang = props.lang ?? "it";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const legend = LEGEND[lang];

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="block cursor-help border-0 bg-transparent p-0"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={legend.aria}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
      >
        <SeaStateIcon
          waveHeightM={props.waveHeightM}
          wavePeriodS={props.wavePeriodS}
          waveDirDeg={props.waveDirDeg}
          size={props.size}
          showLabel={props.showLabel}
          lang={lang}
        />
      </button>
      {open && (
        <div
          id={popoverId}
          role="tooltip"
          className="paper-card absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 p-3 text-xs text-ink shadow-lg"
        >
          <div className="font-scribble text-base mb-2 text-ink">
            {legend.title}
          </div>
          <ul className="list-disc space-y-1 pl-4">
            {legend.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink/40">
            {legend.hint}
          </div>
        </div>
      )}
    </div>
  );
}
