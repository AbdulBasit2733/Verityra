# Auth guard parser fix verification

## Root cause

`lib/auth-guard.ts` had a duplicated success return and closing brace after `resolvePersistedAdminActor`. The second return sat at module scope, producing “Return statement is not allowed here.”

## Repair

Removed only the duplicated top-level return block. Authorization behavior and the persisted-admin contract were not changed.

## Verification

- `pnpm exec eslint lib/auth-guard.ts` — passed.
- `pnpm test` — passed, 65/65 tests.
- `pnpm typecheck` — parser error resolved; a separate pre-existing Prisma type error remains in `scripts/clear-database.ts:220` (`evaluationQuestionItem` is not a generated Prisma property).
