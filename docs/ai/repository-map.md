# Repository map

## Routes and UI ownership

- `app/admin/*` composes `components/admin/<feature>/*` inside the role-neutral `components/portal/portal-shell.tsx`.
- `app/student/*` composes `components/student/<feature>/*` inside the same portal shell.
- `components/portal/desktop` and `components/portal/mobile` hold the intentionally different portal markup.
- `components/ui` owns reusable primitives; feature code must not duplicate primitive behavior.
- `components/common`, `components/auth`, `components/landing`, and `components/shared` are non-role-specific.

## Import rules

- Route pages import their role feature directly using `@/components/admin/...` or `@/components/student/...`.
- Role feature modules may import `ui`, `shared`, actions, and lib modules.
- Student modules must not import administrator modules or evaluator-only information.
- Administrator modules may display governance-only information but must preserve server authorization as the enforcement layer.
- Use `desktop/` or `mobile/` only for genuinely alternate markup; do not split simple Tailwind breakpoints into duplicate files.
