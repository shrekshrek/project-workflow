---
name: feature-init
description: "Use when a new feature or durable behavior change may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; before materialization, expose whether the request is one independently deliverable outcome or needs decomposition, then classify direct/no-artifact, light tasks-only, or full spec/plan/tasks. Do not invoke for local reversible work with no durable artifact consumer."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Before materialization, emit the canonical Scope Viability result from the action spec. Infer implicit candidate outcomes, but never split by module count, task count, file count, or size alone.
- When Scope Viability is blocked, stop after its canonical result and one allowed question; do not pre-read lane-specific, materializer, architecture, or reviewer assets before an outcome is selected and the owning boundary applies.
- When the selected change establishes or materially changes project-wide application architecture, read [`../../../../docs/architecture-design.md`](../../../../docs/architecture-design.md) completely and use only its applicable conversational-fill topics; ordinary features skip it.
- For applicable architecture work, continue conversational fill across user turns as one material question → user decision → artifact update until high-impact TODOs are resolved or the user explicitly pauses or defers; a paused flow is not handoff-ready.
- Use inline trace for sourced prefill; at the narrowed canonical boundary dispatch a fresh subagent for [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md), with fallback under the shared execution contract.
- Preserve unresolved TODOs, create no implementation code, and never commit.
- Remove a template TODO only when user or repository evidence determines its value; generic best practice or implementation-stage discovery is not evidence. Otherwise retain it in the applicable section and report it.
- A named component or tier proves only its existence. Do not infer its responsibilities, ownership, call direction, sync/async relationship, or coupling; retain those decisions as TODOs without user or repository evidence.

Report Scope Viability (or N/A for no-artifact/direct work), the no-artifact/light/full decision, shape, created files, ownership, unresolved placeholders, `Reviewer execution` for every applicable audit, audit result, and next action.
