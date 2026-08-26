---
name: spec-quality-check
description: Run the canonical pre-implementation requirements-reconciliation and quality gate for synchronized full-lane feature artifacts. Do not use for a material correction to an accepted contract; use spec-revise first.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. The fresh reviewer reads its canonical spec; read that spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. A missing `spec.md` is light-lane N/A, not a failed full-lane gate.
- Run the canonical mechanical prerequisites directly. When they pass, assemble the action's Requirements
  Source Map and dispatch one fresh `spec-quality-reviewer` with that map and the artifact population under the
  shared execution contract.
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
