# project-personalize

Canonical P0 action for adapting a copied scaffold or existing project-workflow-shaped project to the user's actual project.

## Use When

- The target already has `AGENTS.md` or other project-workflow scaffold files.
- Default names, commands, ports, database names, tier paths, or rule path patterns still reflect the scaffold.
- An existing codebase needs its project conventions aligned with actual structure.

Do not use for an empty greenfield project; use [`project-init`](project-init.md).

## Inputs

- Target directory.
- User-selected scope: replace scaffold defaults, add missing tier-level guidance, infer project structure, or all of these.
- Actual project names, database/container names, commands, tier paths, and known conventions.

## Outputs

- Updated root `AGENTS.md`.
- Updated path-scoped rule files.
- Added or repaired tier-level `AGENTS.md` and one-line `CLAUDE.md` aliases when relevant.
- Removed stale scaffold placeholders/defaults.
- Summary of values changed and items requiring human review.

## Codex Adapter Contract

When `.claude/rules/` compatibility files exist, the Codex adapter inventories their metadata and resolves them against real project paths through the [Codex scoped-rule bridge](../adapters/codex-scoped-rule-bridge.md). It reports global, matched, skipped, and ambiguous sets. An ambiguity that may hide a critical convention blocks application until clarified. Claude-native rule loading is unchanged.

## Invariants

- Replace only scaffold/default values that are demonstrably stale or selected by the user.
- Do not invent product semantics from directory names.
- `AGENTS.md` remains concise; put tier-specific guidance in tier files.
- Path-rule `paths:` YAML-list patterns must match existing or intentionally planned paths; unsupported historical scope metadata is migrated rather than preserved.
- Historical feature specs are not rewritten.

## Validation

- Search for unresolved placeholders and old scaffold names.
- Check path-scoped rule frontmatter / path matching against the actual directory layout.
- Confirm no example-only assets became active project files.
- For Codex, verify normalized bridge scopes and report all four source sets.
