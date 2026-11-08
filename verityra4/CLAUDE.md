# Claude Code Project Guidelines — Verityra

## Core Rules & Skill Integration
This project operates under the **Verityra Autonomous Agent Instruction & Skill Orchestration Matrix**. For all user interactions, adhere strictly to the protocols defined in [AGENTS.md](./AGENTS.md).

Start with [docs/ai/README.md](./docs/ai/README.md). `AGENTS.md` is the canonical cross-agent contract; this file is only the Claude Code entry point.

## Available Agent Skills
- **Local Workspace Skills (`.agents/skills/`)**:
  - `brand`: Tone of voice, visual identity standards, asset validation.
  - `design-system`: Token architecture (primitive → semantic → component), spacing, typography.
  - `ui-ux-pro-max`: Premium UI components, responsive layout patterns, micro-interactions.
  - `slides`: Presentation slides and documentation graphics.
  - `ui-styling` & `design`: Component styling guidelines and layout ergonomics.
- **Global Tooling Suites (`~/.agents/skills/` & `~/.claude/skills/`)**:
  - **Matt Pocock Skills**: `tdd`, `to-spec`, `to-tickets`, `grill-me`, `codebase-design`, `diagnosing-bugs`, `wayfinder`.
  - **Superpowers**: `using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`.
  - **GStack**: `office-hours`, `plan-ceo-review`, `plan-eng-review`, `plan-design-review`, `qa`, `ship`, `review`, `browse`.

## Standard Commands
All commands should be executed in the `verityra4` workspace directory:
- **Run Unit Tests**: `cd verityra4; pnpm test`
- **TypeScript Typecheck**: `cd verityra4; pnpm run typecheck`
- **Production Build**: `cd verityra4; pnpm run build`
- **Development Server**: `cd verityra4; pnpm dev`

## Mandatory Documentation Standards
Whenever implementing features, fixing bugs, or planning architecture, always provide corresponding `.md` documentation files:
- Specifications: `docs/specs/*.md`
- Implementation Plans: `docs/plans/*.md`
- Architecture Decisions: `docs/adr/*.md`
- Verification Summaries: `docs/qa/*.md`
- Session Handoffs: `docs/handoffs/*.md`

Never assert that work is done without running automated tests and including verified terminal output.
