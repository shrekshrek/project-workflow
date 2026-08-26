---
name: feature-init
description: "Preview or apply DIRECT/LIGHT/FULL routing for implementation that may need durable tracking or contract/risk protection, and for explicit feature-routing questions. Do not invoke for ordinary discussion, diagnosis, or clear local reversible work unless routing is requested."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Under the shared execution contract, dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) only at the
  canonical high-impact/weak-evidence boundary. Record an allowed fallback reason and canonical Reviewer execution evidence.
- Create no implementation code and never commit. Return control to the enclosing request as directed by the
  canonical action.

Report the canonical compact route result without adding an adapter-specific schema.
