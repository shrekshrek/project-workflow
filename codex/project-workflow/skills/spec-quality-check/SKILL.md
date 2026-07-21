---
name: spec-quality-check
description: "Run the Codex-native pre-implementation quality gate for a full-lane feature artifact."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../docs/actions/spec-quality-check.md`](../../docs/actions/spec-quality-check.md) completely before reviewing. The fresh subagent reads the canonical reviewer spec; read it in the main session only for an allowed fallback.

- Resolve an active feature through shared runtime rules; light lane is N/A.
- Run the canonical mechanical table directly; do not reproduce or alter it here.
- If any required mechanical prerequisite fails, return `BLOCKED`, record `Reviewer execution: N/A(mechanical prerequisites failed)`, and do not dispatch subjective review.
- Otherwise dispatch a fresh general subagent to run [`spec-quality-reviewer`](../../docs/reviewers/spec-quality-reviewer.md) with the exact artifact paths and shape under the canonical execution contract.
- Deduplicate findings by root cause and cite exact evidence.
- On `READY`, consume an explicit current-request "if this passes, continue implementation" authorization by changing only the top status marker from draft to confirmed, then continue the requested implementation. Pure checks remain read-only; `BORDERLINE` requires explicit acceptance of its concrete risk and follow-up. Never use this authorization to repair artifact content or commit.

Report `Reviewer execution` (reviewer, mode, completion status, fallback reason or `none`), the canonical verdict, failed/unresolved checks, accepted-risk requirements, any status transition, and next action. Missing required execution evidence makes the gate `BLOCKED`.
