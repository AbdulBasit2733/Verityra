# Shared Chrome and Auth Layout Plan

- [x] Make `SiteChrome` add navigation/footer only to public marketing routes.
- [x] Remove page-level navigation/footer imports and duplicate markup from public pages.
- [x] Replace the JavaScript viewport switch in `AuthShell` with a single CSS-responsive layout.
- [x] Add shared theme controls to the sign-in/sign-up and recovery/access-state shells.
- [x] Keep the root `ThemeProvider` as the sole theme provider.
- [x] Align auth form borders, contrast, spacing, and overflow behavior.
- [x] Record final typecheck, lint, and build evidence in `docs/qa/shared-chrome-auth-layout-verification.md`.

## Verification

- `pnpm typecheck`
- `pnpm exec eslint app/layout.tsx app app/signin app/signup app/forgot-password app/reset-password app/verify-email app/unauthorized app/suspended components/common components/layout/auth`
- `pnpm build`
- `git diff --check`
