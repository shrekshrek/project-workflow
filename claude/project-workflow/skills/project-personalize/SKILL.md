---
name: project-personalize
description: Adapt a target whose project evidence or partial/custom baseline must shape the working agreement, using repository evidence and explicit user decisions.
---

# Project Personalize

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional target, include dotfiles in inspection, exclude version-control metadata
  from content classification, and apply the canonical target classification and route.
- Inspect with Read/Grep/Glob/Bash. Use `codebase-explorer`, `tech-researcher`, and
  `decision-completeness-auditor` only at their canonical boundaries.
- For a partial/missing baseline, use `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs --stage` in a disposable directory.
- Include `.claude/rules/` only within the selected convention scope; preserve unrelated project configuration.
- Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize-reference.md` only when repository evidence or a user decision makes a specific section relevant; it supplies examples, never defaults.
- Use inline trace or fresh named agents at those canonical boundaries; fallback follows the shared execution contract.
- Preflight and apply staged changes under the current request's authorization. An unsafe destination
  symlink/conflict or blocking audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report the canonical compact result and applicable `Reviewer execution` without adding an adapter-specific schema.
