---
name: spec-quality-check
description: Run the canonical pre-implementation quality gate for a full-lane feature spec, plan, and tasks.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. The fresh reviewer reads its canonical spec; read that spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. A missing `spec.md` is light-lane N/A, not a failed full-lane gate.
- Run the canonical mechanical table directly; do not reproduce or modify it here.
- Dispatch a fresh `spec-quality-reviewer` with the exact artifact paths and shape under the canonical execution contract.
- Deduplicate findings by root cause and cite exact evidence.
- Keep the gate read-only unless the user separately asks to fix the artifacts. Do not mark the spec confirmed automatically or commit.

Report `Reviewer execution` (reviewer, mode, completion status, fallback reason or `none`), the canonical verdict, failed/unresolved checks, accepted-risk requirements, and next action. Missing required execution evidence makes the gate `BLOCKED`.
