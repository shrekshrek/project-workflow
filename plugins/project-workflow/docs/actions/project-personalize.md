# project-personalize

Canonical P0 action for adapting a copied scaffold or retrofitting an existing non-empty codebase to the user's actual project. The target may have a complete, partial, unrelated, or missing project-workflow baseline.

## Use When

- The target is a non-empty existing codebase, copied scaffold, or partially initialized project.
- `AGENTS.md` may be complete, partial, unrelated to project-workflow, or absent.
- Default names, commands, ports, database names, tier paths, or rule path patterns still reflect the scaffold.
- An existing codebase needs its project conventions aligned with actual structure.

Do not use for an empty greenfield project; use [`project-init`](project-init.md). A non-empty codebase without `AGENTS.md` is retrofit, not greenfield.

## Inputs

- Target directory.
- User-selected scope: replace scaffold defaults, add missing tier-level guidance, infer project structure, or all of these.
- Actual project names, database/container names, commands, tier paths, and known conventions.

## Outputs

- Created or updated root `AGENTS.md`, preserving useful existing guidance.
- Updated path-scoped rule files.
- Existing hook adapter preserved unless the user approves a repair; a new hook adapter is generated only for an `active + verified` command, otherwise report `not installed + reason`.
- Added or repaired tier-level `AGENTS.md` and one-line `CLAUDE.md` aliases when relevant.
- Removed stale scaffold placeholders/defaults.
- Summary of values changed and items requiring human review.

## Codex Adapter Contract

When `.claude/rules/` compatibility files exist, the Codex adapter resolves them through the [Codex scoped-rule bridge](../adapters/codex-scoped-rule-bridge.md). Report compact counts plus applicable/ambiguous paths; full skipped paths are debug-only. Critical ambiguity blocks application.

## Invariants

- Replace only scaffold/default values that are demonstrably stale or selected by the user.
- Missing baseline sections are added in place; existing custom headings or guidance are not grounds for redirecting to `project-init`.
- When `AGENTS.md` is absent in a non-empty codebase, render the minimum baseline from objective repository evidence and user answers, with a preview before writing.
- Missing-baseline bootstrap keeps all reusable templates in the plugin and renders `AGENTS.md` indexes from files that will actually exist; absent hooks/templates are not advertised as project-local assets.
- Activate a new edit-time lint hook only for a user-confirmed, safe, sub-five-second per-file command; otherwise do not add hook files/config. Existing project hooks are reported as active/verified, existing/unverified, or user-approved for repair.
- Do not invent product semantics from directory names.
- `AGENTS.md` remains concise; put tier-specific guidance in tier files.
- Path-rule `paths:` YAML-list patterns must match existing or intentionally planned paths; unsupported historical scope metadata is migrated rather than preserved.
- Historical feature specs are not rewritten.
- Compose every proposed patch in memory or a disposable staging directory, then run trace/audit and show one consolidated diff before applying it. Rejection or a blocking audit leaves the target unchanged. Missing-baseline apply uses strict no-clobber preflight: any approval-time conflict or symlinked destination rejects the whole staged population before copying anything.

## Validation

- Search for unresolved placeholders and old scaffold names.
- Check path-scoped rule frontmatter / path matching against the actual directory layout.
- Verify a newly activated hook against a matching file; otherwise report `hook: not installed` and its reason without claiming runtime enforcement.
- Confirm no example-only assets became active project files.
- For Codex, verify normalized bridge scopes and report compact counts plus applicable/ambiguous paths.
