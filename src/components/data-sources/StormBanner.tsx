import Link from "next/link";
import type { ActiveStorm } from "@/lib/providers/types";
import type { Spot } from "@/lib/types";
import { distanceKm } from "@/lib/providers/nhc";

const STORM_PROXIMITY_KM = 800;

// banner se uno o più cicloni NHC sono entro 800 km da uno spot della lista; null se non c'è nulla
export function StormBanner({
  storms,
  spots,
  lang,
}: {
  storms: ActiveStorm[];
  spots: Spot[];
  lang: "it" | "en";
}) {
  const alerts: Array<{ storm: ActiveStorm; spot: Spot; km: number }> = [];
  for (const storm of storms) {
    for (const spot of spots) {
      const km = distanceKm(spot.lat, spot.lng, storm.lat, storm.lng);
      if (km <= STORM_PROXIMITY_KM) {
        alerts.push({ storm, spot, km });
      }
    }
  }
  if (alerts.length === 0) return null;

  // dedupe per storm: tieni lo spot più vicino
  const byStorm = new Map<string, { storm: ActiveStorm; spot: Spot; km: number }>();
  for (const a of alerts) {
    const prev = byStorm.get(a.storm.id);
    if (!prev || a.km < prev.km) byStorm.set(a.storm.id, a);
  }

  return (
    <div className="paper-card p-3 bg-warm/10 border-warm/50">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-scribble text-lg text-warm">
          ⚠ {lang === "it" ? "allerta cicloni" : "storm alert"}
        </span>
        <span className="text-xs text-ink/60 font-mono">via NHC (NOAA)</span>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {[...byStorm.values()].map(({ storm, spot, km }) => (
          <li key={storm.id} className="text-ink/80">
            <span className="font-mono font-bold">
              {storm.category} {storm.name}
            </span>
            {storm.windKn && (
              <span className="text-xs text-ink/60">
                {" "}
                · {Math.round(storm.windKn)} kn
              </span>
            )}
            <span className="text-xs text-ink/60">
              {" — "}
              {lang === "it" ? "a" : ""}{" ≈ "}
              <span className="num">{Math.round(km)}</span> km{" "}
              {lang === "it" ? "da" : "from"}{" "}
            </span>
            <Link
              href={`/spot/${spot.slug}`}
              className="text-accent hover:underline"
            >
              {spot.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
