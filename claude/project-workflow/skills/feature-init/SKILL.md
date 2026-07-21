---
name: feature-init
description: Use when a new feature or durable behavior change may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; classify direct/no-artifact, light tasks-only, or full spec/plan/tasks. Do not invoke for local reversible work with no durable artifact consumer.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns classification, workflow, outputs, and safety rules.

Claude execution details:

- Parse `$ARGUMENTS` as a kebab-case slug plus optional description. Resolve the target root explicitly; all writes stay below it.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- Use inline trace for sourced prefill; dispatch a fresh `decision-completeness-auditor` only at its narrowed canonical boundary, with fallback under the shared execution contract.
- Preserve unresolved TODOs, create no implementation code, and never commit.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report the canonical no-artifact/light-lane/full-lane decision, shape, created files, ownership, unresolved placeholders, `Reviewer execution` for every applicable audit, trace/audit result, and next action.
