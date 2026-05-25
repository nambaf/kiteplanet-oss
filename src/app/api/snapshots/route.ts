import { NextResponse } from "next/server";
import { SEED_SPOTS } from "@/data/spots";
import { fetchSpotSnapshotHoursBulk } from "@/lib/forecast/open-meteo";
import { matchHour } from "@/lib/kite/reco";
import {
  computeEvents,
  type SnapshotMap,
  type SpotSnapshot,
} from "@/lib/forecast/snapshot";
import type { ForecastHour } from "@/lib/types";

export const runtime = "nodejs";
// niente prerender al build: evita la fetch Open-Meteo durante `next build` (resta cache-friendly via header)
export const dynamic = "force-dynamic";

// snapshot live di tutti gli spot in UNA chiamata multi-location a Open-Meteo.
// NHC storms NON qui: server-fetched in page.tsx via loadHomeBundle → prop a LiveMapPanel.
export async function GET() {
  let slims: Array<Awaited<
    ReturnType<typeof fetchSpotSnapshotHoursBulk>
  >[number]> = [];
  try {
    slims = await fetchSpotSnapshotHoursBulk(
      SEED_SPOTS.map((s) => ({ lat: s.lat, lng: s.lng })),
    );
  } catch {
    // Open-Meteo giù o timeout: mappa vuota, l'UI mostra pin neutri
    return NextResponse.json({} satisfies SnapshotMap, {
      headers: {
        "Cache-Control":
          "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  const map: SnapshotMap = {};
  SEED_SPOTS.forEach((spot, i) => {
    const slim = slims[i];
    if (!slim) return;
    // matchHour vuole un ForecastHour completo: stub temp/marine, non li legge per il match
    const hour: ForecastHour = {
      timeIso: slim.timeIso,
      windKn: slim.windKn,
      gustKn: slim.gustKn,
      windDirDeg: slim.windDirDeg,
      tempC: 0,
      precipMm: slim.precipMm,
    };
    const match = matchHour({ spot, hour });
    map[spot.id] = {
      spotId: spot.id,
      windKn: slim.windKn,
      gustKn: slim.gustKn,
      windDirDeg: slim.windDirDeg,
      waveHeightM: undefined,
      match,
      events: computeEvents(hour),
    } satisfies SpotSnapshot;
  });

  return NextResponse.json(map, {
    headers: {
      "Cache-Control":
        "public, max-age=60, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
