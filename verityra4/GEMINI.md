# Antigravity (AGY) Project Directives — Verityra

## Autonomous Skill Activation Directive
When receiving any user prompt:
1. **Always activate relevant skills** from both the local `.agents/skills/` directory (`brand`, `design-system`, `ui-ux-pro-max`, `ui-styling`) and the globally installed suites (`mattpocock/skills`, `obra/superpowers`, `garrytan/gstack`).
2. **Follow the structured workflow pipeline**:
   - Brainstorm & Spec -> Plan & Review -> TDD Implementation -> Verification & QA.
3. **Generate all required `.md` files**:
   - Provide structured markdown files in `docs/specs/`, `docs/plans/`, `docs/adr/`, `docs/qa/`, and `docs/handoffs/`.
4. **Enforce Brand Identity & Invariants**:
   - Primary color: `#2A6AED`.
   - 60-30-10 color balance.
   - Strict attempt ceiling & rubric isolation.
   - Verification evidence required for all claims.

Refer to [AGENTS.md](./AGENTS.md) for the complete orchestration matrix.
