# Verityra agent handbook

## Start here

1. Read root `AGENTS.md` for mandatory rules and domain invariants.
2. Read `repository-map.md` for ownership and import locations.
3. Use `skill-routing.md` to select only the skills relevant to the task.
4. Follow `quality-gates.md` before reporting completion.

## Common commands

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm exec eslint <changed-files>
git diff --check
```

## Reference index

- `../company/izone-company-profile.md`: I Zone Coaching Classes profile, location, timings, courses, and exclusions.
- `../company/platform-overview.md`: Izone online test series & question paper platform scope and architecture.
- `feature-boundaries.md`: authorization and business invariants.
- `debugging-runbook.md`: reproduce, diagnose, repair, and verify.
- `ui-ux-playbook.md`: visual and accessibility requirements.
- `skill-routing.md`: required process and specialist skills by task.
- `quality-gates.md`: evidence required for each task class.
