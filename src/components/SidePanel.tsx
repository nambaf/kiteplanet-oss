import { Flame, Trophy } from "lucide-react";
import Link from "next/link";
import type { Spot } from "@/lib/types";
import type { SnapshotMap, SpotSnapshot } from "@/lib/forecast/snapshot";
import { degToCardinal } from "@/lib/kite/reco";

interface Props {
  spots: Spot[];
  snapshots: SnapshotMap;
}

interface SpotWithSnap {
  spot: Spot;
  snap: SpotSnapshot;
}

const sketchy = "[filter:url(#kp-sketchy)]";

export function SidePanel({ spots, snapshots }: Props) {
  const enriched: SpotWithSnap[] = spots
    .map((spot) => ({ spot, snap: snapshots[spot.id] }))
    .filter((x): x is SpotWithSnap => x.snap !== undefined);

  const onNow = enriched
    .filter((x) => x.snap.match.status === "on")
    .sort((a, b) => b.snap.match.score - a.snap.match.score)
    .slice(0, 5);

  const recordTop5 = [...enriched]
    .sort((a, b) => b.snap.gustKn - a.snap.gustKn)
    .slice(0, 5);

  return (
    <aside className="flex flex-col gap-4 lg:max-w-[360px]">
      <Card
        title="on adesso"
        icon={<Flame className={`w-5 h-5 ${sketchy}`} strokeWidth={1.8} />}
        accent="warm"
      >
        {onNow.length === 0 ? (
          <p className="text-sm text-ink/60 italic">
            vento debole ovunque — perfetto per pianificare 🌬
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {onNow.map(({ spot, snap }) => (
              <li key={spot.id} className="py-2">
                <Link
                  href={`/spot/${spot.slug}`}
                  className="flex items-baseline justify-between gap-3 hover:text-warm transition-colors"
                >
                  <span className="flex items-baseline gap-2 truncate">
                    <span className="inline-block w-2 h-2 rounded-full bg-warm flex-shrink-0" />
                    <span className="truncate">{spot.name}</span>
                  </span>
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="num text-lg text-warm">
                      {Math.round(snap.windKn)}
                    </span>
                    <span className="text-xs text-ink/60">kn</span>
                    <span className="font-mono text-xs text-ink/70 ml-1">
                      {degToCardinal(snap.windDirDeg)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {recordTop5.length > 0 && (
        <Card
          title="record oggi"
          icon={<Trophy className={`w-5 h-5 ${sketchy}`} strokeWidth={1.8} />}
          accent="warm"
        >
          <ul className="divide-y divide-ink/10">
            {recordTop5.map(({ spot, snap }) => {
              const status = snap.match.status;
              const dotColor =
                status === "on"
                  ? "bg-warm"
                  : status === "marginal"
                    ? "bg-note border border-warm/50"
                    : "bg-ink/20";
              return (
                <li key={spot.id} className="py-2">
                  <Link
                    href={`/spot/${spot.slug}`}
                    className="flex items-baseline justify-between gap-3 hover:text-warm transition-colors"
                  >
                    <span className="flex items-baseline gap-2 truncate">
                      <span
                        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}
                      />
                      <span className="truncate">{spot.name}</span>
                    </span>
                    <span className="flex items-baseline gap-1 whitespace-nowrap">
                      <span className="num text-lg text-warm">
                        {Math.round(snap.gustKn)}
                      </span>
                      <span className="text-xs text-ink/60">kn</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </aside>
  );
}

// card mobile-collapsible: <details> nativo chiuso su <md, sempre aperta su desktop (due rami SSR, niente flash)
function Card({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: "warm";
  children: React.ReactNode;
}) {
  const heading = (
    <h2 className="font-scribble text-2xl flex items-center gap-2">
      {icon && (
        <span className={accent === "warm" ? "text-warm" : "text-ink/70"}>
          {icon}
        </span>
      )}
      {title}
    </h2>
  );
  return (
    <>
      <details className="paper-card p-4 kp-fade-up group md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          {heading}
          <span
            aria-hidden
            className="text-2xl leading-none transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="mt-3 pt-2 border-t border-ink/10">{children}</div>
      </details>
      <section className="paper-card p-4 kp-fade-up hidden md:block">
        <header className="flex items-baseline justify-between mb-3 pb-2 border-b border-ink/10">
          {heading}
        </header>
        {children}
      </section>
    </>
  );
}
