# Student Evaluations and Downloads

## Purpose

Provide authenticated students with a clear history of their submitted evaluations, question-level feedback, and registered test resources.

## Routes

- `/student/evaluations` — evaluation history with filtering and responsive table/cards.
- `/student/evaluations/[submissionId]` — ownership-checked scorecard and question feedback.
- `/student/downloads` — active-registration papers and answer-sheet templates.

## Security boundaries

- Every route requires `requireStudent`.
- Submission queries always constrain `userId` to the authenticated student.
- Private evaluator instructions, prompts, model metadata, admin notes, and audit fields are never projected.
- Download URLs are normalized through the authenticated private file route.

## UI contract

The pages use the existing Shadcn/Base UI primitives: cards, badges, buttons, tabs, accordion, alerts, progress, data table, skeletons, and semantic design tokens. Desktop uses dense table/group layouts; mobile uses stacked cards and accordion groups without horizontal page scrolling.

Pending and failed submissions never display a fabricated score. Empty, loading, filtered-empty, and warning states provide clear recovery or navigation actions.
