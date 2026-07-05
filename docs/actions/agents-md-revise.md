# agents-md-revise

Canonical P4 action for refreshing A-class project conventions.

## Use When

- The project has evolved and `AGENTS.md` or path-scoped rules may be stale.
- Commands, directories, package managers, dependencies, or tier boundaries changed.
- The user explicitly wants convention drift reviewed.

Do not use to rewrite historical feature specs, create backlog items, or make subjective product-roadmap changes.

## Inputs

- Root and nested `AGENTS.md`.
- Path-scoped rules.
- Objective project state: manifests, commands, directory layout, config files, and recent relevant changes.
- User decisions for each proposed convention change.

## Outputs

- Drift report with objective evidence.
- User-approved edits to A-class conventions.
- Optional ignore/ledger entries for intentionally ignored drift when the adapter supports it.
- Advisory (read-only, not in the apply flow): current-truth freshness — for each `docs/current/<area>.md`, if its "最后核对" date is older than ~30 days and commits landed since, flag it as possibly stale and suggest a `feature-archive` sweep or manual verification. Coarse signal only; no area-to-path precision mapping, no behavior-level comparison.
- Summary of applied changes and follow-up manual review.

## Invariants

- Only A-class conventions are in scope.
- Critical objective drift is prioritized over nice-to-have style opinions.
- User approves each material convention change before it is applied.
- ADR orphan or spec-history notes may be advisory, but do not enter the apply flow.
- Specific new convention text must be traceable to observed project state or user approval.

## Validation

- Search for unresolved placeholders.
- Verify updated commands and paths exist or are explicitly documented as deferred.
- Check path-scoped rule descriptions and path matching after edits.
