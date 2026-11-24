---
name: feature-archive
description: "Close READY features by merging durable conclusions into current truth and archiving approved feature directories."
---

# Feature Archive

Match the user's language and preserve file language. Read [`../docs/actions/feature-archive.md`](../docs/actions/feature-archive.md) completely before acting. Apply [runtime conventions](../docs/actions/README.md#shared-runtime-conventions).

- Resolve an explicit candidate or empty sweep mode through the shared runtime conventions.
- Validate eligibility using [receipt schema](../docs/actions/feature-done.md#delivery-receipt--proof-bundle-on-disk); check freshness and current truth before mutation. Use questions when the action requires a user decision.
- Use the bundled `resources/` directory; use its domain template when canonical current-truth creation applies.
- Move approved directories with an ordinary filesystem rename, then run the packaged `scripts/relocate-markdown-links.cjs <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply lifecycle/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.
