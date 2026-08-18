---
name: feature-archive
description: Close READY features by merging durable conclusions into current truth and moving approved feature directories into archive with history preserved.
---

# Feature Archive

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-archive.md` completely before acting; it owns eligibility, lifecycle rules, and outputs.

Claude execution details:

- Parse `$ARGUMENTS` as a feature slug/number/path or empty sweep mode using the shared runtime conventions.
- Require every canonical archive-eligibility receipt field. Invalid fields rerun `feature-done`; never infer
  READY from history. Apply the action's exact Git/non-Git identity and freshness rules, independently validate
  pending current truth, and create no manual population/fingerprint/hash.
- An explicit single-feature invocation needs no duplicate approval. Use Claude's native question flow for sweep candidates and uncertain area, supersession, or ADR decisions.
- Create a new current-truth document only from `${CLAUDE_PLUGIN_ROOT}/template/docs/specs/_template/domain.md` when the canonical action requires one.
- Move approved directories with an ordinary filesystem rename, then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/relocate-markdown-links.cjs" <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply lifecycle/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.

Report archived features, current-truth updates, superseded artifacts, ADR follow-ups, and unresolved items.
