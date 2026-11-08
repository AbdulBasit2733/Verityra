# Landing Page Components Plan

## Implementation checklist

- [x] Extract the responsive hero into `components/landing/hero-section.tsx`.
- [x] Extract the handwritten preparation workflow into `components/landing/preparation-section.tsx`.
- [x] Add `components/landing/exam-paths-section.tsx` for UPSC, State PCS, and Judicial Services discovery.
- [x] Extract candidate progress/trust messaging into `components/landing/progress-section.tsx`.
- [x] Compose sections from `app/page.tsx` and retain the existing catalog and signup destinations.
- [x] Add a light footer variant and force the homepage navigation presentation to light.
- [x] Add CSS-created decorative shapes and scope light semantic tokens to the landing page.
- [x] Record final typecheck, lint, and production-build output in `docs/qa/landing-page-components-verification.md`.

## Verification commands

- `pnpm typecheck`
- `pnpm exec eslint app/page.tsx components/landing components/footer.tsx components/navbar.tsx`
- `pnpm build`
- `git diff --check`

## Rollback criteria

Revert only the landing-page component and light-theme changes if the page fails to compile, navigation destinations regress, or a public surface exposes evaluator-only content. Keep unrelated worktree changes untouched.
