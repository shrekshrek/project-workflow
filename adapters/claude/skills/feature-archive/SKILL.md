---
name: feature-archive
description: Close READY features by merging durable conclusions into current truth and moving approved feature directories into archive with history preserved.
---

# Feature Archive

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md` completely before acting; it owns eligibility, lifecycle rules, and outputs.

Claude execution details:

- Parse `$ARGUMENTS` as a feature slug/number/path or empty sweep mode using the shared runtime conventions.
- Treat receipts without `Verdict:` or without the current Git/non-Git identity as visible migration candidates; rerun `feature-done` instead of inferring READY.
- Accept only an exact commit SHA with `dirty=no` or current worktree with `dirty=yes`; reject other pairings. Use a dirty-worktree READY result only in the current task while its reviewed state is unchanged. An older receipt requires a resolvable immutable reviewed commit SHA or explicit non-Git inputs; later branch/PR-head movement alone does not invalidate that delivery proof, while committing a dirty receipt does not re-anchor it. Independently validate pending current-truth facts against present implementation and successor changes. Otherwise rerun `feature-done`. Do not create a manual file-list, fingerprint, or population hash.
- An explicit single-feature invocation needs no duplicate approval. Use Claude's native question flow for sweep candidates and uncertain area, supersession, or ADR decisions.
- Create a new current-truth document only from `${CLAUDE_PLUGIN_ROOT}/template/docs/specs/_template/domain.md` when the canonical action requires one.
- Move approved directories with an ordinary filesystem rename, then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/relocate-markdown-links.cjs" <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply lifecycle/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.

Report archived features, current-truth updates, superseded artifacts, ADR follow-ups, and unresolved items.
