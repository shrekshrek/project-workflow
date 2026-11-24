---
name: project-personalize
description: "Adapt a target whose project evidence or partial/custom baseline must shape the working agreement, using repository evidence and user decisions."
metadata:
  version: "4.0.2"
---

# Project Personalize

Match the user's language and preserve file language. Read [`resources/docs/actions/project-personalize.md`](resources/docs/actions/project-personalize.md) completely before acting. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

- For convention placement read [guidance placement](resources/docs/actions/agents-md-revise.md#guidance-placement-contract); only for a selected tier layout read [tier examples](resources/template/_multi_tier_examples/README.md).

- Reuse the setup target and route when invoked from project-init. On direct invocation resolve the target from the argument or cwd and follow [setup routing](resources/docs/actions/project-init.md).
- Use the bundled `resources/` directory. Stage missing baseline files with its `scripts/materialize-project-baseline.cjs`.
- Under the [review execution](resources/docs/reviewers/README.md#reviewer-execution-contract), dispatch fresh general subagents only at the canonical
  [`codebase-explorer`](resources/docs/reviewers/codebase-explorer.md),
  [`tech-researcher`](resources/docs/reviewers/tech-researcher.md), or
  [`decision-completeness-auditor`](resources/docs/reviewers/decision-completeness-auditor.md#dispatch-boundary) boundaries.
  Each subagent reads its canonical spec; the main session reads it only for fallback.
- Read [`resources/docs/actions/project-personalize-reference.md`](resources/docs/actions/project-personalize-reference.md) only when repository evidence or a user decision makes one section relevant. It supplies examples, never defaults.
- Include host-private conventions only when selected; preserve unrelated project configuration.
- Preflight and apply staged changes under the current request's authorization. Conflict, symlink, or blocking
  audit leaves the target unchanged.
- Do not rewrite feature history or commit.
