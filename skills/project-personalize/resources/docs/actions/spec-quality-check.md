# spec-quality-check

Canonical semantic readiness check before implementation or after a material accepted revision.

## Use When

A feature record is ready to guide implementation, or the user explicitly asks to check it. The same check
judges the record by its decision-relevant content and evidence, including linked attachments when relevant. Reuse a completed check when its decision sources and affected inputs remain unchanged. For a revision, follow [the revision validation rule](spec-revise.md#validation) to determine whether this action is needed.

A pending correction to an accepted contract returns `N/A(route: spec-revise)` before mechanical checks or
reviewer dispatch. Drafts can be edited normally. This action does not implement code or change requirements.

## Inputs

Read the feature record, applicable project decisions and attachments that affect the judgment.
Supply the exchange or source showing which material effects the user accepted. For a correction,
include the exact user statement or stable accepted source, the replacement and the rule it supersedes.

## Requirements Reconciliation

Apply the [reviewer method](../reviewers/spec-quality-reviewer.md#requirements-reconciliation) to compare
sources with the proposed record in both directions. The transient source map is just the necessary source
references, not a new persisted artifact. Report `ALIGNED`, `MISMATCH` or `SOURCE GAP`; a material mismatch or
source gap blocks the affected implementation. Existing code proves what happens, not what the user accepted.
A recorded experiment is evidence; it is not automatically an acceptance decision.

## Checks

Check meaning, not template completion. Read and apply the canonical
[review method](../reviewers/spec-quality-reviewer.md#review), including its conditional checks, in both
main-session and independent review. Keep assessment criteria there rather than maintaining another checklist here.

Mechanical checks establish readable inputs, usable references and detect literal unresolved placeholders
where an actual decision is needed. They cannot establish clarity or readiness from heading counts, file
counts, a filled template, or the presence of a word. A blank scaffold is not an accepted contract.

## Reviewer Execution

The main session performs the above semantic check in the current flow. Run a fresh independent
[spec-quality reviewer](../reviewers/spec-quality-reviewer.md) when requested, required by the project, or
when the change affects security/authorization, data migration, shared contracts, durable architecture or
release/recovery boundaries requiring independent judgment. Simple well-understood work does not require
another review merely because it has a spec. Reconciliation remains required when independent review is N/A.

Dispatch only after required inputs and source decisions are available, under the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Record applicable review
execution truthfully, including whether it ran as an independent dispatch or in the main session; missing
required execution blocks `APPROVED`. Do not dispatch a reviewer to invent a missing
user decision. Review the affected boundary, not every project document or unrelated historical decision.

## Verdict and continuation

- `APPROVED`: required checks pass, critical direction questions are resolved, acceptance is actionable and
  every applicable review boundary completed reliably. The delivery verdict `READY` belongs to [`feature-done`](feature-done.md).
- `BORDERLINE`: a concrete residual risk is identified with an explicit decision needed before affected
  implementation; reuse existing unchanged risk acceptance instead of asking twice.
- `BLOCKED`: a material mismatch, unsupported decision, unexecutable acceptance or missing required evidence
  prevents reliable implementation. State the specific gap and next useful action.

A standalone check is read-only. Return to the enclosing request under the
[implementation authorization rule](feature-init.md#record-and-authorization). Once the user has
accepted the reviewed approach and authorized implementation, an approved record can be marked `已确认`.

## Invariants

- This checks the implementation basis, not whether the code is delivered.
- Unchanged settled decisions and evidence remain valid; new material discoveries use
  [Implementation Scope Stop](feature-init.md#implementation-scope-stop).
- Findings cite the affected decision and evidence; source authority is fail-closed.
- Do not rewrite expectations to accommodate a failed trial or test.
