# Quality gates

## Required baseline

- `pnpm typecheck`
- Focused ESLint for changed TypeScript/TSX files
- `git diff --check`

## When behavior, actions, or authorization change

- `pnpm test`
- Relevant targeted tests or E2E coverage

## When build or route configuration changes

- `pnpm build`

## When UI changes

- Review 375px, 768px, 1024px, and 1440px layouts.
- Verify keyboard navigation, focus visibility, loading/empty/error states, and no horizontal page scrolling.

Record actual command output, failures, and remaining limitations in `docs/qa/`. Never report a gate as passed without fresh evidence.
