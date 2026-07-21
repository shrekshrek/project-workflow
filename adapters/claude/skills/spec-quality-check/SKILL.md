---
name: spec-quality-check
description: Run the canonical pre-implementation quality gate for a full-lane feature spec, plan, and tasks.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. The fresh reviewer reads its canonical spec; read that spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. A missing `spec.md` is light-lane N/A, not a failed full-lane gate.
- Run the canonical mechanical table directly; do not reproduce or modify it here.
- If any required mechanical prerequisite fails, return `BLOCKED`, record `Reviewer execution: N/A(mechanical prerequisites failed)`, and do not dispatch subjective review.
- Otherwise dispatch a fresh `spec-quality-reviewer` with the exact artifact paths and shape under the canonical execution contract.
- Deduplicate findings by root cause and cite exact evidence.
- On `READY`, consume an explicit current-request "if this passes, continue implementation" authorization by changing only the top status marker from draft to confirmed, then continue the requested implementation. Pure checks remain read-only; `BORDERLINE` requires explicit acceptance of its concrete risk and follow-up. Never use this authorization to repair artifact content or commit.

Report `Reviewer execution` (reviewer, mode, completion status, fallback reason or `none`), the canonical verdict, failed/unresolved checks, accepted-risk requirements, any status transition, and next action. Missing required execution evidence makes the gate `BLOCKED`.
