import { afterEach, describe, expect, it, vi } from "vitest";
import { nhc } from "./nhc";

// Mock della sorgente dati: fetch ritorna un sample del feed NHC CurrentStorms.json.
afterEach(() => vi.unstubAllGlobals());

function mockFetch(payload: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => payload,
    })),
  );
}

describe("nhc.fetchActiveStorms", () => {
  it("mappa il feed e normalizza coordinate, categoria e vento", async () => {
    mockFetch({
      activeStorms: [
        {
          id: "al012025",
          name: "Alberto",
          classification: "HU",
          intensity: "75",
          latitude: "24.5N",
          longitude: "60.2W",
          movementDir: 315,
        },
      ],
    });

    const storms = await nhc.fetchActiveStorms();
    expect(storms).toHaveLength(1);
    const s = storms[0];
    expect(s.lat).toBe(24.5);
    expect(s.lng).toBe(-60.2); // 'W' → longitudine negativa
    expect(s.category).toBe("HU");
    expect(s.windKn).toBe(75);
    expect(s.movementDir).toBe("NW"); // 315° → NW
  });

  it("scarta le tempeste senza coordinate valide", async () => {
    mockFetch({ activeStorms: [{ id: "x", name: "NoCoords" }] });
    expect(await nhc.fetchActiveStorms()).toHaveLength(0);
  });
});
