---
name: spec-quality-check
description: "Run the Codex-native pre-implementation requirements-reconciliation and quality gate for a synchronized full-lane feature artifact. Do not use for a material correction to an accepted contract; use spec-revise first."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) completely before reviewing. The fresh subagent reads the canonical reviewer spec; read it in the main session only for an allowed fallback.

- Resolve an active feature through shared runtime rules; light lane is N/A.
- Before mechanical checks, reject a pending material correction to an accepted or delivered-but-unarchived
  contract as `N/A(route: spec-revise)`. Do not dispatch review or validate the stale artifact. Draft
  pre-implementation corrections are edited normally before this gate.
- Run the canonical mechanical table directly. A failed prerequisite is `BLOCKED` and suppresses subjective
  review.
- Otherwise the main session assembles the canonical Requirements Source Map, including exact correction/
  supersede evidence and any supplied decision-closure result, then dispatches one fresh general subagent to
  run [`spec-quality-reviewer`](../../../../docs/reviewers/spec-quality-reviewer.md) with that map and the artifact
  population. The same invocation owns reconciliation and Q3-Q7, including applicable Q6 Guidance Placement
  and bounded architecture adequacy; never add a reconciliation or architecture reviewer. `MISMATCH` or
  `SOURCE GAP` is `BLOCKED`.
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
