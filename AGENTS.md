# Verityra Agent Operating Manual

> **PRIMARY DIRECTIVE**: The active application codebase is located in **`verityra4/`**. Always execute terminal commands and code modifications inside `verityra4/`.

Refer to [`GEMINI.md`](GEMINI.md) for full architecture and domain invariants.

## Essential Rules for Autonomous Agents
1. **Directory**: Always operate inside `verityra4/`.
2. **Action-Based Architecture**: Use direct Server Actions (`actions/*.ts` with `"use server"`). Do NOT create client `fetch()` calls to internal API routes.
3. **Zero AI Marketing Rule**: Never mention AI, automated evaluation, or AI checking in any public marketing copy or landing pages.
4. **Three-Attempt Invariant**: Strict maximum 3 submissions per test series registration. Backed by `@unique([registrationId, attemptNumber])`.
5. **Instruction Isolation**: `privateEvaluationInstructions` must never be exposed or returned to students.
6. **Suspense Boundaries**: Wrap client components using `useSearchParams()` with `<Suspense>`.
7. **Verification Routine**: Always run `cd verityra4; pnpm test` and `pnpm run typecheck` before finishing.
