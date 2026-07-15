---
name: feature-archive
description: Close READY features by merging durable conclusions into current truth and moving approved feature directories into archive with history preserved.
---

# Feature Archive

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md` completely before acting; it owns eligibility, lifecycle rules, and outputs.

Claude execution details:

- Parse `$ARGUMENTS` as a feature slug/number/path or empty sweep mode using the shared runtime conventions.
- Legacy receipts without `Verdict:` require feature-done migration; do not infer READY from checkboxes.
- Use a current-task READY result only while its exact review population is unchanged. For an older receipt, establish unchanged inputs from available Git/task evidence or rerun `feature-done`; do not create a fingerprint protocol.
- An explicit single-feature invocation needs no duplicate approval. Use Claude's native question flow for sweep candidates and uncertain area, supersession, or ADR decisions.
- Create a new current-truth document only from `${CLAUDE_PLUGIN_ROOT}/template/docs/specs/_template/domain.md` when the canonical action requires one.
- Move approved directories with an ordinary filesystem rename, then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/relocate-markdown-links.cjs" <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply lifecycle/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.

Report archived features, current-truth updates, superseded artifacts, ADR follow-ups, unresolved items, and a commit-message draft.
