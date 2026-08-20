---
name: spec-quality-check
description: Run the canonical pre-implementation requirements-reconciliation and quality gate for a full-lane feature spec, plan, and tasks.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. The fresh reviewer reads its canonical spec; read that spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. A missing `spec.md` is light-lane N/A, not a failed full-lane gate.
- Run the canonical mechanical table directly; do not reproduce or modify it here.
- If any required mechanical prerequisite fails, return `BLOCKED` and do not dispatch subjective review.
- Otherwise assemble the canonical transient Requirements Source Map, then dispatch one fresh
  `spec-quality-reviewer` with that exact map and artifact paths. Follow the canonical execution contract.
  The same reviewer performs Requirements Reconciliation first and Q3-Q7 second; never dispatch
  a separate reconciliation reviewer. `MISMATCH` or `SOURCE GAP` is `BLOCKED`.
- Reference user-supplied/confirmed spec sections directly and never require ordinary spec content to be
  copied into plan Prior decisions. Ordinary work uses Scope, Constraints, Module Impact, and Verification;
  multi-boundary or materially high-risk work also records its relevant coupling and rollback boundary.
- Include Q6 Guidance Placement in that same review: a selected `Codify` must name the durable difference,
  source, narrowest root/tier/module/mechanical owner, and any difference-only nested guidance/one-line alias
  task. Do not require nested files for ordinary modules.
- When the accepted boundary has a real architecture-shaped signal, supply that
  signal and the applicable artifact decisions to the same reviewer for the canonical Q5/Q7c/Q7d adequacy
  check. Do not dispatch another reviewer or add an artifact/receipt field; ordinary same-boundary permission
  changes and internal refactors skip this check.
- Deduplicate findings by root cause and cite exact evidence.
- On `READY`, consume an explicit current-request "if this passes, continue implementation" authorization by changing only the top status marker from draft to confirmed, then continue the requested implementation. Pure checks remain read-only; `BORDERLINE` requires explicit acceptance of its concrete risk and follow-up. Never use this authorization to repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
