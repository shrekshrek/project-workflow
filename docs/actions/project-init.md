# project-init

Canonical P0 action for creating a greenfield project-workflow baseline in a target project that does not already have `AGENTS.md`.

## Use When

- Starting a new project or an empty target directory.
- The user wants project-level conventions, path-scoped rules, ADR/spec templates, and optional tier-level guidance.

Do not use for a copied scaffold or existing project that already has `AGENTS.md`; use [`project-personalize`](project-personalize.md).

## Inputs

- Target directory, defaulting to the current working directory.
- Project shape: single tier or multi-tier.
- Durable stack facts needed to fill conventions: language, framework, package manager, test/check/lint commands, tier names.

Do not ask feature or business-domain questions. Those belong to [`feature-init`](feature-init.md).

## Outputs

Minimum baseline:

- `AGENTS.md`
- `CLAUDE.md` as a one-line alias for Claude compatibility
- path-scoped rule files where the adapter supports them
- hook/check configuration where the adapter supports it
- `docs/adr/`
- `docs/specs/_template/`
- `docs/gotchas.md`
- `.gitignore`

For multi-tier projects, create tier-level `AGENTS.md` files only when there is durable tier-specific guidance.

## Invariants

- `AGENTS.md` is the cross-tool convention entry point.
- Tool-specific files are adapter assets, not methodology core.
- Commands must come from user answers, manifests, or conservative stack conventions. Unknown deployment commands stay deferred.
- No unresolved scaffold placeholders may remain outside intentional templates.
- No application code is generated.

## Validation

- Search for unresolved `{{...}}` placeholders, excluding intentional templates.
- Verify generated rule files have clear descriptions and sensible path scopes.
- Summarize created files, known deferred decisions, and next action.
