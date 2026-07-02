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

## Validation

- Show a concise diff summary before finalizing when the tool supports it.
- Confirm the next implementation step and whether [`spec-quality-check`](spec-quality-check.md) should be rerun.

