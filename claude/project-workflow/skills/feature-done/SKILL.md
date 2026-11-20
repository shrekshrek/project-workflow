---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their canonical specs; the main session reads one only when executing the allowed fallback. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

Claude execution details:

- Before scope routing or post-gate continuation, read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#implementation-scope-stop`; for long-run checks also read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#record-and-authorization`.

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Review applicability follows the actual risk and project requirements, not file names.
- Execute the complete canonical action with Bash against its selected Git population. A stop still writes the
  canonical receipt. For preflight, read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#document-updates-and-context`.
- Resolve the canonical convention population and dispatch `spec-reviewer` (`${CLAUDE_PLUGIN_ROOT}/docs/reviewers/spec-reviewer.md`) and `agents-md-reviewer` (`${CLAUDE_PLUGIN_ROOT}/docs/reviewers/agents-md-reviewer.md`) under `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/README.md#reviewer-execution-contract`.
  Claude L2 may include project-root `.claude/rules/`; include user-level `~/.claude/rules/` only when selected.
- Persist and structurally re-read the canonical `## Proof Bundle` receipt.

Apply the canonical verdict and closure-authorization rules; check `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md#closure-authorization` and, when authorized, continue to
`/project-workflow:feature-archive` for the explicit feature. Otherwise leave archive pending.
