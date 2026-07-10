# Codex scoped-rule bridge design

> Date: 2026-07-10
> Status: superseded by [Claude rule paths and hook hardening design](2026-07-10-claude-rule-paths-and-hook-hardening-design.md)

This file is retained only as the historical record that introduced the Codex bridge. Do not use
its original scope-parsing proposal as an implementation contract. The current contract is
[`docs/adapters/codex-scoped-rule-bridge.md`](../adapters/codex-scoped-rule-bridge.md).

## Goal

Make Codex project-workflow actions read applicable A-class path-scoped rules before they create implementation context or review changes, without changing Claude Code runtime behavior.

## Outcome

- Codex project-workflow actions explicitly resolve `.claude/rules/**/*.md` as compatibility input.
- L2 remains responsible for A-class conventions; L3 remains scoped to the frozen change contract.
- `.codex/rules/*.rules` remains command-approval policy, not a coding-convention carrier.
- Scope parsing was subsequently narrowed to the current Claude `paths:` YAML-list format by the
  superseding design above.
