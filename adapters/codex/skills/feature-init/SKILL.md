---
name: feature-init
description: "Use when a new feature or durable behavior change may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; check whether the request is one independently deliverable outcome or needs decomposition, then classify direct/no-artifact, light tasks-only, or full spec/plan/tasks. Do not invoke for local reversible work with no durable artifact consumer."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Apply the action's scope-viability, deferred-outcome, and progressive-read boundaries exactly; normal single-outcome and no-artifact paths need no extra gate narration.
- When the selected change establishes or materially changes project-wide application architecture, read [`../../../../docs/architecture-design.md`](../../../../docs/architecture-design.md) completely and use only its applicable conversational-fill topics; ordinary features skip it.
- Use inline trace for sourced prefill. Under the shared execution contract, dispatch a fresh subagent for [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) only for newly generated unconfirmed high-impact architecture, ownership, infrastructure, port, package/API, or ADR choices, or conflicting/weak evidence; ordinary full-lane work with directly traceable values is `N/A`. Use main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
- Preserve unresolved TODOs; do not replace an unknown implementation detail with discovery-task prose merely to remove its marker. Create no implementation code and never commit.

Report the no-artifact/light/full decision and the canonical applicable outputs, including any blocking Scope Viability decision and `Reviewer execution` for an applicable audit. Never report a nonblocking Scope Viability result.
