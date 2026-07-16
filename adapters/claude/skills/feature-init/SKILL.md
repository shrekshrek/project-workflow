---
name: feature-init
description: Use before implementing a new feature or durable behavior change to classify it as direct/no-artifact, light tasks-only, or full spec/plan/tasks, and initialize artifacts only when needed.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns classification, workflow, outputs, and safety rules.

Claude execution details:

- Parse `$ARGUMENTS` as a kebab-case slug plus optional description. Resolve the target root explicitly; all writes stay below it.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- Use an inline value-to-source trace for simple prefill. At the canonical audit boundary, when named-agent dispatch is available and the host has not reported exhausted capacity, you MUST dispatch `decision-completeness-auditor`. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Preserve unresolved TODOs, create no implementation code, and never commit.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report the canonical no-artifact/light-lane/full-lane decision, shape, created files, ownership, unresolved placeholders, `Reviewer execution` for every applicable audit, trace/audit result, and next action.
