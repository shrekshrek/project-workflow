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
- With user approval, per losing spec: status mark `已取代` (link the successor) or `已废弃`, then physical move to `docs/specs/changes/archive/` (same mechanics as [`feature-archive`](feature-archive.md)), including relative-link relocation and move-back on failure. Winning delivered specs are closed through `feature-archive` as the recommended follow-up.
- Current-truth gaps: merge or identify still-valid durable facts from scattered or superseded specs for `docs/specs/<area>.md`, following [Current-Truth Document Discipline](feature-archive.md#current-truth-document-discipline).
- ADR consistency: contradictions whose loser is backed by an `Accepted` ADR get flagged for a superseding ADR or a status update.
- Recommended next step: run `feature-archive` (sweep) for delivered features, update current truth, or start a new feature.

## Workflow

1. Resolve an area, module, or explicit feature list and collect at least two related active specs plus relevant current truth, ADRs, and optional implementation evidence.
2. Build an exact-citation matrix of direct contradictions, grouping only conflicts resolved by the same
   precedence and lifecycle decision; keep independent conflicts separate and never choose a winner silently.
3. For each group, present evidence, impact, and a recommendation; the user chooses the direction and losing
   lifecycle state, and may split the group. Unresolved groups block implementation in the affected area.
4. After approval, prepare losing status/successor links and current-truth edits without applying them. Move each losing directory with an ordinary filesystem rename, relocate local Markdown links, and move it back before stopping if relocation fails.
5. After successful moves, apply final statuses and extract still-valid facts into current-truth gaps; replace archive-link lists or historical narratives with present-tense facts only after approval.
6. Flag losing directions backed by Accepted ADRs for superseding decisions or status correction. Update an existing changes index when present.

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
- Every archived directory must retain resolvable local Markdown links after its move; a missing target blocks the lifecycle update.
- Current-truth output is not a history index: do not leave archive references or change lists as the body of `docs/specs/<area>.md`.
