# Table action controls plan

- [x] Add a reusable icon-only action button backed by the shared tooltip primitive.
- [x] Replace text actions in administrative and student data-table action columns.
- [x] Preserve dialog-trigger actions with icon buttons, accessible labels, and tooltips.
- [x] Document the shared table-action rule in the UI architecture.
- [x] Run focused typecheck, lint, and whitespace verification.

## Rollback

Revert only the icon-action component and affected action-cell renderers; table data, handlers, routes, and dialogs remain unchanged.
