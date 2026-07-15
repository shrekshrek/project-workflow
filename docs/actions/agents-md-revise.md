# agents-md-revise

Canonical P4 action for refreshing A-class project conventions.

## Use When

- The project has evolved and root/nested `AGENTS.md` or host-specific convention files may be stale.
- Commands, directories, package managers, dependencies, or tier boundaries changed.
- The user explicitly wants convention drift reviewed.

Do not use to rewrite historical feature specs, create backlog items, or make subjective product-roadmap changes.

## Inputs

- Root and nested `AGENTS.md`.
- Host-specific convention files selected for this run, if any.
- Objective project state: manifests, commands, directory layout, config files, and recent relevant changes.
- User decisions for each proposed convention change.

## Outputs

- Drift report with objective evidence.
- User-approved edits to A-class conventions.
- Summary of applied changes and follow-up manual review.

## Workflow

1. Resolve root/nested `AGENTS.md` and only the host-specific convention files explicitly included in this run.
2. Extract testable statements about commands, dependencies, directories, configuration, framework rules, and tier boundaries.
3. Inspect objective repository evidence: manifests, lockfiles, tool-version files, actual paths, configuration examples, and relevant recent changes.
4. For each mismatch, record the old text, observed state, evidence source, and a narrow proposed patch. Exclude preferences and weak pattern guesses.
5. Ask only about material ambiguity or genuinely new policy, at most five decisions per batch. Objective stale-value synchronization proceeds to the consolidated preview without a separate decision round.
6. Draft approved patches without editing the worktree. Use an inline value-to-source trace for simple synchronization and the decision-completeness auditor only for new technical specifics, weak evidence, or generated decisions spanning files.
7. Show one consolidated diff, apply only approved patches, then validate the changed commands, paths, and placeholders.

## Invariants

- Only A-class conventions are in scope.
- Critical objective drift is prioritized over nice-to-have style opinions.
- Show one consolidated diff and apply only its approved convention changes.
- Specific new convention text must be traceable to observed project state or user approval.

## Validation

- Search for unresolved placeholders.
- Verify updated commands and paths exist or are explicitly documented as deferred.
- Check path matching after editing any host-specific path-scoped convention file.
