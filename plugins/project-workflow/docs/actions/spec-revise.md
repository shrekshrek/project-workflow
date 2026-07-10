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

## Codex Adapter Contract

When `.claude/rules/` compatibility files exist, the Codex adapter resolves them through the [Codex scoped-rule bridge](../adapters/codex-scoped-rule-bridge.md) against the proposed affected module/file population before drafting. It recomputes resolution whenever that population or a module boundary changes, reports global, matched, skipped, and ambiguous sets, and names applicable rule paths in the resumed implementation handoff. Claude-native rule loading is unchanged.

## Invariants

- Do not silently rewrite a frozen spec.
- Every material spec change has an ADR.
- `spec.md`, `plan.md`, and `tasks.md` stay consistent after the revision.
- Module-boundary changes update affected module notes and future validation expectations.
- Specific decisions must be traceable to user input, existing project convention, or the ADR.
- If the revision changes durable behavior recorded in `docs/specs/<area>.md`, keep the domain document read-only during this in-flight revision and record `current truth update pending` for [`feature-done`](feature-done.md) → [`feature-archive`](feature-archive.md). If it supersedes earlier specs, record a follow-up for [`feature-archive`](feature-archive.md) or [`spec-reconcile`](spec-reconcile.md) to mark and archive them.
- Before finalizing a new ADR, scan existing `Accepted`/`Proposed` ADRs for decisions this one overturns or contradicts; with user approval, flip the old ADR's status to `Superseded by NNNN` (the only edit allowed on an old ADR) and note the takeover in the new ADR's context. Recording a new decision without flipping the old status is how ADR conflicts accumulate.

## Validation

- Show a concise diff summary before finalizing when the tool supports it.
- Confirm the next implementation step and whether [`spec-quality-check`](spec-quality-check.md) should be rerun.
- For Codex, verify that bridge resolution reflects the final affected scope and report all four source sets.
