import type { Spot } from "@/lib/types";
import { ITALY_SPOTS } from "./italy";
import { MEDITERRANEAN_SPOTS } from "./mediterranean";
import { ATLANTIC_SPOTS } from "./atlantic";
import { INDIAN_OCEAN_SPOTS } from "./indianOcean";
import { ASIA_PACIFIC_SPOTS } from "./asiaPacific";
import { AMERICAS_SPOTS } from "./americas";

// 50 spot iconici globali: l'Italia tiene i 6 originali, gli altri 5 file regione aggiungono lo standard mondiale
export const SEED_SPOTS: Spot[] = [
  ...ITALY_SPOTS,
  ...MEDITERRANEAN_SPOTS,
  ...ATLANTIC_SPOTS,
  ...INDIAN_OCEAN_SPOTS,
  ...ASIA_PACIFIC_SPOTS,
  ...AMERICAS_SPOTS,
];

export function findSpotBySlug(slug: string): Spot | undefined {
  return SEED_SPOTS.find((s) => s.slug === slug);
}

export function findSpotById(id: string): Spot | undefined {
  return SEED_SPOTS.find((s) => s.id === id);
}
