import Link from "next/link";
import { ProviderStatusDot } from "./ProviderStatusDot";
import { PAGE_COPY } from "@/lib/providers/copy";
import { timeAgo } from "@/lib/i18n/dict";
import type { Lang, ProviderId, ProviderStatus } from "@/lib/providers/types";
import { getProvider } from "@/lib/providers/registry";

// badge compatto inline accanto a una metric; click → /data-sources/{id}
export function DataSourceBadge({
  provider,
  status,
  ts,
  lang,
}: {
  provider: ProviderId;
  status: ProviderStatus;
  ts?: string;
  lang: Lang;
}) {
  const p = getProvider(provider);
  const label = PAGE_COPY[lang].badgeSourceLabel[status];
  return (
    <Link
      href={`/data-sources/${provider}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper/70 px-2 py-0.5 text-[10px] font-mono text-ink/70 hover:border-ink/40 hover:text-ink transition-colors"
      title={`${p.name} · ${label}${ts ? ` · ${timeAgo(ts, lang)}` : ""}`}
    >
      <ProviderStatusDot status={status} size="xs" />
      <span>{p.name}</span>
      <span className="text-ink/40">·</span>
      <span>{label}</span>
      {ts && status === "live" && (
        <>
          <span className="text-ink/40">·</span>
          <span>{timeAgo(ts, lang)}</span>
        </>
      )}
    </Link>
  );
}
