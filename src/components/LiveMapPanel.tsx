"use client";

import { MapPanel } from "./MapPanel";
import type { Spot } from "@/lib/types";
import type { ActiveStorm } from "@/lib/providers/types";
import { useDisplaySnapshots } from "@/lib/snapshot-client";

interface Props {
  spots: Spot[];
  /** Tempeste NHC server-fetched in page.tsx (loadHomeBundle, React-cached). */
  initialStorms?: ActiveStorm[];
}

export function LiveMapPanel({ spots, initialStorms = [] }: Props) {
  const { snapshots } = useDisplaySnapshots();
  return <MapPanel spots={spots} snapshots={snapshots} liveStorms={initialStorms} />;
}
