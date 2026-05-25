import Link from "next/link";
import { ProviderStatusDot } from "./ProviderStatusDot";
import { PAGE_COPY, PROVIDER_COPY } from "@/lib/providers/copy";
import { getProvider, getProviderStatusSnapshot } from "@/lib/providers/registry";
import type { Lang, ProviderId } from "@/lib/providers/types";

// card compatta per la griglia in /data-sources (deep-dive: /data-sources/{id})
export function ProviderCard({
  id,
  lang,
}: {
  id: ProviderId;
  lang: Lang;
}) {
  const meta = getProvider(id);
  const copy = PROVIDER_COPY[id][lang];
  const pageCopy = PAGE_COPY[lang];
  const status = getProviderStatusSnapshot().find((s) => s.id === id)?.status ??
    "unavailable";

  return (
    <Link
      href={`/data-sources/${id}`}
      className="paper-card p-4 block hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-scribble text-xl">{meta.name}</h3>
        <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-ink/60">
          <ProviderStatusDot status={status} size="sm" />
          {pageCopy.badgeSourceLabel[status]}
        </div>
      </div>
      <p className="text-xs text-ink/60 mt-1">{copy.tagline}</p>
      <p className="text-sm text-ink/80 mt-2">{copy.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink/60">
        <span>
          <span className="font-mono uppercase">{pageCopy.licenseLabel}:</span>{" "}
          {meta.license}
        </span>
        <span>
          <span className="font-mono uppercase">{pageCopy.freeTierLabel}:</span>{" "}
          {meta.freeTier}
        </span>
      </div>
    </Link>
  );
}
