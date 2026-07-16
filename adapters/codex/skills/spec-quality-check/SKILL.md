---
name: spec-quality-check
description: "Run the Codex-native pre-implementation quality gate for a full-lane feature artifact."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) and [`../../../../docs/reviewers/spec-quality-reviewer.md`](../../../../docs/reviewers/spec-quality-reviewer.md) completely before reviewing.

- Resolve an active feature through shared runtime rules; light lane is N/A.
- Run the canonical mechanical table directly; do not reproduce or alter it here.
- At the applicable reviewer boundary, when Codex dispatch is available and capacity is not reported exhausted, you MUST spawn a fresh general subagent with exact paths and detected shape; never retask an existing subagent instance. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Deduplicate findings by root cause and cite exact evidence.
- Keep the gate read-only unless the user separately requests fixes. Do not mark the spec confirmed automatically or commit.

Report `Reviewer execution` (reviewer, mode, completion status, fallback reason or `none`), the canonical verdict, failed/unresolved checks, accepted-risk requirements, and next action. Missing required execution evidence makes the gate `BLOCKED`.
