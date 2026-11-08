# Leaderboard UI refresh

## Summary

Refresh the public leaderboard with the existing Verityra Sapphire/editorial system while preserving ranking data, filtering, sorting, pagination, and cache behavior.

## Interaction contract

- Keep finalized/published results as the only visible dataset.
- Keep deterministic rank ordering and earliest-submission tie semantics.
- Preserve search, score-band filters, attempt filters, date filtering, table/card views, and empty states.
- Keep public navigation and footer labels aligned: Test Series, Leaderboard, How It Works, and Resources.

## UI requirements

- Use semantic theme tokens and existing primitives.
- Highlight the top three with rank, initials, score, percentage bar, and attempt context.
- Preserve readable mobile cards and desktop data-table scanning.
- Maintain visible keyboard focus, responsive gutters, accessible rank labels, and non-color score communication.
