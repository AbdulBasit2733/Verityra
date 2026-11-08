# Verityra UI Redesign Implementation Checklist

## Phase 0 — Governance

- [x] Define hybrid editorial brand direction.
- [x] Document tokens, hierarchy, interaction, accessibility, and invariants.
- [ ] Update `AGENTS.md` and `PRD.md` with the finalized UI architecture.
- [ ] Verify required global skills; do not restore unrelated deleted `.agents` files.

## Phase 1 — Foundation

- [x] Add canonical semantic tokens and interaction rules to `app/globals.css`.
- [x] Normalize font fallback in `app/layout.tsx`.
- [x] Normalize button and card primitives.
- [x] Add focus, reduced motion, dark mode, and touch-target rules.

## Phase 2 — Shells

- [x] Update public navigation/footer treatment.
- [x] Fix auth shell to render one responsive form and expose semantic field names.
- [x] Update student/admin portal navigation treatments and mobile active states.
- [x] Normalize key portal control sizing and focus behavior.

## Phase 3–6 — Screens

- [ ] Redesign public catalog, detail, and question-paper screens.
- [x] Refresh the public leaderboard hierarchy and align navbar/footer destinations.
- [ ] Redesign authentication and recovery states.
- [ ] Redesign student dashboard, workspace, purchases, and profile.
- [ ] Redesign admin overview, submissions, test-series, students, payments, and profile.

## Phase 7–8 — Quality

- [ ] Align all route-specific loading, empty, error, and filtered-empty states.
- [x] Run typecheck, unit tests, build, and targeted responsive E2E tests.
- [x] Record evidence in `docs/qa/verityra-ui-redesign-verification.md`.
- [x] Record handoff status in `docs/handoffs/2026-11-07-verityra-ui-redesign.md`.

## Rollback criteria

Stop and revert only the redesign changes if domain tests, authorization tests, private-instruction isolation, payment invariants, or three-attempt tests regress. Existing unrelated `.agents` deletions are outside this change.
