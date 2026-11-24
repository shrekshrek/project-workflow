---
name: spec-reconcile
description: "Reconcile objective contradictions among accumulated specs, current truth, ADRs, and optional implementation evidence."
metadata:
  version: "4.0.0"
---

# Spec Reconcile

Match the user's language and preserve file language. Read [`resources/docs/actions/spec-reconcile.md`](resources/docs/actions/spec-reconcile.md) completely before acting. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

- For approved moves read [archive mechanics](resources/docs/actions/feature-archive.md#workflow); for current-truth repair read [current-truth discipline](resources/docs/actions/feature-archive.md#current-truth-document-discipline).

- Resolve an area, module path, or explicit feature list through shared runtime rules.
- Use questions and approval for canonical decision groups and their lifecycle/current-truth changes;
  present evidence and a recommendation without choosing a winner silently.
- Use the bundled `resources/` directory; after each approved ordinary filesystem rename, run its `scripts/relocate-markdown-links.cjs <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply prepared status/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.
