---
name: project-personalize
description: "Adapt a target whose project evidence or partial/custom baseline must shape the working agreement, using repository evidence and user decisions."
---

# Project Personalize (Codex)

Match the user's language and preserve file language. Read [`../../docs/actions/project-personalize.md`](../../docs/actions/project-personalize.md) completely before acting; it owns the portable workflow and contract.

- Include dotfiles in target inspection, exclude version-control metadata from content classification, and apply
  the canonical target classification and route.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`. Stage missing baseline files with its `scripts/materialize-project-baseline.cjs`.
- Under the shared execution contract, dispatch fresh general subagents only at the canonical
  [`codebase-explorer`](../../docs/reviewers/codebase-explorer.md),
  [`tech-researcher`](../../docs/reviewers/tech-researcher.md), or
  [`decision-completeness-auditor`](../../docs/reviewers/decision-completeness-auditor.md) boundaries.
  Each subagent reads its canonical spec; the main session reads it only for fallback.
- Read [`../../docs/actions/project-personalize-reference.md`](../../docs/actions/project-personalize-reference.md) only when repository evidence or a user decision makes one section relevant. It supplies examples, never defaults.
- Include host-private conventions only when selected; preserve unrelated project configuration.
- Preflight and apply staged changes under the current request's authorization. Conflict, symlink, or blocking
  audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report the canonical compact result and applicable `Reviewer execution` without adding an adapter-specific schema.
