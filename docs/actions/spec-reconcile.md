# spec-reconcile

Canonical repair action for product areas where accumulated specs conflict with each other or with current truth. Primarily a **retrofit tool**: projects adopting the archive discipline mid-way, or areas where multiple direction changes piled up before lifecycle management existed. In steady state (archive sweeps running), it is rarely needed.

## Use When

- A product area has accumulated several feature specs and the user suspects stale specs are steering new work back toward superseded directions.
- `feature-init` detected related historical specs for the same area and recommended reconciliation.
- Adopting lifecycle management in an existing project: one-time cleanup that establishes current truth and empties the active tree of history.

Do not use for a single active feature that is simply wrong mid-implementation; that is [`spec-revise`](spec-revise.md).

## Inputs

- Product area, module path, or explicit list of `docs/specs/changes/<NNN>-*/` directories.
- Related current-truth documents (`docs/specs/<area>.md`), if any.
- Related ADRs.
- Optionally, current implementation files for cross-checking which direction the code actually follows.

## Outputs

- Conflict report: for each contradiction, the exact files and sections that disagree, and which statement the evidence supports.
- Selected source of truth per contradiction (a spec, an ADR, a current-truth document, or the code itself).
- With user approval, per losing spec: status mark `已取代` (link the successor) or `已废弃`, then physical move to `docs/specs/changes/archive/` (same mechanics as [`feature-archive`](feature-archive.md)). Winning delivered specs are closed through `feature-archive` as the recommended follow-up.
- Current-truth gaps: durable facts that exist only in scattered specs — including still-valid foundations from superseded specs (data model, API, pipeline) — merged into or listed for `docs/specs/<area>.md`. There is no "historical foundation" status; surviving facts move into current truth, the spec itself is archived.
- ADR consistency: contradictions whose loser is backed by an `Accepted` ADR get flagged for a superseding ADR or a status update.
- Recommended next step: run `feature-archive` (sweep) for delivered features, update current truth, or start a new feature.

## Verdict

- `CLEAN`: current truth and specs align; no lifecycle updates needed.
- `NEEDS LIFECYCLE UPDATE`: statuses, archive moves, or current-truth documents need changes before new implementation in this area.
- `BLOCKED`: contradictory active specs make new implementation unsafe until the user picks a precedence.

## Invariants

- Do not edit implementation code.
- Do not delete history; superseding is marking plus archiving, never removing.
- Do not continue implementation in the area while active specs contradict each other without a resolved precedence.
- Every reported conflict cites exact files and sections; no vague "may be stale" findings.
- Status changes and archive moves are applied only with user approval.
