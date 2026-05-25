// layer atmosferici decorativi per il globo (country label, wind streak, cicloni), curati a mano
export interface CountryLabel {
  name: string;
  lat: number;
  lng: number;
}

export const COUNTRY_LABELS: CountryLabel[] = [
  // --- Europa / Mediterraneo (originali) ---
  { name: "francia", lat: 46.6, lng: 2.2 },
  { name: "italia", lat: 42.5, lng: 12.5 },
  { name: "spagna", lat: 40.0, lng: -3.7 },
  { name: "grecia", lat: 39.0, lng: 22.0 },
  { name: "turchia", lat: 39.0, lng: 35.0 },
  { name: "marocco", lat: 31.8, lng: -7.1 },
  { name: "algeria", lat: 28.0, lng: 2.6 },
  { name: "tunisia", lat: 34.0, lng: 9.5 },
  { name: "libia", lat: 27.0, lng: 18.0 },
  { name: "egitto", lat: 26.8, lng: 30.8 },
  { name: "regno unito", lat: 54.0, lng: -2.0 },
  { name: "germania", lat: 51.0, lng: 10.0 },
  { name: "portogallo", lat: 39.5, lng: -8.0 },

  // --- Atlantico / Africa ---
  { name: "capo verde", lat: 16.0, lng: -24.0 },
  { name: "senegal", lat: 14.5, lng: -14.5 },
  { name: "sudafrica", lat: -29.0, lng: 24.0 },
  { name: "kenya", lat: -1.0, lng: 38.0 },
  { name: "tanzania", lat: -6.5, lng: 35.0 },
  { name: "etiopia", lat: 9.0, lng: 40.0 },
  { name: "arabia saudita", lat: 24.0, lng: 45.0 },
  { name: "madagascar", lat: -19.5, lng: 46.5 },
  { name: "mauritius", lat: -20.3, lng: 57.5 },

  // --- Asia ---
  { name: "india", lat: 22.0, lng: 79.0 },
  { name: "sri lanka", lat: 7.5, lng: 80.7 },
  { name: "cina", lat: 35.0, lng: 103.0 },
  { name: "giappone", lat: 36.0, lng: 138.0 },
  { name: "vietnam", lat: 14.0, lng: 108.0 },
  { name: "thailandia", lat: 15.0, lng: 101.0 },
  { name: "filippine", lat: 13.0, lng: 122.0 },
  { name: "indonesia", lat: -2.0, lng: 117.0 },

  // --- Oceania ---
  { name: "australia", lat: -25.0, lng: 134.0 },
  { name: "nuova zelanda", lat: -41.0, lng: 173.0 },

  // --- Americhe ---
  { name: "stati uniti", lat: 39.0, lng: -98.0 },
  { name: "hawaii", lat: 20.5, lng: -157.0 },
  { name: "canada", lat: 60.0, lng: -100.0 },
  { name: "messico", lat: 23.0, lng: -102.0 },
  { name: "cuba", lat: 22.0, lng: -79.0 },
  { name: "rep. dominicana", lat: 19.0, lng: -70.7 },
  { name: "venezuela", lat: 8.0, lng: -66.0 },
  { name: "colombia", lat: 4.5, lng: -73.0 },
  { name: "brasile", lat: -10.0, lng: -55.0 },
  { name: "argentina", lat: -38.0, lng: -65.0 },

  // --- Nord estremo (riferimenti) ---
  { name: "russia", lat: 60.0, lng: 90.0 },
  { name: "norvegia", lat: 62.0, lng: 10.0 },
  { name: "islanda", lat: 65.0, lng: -19.0 },
  { name: "groenlandia", lat: 72.0, lng: -40.0 },
];

export interface WindStreak {
  lat: number;
  lng: number;
  dirDeg: number; // verso cui VA il vento, gradi (0=N, 90=E)
}

// trattini sull'oceano, direzioni picchettate sui venti dominanti regionali
export const WIND_STREAKS: WindStreak[] = [
  // Tirreno
  { lat: 41.0, lng: 11.0, dirDeg: 135 },
  { lat: 40.0, lng: 12.5, dirDeg: 130 },
  { lat: 39.0, lng: 14.0, dirDeg: 140 },
  // Med centrale (tra Sicilia e Africa)
  { lat: 36.0, lng: 13.0, dirDeg: 145 },
  { lat: 35.0, lng: 16.0, dirDeg: 150 },
  { lat: 36.5, lng: 18.0, dirDeg: 145 },
  // Ionio
  { lat: 38.0, lng: 19.0, dirDeg: 160 },
  { lat: 37.0, lng: 20.5, dirDeg: 170 },
  // Egeo (meltemi da N)
  { lat: 38.0, lng: 25.0, dirDeg: 180 },
  { lat: 37.0, lng: 26.5, dirDeg: 185 },
  { lat: 36.0, lng: 27.0, dirDeg: 175 },
  // Adriatico
  { lat: 44.0, lng: 14.0, dirDeg: 140 },
  { lat: 43.0, lng: 15.5, dirDeg: 145 },
  // Golfo Lione (mistral da NW)
  { lat: 43.0, lng: 5.0, dirDeg: 135 },
  { lat: 42.5, lng: 4.0, dirDeg: 140 },
  // Atlantico Marocco (alisei)
  { lat: 30.0, lng: -10.0, dirDeg: 200 },
  { lat: 25.0, lng: -14.0, dirDeg: 210 },
  // Mar Rosso (vento da N)
  { lat: 27.5, lng: 34.5, dirDeg: 190 },
  { lat: 26.0, lng: 35.5, dirDeg: 180 },
  // Spagna sud (poniente)
  { lat: 36.5, lng: -3.0, dirDeg: 90 },
  { lat: 36.5, lng: -1.0, dirDeg: 95 },

  // --- Bacini globali (visibili in demo mode) ---
  // Alisei NE (Atlantico tropicale)
  { lat: 18.0, lng: -45.0, dirDeg: 240 },
  { lat: 15.0, lng: -55.0, dirDeg: 245 },
  { lat: 20.0, lng: -35.0, dirDeg: 235 },
  // Alisei SE (Atlantico sud)
  { lat: -10.0, lng: -25.0, dirDeg: 290 },
  { lat: -15.0, lng: -30.0, dirDeg: 295 },
  // Caraibi (alisei E)
  { lat: 15.0, lng: -70.0, dirDeg: 270 },
  { lat: 18.0, lng: -65.0, dirDeg: 265 },
  // Pacifico orientale (alisei NE)
  { lat: 18.0, lng: -130.0, dirDeg: 240 },
  { lat: 22.0, lng: -150.0, dirDeg: 235 },
  // Pacifico occidentale (monsone)
  { lat: 12.0, lng: 130.0, dirDeg: 220 },
  { lat: 15.0, lng: 145.0, dirDeg: 230 },
  // Oceano Indiano (monsone SW)
  { lat: 10.0, lng: 65.0, dirDeg: 50 },
  { lat: 5.0, lng: 80.0, dirDeg: 60 },
  // Sud Indiano (alisei SE)
  { lat: -20.0, lng: 75.0, dirDeg: 295 },
  // Roaring forties (sud)
  { lat: -45.0, lng: -50.0, dirDeg: 90 },
  { lat: -45.0, lng: 30.0, dirDeg: 90 },
  { lat: -45.0, lng: 110.0, dirDeg: 90 },
];

export interface Cyclone {
  id: string;
  lat: number;
  lng: number;
  hpa: number;
  label: string;
}

// cicloni mock (spirali rotanti) nei principali bacini ciclonici: globo demo "vivo" anche con NHC piatto
export const MOCK_CYCLONES: Cyclone[] = [
  // Mediterraneo (medicanes — rari ma reali)
  { id: "med-golfo-leone", lat: 42.5, lng: 5.0, hpa: 998, label: "medicane" },
  { id: "med-egeo", lat: 36.5, lng: 26.0, hpa: 1004, label: "cella isolata" },
  // North Atlantic (NHC area)
  { id: "atl-bahamas", lat: 24.0, lng: -70.0, hpa: 985, label: "TS · 55 kn" },
  // East Pacific (off Mexico)
  { id: "epac-baja", lat: 15.0, lng: -110.0, hpa: 978, label: "HU · 80 kn" },
  // West Pacific (Philippine Sea — tifoni)
  { id: "wpac-philippines", lat: 17.0, lng: 138.0, hpa: 955, label: "TY · 105 kn" },
  // North Indian (Bay of Bengal)
  { id: "nio-bengal", lat: 16.0, lng: 88.0, hpa: 990, label: "CS · 60 kn" },
  // South Indian (off Madagascar)
  { id: "sio-madagascar", lat: -18.0, lng: 60.0, hpa: 982, label: "TC · 75 kn" },
  // South Pacific (near Fiji)
  { id: "spac-fiji", lat: -15.0, lng: 175.0, hpa: 988, label: "TC · 65 kn" },
];
