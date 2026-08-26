---
name: feature-init
description: Preview or apply DIRECT/LIGHT/FULL routing for implementation that may need durable tracking or contract/risk protection, and for explicit feature-routing questions. Do not invoke for ordinary discussion, diagnosis, or clear local reversible work unless routing is requested.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns classification, workflow, outputs, and safety rules.

Claude execution details:

- Parse `$ARGUMENTS` as a kebab-case slug plus optional description. Resolve the target root explicitly; all writes stay below it.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- Under the shared execution contract, dispatch a fresh `decision-completeness-auditor` only at the
  canonical material-choice/conflicting-or-weak-evidence boundary; ordinary full-lane work with directly
  traceable values is `N/A`. Use
  main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
  Report canonical Reviewer execution evidence whenever this audit boundary applies.
- Create no implementation code and never commit. Return control to the enclosing request as directed by the
  canonical action.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report the canonical compact route result without adding an adapter-specific schema.
