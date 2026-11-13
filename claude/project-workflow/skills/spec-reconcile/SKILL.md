---
name: spec-reconcile
description: Reconcile objective contradictions among accumulated specs, current truth, ADRs, and optional implementation evidence.
---

# Spec Reconcile

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-reconcile.md` completely before acting. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

Claude execution details:

- For approved moves read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md#workflow`; for current-truth repair read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md#current-truth-document-discipline`.

- Parse `$ARGUMENTS` as an area, module path, or explicit feature list; use the shared active-feature rules and exclude `archive/` from candidates.
- Use Claude's native question/approval flow for canonical decision groups and their lifecycle/current-truth
  changes; present evidence and a recommendation without choosing a winner silently.
- After precedence approval, move losing artifacts with an ordinary filesystem rename and run `node "${CLAUDE_PLUGIN_ROOT}/scripts/relocate-markdown-links.cjs" <old-dir> <new-dir>` after each move. If relocation fails, move the directory back before stopping; apply prepared status/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.
