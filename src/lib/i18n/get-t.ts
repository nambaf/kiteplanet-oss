import { cookies } from "next/headers";
import type { Lang } from "@/lib/providers/types";
import { DICT, type DictKey } from "./dict";

const DEFAULT_LANG: Lang =
  (process.env.NEXT_PUBLIC_DEFAULT_LANG as Lang | undefined) ?? "it";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get("lang")?.value;
  if (v === "it" || v === "en") return v;
  return DEFAULT_LANG;
}

export async function getT(): Promise<{
  lang: Lang;
  t: (k: DictKey) => string;
}> {
  const lang = await getLang();
  return {
    lang,
    t: (k: DictKey) => DICT[lang][k],
  };
}
