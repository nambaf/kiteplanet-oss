import Link from "next/link";
import { DataSourceBadge } from "./DataSourceBadge";
import { MobileCollapsible } from "@/components/MobileCollapsible";
import { PAGE_COPY, PROVIDER_COPY } from "@/lib/providers/copy";
import { getProvider } from "@/lib/providers/registry";
import type { SpotBundle } from "@/lib/providers/enrichment";
import type {
  Lang,
  ProviderId,
  ProviderResult,
  ProviderStatus,
} from "@/lib/providers/types";

// pannello "Sorgenti per questo spot" in fondo a /spot/[slug]: una riga per provider interrogato
// (stato, timestamp, "come lo usiamo"), collassato di default su <md
interface Row {
  provider: ProviderId;
  result: { source: ProviderStatus; fetchedAt: string };
  note?: string;
}

export function SpotDataSourcesPanel({
  bundle,
  forecastSource,
  forecastTs,
  lang,
}: {
  bundle: SpotBundle;
  forecastSource: ProviderStatus;
  forecastTs: string;
  lang: Lang;
}) {
  const copy = PAGE_COPY[lang];
  const rows: Row[] = [
    {
      provider: "open-meteo",
      result: { source: forecastSource, fetchedAt: forecastTs },
      note: lang === "it" ? "vento, onda, SST" : "wind, waves, SST",
    },
    { provider: "noaa-ndbc", result: pick(bundle.observation) },
    { provider: "stormglass", result: pick(bundle.tides) },
    { provider: "wikipedia", result: pick(bundle.wiki) },
    {
      provider: "nhc",
      result: {
        source: bundle.nearbyStorms.length ? "live" : "live",
        fetchedAt: new Date().toISOString(),
      },
      note:
        bundle.nearbyStorms.length === 0
          ? lang === "it"
            ? "nessun ciclone vicino"
            : "no nearby storms"
          : lang === "it"
            ? `${bundle.nearbyStorms.length} ciclone/i nelle vicinanze`
            : `${bundle.nearbyStorms.length} nearby storm(s)`,
    },
  ];

  const header = (
    <h2 className="font-scribble text-2xl">{copy.spotPanelTitle}</h2>
  );
  return (
    <section className="px-4 md:px-8 mt-8">
      <MobileCollapsible title={header} padding="p-5">
        <p className="text-sm text-ink/70 -mt-2">{copy.spotPanelIntro}</p>

        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const meta = getProvider(row.provider);
            const c = PROVIDER_COPY[row.provider][lang];
            return (
              <li key={row.provider} className="border-t border-ink/10 pt-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/data-sources/${row.provider}`}
                      className="font-mono font-bold text-sm text-ink hover:underline"
                    >
                      {meta.name}
                    </Link>
                    <span className="text-xs text-ink/50">·</span>
                    <span className="text-xs text-ink/70">{c.tagline}</span>
                  </div>
                  <DataSourceBadge
                    provider={row.provider}
                    status={row.result.source}
                    ts={row.result.fetchedAt}
                    lang={lang}
                  />
                </div>
                {row.note && (
                  <p className="text-xs text-ink/60 mt-1">{row.note}</p>
                )}
                <ul className="mt-1 ml-4 text-xs text-ink/70 list-disc list-inside space-y-0.5">
                  {c.usedFor.slice(0, 2).map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </MobileCollapsible>
    </section>
  );
}

function pick<T>(r: ProviderResult<T>): { source: ProviderStatus; fetchedAt: string } {
  return { source: r.source, fetchedAt: r.fetchedAt };
}
