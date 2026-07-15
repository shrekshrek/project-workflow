---
name: spec-quality-check
description: "Run the Codex-native pre-implementation quality gate for a full-lane feature artifact."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) and [`../../../../docs/reviewers/spec-quality-reviewer.md`](../../../../docs/reviewers/spec-quality-reviewer.md) completely before reviewing.

- Resolve an active feature through shared runtime rules; light lane is N/A.
- Run the canonical mechanical table directly; do not reproduce or alter it here.
- Run the canonical reviewer in a general subagent when available with exact paths and detected shape; main-session fallback follows the same contract.
- Deduplicate findings by root cause and cite exact evidence.
- Keep the gate read-only unless the user separately requests fixes. Do not mark the spec confirmed automatically or commit.

Report the canonical verdict, failed/unresolved checks, accepted-risk requirements, and next action.
