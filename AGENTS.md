<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Verityra Agent Operating Manual

Refer to [`GEMINI.md`](GEMINI.md) for full architecture and domain invariants.

## Essential Rules for Autonomous Agents
1. **Directory**: Always operate inside `verityra4/`.
2. **Action-Based Architecture**: Use direct Server Actions (`actions/*.ts` with `"use server"`). Do NOT create client `fetch()` calls to internal API routes.
3. **Zero AI Marketing Rule**: Never mention AI, automated evaluation, or AI checking in any public marketing copy or landing pages.
4. **Three-Attempt Invariant**: Strict maximum 3 submissions per test series registration. Backed by `@unique([registrationId, attemptNumber])`.
5. **Instruction Isolation**: `privateEvaluationInstructions` must never be exposed or returned to students.
6. **Suspense Boundaries**: Wrap client components using `useSearchParams()` with `<Suspense>`.
7. **Verification Routine**: Always run `pnpm test` and `pnpm run typecheck` before finishing.
