"use client";

import { ChevronDown, CloudLightning, Waves, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FilterKey } from "@/lib/filter";

interface Props {
  value: FilterKey;
  onChange: (next: FilterKey) => void;
}

const sketchy = "[filter:url(#kp-sketchy)]";

function FlatIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M 1 5 q 1.5 -1.5, 3 0 t 3 0 t 3 0 t 3 0" />
      <path d="M 1 9 q 1.5 -1.5, 3 0 t 3 0 t 3 0 t 3 0" />
    </svg>
  );
}

const CHIPS: { key: FilterKey; label: string; icon?: React.ReactNode }[] = [
  { key: "tutti", label: "tutti" },
  {
    key: "vento",
    label: "vento",
    icon: <Wind className={`w-3.5 h-3.5 ${sketchy}`} strokeWidth={2} />,
  },
  {
    key: "wave",
    label: "wave",
    icon: <Waves className={`w-3.5 h-3.5 ${sketchy}`} strokeWidth={2} />,
  },
  {
    key: "flat",
    label: "flat",
    icon: <FlatIcon className={sketchy} />,
  },
  {
    key: "storm",
    label: "storm",
    icon: <CloudLightning className={`w-3.5 h-3.5 ${sketchy}`} strokeWidth={1.7} />,
  },
];

export function FilterChips({ value, onChange }: Props) {
  const active = CHIPS.find((c) => c.key === value) ?? CHIPS[0];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mobile dropdown: chiudi su click fuori e su Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div role="group" aria-label="filtri">
      {/* Mobile: pill attiva + chevron, dropdown con le altre opzioni */}
      <div ref={wrapperRef} className="md:hidden relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-ink text-paper border-ink shadow-sm text-sm font-mono"
        >
          {active.icon}
          <span>{active.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        </button>
        {open && (
          <div
            role="menu"
            className="absolute left-0 top-full z-20 mt-1 paper-card p-1 flex flex-col gap-0.5 min-w-[140px]"
          >
            {CHIPS.filter((c) => c.key !== value).map((c) => (
              <button
                key={c.key}
                role="menuitem"
                type="button"
                onClick={() => {
                  onChange(c.key);
                  setOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-left text-sm font-mono text-ink/80 hover:bg-ink/5 hover:text-ink transition-colors"
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: tutte le pill in fila */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        {CHIPS.map((c) => {
          const isActive = c.key === value;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChange(c.key)}
              aria-pressed={isActive}
              className={
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm font-mono " +
                (isActive
                  ? "bg-ink text-paper border-ink shadow-sm"
                  : "bg-paper/90 text-ink/70 border-ink/30 hover:border-ink/70 hover:text-ink")
              }
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
