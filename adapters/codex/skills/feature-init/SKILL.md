---
name: feature-init
description: "Understand a proposed change, resolve consequential unknowns, and create or reuse only the feature record needed for acceptance or handoff. Keep ordinary questions and diagnosis in conversation; tiny local fixes need no record."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns discovery, records, authorization, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Under the shared execution contract, dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) only at the
  canonical material-choice/conflicting-or-weak-evidence boundary. Record an allowed fallback reason and canonical Reviewer execution evidence.
- Create no production implementation code and never commit. A separately authorized bounded trial follows the canonical discovery rules. Return control to the enclosing request as directed by the
  canonical action.

Report the useful conclusion, record disposition, evidence, and next action without adding an adapter-specific schema.
