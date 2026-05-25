import { cookies } from "next/headers";
import {
  MAP_MODE_COOKIE,
  MAP_MODE_DEFAULT,
  isMapMode,
  type MapMode,
} from "./map-mode-shared";

// legge la map mode dal cookie server-side per inizializzare <MapModeProvider>: senza, chi ha
// scelto "demo" vedrebbe un flash live→demo dopo l'idratazione
export async function getMapMode(): Promise<MapMode> {
  const store = await cookies();
  const v = store.get(MAP_MODE_COOKIE)?.value;
  return isMapMode(v) ? v : MAP_MODE_DEFAULT;
}
