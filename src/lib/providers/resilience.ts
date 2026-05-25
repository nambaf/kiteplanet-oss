import type {
  DataProvider,
  ProviderId,
  ProviderResult,
} from "./types";

export interface ResilienceOptions {
  provider: Pick<DataProvider, "id" | "available">;
  timeoutMs?: number; // default 5000
}

export async function withResilience<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  opts: ResilienceOptions,
): Promise<ProviderResult<T>> {
  const provider = opts.provider.id as ProviderId;
  const now = () => new Date().toISOString();

  const availability = opts.provider.available();
  if (!availability.ok) {
    return {
      data: null,
      source: availability.reason === "disabled" ? "disabled" : "requires-key",
      fetchedAt: now(),
      provider,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 5000,
  );

  try {
    const data = await fn(controller.signal);
    clearTimeout(timer);
    return {
      data,
      source: "live",
      fetchedAt: now(),
      provider,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      data: null,
      source: "unavailable",
      fetchedAt: now(),
      provider,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Wikimedia blocca client con UA vuoto/generico → UA esplicito, override via env per fork
const DEFAULT_USER_AGENT =
  process.env.KITEPLANET_UA ??
  "Kiteplanet/1.0.0 (+https://github.com/nambaf/kiteplanet-oss)";

export async function providerFetch(
  url: string,
  signal: AbortSignal,
  opts: { revalidateSec?: number; headers?: Record<string, string> } = {},
): Promise<Response> {
  const init: RequestInit = {
    signal,
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      ...opts.headers,
    },
  };
  if (typeof opts.revalidateSec === "number") {
    (init as RequestInit & { next?: { revalidate?: number } }).next = {
      revalidate: opts.revalidateSec,
    };
  }
  return fetch(url, init);
}
