# Leaderboard UI refresh plan

- [x] Audit active leaderboard composition and shared public chrome.
- [x] Redesign leaderboard header, ranking-standard panel, podium, metrics, and result cards.
- [x] Add Leaderboard to desktop/mobile public navigation and align footer platform labels.
- [x] Preserve cache, ranking, filtering, sorting, pagination, and empty-state behavior.
- [x] Run focused typecheck, ESLint, and whitespace verification.

## Rollback

Revert only leaderboard and common-chrome presentation changes. No API, cache, route, or ranking logic migration is required.
