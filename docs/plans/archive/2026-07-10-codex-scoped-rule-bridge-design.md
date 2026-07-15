# Codex scoped-rule bridge design

> Date: 2026-07-10
> Status: superseded by [Unified workflow capability-preservation design](../2026-07-14-unified-workflow-capability-preservation-design.md)

This file is retained only as the historical record that introduced the Codex bridge. Do not use
its original scope-parsing proposal as an implementation contract. The bridge was later removed:
Codex now uses root/nested `AGENTS.md`, while Claude-private rules remain optional local assets.

## Goal

Make Codex project-workflow actions read applicable A-class path-scoped rules before they create implementation context or review changes, without changing Claude Code runtime behavior.

## Outcome

- Codex project-workflow actions originally resolved `.claude/rules/**/*.md` as compatibility input; this behavior is no longer active.
- L2 remains responsible for A-class conventions; L3 remains scoped to the frozen change contract.
- `.codex/rules/*.rules` remains command-approval policy, not a coding-convention carrier.
- Scope parsing was subsequently narrowed to the current Claude `paths:` YAML-list format by the
  superseding design above.
