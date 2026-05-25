import { describe, expect, it } from "vitest";
import { parseNdbcLatest } from "./noaa-ndbc";

// Sample del formato fixed-width che NDBC pubblica per ogni boa.
const SAMPLE = `#YY  MM DD hh mm WDIR WSPD GST  WVHT  DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s     m  sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft
2024 01 15 12 00 180  5.0  7.0   1.5  8.0   6.0 200 1015.0  18.0  20.0  15.0   MM   MM    MM`;

describe("parseNdbcLatest", () => {
  it("estrae l'osservazione più recente e converte m/s → nodi", () => {
    const obs = parseNdbcLatest(SAMPLE);
    expect(obs).not.toBeNull();
    expect(obs!.observedAtIso).toBe("2024-01-15T12:00:00Z");
    expect(obs!.windKn).toBeCloseTo(9.72, 1); // 5.0 m/s
    expect(obs!.gustKn).toBeCloseTo(13.61, 1); // 7.0 m/s
    expect(obs!.windDirDeg).toBe(180);
    expect(obs!.waveHeightM).toBe(1.5);
    expect(obs!.wavePeriodS).toBe(8.0);
    expect(obs!.waterTempC).toBe(20.0);
  });

  it("torna null se non ci sono righe di dati", () => {
    expect(parseNdbcLatest("#YY MM DD hh mm\n#yr mo dy hr mn")).toBeNull();
  });
});
