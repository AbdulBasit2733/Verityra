# Verityra Autonomous Agent Instruction & Skill Orchestration Matrix
<!-- Applicable across Antigravity, Claude Code, OpenAI Codex, and Cursor -->

## 1. Prime Directive: Mandatory Skill Routing
For **EVERY** user prompt, you MUST NOT jump directly into writing ad-hoc, unverified code. You MUST analyze the prompt's intent, activate the corresponding specialized skills installed in the workspace and global `.agents/` environment, and produce all required documentation (`.md`) artifacts.

---

## 2. Intent-to-Skill Routing Matrix

| Prompt Category | Trigger Signals | Primary Mandatory Skills | Supporting Skills | Required Output Artifacts (`.md`) |
| :--- | :--- | :--- | :--- | :--- |
| **New Features & Strategy** | "build", "create", "feature", "idea", "add functionality" | `using-superpowers`<br>`brainstorming`<br>`office-hours` (gstack) | `spec` (gstack)<br>`to-spec` (mattpocock) | `docs/specs/[feature]-spec.md`<br>`PRD.md` update |
| **Scoping & Stress-Testing** | "scope", "challenge", "grill", "critique", "review idea" | `grill-me` (mattpocock)<br>`grilling`<br>`plan-ceo-review` (gstack) | `grill-with-docs`<br>`loop-me` | `docs/adr/[decision].md`<br>Questionnaire / Risk Log |
| **Planning & Task Breakdown** | "plan", "how should we", "breakdown", "roadmap", "architecture" | `writing-plans` (superpowers)<br>`to-tickets` (mattpocock)<br>`plan-eng-review` (gstack) | `wayfinder` (mattpocock)<br>`executing-plans` | `docs/plans/[task]-plan.md`<br>Implementation Checklist |
| **UI, Styling & Design System** | "UI", "design", "css", "styling", "component", "brand", "banner" | `.agents/skills/brand`<br>`.agents/skills/design-system`<br>`.agents/skills/ui-ux-pro-max` | `design-consultation` (gstack)<br>`design-review` (gstack)<br>`.agents/skills/ui-styling` | `docs/specs/[component]-design.md`<br>Token Diffs |
| **Bug Fixing & Diagnostics** | "bug", "broken", "error", "fix", "failing", "why is this slow" | `systematic-debugging` (superpowers)<br>`diagnosing-bugs` (mattpocock)<br>`investigate` (gstack) | `diagnosing-superpowers`<br>`careful` | Reproduction Test (`tests/*.test.ts`)<br>Root Cause Analysis |
| **Implementation & TDD** | "code", "implement", "write test", "refactor" | `test-driven-development` (superpowers)<br>`tdd` (mattpocock)<br>`implement` | `codebase-design`<br>`deslop-shared-libs` | Unit tests first (`tests/*.test.ts`)<br>Implementation diffs |
| **Verification & Quality Assurance** | "verify", "test", "ready to ship", "done", "check" | `verification-before-completion`<br>`qa` (gstack)<br>`review` (gstack) | `test-audit` (gstack)<br>`cso` (security audit) | `docs/qa/[feature]-verification.md`<br>Execution evidence logs |
| **Session Handoff & Retrospective** | "handoff", "summary", "retro", "wrap up", "next steps" | `handoff` (mattpocock)<br>`retro` (gstack)<br>`writing-for-agents` | `chief-of-staff`<br>`claude-handoff` | `docs/handoffs/[date]-session.md`<br>`walkthrough.md` |

---

## 3. Mandatory Documentation Artifacts (`.md` Files)

Whenever completing non-trivial tasks, the agent MUST generate or update the following standardized Markdown documentation:

1. **Specification (`docs/specs/[feature-name].md`)**:
   - Executive summary and user user stories.
   - API contract definitions and Zod validation schemas.
   - Edge cases, error handling, and authorization rules.
2. **Implementation Plan (`docs/plans/[task-name].md`)**:
   - Sequential, phased implementation tasks with checkboxes `[ ]`.
   - Explicit file changes (`[MODIFY]`, `[NEW]`, `[DELETE]`).
   - Automated verification commands and rollback criteria.
3. **Architecture Decision Records (`docs/adr/[YYYY-MM-DD]-[decision-title].md`)**:
   - Status: Accepted / Rejected / Superseded.
   - Context, alternatives considered, decision outcome, and consequences.
4. **Verification & Quality Report (`docs/qa/[feature-name]-verification.md`)**:
   - Automated test outputs (`pnpm test`).
   - TypeScript compilation status (`pnpm run typecheck`).
   - Production build logs (`pnpm run build`).
5. **Session Handoff (`docs/handoffs/[YYYY-MM-DD]-[topic].md`)**:
   - Current task status, completed changes, blocking items, and next steps for subsequent sessions.

---

## 4. Domain Invariants & Design System Guidelines

- **Primary Brand Accent**: `#2A6AED` (Electric Sapphire / Royal Indigo). Never substitute with unapproved purples or generic blues.
- **Color Harmony (60-30-10 Rule)**:
  - **60%**: Neutral backgrounds (`#F8FAFC` slate-50 canvas, `#FFFFFF` cards, dark mode equivalents).
  - **30%**: Structural layout, borders (`#E2E8F0` / `#CBD5E1`), text (`#0F172A` / `#334155`), and subtle accents.
  - **10%**: High-contrast `#2A6AED` focal points (primary CTA buttons, active tabs, key metric highlights).
- **Candidate Isolation**: Evaluation rubrics, model prompts, and internal moderator notes are strictly isolated from candidate-facing queries and endpoints.
- **Attempt Ceiling**: The 3-attempt ceiling per test registration is strictly enforced and compensated only on terminal system failures.
- **Evidence Before Assertion**: Never state that code is working or verified without executing the actual test/build command and providing real command output.

---

## 5. Subagent & Teamwork Coordination
When working on complex multi-faceted tasks, divide work among specialized subagent roles:
- **`planner`**: Evaluates requirements, interviews ambiguities (`grill-me`), and drafts `PRD.md` & `docs/plans/*.md`.
- **`ui-designer`**: Enforces `.agents/skills/design-system` and produces pixel-perfect, accessible components.
- **`qa-engineer`**: Writes tests upfront following `test-driven-development`, validates edge cases, and executes CI runs.
- **`reviewer`**: Audits changes for memory leaks, socket leaks, security vulnerabilities, and adherence to `AGENTS.md`.

## 6. Canonical Codebase Map and Agent Workflow

This file is the canonical instruction contract for Codex, Claude Code, Antigravity, and other coding agents. Read `docs/ai/README.md` before a non-trivial task; tool-specific root files only point back here.

### Component ownership

- `components/admin/<feature>/`: administrator-only feature modules. Keep payments, submissions, students, and test-series implementations isolated here.
- `components/student/<feature>/`: candidate-only feature modules. Never import administrator-only UI or confidential evaluator data into this tree.
- `components/portal/`: role-neutral portal shell, desktop/mobile layouts, and command palette.
- `components/ui/`: primitives only. `components/common/`, `components/auth/`, `components/landing/`, and `components/shared/` remain cross-surface modules.
- Create `desktop/` or `mobile/` folders only when markup or interaction differs materially. Keep ordinary responsive CSS colocated with the feature module.

### Required task workflow

1. Read the relevant files in `docs/ai/` and inspect the current implementation before changing it.
2. Route skills by task: use Superpowers process skills for planning, debugging, TDD, and verification; GStack for reviews/QA; Ponytail only for intentionally minimal changes; workspace design skills for UI work.
3. Preserve business invariants and public interfaces unless the user explicitly authorizes a contract change.
4. Run the required quality gates from `docs/ai/quality-gates.md` and record factual results in `docs/qa/` before claiming completion.
5. For non-trivial work, update the spec, plan, ADR, QA report, and handoff artifacts required by this file.

## Verityra UI Architecture Rules

- Use the hybrid editorial brand system: Electric Sapphire `#2A6AED` is the primary accent; deep ink/slate surfaces and paper-white reading surfaces provide structure; crimson is reserved for destructive, error, and exam-warning semantics.
- Use semantic CSS tokens from `app/globals.css`. Do not add per-screen hardcoded colors, arbitrary radii, or one-off shadows when a token or primitive exists.
- Use Plus Jakarta Sans for headings and UI text and JetBrains Mono for technical identifiers, audit metadata, and payment references.
- Keep the 4/8px spacing rhythm. Standard controls are 36px compact, 44px default, and 48–52px large; icon controls retain a 44px hit area.
- Every interactive control needs hover, pressed, disabled, and visible keyboard-focus states. Icon-only controls require accessible names.
- Every route must account for loading, empty, error, filtered-empty, and permission states. Responsive behavior is verified at 375px, 768px, 1024px, and 1440px.
- Respect reduced motion, readable contrast, semantic HTML, screen-reader labels, and non-color status cues.
- UI redesigns must preserve candidate/admin isolation, private evaluator instruction confidentiality, the three-attempt ceiling, payment/refund invariants, upload safety, and immutable audit behavior.
- Do not restore unrelated pre-existing deleted `.agents` files as part of UI work.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
