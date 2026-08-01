---
name: project-personalize
description: "Adapt a target with project content beyond version-control metadata and the neutral baseline, including a generated or copied scaffold or existing codebase, to project-workflow in Codex from repository evidence and user decisions."
---

# Project Personalize (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/project-personalize.md`](../../../../docs/actions/project-personalize.md) completely before acting; it owns the portable workflow and contract.

- Include dotfiles in target inspection, excluding version-control metadata from content classification. Empty targets redirect to `$project-init`; a six-file population matching the neutral template is N/A; targets with other project content stay here with a complete, partial, custom, or missing baseline.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`. Stage missing baseline files with its `scripts/materialize-project-baseline.cjs`.
- Under the shared execution contract, dispatch fresh general subagents for applicable [`codebase-explorer`](../../../../docs/reviewers/codebase-explorer.md), [`tech-researcher`](../../../../docs/reviewers/tech-researcher.md), or [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md) boundaries. Each subagent reads its canonical spec; the main session reads it only for fallback. The user makes final technical choices.
- Read [`../../../../docs/actions/project-personalize-reference.md`](../../../../docs/actions/project-personalize-reference.md) only when repository evidence or a user decision makes one section relevant. It supplies examples, never defaults.
- Preserve host-private rules/hooks unless explicitly selected. Do not copy host-private rules/hooks/tier examples by default.
- Do not run architecture-design conversational fill here. Report relevant repository and accepted-decision evidence, and route material architecture changes to `$feature-init`.
- Show one consolidated diff/new-file list and use Codex-native approval before the single preflighted apply. Conflict, symlink, rejection, or blocking audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report the evidence-backed commands, source/test paths, project-specific rules/boundaries, real tier ownership, changed files, hook status, `Reviewer execution` for every applicable role, audit result, unresolved decisions, and that the working agreement is aligned for direct work or `$feature-init` without claiming an architecture-quality verdict.
