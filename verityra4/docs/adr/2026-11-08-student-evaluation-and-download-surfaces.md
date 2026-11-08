# ADR: Student Evaluation and Download Surfaces

Status: Accepted

## Context

Students had portal navigation entries for evaluations and downloads without corresponding routes. Existing test-workspace data and private file helpers already provide the required source of truth.

## Decision

Add dedicated student routes and domain-first components. Evaluations use a list plus an ownership-checked detail route. Downloads aggregate only resources from active registrations. Responsive presentation stays in shared components, using table/card and desktop/accordion mobile patterns where interaction differs.

## Consequences

- Students get a focused review workflow without changing evaluation or submission behavior.
- Secure file access remains centralized in the existing API route.
- No schema, payment, attempt, evaluation, or authorization model changes are required.
