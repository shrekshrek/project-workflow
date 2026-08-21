---
name: feature-init
description: "Preview or apply feature routing when the user explicitly asks whether work needs a project-workflow feature, or when proposed implementation may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; classify completed decisions as DIRECT, LIGHT tasks-only, or FULL spec/plan/tasks. Route-preview requests are read-only. Do not invoke for general discussion, reasonableness assessment, diagnosis, implementation-status review, or local reversible work unless the user explicitly requests feature routing."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- When the selected change establishes or materially changes project-wide application architecture, read [`../../../../docs/architecture-design.md`](../../../../docs/architecture-design.md) completely and use only its applicable conversational-fill topics; ordinary features skip it.
- Resolve applicable Guidance Placement in existing plan/tasks; ordinary modules receive no generated
  guidance. Under the shared execution contract, dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) only at the
  canonical high-impact/weak-evidence boundary. Record an allowed fallback reason and canonical Reviewer execution evidence.
- Before full-lane drafting, close only material current-conversation decisions under the canonical rule:
  proceed without reconfirmation when they are consistent, and ask the smallest useful question only when an
  unresolved interpretation can change the contract.
- Create no implementation code and never commit. Return control to the enclosing request as directed by the
  canonical action.

Report the canonical compact route result without adding an adapter-specific schema.
