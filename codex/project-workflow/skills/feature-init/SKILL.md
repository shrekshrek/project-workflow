---
name: feature-init
description: "Use when a new feature or durable behavior change may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; classify direct/no-artifact, light tasks-only, or full spec/plan/tasks. Do not invoke for local reversible work with no durable artifact consumer."
---

# Feature Init (Codex)

Match the user's language. Read [`../../docs/actions/feature-init.md`](../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Use inline trace for sourced prefill; at the narrowed canonical boundary dispatch a fresh subagent for [`decision-completeness-auditor`](../../docs/reviewers/decision-completeness-auditor.md), with fallback under the shared execution contract.
- Preserve unresolved TODOs, create no implementation code, and never commit.

Report the no-artifact/light/full decision, shape, created files, ownership, unresolved placeholders, `Reviewer execution` for every applicable audit, audit result, and next action.
