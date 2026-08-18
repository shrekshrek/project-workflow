---
name: spec-quality-check
description: "Run the Codex-native pre-implementation requirements-reconciliation and quality gate for a full-lane feature artifact."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) completely before reviewing. The fresh subagent reads the canonical reviewer spec; read it in the main session only for an allowed fallback.

- Resolve an active feature through shared runtime rules; light lane is N/A.
- Run the canonical mechanical table directly; do not reproduce or alter it here.
- If any required mechanical prerequisite fails, return `BLOCKED`, record `Reviewer execution: N/A(mechanical prerequisites failed)`, and do not dispatch subjective review.
- Otherwise assemble the canonical transient Requirements Source Map, then dispatch one fresh general
  subagent to run [`spec-quality-reviewer`](../../../../docs/reviewers/spec-quality-reviewer.md) with that
  exact map, artifact paths, and shape under the canonical execution contract. The same reviewer performs
  Requirements Reconciliation first and Q3-Q7 second; never dispatch a separate reconciliation reviewer.
  `MISMATCH` or `SOURCE GAP` is `BLOCKED`.
- Reference user-supplied/confirmed spec sections directly and never require ordinary spec content to be
  copied into plan Prior decisions. Treat a missing or incomplete Delivery Shape Baseline as a mechanical
  failure; other artifact sections do not substitute for it.
- Include Q6 Guidance Placement in that same review: a selected `Codify` must name the durable difference,
  source, narrowest root/tier/module/mechanical owner, and any difference-only nested guidance/one-line alias
  task. Do not require nested files for ordinary modules.
- If the accepted Delivery Shape Baseline contains an architecture-shaped boundary signal, pass that signal
  and its applicable recorded decisions to this same subagent for the canonical Q5/Q7c/Q7d adequacy check.
  Never add a second subagent, schema/receipt field, or whole-repository review; same-boundary permissions and
  internal refactors are not applicable.
- Deduplicate findings by root cause and cite exact evidence.
- On `READY`, consume an explicit current-request "if this passes, continue implementation" authorization by changing only the top status marker from draft to confirmed, then continue the requested implementation. Pure checks remain read-only; `BORDERLINE` requires explicit acceptance of its concrete risk and follow-up. Never use this authorization to repair artifact content or commit.
- A pass authorizes only the accepted outcome and impact boundary. Carry `Implementation Scope Stop`, matching
  plan/tasks slices for multi-boundary full-lane work, the `Implementation Continuation Check`, and smallest-
  sufficient focused/final evidence rules into implementation.

Report one compact passing mechanical range, `Requirements Reconciliation` (`ALIGNED`, `MISMATCH`, or
`SOURCE GAP`), `Reviewer execution` (reviewer, mode, completion status, fallback reason or `none`), the
  canonical verdict, failed/unresolved checks, required Q3 consolidation findings plus optional nonblocking suggestions, accepted-risk
requirements, any status transition, and next action. Do not narrate every ordinary pass. Missing required
execution evidence makes the gate `BLOCKED`.
