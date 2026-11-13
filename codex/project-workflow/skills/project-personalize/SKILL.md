---
name: project-personalize
description: "Adapt a target whose project evidence or partial/custom baseline must shape the working agreement, using repository evidence and user decisions."
---

# Project Personalize (Codex)

Match the user's language and preserve file language. Read [`../../docs/actions/project-personalize.md`](../../docs/actions/project-personalize.md) completely before acting. Apply [runtime conventions](../../docs/actions/README.md#shared-runtime-conventions).

- For convention placement read [guidance placement](../../docs/actions/agents-md-revise.md#guidance-placement-contract); only for a selected tier layout read [tier examples](../../template/_multi_tier_examples/README.md).

- Reuse the setup target and route when invoked from $project-init. On direct invocation resolve the target from the argument or cwd and follow [setup routing](../../docs/actions/project-init.md).
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`. Stage missing baseline files with its `scripts/materialize-project-baseline.cjs`.
- Under the [review execution](../../docs/reviewers/README.md#reviewer-execution-contract), dispatch fresh general subagents only at the canonical
  [`codebase-explorer`](../../docs/reviewers/codebase-explorer.md),
  [`tech-researcher`](../../docs/reviewers/tech-researcher.md), or
  [`decision-completeness-auditor`](../../docs/reviewers/decision-completeness-auditor.md#dispatch-boundary) boundaries.
  Each subagent reads its canonical spec; the main session reads it only for fallback.
- Read [`../../docs/actions/project-personalize-reference.md`](../../docs/actions/project-personalize-reference.md) only when repository evidence or a user decision makes one section relevant. It supplies examples, never defaults.
- Include host-private conventions only when selected; preserve unrelated project configuration.
- Preflight and apply staged changes under the current request's authorization. Conflict, symlink, or blocking
  audit leaves the target unchanged.
- Do not rewrite feature history or commit.
