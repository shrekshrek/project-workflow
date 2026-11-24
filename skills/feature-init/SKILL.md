---
name: feature-init
description: "Plan the behavior and acceptance of one feature, including changes across modules that follow established rules. If multiple features need the same undecided rule, route that decision to Blueprint plan-project. Keep ordinary questions and diagnosis in conversation. Create or reuse a record only when acceptance or handoff needs one."
metadata:
  version: "4.0.0"
---

# Feature Init

Match the user's language. Read [`resources/docs/actions/feature-init.md`](resources/docs/actions/feature-init.md) completely before acting. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

- For architecture-shaped work read [architecture guidance](resources/docs/architecture-design.md); for convention placement read [guidance placement](resources/docs/actions/agents-md-revise.md#guidance-placement-contract); for old receipt preservation read [receipt history](resources/docs/actions/feature-done.md#completion-preflight).

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Only when creating a new feature record, use the bundled `resources/` directory and invoke its `scripts/materialize-feature-artifact.cjs`, preserving the no-clobber gate. Skip materialization when reusing a record or when no record is needed.
- Under the [review execution](resources/docs/reviewers/README.md#reviewer-execution-contract), dispatch a fresh subagent for
  [`decision-completeness-auditor`](resources/docs/reviewers/decision-completeness-auditor.md#dispatch-boundary) only at the
  canonical material-choice/conflicting-or-weak-evidence boundary. Record an allowed fallback reason and canonical Reviewer execution evidence.
- Create no production implementation code and never commit. A separately authorized bounded trial follows the canonical discovery rules. Return control to the enclosing request as directed by the
  canonical action.
