import Link from "next/link";
import { ProviderStatusDot } from "./ProviderStatusDot";
import { MobileCollapsible } from "@/components/MobileCollapsible";
import { PAGE_COPY, PROVIDER_COPY } from "@/lib/providers/copy";
import type { Lang, ProviderStatusSnapshot } from "@/lib/providers/types";

// strip server-component sotto la mappa: una chip per provider (dot + tagline), tutto via prop,
// niente env nel browser; collassata di default su <md
export function DataSourcesStrip({
  snapshot,
  lang,
}: {
  snapshot: ProviderStatusSnapshot[];
  lang: Lang;
}) {
  const copy = PAGE_COPY[lang];
  const header = (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="font-scribble text-xl">{copy.stripTitle}</h2>
      <Link
        href="/data-sources"
        className="text-xs text-ink/60 hover:text-ink font-mono"
      >
        {lang === "it" ? "tutte →" : "all →"}
      </Link>
    </div>
  );
  return (
    <MobileCollapsible title={header}>
      <ul className="flex flex-wrap gap-2">
        {snapshot.map((p) => {
          const tagline = PROVIDER_COPY[p.id][lang].tagline;
          return (
            <li key={p.id}>
              <Link
                href={`/data-sources/${p.id}`}
                className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3 py-1.5 hover:border-ink/40 hover:-translate-y-px transition-all"
              >
                <ProviderStatusDot status={p.status} size="sm" />
                <span className="font-mono text-xs font-bold text-ink">
                  {p.name}
                </span>
                <span className="text-[11px] text-ink/60 hidden sm:inline">
                  {tagline}
                </span>
                <span className="text-[10px] text-ink/40 font-mono uppercase">
                  {copy.badgeSourceLabel[p.status]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </MobileCollapsible>
  );
}
