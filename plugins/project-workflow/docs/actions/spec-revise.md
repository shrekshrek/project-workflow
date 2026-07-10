# spec-revise

Canonical action for changing a frozen feature contract after implementation has started.

## Use When

- A confirmed `spec.md` needs to change during implementation.
- A module boundary or architecture decision must be adjusted after the original plan.
- The change would otherwise rewrite history or hide a requirement shift.

Draft specs may be edited directly before implementation starts.

## Inputs

- Feature directory.
- Requested change and reason.
- Existing `spec.md`, `plan.md`, `tasks.md`.
- ADR directory state.

## Outputs

- Updated `spec.md` with changed text and a revision record.
- Updated `plan.md` prior decisions and affected module/architecture sections.
- Updated `tasks.md` if task order, scope, or validation changed.
- New ADR only when the revision changes architecture/module boundaries, establishes a durable cross-feature technical decision, or supersedes an existing ADR.

## Codex Adapter Contract

When `.claude/rules/` compatibility files exist, the Codex adapter resolves them against the proposed affected population before drafting and recomputes after scope changes. Report compact counts plus applicable/ambiguous paths; full skipped paths are debug-only.

## Invariants

- Do not silently rewrite a frozen spec.
- Every material spec change has a dated revision record with reason and decision source. ADRs are conditional, not a generic change log.
- `spec.md`, `plan.md`, and `tasks.md` stay consistent after the revision.
- Module-boundary changes update affected module notes and future validation expectations.
- Specific decisions must be traceable to user input, existing project convention, revision record, or an applicable ADR.
- If the revision changes durable behavior recorded in `docs/specs/<area>.md`, keep the domain document read-only during this in-flight revision and record `current truth update pending` for [`feature-done`](feature-done.md) → [`feature-archive`](feature-archive.md). If it supersedes earlier specs, record a follow-up for [`feature-archive`](feature-archive.md) or [`spec-reconcile`](spec-reconcile.md) to mark and archive them.
- When an ADR is required, scan existing `Accepted`/`Proposed` ADRs for decisions it overturns or contradicts; with user approval, flip the old ADR's status to `Superseded by NNNN` and note the takeover in the new ADR.

## Validation

- Use two approval points: approve the proposed decision/scope (including any ADR supersede decisions), then approve one consolidated proposed diff. Draft and audit final contents without changing the worktree; apply once only after the second approval. Ask intermediate questions only when new ambiguity appears.
- Confirm the next implementation step and whether [`spec-quality-check`](spec-quality-check.md) should be rerun.
- For Codex, verify final bridge resolution and report compact counts plus applicable/ambiguous paths.
