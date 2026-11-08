# Debugging runbook

1. Reproduce the issue and identify the owning route, role feature, action, and UI primitive.
2. Read the relevant feature boundary before inspecting server actions or data access.
3. Use `systematic-debugging`, `diagnosing-bugs`, or GStack `investigate` for a root-cause loop; do not patch symptoms first.
4. Add or update a focused regression test when behavior can be exercised deterministically.
5. Make the smallest safe repair, then run the affected test plus typecheck, focused lint, and the applicable quality gate.
6. Record cause, repair, verification output, and remaining risk in the matching QA or handoff document.
