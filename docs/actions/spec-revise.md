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

- New ADR recording context, decision, alternatives, and consequences.
- Updated `spec.md` with changed text and a revision record.
- Updated `plan.md` prior decisions and affected module/architecture sections.
- Updated `tasks.md` if task order, scope, or validation changed.

## Invariants

- Do not silently rewrite a frozen spec.
- Every material spec change has an ADR.
- `spec.md`, `plan.md`, and `tasks.md` stay consistent after the revision.
- Module-boundary changes update affected module notes and future validation expectations.
- Specific decisions must be traceable to user input, existing project convention, or the ADR.
- If the revision changes durable behavior recorded in `docs/current/<area>.md`, update that document (or record why not); if it supersedes earlier specs, apply the lifecycle markers per [`spec-reconcile`](spec-reconcile.md) or record the follow-up.
- Before finalizing a new ADR, scan existing `Accepted`/`Proposed` ADRs for decisions this one overturns or contradicts; with user approval, flip the old ADR's status to `Superseded by NNNN` (the only edit allowed on an old ADR) and note the takeover in the new ADR's context. Recording a new decision without flipping the old status is how ADR conflicts accumulate.

## Validation

- Show a concise diff summary before finalizing when the tool supports it.
- Confirm the next implementation step and whether [`spec-quality-check`](spec-quality-check.md) should be rerun.

