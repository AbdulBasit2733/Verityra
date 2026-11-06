# Artifact & Documentation Specifications

All agents operating in this workspace must maintain and generate the following `.md` documentation files for project continuity and engineering rigor:

## 1. Specifications (`docs/specs/*.md`)
Must include:
- **Feature Overview**: Business objective and user journey.
- **Contract & Schemas**: TypeScript types, Zod schemas, database model impact.
- **Security & Authorization**: Role guards (`STUDENT` vs `ADMIN`), rate limits, data isolation.
- **Edge Cases**: Outages, token expirations, race conditions.

## 2. Implementation Plans (`docs/plans/*.md`)
Must include:
- **Phased Checklists**: Clearly demarcated phases with actionable checkboxes `[ ]`.
- **Target Files**: Explicit file basenames marked with `[MODIFY]`, `[NEW]`, or `[DELETE]`.
- **Verification Strategy**: Automated commands to run and expected outputs.

## 3. Architecture Decision Records (`docs/adr/*.md`)
Follow the standard Nygard format:
- **Title**: `[Number]-[Short-Title].md`
- **Context**: Problem statement and forces at play.
- **Decision**: Chosen solution and rationale.
- **Consequences**: Positive, neutral, and negative tradeoffs.

## 4. Verification & QA Reports (`docs/qa/*.md`)
Must include:
- **Command Runs**: Exact terminal commands executed.
- **Test Metrics**: Total passed, failed, and suite duration.
- **Build Output**: Route table, compilation status, and bundle warnings.
