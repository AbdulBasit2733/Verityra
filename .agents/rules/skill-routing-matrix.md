# Skill Routing Matrix & Workflow Rules

## Activation Protocol
Whenever a user prompt is processed, the agent must evaluate the prompt against this routing table and invoke the appropriate skills before modifying any code.

### 1. Requirements & Scoping Phase
- If the user proposes a new feature, idea, or concept:
  - Invoke `brainstorming` (superpowers) and `office-hours` (gstack).
  - Invoke `grill-me` (mattpocock) to eliminate design ambiguity through targeted Socratic questioning.
  - Output: `docs/specs/[feature-name]-spec.md`.

### 2. Planning & Architecture Phase
- Before writing multi-file changes or executing complex logic:
  - Invoke `writing-plans` (superpowers), `to-tickets` (mattpocock), or `plan-eng-review` (gstack).
  - Structure tasks into granular, verifiable steps.
  - Output: `docs/plans/[task-name]-plan.md` or implementation plan artifact.

### 3. Visual & UI Design Phase
- For any frontend, UI component, dashboard, or layout work:
  - Invoke `.agents/skills/brand` and `.agents/skills/design-system`.
  - Consult `.agents/skills/ui-ux-pro-max` for spacing, typography scale, and responsive patterns.
  - Use `design-review` (gstack) to audit for visual balance and accessibility.
  - Ensure `#2A6AED` is used as the primary action accent.

### 4. Implementation Phase
- For feature implementation or bug fixes:
  - Follow `test-driven-development` (`tdd`) loops: write failing assertion first, implement the minimum code to pass, and refactor cleanly.
  - Reference `codebase-design` (mattpocock) to build deep modules with minimal surface area.

### 5. Verification & Review Phase
- Before presenting the solution or claiming completion:
  - Invoke `verification-before-completion` (superpowers) and `review` (gstack).
  - Run `pnpm test`, `pnpm run typecheck`, and `pnpm run build`.
  - Output: `docs/qa/[feature]-verification.md` or walkthrough report.
