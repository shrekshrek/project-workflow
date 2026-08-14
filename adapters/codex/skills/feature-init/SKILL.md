---
name: feature-init
description: "Preview or apply feature routing when the user explicitly asks whether work needs a project-workflow feature, or when proposed implementation may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; classify completed decisions as DIRECT, LIGHT tasks-only, or FULL spec/plan/tasks. Route-preview requests are read-only. Do not invoke for general discussion, reasonableness assessment, diagnosis, implementation-status review, or local reversible work unless the user explicitly requests feature routing."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Apply the action's impact/necessity preflight, scope-viability, deferred-outcome, and progressive-read
  boundaries exactly. Resolve high-impact business, ownership, authorization, data-disposition, and
  release-coupling questions before materialization; normal small/medium single-outcome and no-artifact
  paths need no extra gate narration.
- Classify `PREVIEW` versus `APPLY` from the user's requested operation. `PREVIEW` never invokes the materializer, dispatches the auditor, or writes files; invocation alone is not write authorization. Reuse a compatible active feature instead of allocating a duplicate number.
- When the selected change establishes or materially changes project-wide application architecture, read [`../../../../docs/architecture-design.md`](../../../../docs/architecture-design.md) completely and use only its applicable conversational-fill topics; ordinary features skip it.
- When a tier/module boundary changes, a durable local exception appears, or Sibling Alignment selects
  `Codify`, resolve canonical Guidance Placement in the existing plan/tasks: exact root/tier/module/mechanical
  owner, durable difference, source, difference-only content, and any adopted one-line alias. Ordinary modules
  stay silent and receive no generated guidance.
- Use inline trace for sourced prefill. Keep ordinary outcomes/scope/constraints/exclusions in `spec.md`; put
  only non-obvious choices, external interpretations, conflict/bundled-risk resolutions, and supersede
  decisions with why/source in plan Prior decisions before `spec-quality-check`. Do not preserve a raw transcript. Under the
  shared execution contract, dispatch a fresh subagent for [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) only for newly generated unconfirmed high-impact architecture, ownership, infrastructure, port, package/API, or ADR choices, or conflicting/weak evidence; ordinary full-lane work with directly traceable values is `N/A`. Use main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
- Preserve unresolved TODOs; do not replace an unknown implementation detail with discovery-task prose merely to remove its marker, and do not turn unspecified or out-of-scope inputs into verification obligations, artifact decisions, or reported placeholders unless they block implementation. Create no implementation code and never commit.
- Carry the canonical Implementation Scope Stop into the enclosing implementation for every route. Before
  extending an undeclared outcome/high-impact surface or capability without a current consumer, stop, report
  the delta/necessity/recommended remove-narrow-child-revise direction, and ask at most one material question
  only when direction requires the user. Already-written code and tests never authorize absorption. Apply the
  action's smallest-sufficient-evidence rule; do not add test layers or matrices without distinct risk coverage.
- Do not terminate an enclosing implementation/change request at this action boundary. After `DIRECT/APPLY`, return control for immediate implementation; after `LIGHT/APPLY`, return control after materialization; after `FULL/APPLY`, continue to `spec-quality-check` and then only as that gate permits. Stop after the route/artifact report when the user requested only preview or artifact initialization.

Report the canonical `Route`, `Execution`, concrete `Reason`, `Feature` (`none`, `create=<path>`, or `reuse=<path>`), and `Next gates`, plus module decision, literal unresolved template placeholders, and applicable audit execution when an artifact is created. Add `Impact` only when a material unknown, large/extra-large signal, decomposition, or bundled-risk decision affected routing. Add a scope-viability section only for `clarification-required`, `split-required`, or `bundled-risk-accepted`; on the normal path do not mention that check, its field name, or its omission. `DIRECT` creates nothing and continues an enclosing implementation request, `LIGHT` proceeds to implementation after materialization and skips `spec-quality-check`, and `FULL` runs that gate before implementation.
