import type { Lang } from "@/lib/providers/types";

// dizionario minimale per la sola sezione data-sources (resto app: stringhe inline / copy.ts)
export const DICT = {
  it: {
    sources: "sorgenti",
    spot: "spot",
    home: "home",
    backToHome: "← globo",
    backToSources: "← sorgenti dati",
    addedSpotsLine: "spot che usano questa sorgente",
    lastFetched: "ultimo fetch",
    seconds: "s fa",
    minutes: "min fa",
    hours: "h fa",
    days: "g fa",
    requiresKey: "serve API key",
    unavailable: "non disponibile",
    disabled: "disabilitato",
    live: "live",
    cache: "cache",
  },
  en: {
    sources: "sources",
    spot: "spot",
    home: "home",
    backToHome: "← globe",
    backToSources: "← data sources",
    addedSpotsLine: "spots using this source",
    lastFetched: "last fetched",
    seconds: "s ago",
    minutes: "min ago",
    hours: "h ago",
    days: "d ago",
    requiresKey: "API key required",
    unavailable: "unavailable",
    disabled: "disabled",
    live: "live",
    cache: "cache",
  },
} as const;

export type DictKey = keyof typeof DICT.it;

export function t(lang: Lang, key: DictKey): string {
  return DICT[lang][key];
}

export function timeAgo(isoTs: string, lang: Lang): string {
  const diffMs = Date.now() - new Date(isoTs).getTime();
  const sec = Math.max(Math.round(diffMs / 1000), 0);
  if (sec < 60) return `${sec}${t(lang, "seconds")}`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}${t(lang, "minutes")}`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}${t(lang, "hours")}`;
  const day = Math.round(hr / 24);
  return `${day}${t(lang, "days")}`;
}
