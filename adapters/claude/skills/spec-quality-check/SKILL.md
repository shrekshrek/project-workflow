---
name: spec-quality-check
description: Run the canonical pre-implementation requirements-reconciliation and quality gate for synchronized full-lane feature artifacts. Do not use for a material correction to an accepted contract; use spec-revise first.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. The fresh reviewer reads its canonical spec; read that spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. A missing `spec.md` is light-lane N/A, not a failed full-lane gate.
- Before mechanical checks, reject a pending material correction to an accepted or delivered-but-unarchived
  contract as `N/A(route: spec-revise)`. Do not dispatch review or validate the stale artifact. Draft
  pre-implementation corrections are edited normally before this gate.
- Run the canonical mechanical table directly. A failed prerequisite is `BLOCKED` and suppresses subjective
  review.
- Otherwise assemble the canonical Requirements Source Map, including exact correction/supersede evidence and
  any supplied decision-closure result, then dispatch one fresh `spec-quality-reviewer` with that map and the
  artifact population under the canonical execution contract. The same invocation owns reconciliation and
  Q3-Q7, including applicable Q6 Guidance Placement and bounded architecture adequacy; never add a
  reconciliation or architecture reviewer. `MISMATCH` or `SOURCE GAP` is `BLOCKED`.
- On `READY`, consume an explicit current-request "if this passes, continue implementation" authorization by changing only the top status marker from draft to confirmed, then continue the requested implementation. Pure checks remain read-only; `BORDERLINE` requires explicit acceptance of its concrete risk and follow-up. Never use this authorization to repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
