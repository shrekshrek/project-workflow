---
name: spec-quality-check
description: "Run the Codex-native pre-implementation requirements-reconciliation and quality gate for a synchronized full-lane feature artifact. Do not use for a material correction to an accepted contract; use spec-revise first."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) completely before reviewing. The fresh subagent reads the canonical reviewer spec; read it in the main session only for an allowed fallback.

- Resolve an active feature through shared runtime rules; light lane is N/A.
- Run the canonical mechanical prerequisites directly. When they pass, assemble the action's Requirements
  Source Map and dispatch one fresh general subagent to
  run [`spec-quality-reviewer`](../../../../docs/reviewers/spec-quality-reviewer.md) with that map and the artifact
  population under the shared execution contract.
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
