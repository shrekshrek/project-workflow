---
name: feature-init
description: Create no artifact, a light tasks artifact, or a full spec/plan/tasks artifact according to the canonical tracking boundary.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns classification, workflow, outputs, and safety rules.

Claude execution details:

- Parse `$ARGUMENTS` as a kebab-case slug plus optional description. Resolve the target root explicitly; all writes stay below it.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- Use an inline value-to-source trace for simple prefill. When the canonical boundary is met, dispatch `decision-completeness-auditor`; main-session fallback follows the same contract.
- Preserve unresolved TODOs, create no implementation code, and never commit.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report the canonical no-artifact / light-lane / full-lane decision, shape, created files, ownership, unresolved placeholders, trace/audit result, and next action.
