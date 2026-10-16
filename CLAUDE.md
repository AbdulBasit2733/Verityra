# Verityra — Claude & Agent Instructions

Refer to **`GEMINI.md`** for the full comprehensive architecture, invariants, and directory map.

## Core Directives
1. **Work Directory**: `verityra4/`
2. **Commands** (run inside `verityra4/`):
   - `pnpm test` -> Run automated test suite (11/11 tests)
   - `pnpm run typecheck` -> Type check TypeScript with zero errors
   - `pnpm run build` -> Production build with Turbopack
   - `pnpm run dev` -> Local dev server on port 3000
   - `pnpm exec prisma db push` -> Sync Prisma schema with Supabase PostgreSQL
   - `pnpm exec prisma db seed` -> Seed initial Admin & mock tests
3. **Critical Invariants**:
   - **Zero AI in Public Copy**: Never mention AI, automated grading, or AI checking on landing pages or public marketing.
   - **Strict 3-Attempt Limit**: Atomically enforced via `@unique([registrationId, attemptNumber])` and transactions.
   - **Confidential Instructions**: Never leak `privateEvaluationInstructions` to student projections.
   - **Server Actions**: All mutations use direct Server Actions in `actions/*`. No client fetch to internal routes.
   - **Role Enforcement**: Server-enforced via `lib/auth-guard.ts`. Public signup = `Role.STUDENT`.
   - **Suspense Boundary**: Wrap any client component using `useSearchParams()` with `<Suspense>`.
