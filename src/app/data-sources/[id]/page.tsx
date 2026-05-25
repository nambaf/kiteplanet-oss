import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LanguageToggle } from "@/components/data-sources/LanguageToggle";
import { ProviderStatusDot } from "@/components/data-sources/ProviderStatusDot";
import { getLang } from "@/lib/i18n/get-t";
import { PAGE_COPY, PROVIDER_COPY } from "@/lib/providers/copy";
import {
  PROVIDER_IDS,
  getProvider,
  getProviderStatusSnapshot,
} from "@/lib/providers/registry";
import { SEED_SPOTS } from "@/data/spots";
import type { Spot } from "@/lib/types";
import type { ProviderId } from "@/lib/providers/types";

export const revalidate = 3600;

export function generateStaticParams() {
  return PROVIDER_IDS.map((id) => ({ id }));
}

const EXAMPLE_JSON: Record<ProviderId, string> = {
  "open-meteo": `{
  "hourly": {
    "time": ["2026-05-21T14:00", ...],
    "wind_speed_10m": [8.0, 7.5, ...],
    "wind_direction_10m": [275, 280, ...]
  }
}`,
  "noaa-ndbc": `2026 05 21 14 50 280  8.0  9.0   1.5   8.0   5.0 270  1013.0  20.0  18.0
2026 05 21 14 40 285  7.5  8.5   1.4   8.0   5.0 270  1013.1  20.1  18.0`,
  stormglass: `{
  "data": [
    { "time": "2026-05-21T03:21:00+00:00", "type": "high", "height": 0.42 },
    { "time": "2026-05-21T09:47:00+00:00", "type": "low",  "height": -0.31 }
  ]
}`,
  wikipedia: `{
  "title": "Tarifa",
  "extract": "Tarifa is a municipality in the southernmost part of Spain...",
  "thumbnail": { "source": "https://..." }
}`,
  nhc: `{
  "activeStorms": [{
    "id": "al012026",
    "name": "Arthur",
    "classification": "TS",
    "intensity": "45",
    "latitudeNumeric": 25.4,
    "longitudeNumeric": -75.2
  }]
}`,
};

// spot che dipendono da questo provider: per ndbc/wikipedia/stormglass guardiamo refs, gli altri sono "tutti"
function spotsUsing(id: ProviderId): Spot[] {
  switch (id) {
    case "noaa-ndbc":
      return SEED_SPOTS.filter((s) => !!s.refs?.ndbcBuoyId);
    case "stormglass":
      return SEED_SPOTS.filter((s) => s.refs?.stormglassEnabled === true);
    case "wikipedia":
      return SEED_SPOTS.filter(
        (s) => !!(s.refs?.wikipediaTitle?.it || s.refs?.wikipediaTitle?.en),
      );
    default:
      return SEED_SPOTS;
  }
}

export default async function ProviderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!PROVIDER_IDS.includes(id as ProviderId)) notFound();
  const pid = id as ProviderId;

  const lang = await getLang();
  const meta = getProvider(pid);
  const copy = PROVIDER_COPY[pid][lang];
  const pageCopy = PAGE_COPY[lang];
  const status = getProviderStatusSnapshot().find((s) => s.id === pid)!;
  const spotsList = spotsUsing(pid);

  return (
    <main className="mx-auto max-w-4xl pb-16">
      <Header />

      <div className="px-4 md:px-8 mt-2 flex items-center justify-between gap-3">
        <Link href="/data-sources" className="text-sm text-ink/60 hover:text-ink">
          {lang === "it" ? "← sorgenti dati" : "← data sources"}
        </Link>
        <LanguageToggle current={lang} />
      </div>

      <header className="px-4 md:px-8 mt-4 flex items-baseline gap-3 flex-wrap">
        <h1 className="font-scribble text-5xl md:text-6xl">{meta.name}</h1>
        <div className="flex items-center gap-1 text-xs font-mono uppercase text-ink/60">
          <ProviderStatusDot status={status.status} size="md" />
          {pageCopy.badgeSourceLabel[status.status]}
        </div>
      </header>
      <p className="px-4 md:px-8 mt-1 text-ink/60 text-sm">{copy.tagline}</p>

      <section className="px-4 md:px-8 mt-6">
        <div className="paper-card p-5">
          <p className="text-base leading-relaxed">{copy.description}</p>

          <div className="mt-4">
            <h3 className="font-scribble text-xl">{pageCopy.usedForLabel}</h3>
            <ul className="mt-2 list-disc list-inside text-sm space-y-1 text-ink/80">
              {copy.usedFor.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="paper-card p-4">
          <h3 className="font-scribble text-xl">{pageCopy.envVarsLabel}</h3>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            {meta.envVars.length === 0 ? (
              <li className="text-ink/60">— (no key required)</li>
            ) : (
              meta.envVars.map((v) => (
                <li
                  key={v}
                  className="rounded bg-ink/5 px-2 py-1 text-ink/80 inline-block mr-1 mb-1"
                >
                  {v}
                </li>
              ))
            )}
          </ul>
          {status.status === "requires-key" && (
            <p className="mt-3 text-xs text-warm font-mono">
              ⚠ {pageCopy.ctaAddKey}
            </p>
          )}
        </div>

        <div className="paper-card p-4">
          <h3 className="font-scribble text-xl">{pageCopy.attributionLabel}</h3>
          <p className="text-sm mt-1 text-ink/80">{meta.attribution}</p>
          <div className="mt-3 flex flex-col gap-1 text-xs">
            <span>
              <span className="font-mono uppercase text-ink/60">
                {pageCopy.licenseLabel}:
              </span>{" "}
              {meta.license}
            </span>
            <span>
              <span className="font-mono uppercase text-ink/60">
                {pageCopy.freeTierLabel}:
              </span>{" "}
              {meta.freeTier}
            </span>
            <a
              href={meta.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              {pageCopy.docsLabel} ↗
            </a>
            <a
              href={meta.homeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              {meta.homeUrl} ↗
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 mt-4">
        <div className="paper-card p-4">
          <h3 className="font-scribble text-xl">{pageCopy.exampleJsonLabel}</h3>
          <pre className="mt-2 overflow-x-auto rounded bg-ink/5 p-3 text-xs font-mono text-ink/80">
            <code>{EXAMPLE_JSON[pid]}</code>
          </pre>
        </div>
      </section>

      <section className="px-4 md:px-8 mt-4">
        <div className="paper-card p-4">
          <h3 className="font-scribble text-xl">
            {pageCopy.spotsUsingLabel}{" "}
            <span className="text-sm text-ink/60 font-mono">
              ({spotsList.length})
            </span>
          </h3>
          {spotsList.length === 0 ? (
            <p className="text-sm text-ink/60 mt-2">
              {lang === "it"
                ? "Nessuno spot lo usa direttamente (provider globale o opt-in)."
                : "No spot uses this directly (global provider or opt-in)."}
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {spotsList.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/spot/${s.slug}`}
                    className="rounded-full border border-ink/15 px-2.5 py-1 hover:border-ink/40 hover:bg-paper"
                  >
                    {s.name}{" "}
                    <span className="text-ink/50 text-xs">({s.countryCode})</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
