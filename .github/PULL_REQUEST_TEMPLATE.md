## Summary

<!-- One or two sentences explaining what changed and why. -->

## Checklist

- [ ] `pnpm typecheck` is clean
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] If user-facing strings changed: both IT and EN covered (`src/lib/i18n/dict.ts` / inline ternaries)
- [ ] New external data sources go through `withResilience()` (no ad-hoc fetches)
- [ ] No secrets, API keys, or machine-specific paths committed

## Notes for reviewers

<!--
Anything that helps the reviewer: new spots/providers added, env-var additions,
manual test steps, links to issues, etc.
-->
