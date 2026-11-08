# Role-based component architecture specification

## Summary

Move flat administrator and student feature clients into domain-first folders while preserving exports, behavior, server actions, and authorization. Provide a single cross-agent handbook that makes the codebase navigable for Codex, Claude Code, and Antigravity.

## Architecture

- `components/admin/<feature>` owns administrator-only UI.
- `components/student/<feature>` owns candidate-only UI.
- `components/portal` owns shared authenticated navigation and intentionally separate desktop/mobile layouts.
- `components/ui`, `common`, `auth`, `landing`, and `shared` remain cross-surface ownership areas.

## Contracts and invariants

- Component export names remain unchanged; only internal import paths move.
- No database, API, server-action, validation, authorization, payment, evaluation, or route contract changes.
- Student code cannot import administrator modules or evaluator-only data.
- The three-attempt limit, refund policy, immutable audit records, and upload safety remain unchanged.
