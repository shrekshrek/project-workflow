---
name: feature-init
description: "Create no artifact, a light tasks artifact, or a full spec/plan/tasks artifact through the canonical Codex workflow."
---

# Feature Init (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-init.md`](../../../../docs/actions/feature-init.md) completely before acting; it owns classification, workflow, outputs, and safety rules.

- Resolve the target root explicitly and read applicable `AGENTS.md` plus active current truth; never write under an incidental cwd.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke its `scripts/materialize-feature-artifact.cjs` and never bypass the no-clobber gate.
- Use an inline value-to-source trace for simple prefill. At the canonical audit boundary, when Codex dispatch is available and capacity is not reported exhausted, you MUST spawn a fresh general subagent to run [`../../../../docs/reviewers/decision-completeness-auditor.md`](../../../../docs/reviewers/decision-completeness-auditor.md); never retask an existing subagent instance. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Preserve unresolved TODOs, create no implementation code, and never commit.

Report the no-artifact/light/full decision, shape, created files, ownership, unresolved placeholders, `Reviewer execution` for every applicable audit, audit result, and next action.
