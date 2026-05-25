import Link from "next/link";
import type { Spot, SpotMatch } from "@/lib/types";

const STATUS_COLORS: Record<SpotMatch["status"], string> = {
  on: "bg-accent text-paper",
  marginal: "bg-note text-ink",
  off: "bg-ink/10 text-ink/70",
};

const STATUS_LABEL: Record<SpotMatch["status"], string> = {
  on: "ON",
  marginal: "marginal",
  off: "off",
};

interface Props {
  spot: Spot;
  match?: SpotMatch;
  windKn?: number;
}

export function SpotPin({ spot, match, windKn }: Props) {
  return (
    <Link
      href={`/spot/${spot.slug}`}
      className="paper-card block p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-scribble text-2xl">{spot.name}</h3>
        {match && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-mono font-bold ${STATUS_COLORS[match.status]}`}
          >
            {STATUS_LABEL[match.status]}
          </span>
        )}
      </div>

      <div className="mt-1 text-sm text-ink/70">{spot.country}</div>

      {windKn !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span className="num text-2xl">{Math.round(windKn)}</span>
          <span className="text-xs text-ink/70">kn ora</span>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1">
        {spot.optimalDirections.slice(0, 5).map((d) => (
          <span
            key={d}
            className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink/70"
          >
            {d}
          </span>
        ))}
      </div>
    </Link>
  );
}
