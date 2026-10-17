# GitHub Copilot Instructions for Verityra

You are assisting with the **Verityra** project, an examination test-series platform with handwritten answer sheet evaluation.

## Important Context
- Work directory: The active application root directory is `verityra4/`.
- Full specifications: See `GEMINI.md` and `verityra4/docs/`
- Framework: Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Database: PostgreSQL (Supabase) + Prisma ORM 6.19.3
- Style: Tailwind CSS v4 + shadcn/ui (base-maia style with `@base-ui/react`)

## Core Coding Patterns
1. **Server Actions First**: All data mutations belong in `verityra4/actions/*.ts` with `"use server"`. Never write custom client fetch calls to internal API routes.
2. **Server-Side Authorization**: Every protected action/component must use `getCurrentUser()`, `requireAuth()`, `requireAdmin()`, or `requireStudent()` from `@/lib/auth-guard`.
3. **Strict Invariants**:
   - Never write public marketing copy mentioning AI, automated grading, or AI checking.
   - Respect the 3-attempt limit backed by `@unique([registrationId, attemptNumber])`.
   - Never include `privateEvaluationInstructions` in student queries.
   - Wrap components using `useSearchParams()` with `<Suspense>`.
4. **Validation**:
   - Always run `cd verityra4; pnpm test` and `pnpm run typecheck` to verify code changes.
