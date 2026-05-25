"use client";

import { useEffect, useMemo, useState } from "react";
import type { SnapshotMap } from "@/lib/forecast/snapshot";
import { MOCK_SNAPSHOT_MAP } from "@/lib/forecast/mock-events";
import { useMapMode, type MapMode } from "@/lib/map-mode";

interface SnapshotState {
  snapshots: SnapshotMap;
  loading: boolean;
}

const EMPTY: SnapshotState = { snapshots: {}, loading: true };

// dedupe: una sola fetch per page session, condivisa da tutte le isole client (promise lazy)
let pending: Promise<SnapshotMap> | null = null;

function fetchSnapshotsOnce(): Promise<SnapshotMap> {
  if (!pending) {
    pending = fetch("/api/snapshots", { cache: "default" })
      .then((r) => (r.ok ? (r.json() as Promise<SnapshotMap>) : {}))
      .catch(() => ({}));
  }
  return pending;
}

export function useSnapshots(): SnapshotState {
  const [state, setState] = useState<SnapshotState>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    fetchSnapshotsOnce().then((data) => {
      if (!cancelled) setState({ snapshots: data, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useDisplaySnapshots(): SnapshotState & { mode: MapMode } {
  const { snapshots, loading } = useSnapshots();
  const [mode] = useMapMode();
  const displayed = useMemo(
    () => (mode === "demo" ? MOCK_SNAPSHOT_MAP : snapshots),
    [mode, snapshots],
  );
  return {
    snapshots: displayed,
    loading: mode === "demo" ? false : loading,
    mode,
  };
}
