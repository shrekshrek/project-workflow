---
name: spec-reconcile
description: "Reconcile objective contradictions among accumulated specs, current truth, ADRs, and optional implementation evidence in Codex."
---

# Spec Reconcile (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/spec-reconcile.md`](../../../../docs/actions/spec-reconcile.md) completely before acting; it owns conflict and lifecycle semantics.

- Resolve an area, module path, or explicit feature list through shared runtime rules.
- Use Codex-native approval for scope, precedence, losing lifecycle state, and current-truth edits. Never choose a winner silently.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; after each approved ordinary filesystem rename, run its `scripts/relocate-markdown-links.cjs <old-dir> <new-dir>`. If relocation fails, move the directory back before stopping; apply prepared status/current-truth edits only after successful relocation.
- Do not modify implementation code, delete history, or commit.

Return the canonical verdict with conflict matrix, applied lifecycle changes, current-truth gaps, ADR follow-ups, and next action.
