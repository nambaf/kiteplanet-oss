"use client";

import { SidePanel } from "./SidePanel";
import type { Spot } from "@/lib/types";
import { useDisplaySnapshots } from "@/lib/snapshot-client";

export function LiveSidePanel({ spots }: { spots: Spot[] }) {
  const { snapshots, loading } = useDisplaySnapshots();

  if (loading) {
    return (
      <aside className="flex flex-col gap-4 lg:max-w-[360px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="paper-card p-4 animate-pulse opacity-60">
            <div className="h-6 w-24 bg-ink/10 rounded" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full bg-ink/10 rounded" />
              <div className="h-3 w-3/4 bg-ink/10 rounded" />
              <div className="h-3 w-2/3 bg-ink/10 rounded" />
            </div>
          </div>
        ))}
      </aside>
    );
  }

  return <SidePanel spots={spots} snapshots={snapshots} />;
}
