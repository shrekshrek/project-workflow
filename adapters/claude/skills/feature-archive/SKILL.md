---
name: feature-archive
description: Close READY features by merging durable conclusions into current truth and moving approved feature directories into archive with history preserved.
---

# Feature Archive

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md` completely before acting. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

Claude execution details:

- Parse `$ARGUMENTS` as a feature slug/number/path or empty sweep mode using the shared runtime conventions.
- Validate eligibility using `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md#delivery-receipt--proof-bundle-on-disk`; check freshness and current truth before mutation. Use Claude's native
  question flow when the action requires a user decision.
- Create a new current-truth document only from `${CLAUDE_PLUGIN_ROOT}/template/docs/specs/_template/domain.md` when the canonical action requires one.
- Move approved directories with an ordinary filesystem rename, then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/relocate-markdown-links.cjs" <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply lifecycle/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.
