# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-25

### Added

- Initial public release of Kiteplanet.
- Interactive three.js globe with real coastlines (topojson + world-atlas), Fresnel atmosphere,
  live spot pins and tropical cyclones rendered as rotating spirals.
- 50 curated kitesurf spots shipped in `src/data/spots/` (Italy, Mediterranean, Atlantic,
  Indian Ocean, Asia-Pacific, Americas).
- Provider Registry with a single `withResilience()` wrapper over five open-data sources:
  - Open-Meteo (wind / wave / SST forecast — no key)
  - NOAA NDBC (real-time buoy observations — no key)
  - NHC (active tropical cyclones — no key)
  - Wikipedia REST (spot summaries — no key)
  - Stormglass (tides — opt-in per spot, free 10 req/day)
- Five resilience states (`live` · `unavailable` · `requires-key` · `disabled` · `demo`): the UI
  adapts to each — no infinite loaders, no blank pages.
- Per-section streaming SSR on the spot page (one `<Suspense>` per provider, deduped via React `cache()`).
- `demo` / `live` map mode, persisted on cookie + localStorage with zero hydration flash.
- Bilingual UI (Italian / English), cookie-based, plus a `/data-sources` page documenting every provider.
- Kite-size recommendation engine (`src/lib/kite/reco.ts`) producing ON / MARGINAL / OFF per hour.
- PWA, "carta sketchy" aesthetic (paper palette, hand-drawn fonts, SVG turbulence filter).
- TypeScript strict end-to-end on Next.js 15 (App Router), Tailwind, Vitest test suite, CI on GitHub Actions.

### Note

This is the first stable release. The app runs out-of-the-box with no API keys and no database;
it is designed to be self-deployed (Vercel recommended for SSR streaming).
