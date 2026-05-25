import { describe, expect, it } from "vitest";
import { matchHour } from "./reco";
import type { ForecastHour, Spot } from "@/lib/types";

// Spiaggia rivolta a N (beachAzimuth 0): il vento onshore arriva da S (180°).
const spot: Spot = {
  id: "test",
  slug: "test",
  name: "Test",
  country: "IT",
  countryCode: "IT",
  lat: 0,
  lng: 0,
  beachAzimuth: 0,
  waterType: "flat",
  windMinKn: 12,
  windMaxKn: 30,
  optimalDirections: ["S"],
  seasonMonths: [6, 7, 8],
  description: "",
};

function hour(windKn: number, windDirDeg: number): ForecastHour {
  return { timeIso: "", windKn, gustKn: windKn + 4, windDirDeg, tempC: 20, precipMm: 0 };
}

describe("matchHour", () => {
  it("ON: vento onshore nel range e direzione ottimale", () => {
    const m = matchHour({ spot, hour: hour(18, 180) });
    expect(m.status).toBe("on");
    expect(m.recommendedKiteSize).toBeGreaterThan(0);
  });

  it("OFF: vento offshore (da terra) penalizzato pesantemente", () => {
    const m = matchHour({ spot, hour: hour(18, 0) });
    expect(m.status).toBe("off");
  });
});
