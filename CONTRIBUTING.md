# Contributing

Thanks for wanting to contribute! Quick guidelines to keep things moving.

## Local Setup

The app runs out-of-the-box with **no API keys and no database**:

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Requires Node ≥ 20 (see `.nvmrc`) and pnpm ≥ 10. The 50 spots ship in `src/data/spots/`,
forecasts come from Open-Meteo (free, no key). Only Stormglass (tides) needs a key, and
it degrades gracefully when missing — see `.env.example`.

## Branch Model

- `main` — protected, PRs only
- `feat/<name>` — new features
- `fix/<name>` — bug fixes
- `docs/<name>` — documentation only
- `refactor/<name>` — refactors without behavioural changes

## Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) recommended — the changelog
(`pnpm release`) is generated from them. Examples:

```
feat(providers): add a new tide source
fix(globe): handle antimeridian seam in coastline triangulation
docs(readme): clarify Stormglass opt-in per spot
```

## Before Opening a PR

Everything CI runs (`.github/workflows/ci.yml`) must pass locally:

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint
pnpm test         # vitest run
pnpm build        # production build
```

## What We Appreciate

- **New spots** — add them under `src/data/spots/<region>.ts` (see the existing files for the
  shape; set `refs.stormglassEnabled` only where tides are worth the 10 req/day budget).
- **New data providers** — implement the `DataProvider` interface and always call through
  `withResilience()`.
- **Localisation** — the UI is IT/EN. The dictionary in `src/lib/i18n/dict.ts` is intentionally
  minimal; longer provider copy lives in `src/lib/providers/copy.ts`.
- UI/UX improvements consistent with the existing "carta sketchy" aesthetic.
- Clearer documentation.

## What We Don't Accept

- **Auth / user accounts / profiles** — the app is intentionally open, with no login and no
  database. Need a different model? Fork it.
- **External calls outside `withResilience`** — no ad-hoc `try/catch` fetches. Every provider
  goes through the resilience wrapper so the UI never hangs or shows a blank page.
- Heavy dependencies without justification (keep the bundle lightweight).
- Personal data or secrets in commits (API keys, `.env*` files, machine-specific paths).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
