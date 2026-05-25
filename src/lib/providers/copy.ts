import type { Lang, ProviderId } from "./types";

export interface ProviderCopy {
  tagline: string;
  description: string;
  usedFor: string[];
}

export const PROVIDER_COPY: Record<ProviderId, Record<Lang, ProviderCopy>> = {
  "open-meteo": {
    it: {
      tagline: "previsioni vento, onda e SST (free tier, no key)",
      description:
        "Aggregatore meteo open che unisce i principali modelli numerici globali (ECMWF, GFS, ICON e altri) dietro un'unica API. Lo usiamo nel free tier (CC BY 4.0, <10k chiamate/giorno, non-commerciale) attaccando tre endpoint distinti: forecast atmosferico, marine e SST.",
      usedFor: [
        "Home: snapshot 12h per ogni spot — alimenta il punteggio match e gli eventi sulla mappa",
        "Pagina spot: forecast orario 72h (vento 10m in nodi, raffiche, direzione, temperatura aria, pioggia)",
        "Pagina spot: onda da marine API (altezza, periodo, direzione) quando disponibile",
        "Pagina spot: card temperatura mare (SST) dalla marine API",
      ],
    },
    en: {
      tagline: "wind, wave & SST forecast (free tier, no key)",
      description:
        "Open meteorological aggregator blending the main global numerical models (ECMWF, GFS, ICON and others) behind a single API. We use the free tier (CC BY 4.0, <10k calls/day, non-commercial) against three distinct endpoints: atmospheric forecast, marine and SST.",
      usedFor: [
        "Home: 12h snapshot per spot — feeds the match score and events shown on the map",
        "Spot page: 72h hourly forecast (10m wind in knots, gusts, direction, air temp, precipitation)",
        "Spot page: waves from marine API (height, period, direction) when available",
        "Spot page: sea-surface temperature (SST) card from the marine API",
      ],
    },
  },
  "noaa-ndbc": {
    it: {
      tagline: "boe NOAA real-time (public domain, no key)",
      description:
        "National Data Buoy Center: stazioni fisiche (boe + C-MAN) della NOAA che pubblicano osservazioni dirette di vento, onda e temperatura. Leggiamo l'endpoint testuale realtime2 (.txt) della stazione, refresh ogni ~10 minuti. Dati public domain (U.S. Government work), copertura densa in Atlantico, Pacifico e Caraibi.",
      usedFor: [
        "Pagina spot: card 'boa più vicina' con vento e raffiche misurate (nodi)",
        "Pagina spot: altezza e periodo onda reali (non da modello)",
        "Pagina spot: temperatura acqua e aria al momento dell'osservazione",
        "Globo home: ogni stazione è marcata con un pittogramma boa + station ID",
        "Whitelist via spot.refs.ndbcBuoyId — solo gli spot con boa assegnata mostrano la card",
      ],
    },
    en: {
      tagline: "NOAA real-time buoys (public domain, no key)",
      description:
        "National Data Buoy Center: physical stations (buoys + C-MAN) run by NOAA publishing direct observations of wind, wave and temperature. We hit the realtime2 text endpoint (.txt) for each station, refreshed every ~10 minutes. Data is public domain (U.S. Government work), with dense coverage in the Atlantic, Pacific and Caribbean.",
      usedFor: [
        "Spot page: 'nearest buoy' card showing measured wind and gusts (knots)",
        "Spot page: real wave height and period (not modelled)",
        "Spot page: water and air temperature at observation time",
        "Home globe: each station gets a buoy pictogram + station ID marker",
        "Whitelist via spot.refs.ndbcBuoyId — only spots with an assigned buoy show the card",
      ],
    },
  },
  stormglass: {
    it: {
      tagline: "maree (key, 10 req/giorno gratis)",
      description:
        "API marine che dà accesso a multi-modello e maree. Per noi serve solo l'endpoint marea: critico su spot come Stagnone, Trettu, Outer Banks dove la marea decide se si naviga.",
      usedFor: [
        "Estremi di marea (high/low) per i prossimi 5 giorni",
        "Differenza in cm tra picco e cavo (range della marea)",
        "Whitelist: si attiva solo dove refs.stormglassEnabled = true",
      ],
    },
    en: {
      tagline: "tides (key, free 10 req/day)",
      description:
        "Marine API exposing multi-model and tide data. We only use the tide endpoint: critical on spots like Stagnone, Trettu, Outer Banks where tides decide whether you can ride.",
      usedFor: [
        "Tide extremes (high/low) for the next 5 days",
        "Range in cm between peak and trough",
        "Whitelist: enabled only where refs.stormglassEnabled = true",
      ],
    },
  },
  wikipedia: {
    it: {
      tagline: "descrizione enciclopedica (CC BY-SA, no key)",
      description:
        "REST API ufficiale Wikimedia: endpoint /api/rest_v1/page/summary/{title}. Routiamo automaticamente sul dominio it.wikipedia.org o en.wikipedia.org in base alla lingua dell'utente. Titolo della voce specificato per-spot in refs.wikipediaTitle.it/en. Cache 24h per non martellare Wikimedia.",
      usedFor: [
        "Pagina spot: card 'scheda enciclopedica' full-width con summary della voce",
        "Pagina spot: link 'voce completa ↗' all'articolo Wikipedia originale",
        "Solo spot con refs.wikipediaTitle.<lang> impostato mostrano la card",
      ],
    },
    en: {
      tagline: "encyclopedic summary (CC BY-SA, no key)",
      description:
        "Official Wikimedia REST API: /api/rest_v1/page/summary/{title} endpoint. We automatically route to it.wikipedia.org or en.wikipedia.org based on the user's locale. Article title is set per-spot in refs.wikipediaTitle.it/en. 24h cache so we don't hammer Wikimedia.",
      usedFor: [
        "Spot page: full-width 'encyclopedia' card with the article summary",
        "Spot page: 'full article ↗' link to the original Wikipedia page",
        "Only spots with refs.wikipediaTitle.<lang> set render the card",
      ],
    },
  },
  nhc: {
    it: {
      tagline: "cicloni attivi (no key)",
      description:
        "National Hurricane Center (NOAA). Pubblicazione JSON dei cicloni tropicali attivi nei bacini Atlantico/Pacifico orientale e centrale. Sostituisce i mock con dati reali.",
      usedFor: [
        "Banner di allerta in home se un ciclone è entro 800 km da uno spot ON",
        "Marker spirale sul globo per ogni storm attivo",
        "Categoria (TD/TS/HU), vento sostenuto, movimento",
      ],
    },
    en: {
      tagline: "active tropical storms (no key)",
      description:
        "National Hurricane Center (NOAA). JSON feed of active tropical storms in the Atlantic and East/Central Pacific basins. Replaces the mock data with real observations.",
      usedFor: [
        "Home alert banner if a storm is within 800 km of an ON spot",
        "Spiral marker on the globe for each active storm",
        "Category (TD/TS/HU), sustained wind, movement",
      ],
    },
  },
};

// copy per la sezione intro di /data-sources e la strip in home
export const PAGE_COPY: Record<Lang, {
  pageTitle: string;
  pageIntro: string;
  stripTitle: string;
  badgeSourceLabel: Record<"live" | "cache" | "unavailable" | "requires-key" | "disabled" | "demo", string>;
  spotPanelTitle: string;
  spotPanelIntro: string;
  ctaAddKey: string;
  langSwitchLabel: string;
  freeTierLabel: string;
  licenseLabel: string;
  envVarsLabel: string;
  usedForLabel: string;
  attributionLabel: string;
  docsLabel: string;
  exampleJsonLabel: string;
  spotsUsingLabel: string;
}> = {
  it: {
    pageTitle: "sorgenti dati",
    pageIntro:
      "Kiteplanet è un'app open-source che orchestra sorgenti dati gratuite per generare la mappa, gli eventi e le schede spot. Ogni provider qui sotto è documentato: cosa fornisce, come viene usato, e come abilitarlo nella tua copia.",
    stripTitle: "sorgenti dati",
    badgeSourceLabel: {
      live: "live",
      cache: "cache",
      unavailable: "non disponibile",
      "requires-key": "serve API key",
      disabled: "disabilitato",
      demo: "demo",
    },
    spotPanelTitle: "sorgenti per questo spot",
    spotPanelIntro:
      "Ogni metric mostrata in questa pagina viene da una sorgente diversa. Ecco il dettaglio:",
    ctaAddKey: "Aggiungi la tua key in .env per attivare",
    langSwitchLabel: "EN",
    freeTierLabel: "free tier",
    licenseLabel: "licenza",
    envVarsLabel: "variabili env",
    usedForLabel: "come lo usiamo",
    attributionLabel: "attribuzione",
    docsLabel: "documentazione",
    exampleJsonLabel: "esempio risposta",
    spotsUsingLabel: "spot che lo usano",
  },
  en: {
    pageTitle: "data sources",
    pageIntro:
      "Kiteplanet is an open-source app orchestrating free data sources to power the map, events and spot pages. Each provider below is documented: what it returns, how we use it, and how to enable it in your own fork.",
    stripTitle: "data sources",
    badgeSourceLabel: {
      live: "live",
      cache: "cache",
      unavailable: "unavailable",
      "requires-key": "API key required",
      disabled: "disabled",
      demo: "demo",
    },
    spotPanelTitle: "sources for this spot",
    spotPanelIntro:
      "Every metric you see on this page comes from a different source. Here's the breakdown:",
    ctaAddKey: "Add your key in .env to enable",
    langSwitchLabel: "IT",
    freeTierLabel: "free tier",
    licenseLabel: "license",
    envVarsLabel: "env vars",
    usedForLabel: "how we use it",
    attributionLabel: "attribution",
    docsLabel: "documentation",
    exampleJsonLabel: "example response",
    spotsUsingLabel: "spots using it",
  },
};
