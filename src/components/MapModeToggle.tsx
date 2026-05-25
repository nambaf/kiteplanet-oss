"use client";

import { Satellite, Sparkles } from "lucide-react";
import type { MapMode } from "@/lib/map-mode";

interface Props {
  value: MapMode;
  onChange: (next: MapMode) => void;
}

const sketchy = "[filter:url(#kp-sketchy)]";

const OPTIONS: { key: MapMode; label: string; icon: React.ReactNode; hint: string }[] = [
  {
    key: "live",
    label: "live",
    icon: <Satellite className={`w-3.5 h-3.5 ${sketchy}`} strokeWidth={1.8} />,
    hint: "Solo dati reali: NHC live, snapshot Open-Meteo raw, niente decorazioni",
  },
  {
    key: "demo",
    label: "demo",
    icon: <Sparkles className={`w-3.5 h-3.5 ${sketchy}`} strokeWidth={1.8} />,
    hint: "Dataset mock fisso: cicloni globali, wind streaks, override per-spot",
  },
];

export function MapModeToggle({ value, onChange }: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="modalità dati mappa"
    >
      {OPTIONS.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            aria-pressed={active}
            title={o.hint}
            className={
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm font-mono " +
              (active
                ? "bg-ink text-paper border-ink shadow-sm"
                : "bg-paper/90 text-ink/70 border-ink/30 hover:border-ink/70 hover:text-ink")
            }
          >
            {o.icon}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
