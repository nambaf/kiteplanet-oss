"use client";

import { Header } from "./Header";
import { SEED_SPOTS } from "@/data/spots";
import { useDisplaySnapshots } from "@/lib/snapshot-client";

export function LiveHeader() {
  const { snapshots } = useDisplaySnapshots();
  const onCount = SEED_SPOTS.filter(
    (s) => snapshots[s.id]?.match.status === "on",
  ).length;
  return <Header onCount={onCount} />;
}
