---
name: feature-init
description: "Preview or apply feature routing when the user explicitly asks whether work needs a project-workflow feature, or when proposed implementation may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; classify completed decisions as DIRECT, LIGHT tasks-only, or FULL spec/plan/tasks. Route-preview requests are read-only. Do not invoke for general discussion, reasonableness assessment, diagnosis, implementation-status review, or local reversible work unless the user explicitly requests feature routing."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Apply the canonical impact, necessity, scope-viability, progressive-read, fill, and evidence rules. Never
  invent values; pause on material unknowns and keep ordinary single-outcome paths silent. `PREVIEW` is
  read-only, and a compatible active feature is reused instead of duplicated.
- When the selected change establishes or materially changes project-wide application architecture, read [`../../../../docs/architecture-design.md`](../../../../docs/architecture-design.md) completely and use only its applicable conversational-fill topics; ordinary features skip it.
- Resolve applicable Guidance Placement in existing plan/tasks; ordinary modules receive no generated
  guidance. Under the shared execution contract, dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) only at the
  canonical high-impact/weak-evidence boundary. Record an allowed fallback reason and canonical Reviewer execution evidence.
- Create no implementation code and never commit. Return control to an enclosing implementation request after
  routing/materialization. A reused accepted FULL artifact first passes the canonical current mechanical-shape recheck;
  a new/draft FULL proceeds through `spec-quality-check`.
- Carry Scope Stop and the Continuation Check into implementation: current contract-bearing slice → focused L1
  → task/progress update → boundary recheck. Do not add artificial slices or run L2/L3/write a Proof Bundle
  inside them; stop material mismatches before dependent work.

Report the canonical compact route result and only its conditionally applicable Impact, scope-viability, placeholder,
and audit fields. Preserve the action's DIRECT/LIGHT/FULL gate sequence.
