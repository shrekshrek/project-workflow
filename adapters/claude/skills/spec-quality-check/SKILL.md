---
name: spec-quality-check
description: Run the canonical pre-implementation quality gate for a full-lane feature spec, plan, and tasks.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` and `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/spec-quality-reviewer.md` completely before reviewing.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. A missing `spec.md` is light-lane N/A, not a failed full-lane gate.
- Run the canonical mechanical table directly; do not reproduce or modify it here.
- At the applicable reviewer boundary, when named-agent dispatch is available and the host has not reported exhausted capacity, you MUST dispatch `spec-quality-reviewer` with the exact spec/plan/tasks paths and detected shape. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Deduplicate findings by root cause and cite exact evidence.
- Keep the gate read-only unless the user separately asks to fix the artifacts. Do not mark the spec confirmed automatically or commit.

Report `Reviewer execution` (reviewer, mode, completion status, fallback reason or `none`), the canonical verdict, failed/unresolved checks, accepted-risk requirements, and next action. Missing required execution evidence makes the gate `BLOCKED`.
