import type { Cyclone } from "@/data/atmosphere";
import type { ActiveStorm } from "@/lib/providers/types";

// shape unificata che il Globo renderizza come spirale: sia i mock (Cyclone) che i live (ActiveStorm)
// vengono mappati qui, così il Globo non sa più chi li ha prodotti
export interface CycloneMarker {
  id: string;
  lat: number;
  lng: number;
  label: string; // testo sotto la spirale
}

export function mockCycloneToMarker(c: Cyclone): CycloneMarker {
  return {
    id: c.id,
    lat: c.lat,
    lng: c.lng,
    label: `${c.hpa} hPa · ${c.label}`,
  };
}

export function activeStormToMarker(s: ActiveStorm): CycloneMarker {
  const wind = s.windKn !== undefined ? ` · ${s.windKn} kn` : "";
  return {
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    label: `${s.category} ${s.name}${wind}`,
  };
}
