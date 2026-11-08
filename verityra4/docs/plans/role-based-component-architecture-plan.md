# Role-based component architecture plan

- [x] Inventory role-specific components, portal layouts, routes, and dynamic imports.
- [x] Move admin modules into feature folders and student modules into feature folders.
- [x] Move the role-neutral shell, command palette, and portal desktop/mobile layouts into `components/portal`.
- [x] Update direct and dynamic imports without changing exports or runtime behavior.
- [x] Create canonical cross-agent instructions and the `docs/ai` handbook.
- [x] Update PRD and UI architecture documentation.
- [x] Run import audit, typecheck, lint, tests, build, and whitespace verification.

## Rollback

Move only the relocated modules and their imports back to their original paths. No data, authorization, action, or schema migration is involved.
