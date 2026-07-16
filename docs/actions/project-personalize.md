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
- A minimum evidence-backed working agreement: real build/test/lint commands, observed source/test paths, project-specific rules or boundaries that an agent cannot safely infer, and durable tier ownership when the repository actually has tiers. Unknown items remain explicitly deferred.
- Updated host-specific convention files when they already exist or the user explicitly chooses them; for example, Claude may use `.claude/rules/`.
- Existing hook adapter preserved unless the user approves a repair; a new hook adapter is generated only for an `active + verified` command, otherwise report `not installed + reason`.
- Added or repaired tier-level `AGENTS.md` and one-line `CLAUDE.md` aliases when relevant.
- Removed stale scaffold placeholders/defaults.
- Summary of values changed and items requiring human review.

## Workflow

1. Resolve the target. Empty targets use `project-init`; every non-empty target continues here as complete, partial/custom, or missing baseline.
2. Inspect root/nested `AGENTS.md`, aliases, manifests, shallow structure, commands, source/test paths, project-specific boundaries, and existing host-private assets. Preserve useful custom guidance.
3. Present only applicable scopes: create/complete the minimum working agreement, replace demonstrably stale scaffold values, repair real tier guidance, survey structure, or explicitly selected host-private rules/hooks.
4. For a missing baseline, stage the neutral six-file template with `scripts/materialize-project-baseline.cjs`; do not write the target yet.
5. Use the codebase-explorer methodology only for a nontrivial or unclear structure survey. When a material stack, library, or tool choice remains unresolved and current external evidence would change the result, run the tech-researcher methodology, present 2-3 suitable candidates and one recommendation, and let the user make the final choice. Derive commands, source/test paths, project-specific rules, and tier ownership from repository evidence; ask only for material gaps.
6. Validate selected host-private rules and hooks only when they already exist or the user chose them. Never copy optional assets by default.
7. Run an inline trace for repository- or user-sourced synchronization and the decision-completeness auditor only for unconfirmed high-impact choices, ADRs, or conflicting/weak evidence.
8. Preflight unchanged baselines and staged destinations, show one consolidated diff/new-file list, and apply once after approval. Normalize an existing target-root symlink to its real directory, but reject symlinked destination components and an absent target below a symlinked ancestor. Conflicts, rejection, or a blocking audit leave the target unchanged.
9. Validate placeholders, commands, source/test paths, project-specific rules/boundaries, real tier ownership, aliases, selected rule scopes, hook status, and `AGENTS.md` concision.

## Reviewer Execution

Every applicable explorer, researcher, or auditor boundary follows the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Report `Reviewer execution` with role, mode, status, and observed reason; missing required evidence is blocking and leaves the target unchanged.

## Invariants

- Replace only scaffold/default values that are demonstrably stale or selected by the user.
- Missing baseline sections are added in place; existing custom headings or guidance are not grounds for redirecting to `project-init`.
- When `AGENTS.md` is absent in a non-empty codebase, render the minimum baseline from objective repository evidence and user answers, with a preview before writing.
- Missing-baseline bootstrap keeps all reusable templates in the plugin and renders `AGENTS.md` indexes from files that will actually exist; absent hooks/templates are not advertised as project-local assets.
- Activate a new edit-time lint hook only for a user-confirmed, safe, sub-five-second per-file command; otherwise do not add hook files/config. Existing project hooks are reported as active/verified, existing/unverified, or user-approved for repair.
- Do not invent product semantics from directory names.
- `AGENTS.md` remains concise; put tier-specific guidance in tier files.
- Do not leave an existing scaffold's commands and source/test paths deferred when objective repository evidence resolves them. Do not invent style, Git, coverage, deployment, or tier policies that the repository and user do not establish.
- When the selected host uses path-scoped convention files, their path patterns must match existing or intentionally planned paths. Do not translate one host's private files into another host's runtime format unless the user explicitly requests a migration.
- Historical feature specs are not rewritten.
- Compose every proposed patch in memory or a disposable staging directory, then run trace/audit and show one consolidated diff before applying it. Rejection or a blocking audit leaves the target unchanged. Missing-baseline apply uses strict no-clobber preflight: any approval-time conflict or symlinked destination beneath the resolved project root rejects the whole staged population before copying anything.

## Validation

- Search for unresolved placeholders and old scaffold names.
- Check path-scoped rule frontmatter / path matching against the actual directory layout.
- Verify a newly activated hook against a matching file; otherwise report `hook: not installed` and its reason without claiming runtime enforcement.
- Confirm no example-only assets became active project files.
