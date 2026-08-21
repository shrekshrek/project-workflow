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
- Run the canonical mechanical table directly; do not reproduce or alter it here.
- If any required mechanical prerequisite fails, return `BLOCKED` and do not dispatch subjective review.
- Otherwise assemble the canonical transient Requirements Source Map. A current-conversation correction or
  supersede entry includes the exact user statement, normalized replacement, and older rule; a caller-authored
  "user confirmed" paraphrase alone is not authority. Then dispatch one fresh general
  subagent to run [`spec-quality-reviewer`](../../../../docs/reviewers/spec-quality-reviewer.md) with that
  exact map, artifact paths, and shape under the canonical execution contract. The same reviewer performs
  Requirements Reconciliation first and Q3-Q7 second; never dispatch a separate reconciliation reviewer.
  `MISMATCH` or `SOURCE GAP` is `BLOCKED`.
- Reference user-supplied/confirmed spec sections directly and never require ordinary spec content to be
  copied into plan Prior decisions. Ordinary work uses Scope, Constraints, Module Impact, and Verification;
  multi-boundary or materially high-risk work also records its relevant coupling and rollback boundary.
- Include Q6 Guidance Placement in that same review: a selected `Codify` must name the durable difference,
  source, narrowest root/tier/module/mechanical owner, and any difference-only nested guidance/one-line alias
  task. Do not require nested files for ordinary modules.
- If the accepted boundary contains an architecture-shaped signal, pass that signal
  and its applicable recorded decisions to this same subagent for the canonical Q5/Q7c/Q7d adequacy check.
  Never add a second subagent, schema/receipt field, or whole-repository review; same-boundary permissions and
  internal refactors are not applicable.
- Deduplicate findings by root cause and cite exact evidence.
- On `READY`, consume an explicit current-request "if this passes, continue implementation" authorization by changing only the top status marker from draft to confirmed, then continue the requested implementation. Pure checks remain read-only; `BORDERLINE` requires explicit acceptance of its concrete risk and follow-up. Never use this authorization to repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
