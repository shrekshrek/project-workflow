---
name: feature-init
description: Understand a proposed change, resolve consequential unknowns, and create or reuse only the feature record needed for acceptance or handoff. Keep ordinary questions and diagnosis in conversation; tiny local fixes need no record.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns discovery, records, authorization, and safety rules.

Claude execution details:

- Interpret `$ARGUMENTS` in the ongoing conversation. Resolve the target root explicitly; all writes stay below it. Choose a kebab-case slug only when an authorized new record is needed.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- Under the shared execution contract, dispatch a fresh `decision-completeness-auditor` only at the
  canonical material-choice/conflicting-or-weak-evidence boundary; ordinary work with directly
  traceable values is `N/A`. Use
  main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
  Report canonical Reviewer execution evidence whenever this audit boundary applies.
- Create no production implementation code and never commit. A separately authorized bounded trial follows the canonical discovery rules. Return control to the enclosing request as directed by the
  canonical action.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report the useful conclusion, record disposition, evidence, and next action without adding an adapter-specific schema.
