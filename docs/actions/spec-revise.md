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

## Workflow

1. Resolve the active full-lane feature and read `spec.md`, `plan.md`, and `tasks.md`. Light-lane work has no frozen spec; upgrade it only when the discovered risk requires a contract.
2. Confirm that the discovery is a material contract, verification, scope, plan, or module-boundary error. Put minor clarification in plan prior decisions or implementation notes instead.
3. Resolve affected modules/files and fresh-read applicable conventions.
4. Classify `ADR_REQUIRED`: yes only for architecture/module boundaries, durable cross-feature technical decisions, or superseding an ADR. When yes, search ADR filenames, titles, status fields, and existing references first, then open only candidates relevant to the affected area or decision.
5. Ask only when the revision direction, affected scope, ADR decision, or supersede action remains ambiguous. An explicit user instruction already settles the stated decision.
6. Draft final spec/plan/tasks contents without changing the worktree. Add the dated revision record; synchronize plan decisions, risks, current-truth follow-up, tasks, and validation. Draft the conditional ADR from the packaged template when required.
7. Update sibling alignment and propose nested `AGENTS.md` guidance only when a changed module is genuinely exceptional.
8. Run an inline trace for repository- or user-sourced corrections; use the decision-completeness auditor only for an ADR, unconfirmed high-impact choices, or conflicting/weak evidence.
9. Show one consolidated diff, obtain one apply approval, then apply once. Rejection or a blocking audit leaves the worktree unchanged.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking and leaves the worktree unchanged.

## Invariants

- Do not silently rewrite a frozen spec.
- Every material spec change has a dated revision record with reason and decision source. ADRs are conditional, not a generic change log.
- `spec.md`, `plan.md`, and `tasks.md` stay consistent after the revision.
- Module-boundary changes update affected module notes and future validation expectations.
- Specific decisions must be traceable to user input, existing project convention, revision record, or an applicable ADR.
- If the revision changes durable behavior recorded in `docs/specs/<area>.md`, keep the domain document read-only during this in-flight revision and record `current truth update pending` for [`feature-done`](feature-done.md) → [`feature-archive`](feature-archive.md). If it supersedes earlier specs, record a follow-up for [`feature-archive`](feature-archive.md) or [`spec-reconcile`](spec-reconcile.md) to mark and archive them.
- When an ADR is required, use metadata/reference search to find relevant `Accepted`/`Proposed` candidates; never load the whole ADR directory. With user approval, flip an overturned ADR's status to `Superseded by NNNN` and note the takeover in the new ADR.

## Validation

- Ask decision questions only for unresolved ambiguity, then use one consolidated proposed-diff approval. Draft and audit final contents without changing the worktree; apply once after approval.
- Confirm the next implementation step and whether [`spec-quality-check`](spec-quality-check.md) should be rerun.
