# Workflow actions

This directory is the canonical action layer for project-workflow.

Each file defines one methodology action: when it applies, required inputs, outputs, invariants, and validation. Runtime adapters such as Claude Code skills, Codex skills, shell scripts, or a manual operator may add execution detail, but they should not redefine the action.

If an adapter conflicts with an action spec, the action spec wins. Update this directory first, then update adapters.

## Shared runtime conventions

Single authoritative home for rules that several actions need. Action specs and runtime skills cite this section instead of restating it.

- **Feature directory resolution**: a feature lives in `docs/specs/changes/<NNN>-<slug>/`. Resolve a slug/number argument to the matching directory; resolve an empty or `current` argument to the most recently modified active feature (artifact-file mtime), always excluding `archive/`. Multiple or zero candidates is a user question, not a guess.
- **NNN numbering**: three digits, one global sequence shared by the active tree and `archive/`; next number = max across both + 1 (zero-padded, `001` when empty). Archived numbers are never reused.
- **Plugin root resolution**: the active runtime adapter resolves the installed package that contains its own skill and the required asset. Claude adapters require a valid `CLAUDE_PLUGIN_ROOT`; Codex adapters walk upward from the active skill to the nearest `.codex-plugin/plugin.json`. Do not scan another host's cache or select an unrelated installation. If the host-local root or required asset is unavailable, stop — never recreate plugin assets inside the target project.

| Action | Purpose |
|---|---|
| [`project-init`](project-init.md) | Create the neutral baseline when its destinations are absent and existing content needs no personalization |
| [`project-personalize`](project-personalize.md) | Establish or adapt project-workflow when project evidence or a partial/custom baseline exists |
| [`feature-init`](feature-init.md) | Create a feature artifact only when needed |
| [`spec-quality-check`](spec-quality-check.md) | Gate full-lane feature specs before implementation |
| [`spec-revise`](spec-revise.md) | Revise frozen spec/plan/tasks during implementation |
| [`feature-done`](feature-done.md) | Run endpoint review and write the compact delivery receipt |
| [`feature-archive`](feature-archive.md) | Close delivered features: merge durable conclusions into current truth, move directories to `docs/specs/changes/archive/` (default sweep mode) |
| [`spec-reconcile`](spec-reconcile.md) | Repair conflicts across accumulated specs in one area (retrofit tool): pick source of truth, mark and archive losing specs |
| [`agents-md-revise`](agents-md-revise.md) | Refresh project conventions |

Architecture-shaped full-lane work remains part of `feature-init`. It conditionally reads the shared [`architecture-design` guidance](../architecture-design.md); this reference is not another action, lane, gate, reviewer, or artifact type.
