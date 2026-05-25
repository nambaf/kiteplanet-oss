"use client";

import { useMemo } from "react";
import type { Lang } from "@/lib/providers/types";
import { DICT, type DictKey } from "./dict";

/** Legge il cookie `lang` lato client. SSR-safe: ritorna 'it' lato server. */
export function getClientLang(defaultLang: Lang = "it"): Lang {
  if (typeof document === "undefined") return defaultLang;
  const match = document.cookie.match(/(?:^|;\s*)lang=(it|en)/);
  return (match?.[1] as Lang) ?? defaultLang;
}

export function useT(initialLang: Lang = "it"): {
  lang: Lang;
  t: (k: DictKey) => string;
} {
  const lang = useMemo(() => getClientLang(initialLang), [initialLang]);
  return {
    lang,
    t: (k) => DICT[lang][k],
  };
}
