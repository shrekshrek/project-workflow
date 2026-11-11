---
name: feature-init
description: Understand a proposed change, resolve consequential unknowns, and create or reuse only the feature record needed for acceptance or handoff. Keep ordinary questions and diagnosis in conversation; tiny local fixes need no record.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

Claude execution details:

- For architecture-shaped work read `${CLAUDE_PLUGIN_ROOT}/docs/architecture-design.md`; for convention placement read `${CLAUDE_PLUGIN_ROOT}/docs/actions/agents-md-revise.md#guidance-placement-contract`; for old receipt preservation read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md#completion-preflight`.

- Interpret `$ARGUMENTS` in the ongoing conversation. Resolve the target root explicitly; all writes stay below it. Choose a kebab-case slug only when an authorized new record is needed.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- Only when creating a new feature record, invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs`; require `CLAUDE_PLUGIN_ROOT` and never search another runtime cache or bypass its no-clobber gate. Skip materialization when reusing a record or when no record is needed.
- Under the `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/README.md#reviewer-execution-contract`, dispatch a fresh `decision-completeness-auditor` (`${CLAUDE_PLUGIN_ROOT}/docs/reviewers/decision-completeness-auditor.md#dispatch-boundary`) only at the
  canonical material-choice/conflicting-or-weak-evidence boundary; ordinary work with directly
  traceable values is `N/A`. Use
  main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
  Report canonical Reviewer execution evidence whenever this audit boundary applies.
- Create no production implementation code and never commit. A separately authorized bounded trial follows the canonical discovery rules. Return control to the enclosing request as directed by the
  canonical action.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.
