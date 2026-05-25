import { providerFetch } from "./resilience";
import type {
  Lang,
  ProviderAvailability,
  WikiProvider,
  WikiSummary,
} from "./types";

const BASE_IT =
  process.env.WIKIPEDIA_BASE_IT ?? "https://it.wikipedia.org/api/rest_v1";
const BASE_EN =
  process.env.WIKIPEDIA_BASE_EN ?? "https://en.wikipedia.org/api/rest_v1";

interface WikiSummaryResponse {
  title: string;
  extract: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source: string };
}

function available(): ProviderAvailability {
  return { ok: true };
}

export const wikipedia: WikiProvider = {
  id: "wikipedia",
  name: "Wikipedia",
  categories: ["encyclopedia"],
  requiresKey: false,
  envVars: ["WIKIPEDIA_BASE_IT", "WIKIPEDIA_BASE_EN"],
  attribution: "Content from Wikipedia (CC BY-SA 4.0)",
  homeUrl: "https://www.wikipedia.org",
  docsUrl: "https://www.mediawiki.org/wiki/Wikimedia_REST_API",
  license: "CC BY-SA 4.0",
  freeTier: "No key, ~200 req/s teorici, User-Agent identificativo richiesto",
  available,
  async fetchSummary(title: string, lang: Lang): Promise<WikiSummary | null> {
    const base = lang === "it" ? BASE_IT : BASE_EN;
    const url = `${base}/page/summary/${encodeURIComponent(title)}`;
    const res = await providerFetch(url, AbortSignal.timeout(4000), {
      revalidateSec: 60 * 60 * 24,
      headers: { Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);
    const data = (await res.json()) as WikiSummaryResponse;
    return {
      title: data.title,
      summary: data.extract,
      url:
        data.content_urls?.desktop?.page ??
        `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      thumbUrl: data.thumbnail?.source,
      lang,
    };
  },
};
