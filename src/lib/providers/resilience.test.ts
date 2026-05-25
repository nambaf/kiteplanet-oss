import { describe, expect, it } from "vitest";
import { withResilience } from "./resilience";
import type { ProviderAvailability } from "./types";

// Il contratto di withResilience è il cuore della resilienza ai provider esterni:
// niente eccezione raggiunge mai il render, ogni esito ha un `source` ben definito.
function provider(available: ProviderAvailability) {
  return { id: "open-meteo" as const, available: () => available };
}

describe("withResilience", () => {
  it("torna 'live' con i dati quando il fetcher risolve", async () => {
    const res = await withResilience(async () => ({ value: 42 }), {
      provider: provider({ ok: true }),
    });
    expect(res.source).toBe("live");
    expect(res.data).toEqual({ value: 42 });
  });

  it("torna 'unavailable' senza propagare l'errore quando il fetcher lancia", async () => {
    const res = await withResilience(
      async () => {
        throw new Error("boom");
      },
      { provider: provider({ ok: true }) },
    );
    expect(res.source).toBe("unavailable");
    expect(res.data).toBeNull();
    expect(res.error).toBe("boom");
  });

  it("torna 'requires-key' / 'disabled' senza chiamare il fetcher se non disponibile", async () => {
    const requiresKey = await withResilience(async () => "x", {
      provider: provider({ ok: false, reason: "no-key" }),
    });
    expect(requiresKey.source).toBe("requires-key");

    const disabled = await withResilience(async () => "x", {
      provider: provider({ ok: false, reason: "disabled" }),
    });
    expect(disabled.source).toBe("disabled");
  });
});
