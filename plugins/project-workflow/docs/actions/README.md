# Workflow actions

This directory is the canonical action layer for project-workflow.

Each file defines one methodology action: when it applies, required inputs, outputs, invariants, and validation. Runtime adapters such as Claude Code skills, Codex skills, shell scripts, or a manual operator may add execution detail, but they should not redefine the action.

If an adapter conflicts with an action spec, the action spec wins. Update this directory first, then update adapters.

## Shared runtime conventions

Single authoritative home for rules that several actions need. Action specs and runtime skills cite this section instead of restating it.

- **Feature directory resolution**: a feature lives in `docs/specs/changes/<NNN>-<slug>/`. Resolve a slug/number argument to the matching directory; resolve an empty or `current` argument to the most recently modified active feature (artifact-file mtime), always excluding `archive/`. Multiple or zero candidates is a user question, not a guess.
- **NNN numbering**: three digits, one global sequence shared by the active tree and `archive/`; next number = max across both + 1 (zero-padded, `001` when empty). Archived numbers are never reused.
- **Plugin root resolution**: prefer `PROJECT_WORKFLOW_PLUGIN_ROOT`, then `CLAUDE_PLUGIN_ROOT`, then `CODEX_PLUGIN_ROOT`; when unset or invalid, search `~/.claude/plugins/cache` and `~/.codex/plugins/cache` for the most recently installed compatible package containing both `template/` and the required asset. Compatibility is asset-specific; never choose a package by lexical path order. If resolution fails, stop — never recreate plugin assets inside the target project.

| Action | Purpose |
|---|---|
| [`project-init`](project-init.md) | Create a greenfield project-workflow baseline |
| [`project-personalize`](project-personalize.md) | Adapt a copied scaffold or retrofit a non-empty existing codebase |
| [`feature-init`](feature-init.md) | Create a feature artifact only when needed |
| [`spec-quality-check`](spec-quality-check.md) | Gate full-lane feature specs before implementation |
| [`spec-revise`](spec-revise.md) | Revise frozen spec/plan/tasks during implementation |
| [`feature-done`](feature-done.md) | Run endpoint review and write the compact delivery receipt |
| [`feature-archive`](feature-archive.md) | Close delivered features: merge durable conclusions into current truth, move directories to `docs/specs/changes/archive/` (default sweep mode) |
| [`spec-reconcile`](spec-reconcile.md) | Repair conflicts across accumulated specs in one area (retrofit tool): pick source of truth, mark and archive losing specs |
| [`agents-md-revise`](agents-md-revise.md) | Refresh A-class project conventions |
