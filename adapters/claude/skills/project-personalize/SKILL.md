---
name: project-personalize
description: Adapt a target whose project evidence or partial/custom baseline must shape the working agreement, using repository evidence and explicit user decisions.
---

# Project Personalize

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional target and include dotfiles in inspection, excluding version-control metadata from content classification. Classify the six baseline destinations and inspect other content only far enough to identify project evidence. All destinations absent plus only incidental material redirects to `/project-workflow:project-init`; all six matching plus only incidental material is N/A; project evidence or any partial/custom/occupied destination stays here. Ask one focused routing question only when the distinction is genuinely ambiguous.
- Inspect with Read/Grep/Glob/Bash. Use `codebase-explorer`, `tech-researcher`, and
  `decision-completeness-auditor` only at their canonical boundaries.
- For a partial/missing baseline, use `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs --stage` in a disposable directory. A missing baseline does not copy host-private rules, hooks, or tier examples.
- Treat `.claude/rules/` and hooks as host-private: preserve them unless selected, and activate a new hook only under the canonical verified-command rule.
- Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize-reference.md` only when repository evidence or a user decision makes a specific section relevant; it supplies examples, never defaults.
- Use inline trace or fresh named agents at those canonical boundaries; fallback follows the shared execution contract.
- Do not run architecture-design conversational fill here. Report relevant repository and accepted-decision evidence, and route material architecture changes to `/project-workflow:feature-init`.
- Use the canonical evidence-led conversation and Guidance Placement rules; choose natural or structured
  presentation according to the number of findings and keep only affected choices pending.
- Preflight and apply staged changes under the current request's authorization and canonical decision
  conversation. An unsafe destination symlink/conflict or blocking audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report the canonical compact result and applicable `Reviewer execution` without adding an adapter-specific schema.
