---
name: feature-init
description: "Understand a proposed change, resolve consequential unknowns, and create or reuse only the feature record needed for acceptance or handoff. Keep ordinary questions and diagnosis in conversation; tiny local fixes need no record."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting. Apply [runtime conventions](../../../../docs/actions/README.md#shared-runtime-conventions).

- For architecture-shaped work read [architecture guidance](../../../../docs/architecture-design.md); for convention placement read [guidance placement](../../../../docs/actions/agents-md-revise.md#guidance-placement-contract); for old receipt preservation read [receipt history](../../../../docs/actions/feature-done.md#completion-preflight).

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Only when creating a new feature record, resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json` and invoke its `scripts/materialize-feature-artifact.cjs`, preserving the no-clobber gate. Skip materialization when reusing a record or when no record is needed.
- Under the [review execution](../../../../docs/reviewers/README.md#reviewer-execution-contract), dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md#dispatch-boundary) only at the
  canonical material-choice/conflicting-or-weak-evidence boundary. Record an allowed fallback reason and canonical Reviewer execution evidence.
- Create no production implementation code and never commit. A separately authorized bounded trial follows the canonical discovery rules. Return control to the enclosing request as directed by the
  canonical action.
