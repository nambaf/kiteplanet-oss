"use client";

import dynamic from "next/dynamic";
import type { Spot } from "@/lib/types";
import type { SnapshotMap } from "@/lib/forecast/snapshot";
import type { FilterKey } from "@/lib/filter";
import type { CycloneMarker } from "@/lib/cyclone-marker";
import type { WindStreak } from "@/data/atmosphere";

const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), {
  ssr: false,
  loading: () => (
    <div
      className="paper-card flex items-center justify-center text-ink/50 text-sm"
      style={{ height: "min(70vh, 560px)" }}
    >
      sto caricando il globo…
    </div>
  ),
});

export function GlobeClient({
  spots,
  snapshots,
  filter,
  cyclones,
  windStreaks,
}: {
  spots: Spot[];
  snapshots?: SnapshotMap;
  filter?: FilterKey;
  cyclones?: CycloneMarker[];
  windStreaks?: WindStreak[];
}) {
  return (
    <Globe
      spots={spots}
      snapshots={snapshots}
      filter={filter}
      cyclones={cyclones}
      windStreaks={windStreaks}
    />
  );
}
