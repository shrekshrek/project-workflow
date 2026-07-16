---
name: project-personalize
description: "Adapt a copied scaffold or retrofit a non-empty codebase to project-workflow in Codex from repository evidence and user decisions."
---

# Project Personalize (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/project-personalize.md`](../../../../docs/actions/project-personalize.md) completely before acting; it owns the portable workflow and contract.

- Empty targets redirect to `$project-init`; every non-empty complete/partial/custom/missing baseline stays here.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`. Stage missing baseline files with its `scripts/materialize-project-baseline.cjs`.
- For a nontrivial structure survey, read [`codebase-explorer`](../../../../docs/reviewers/codebase-explorer.md) completely. When a material stack, library, or tool choice remains unresolved and needs current external evidence, read [`tech-researcher`](../../../../docs/reviewers/tech-researcher.md); the user makes the final choice. At the audit boundary, read [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md).
- At each applicable boundary above, when Codex dispatch is available and capacity is not reported exhausted, you MUST spawn a general subagent to run that canonical contract. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; record the execution mode and observed reason.
- Read [`../../../../docs/actions/project-personalize-reference.md`](../../../../docs/actions/project-personalize-reference.md) only when repository evidence or a user decision makes one section relevant. It supplies examples, never defaults.
- Preserve host-private rules/hooks unless explicitly selected. Do not copy host-private rules/hooks/tier examples by default.
- Show one consolidated diff/new-file list and use Codex-native approval before the single preflighted apply. Conflict, symlink, rejection, or blocking audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report the evidence-backed commands, source/test paths, project-specific rules/boundaries, real tier ownership, changed files, hook status, `Reviewer execution` for every applicable role, audit result, unresolved decisions, and next action.
