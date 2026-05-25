"use client";

import { useMemo, useState } from "react";
import type { Spot } from "@/lib/types";
import type { SnapshotMap } from "@/lib/forecast/snapshot";
import type { ActiveStorm } from "@/lib/providers/types";
import { FilterChips } from "./FilterChips";
import { GlobeClient } from "./GlobeClient";
import { MapModeToggle } from "./MapModeToggle";
import type { FilterKey } from "@/lib/filter";
import { useMapMode } from "@/lib/map-mode";
import { MOCK_CYCLONES, WIND_STREAKS, type WindStreak } from "@/data/atmosphere";
import {
  type CycloneMarker,
  activeStormToMarker,
  mockCycloneToMarker,
} from "@/lib/cyclone-marker";

interface Props {
  spots: Spot[];
  snapshots: SnapshotMap; // già mode-aware (mock in demo, raw in live): vedi useDisplaySnapshots
  liveStorms?: ActiveStorm[]; // NHC, server-fetched da page.tsx
}

// referenza stabile per il vuoto: un nuovo [] ad ogni render ri-eseguirebbe l'useEffect del Globe
const EMPTY_STREAKS: WindStreak[] = [];

export function MapPanel({ spots, snapshots, liveStorms = [] }: Props) {
  const [filter, setFilter] = useState<FilterKey>("tutti");
  const [mode, setMode] = useMapMode();

  // cicloni: mock globali in demo, NHC reale in live
  const cyclones: CycloneMarker[] = useMemo(() => {
    if (mode === "demo") return MOCK_CYCLONES.map(mockCycloneToMarker);
    return liveStorms.map(activeStormToMarker);
  }, [mode, liveStorms]);

  // wind streaks: decorativi, solo in demo
  const windStreaks: WindStreak[] = mode === "demo" ? WIND_STREAKS : EMPTY_STREAKS;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips value={filter} onChange={setFilter} />
        <MapModeToggle value={mode} onChange={setMode} />
      </div>
      <GlobeClient
        spots={spots}
        snapshots={snapshots}
        filter={filter}
        cyclones={cyclones}
        windStreaks={windStreaks}
      />
    </div>
  );
}
