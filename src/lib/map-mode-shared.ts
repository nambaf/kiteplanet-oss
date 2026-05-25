export type MapMode = "live" | "demo";

export const MAP_MODE_COOKIE = "kp-map-mode";
export const MAP_MODE_DEFAULT: MapMode = "demo";

export function isMapMode(v: unknown): v is MapMode {
  return v === "live" || v === "demo";
}
