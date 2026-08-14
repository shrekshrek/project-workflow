---
name: project-personalize
description: Adapt a target whose project evidence or partial/custom baseline must shape the working agreement, using repository evidence and explicit user decisions.
---

# Project Personalize

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional target and include dotfiles in inspection, excluding version-control metadata from content classification. Classify the six baseline destinations and inspect other content only far enough to identify project evidence. All destinations absent plus only incidental material redirects to `/project-workflow:project-init`; all six matching plus only incidental material is N/A; project evidence or any partial/custom/occupied destination stays here. Ask one focused routing question only when the distinction is genuinely ambiguous.
- Inspect with Read/Grep/Glob/Bash. `codebase-explorer` applies only for a nontrivial structure survey. `tech-researcher` applies only when a material stack, library, or tool choice remains unresolved and needs current external evidence; the user makes the final choice.
- For a partial/missing baseline, use `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs --stage` in a disposable directory. A missing baseline does not copy host-private rules, hooks, or tier examples.
- Treat `.claude/rules/` and hooks as host-private: preserve them unless selected, and activate a new hook only under the canonical verified-command rule.
- Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize-reference.md` only when repository evidence or a user decision makes a specific section relevant; it supplies examples, never defaults.
- Use inline trace or fresh named agents at the canonical `codebase-explorer`, `tech-researcher`, and `decision-completeness-auditor` boundaries; fallback follows the shared execution contract.
- Do not run architecture-design conversational fill here. Report relevant repository and accepted-decision evidence, and route material architecture changes to `/project-workflow:feature-init`.
- When structure/guidance scope is selected, run the canonical bounded Guidance Placement survey. Propose
  nested guidance only for a durable clear-subtree difference that is costly/unsafe to infer and not product,
  temporary, inherited, or better enforced mechanically. Prefer tier over duplicate module files; require
  evidence before moving a root rule; use exactly `@AGENTS.md` in an adopted nested Claude alias. Include all
  proposed create/move/delete paths in the consolidated approval; never create files for symmetry.
- Show one `Consolidated Preview + Apply Gate`; use native approval, then preflight and apply once. Rejection, an unsafe destination symlink/conflict, or a blocking audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report only changed or newly confirmed commands/scopes, source/test paths, project-specific rules/boundaries, tier ownership, changed files, hook status, unresolved decisions, and exceptions. Compress each successful applicable `Reviewer execution` to one line; do not restate unchanged evidence. Conclude that the working agreement is aligned for direct work or `/project-workflow:feature-init` without claiming an architecture-quality verdict.
