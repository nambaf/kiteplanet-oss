# Security Policy

## Reporting a Vulnerability

Kiteplanet is an **open, self-deployable** web app: it has no login, no user accounts, and no
database. There is no shared backend holding user data — each adopter deploys their own instance
(e.g. on Vercel) and the only secret involved is an *optional* Stormglass API key, kept in the
adopter's own environment.

That said, if you find an issue that could affect *every* deployment of this code — for example,
a flaw that leaks an adopter's API key to the client, an SSRF through a data-provider fetch, an
XSS via provider/spot content, or a way to make the app issue unbounded outbound requests —
please **do not open a public GitHub issue**.

Instead, open a private security advisory on GitHub:

  https://github.com/nambaf/kiteplanet-oss/security/advisories/new

Include:

- A description of the vulnerability and its impact.
- Reproduction steps or a minimal proof of concept.
- Affected commit SHA or release tag.
- Any suggested remediation, if you have one.

You can expect an acknowledgement within a week. There is no formal SLA — this is a hobby/personal
project — but real issues will be triaged in good faith.

## What is NOT in scope

- Configuration mistakes by an adopter (e.g. committing their own `.env.local` with a Stormglass
  key, or exposing it via a misconfigured client build).
- Rate limits / quota exhaustion of free upstream APIs (Open-Meteo, NOAA NDBC, NHC, Wikipedia) —
  the resilience layer already degrades gracefully, and adopters control their own usage.
- Third-party dependency CVEs that have a patched version available — please send a PR bumping the
  dependency instead.
