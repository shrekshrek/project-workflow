# spec-revise

Canonical action for changing a frozen feature contract after implementation has started.

## Use When

- A confirmed `spec.md` needs to change during implementation.
- The latest user instruction materially corrects, rejects, removes, or replaces behavior in an accepted
  contract, even when the user does not name this action and phrases the request as "fix it" or "continue".
- A delivered-but-unarchived full-lane feature needs to reopen because a material contract, scope, plan, or Verification omission was discovered after `feature-done`.
- Implementation discovers a material scope delta: an undeclared persistent state, API, role, workflow,
  management surface, queue, runtime, Provider/responsibility area, contract, migration, authorization
  rule, release boundary, or a simpler outcome that removes speculative capability.
- A module boundary or architecture decision must be adjusted after the original plan.
- The change would otherwise rewrite history or hide a requirement shift.

Draft specs may be edited directly before implementation starts.
An implementation regression under an unchanged accepted contract does not use this action: repair the implementation and explicitly rerun `feature-done`, which owns delivery-verdict replacement and any `已实现` → `已确认` rollback.

## Inputs

- Feature directory.
- Requested change and reason.
- For a current-conversation contract correction: the exact user statement, its normalized decision, and the
  older accepted rule it supersedes. A caller-authored "user confirmed" paraphrase alone is not authority.
- Existing `spec.md`, `plan.md`, `tasks.md`.
- ADR directory state.

## Outputs

- Updated `spec.md` with changed text and a revision record.
- Updated `plan.md` prior decisions and affected module/architecture sections.
- Updated `tasks.md` if task order, scope, or validation changed.
- The accepted Scope, Constraints, Module Impact, any conditional delivery boundary, and the actual discovered impact delta.
- New ADR only when the revision changes architecture/module boundaries, establishes a durable cross-feature technical decision, or supersedes an existing ADR.
- For a reopened delivery: status returned to `已确认`, the prior receipt preserved under a uniquely named `## Previous Proof Bundle (superseded <date-or-sequence>)`, and a fresh empty canonical `## Proof Bundle` ready for the next `feature-done`.

## Workflow

1. Resolve the active full-lane feature and read `spec.md`, `plan.md`, and `tasks.md`. Light-lane work has no frozen spec; upgrade it only when the discovered risk requires a contract. A full-lane `已实现` feature may be revised only while it remains active and unarchived; an archived feature requires a successor change instead of rewriting history.
2. Confirm that the discovery is a material contract, verification, scope, plan, or module-boundary error.
   Stop implementation work for the discovered delta while its direction is unresolved; do not keep adding
   code, tests, migrations, or compatibility paths that could deepen the rework.
   Classify the scope delta before drafting:
   - `necessary-detail`: required by the same accepted outcome and inside its impact boundary; record the
     implementation decision without widening the contract
   - `contract-correction`: accepted business behavior, ownership, authorization, data disposition, or
     Verification was wrong; revise the synchronized artifacts
   - `separable-outcome`: independently acceptable/shippable/revertible work; create or hand off a child
     feature instead of absorbing it
   - `speculative-capability`: no current consumer or not necessary for the selected outcome; remove or
     defer it
   - `bundled-risk`: materially wider but inseparable; require concrete coupling and explicit acceptance
   Put minor clarification in plan prior decisions or implementation notes instead.
   A current user correction that conflicts with accepted behavior is `contract-correction`; do not run
   `spec-quality-check` against the stale artifact or continue implementing it first.
3. Resolve the accepted boundary, actual affected modules/files and Git overlap, then
   fresh-read applicable conventions. Do not treat already-written implementation as evidence that the
   expansion belongs in the feature.
4. Classify `ADR_REQUIRED`: yes only for architecture/module boundaries, durable cross-feature technical decisions, or superseding an ADR. When yes, search ADR filenames, titles, status fields, and existing references first, then open only candidates relevant to the affected area or decision.
5. Before drafting, close the material correction set from the current conversation: normalize the latest
   explicitly accepted replacement, preserve each explicit supersession/exclusion, and identify only conflicts
   whose interpretation could change the revised contract. Apply `feature-init`'s conversational-judgment rule;
   settled corrections proceed without ceremonial reconfirmation.
   When a decision is required, report one compact `Scope stop`: discovered delta, mismatch with the
   accepted boundary, current necessity, recommended remove/narrow/child/revise direction, and the smallest
   useful decision set. Do not continue the delta until the user decides.
6. When the revision changes the accepted impact boundary, current-consumer/necessity trace, or delivery
   shape, proportionately reapply only the affected `feature-init` impact/necessity and scope-viability
   questions before drafting, keeping routing and unrelated settled decisions intact. If it
   introduces another independently acceptable, shippable, and revertible outcome without mandatory
   coupling, ask the user to create a child feature or explicitly accept the bundled-delivery risk. When
   the outcome is deferred to a child, record the boundary in plan Prior decisions when it needs durable
   handoff; reuse an issue/PM reference when one already exists or the user asks to create one, but do not make
   an external tracker a prerequisite. Record an accepted bundle in the
   existing plan prior-decisions or risks section. Remove speculative capability instead of creating a
   deferred implementation obligation when the user does not need it preserved.
7. For every contract correction, build a compact supersession trace before drafting: exact current user
   statement when available, normalized replacement rule, older rule being replaced, and affected
   spec/plan/tasks/ADR locations. Preserve exclusion and exclusivity semantics such as "remove", "no longer",
   "only", and "single source"; do not narrow them into an optional or conditional fallback without explicit
   authority. Then draft final spec/plan/tasks contents without changing the worktree. Add the dated revision record;
   synchronize plan decisions, any conditional delivery boundary, risks, current-truth follow-up, tasks, and
   validation. Update the Prior decisions source trace for each material correction and explicitly identify
   the older decision it supersedes; never rely on chat memory as the only durable source. Any completed task or proof obligation whose contract, inputs, or affected scope changed
   becomes incomplete again; retain prior evidence only as explicitly superseded history, never as current
   proof. Draft the conditional ADR from the packaged template when required. For a delivered-but-unarchived
   feature, also return `已实现` to `已确认`, move the exact previous receipt under a uniquely named
   dated-or-numbered superseded heading, and recreate one empty canonical `## Proof Bundle`; never edit the
   old receipt into a new verdict.
8. Update sibling alignment and resolve Guidance Placement only when a changed tier/module introduces a
   durable parent difference or selects Codify. Name the exact root/tier/module/mechanical owner and source;
   nested guidance contains differences only and any project-adopted nested `CLAUDE.md` is a one-line alias.
   Do not propose a file for ordinary modules, product semantics, temporary details, or directory symmetry.
9. Run an inline trace for repository- or user-sourced corrections; use the decision-completeness auditor only for an ADR, unconfirmed high-impact choices, or conflicting/weak evidence.
10. Apply the synchronized revision when the user's request already authorizes it. Ask only for an unresolved
    material decision or an external write; rejection or a blocking audit leaves the worktree unchanged.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking and leaves the worktree unchanged.

## Invariants

- Do not silently rewrite a frozen spec.
- Every material spec change has a dated revision record with reason and decision source. ADRs are conditional, not a generic change log.
- `spec.md`, `plan.md`, and `tasks.md` stay consistent after the revision.
- Reopening preserves historical evidence but makes it ineligible for archive until a new `feature-done` writes READY; there is exactly one canonical `## Proof Bundle` and any superseded receipt uses a differently named heading.
- A material scope expansion, contraction, or semantic correction rechecks delivery coherence, current
  necessity, and impact completeness. `spec-quality-check` must rerun when the revision changes scope
  viability, the accepted delivery boundary, or any high-impact business/ownership/authorization/data rule.
- External tracker edits do not revise this feature implicitly. Adopt them only through an explicit draft edit or this action when they change the active contract.
- Module-boundary changes update affected module notes and future validation expectations.
- Specific decisions must be traceable to user input, existing project convention, revision record, or an applicable ADR.
- A material user correction is never durably sourced only as a caller-written "user confirmed" summary. Its
  revision trace records the normalized replacement, what it supersedes, and an exact current statement or
  stable external/durable source that supports that interpretation.
- If the revision changes durable behavior recorded in `docs/specs/<area>.md`, keep the domain document read-only during this in-flight revision and record `current truth update pending` for [`feature-done`](feature-done.md) → [`feature-archive`](feature-archive.md). If it supersedes earlier specs, record a follow-up for [`feature-archive`](feature-archive.md) or [`spec-reconcile`](spec-reconcile.md) to mark and archive them.
- When an ADR is required, use metadata/reference search to find relevant `Accepted`/`Proposed` candidates; never load the whole ADR directory. With user approval, flip an overturned ADR's status to `Superseded by NNNN` and note the takeover in the new ADR.

## Validation

- Apply the canonical conversational-judgment rule to decision questions. Draft and audit the synchronized
  contents before apply; the current request's revision authorization remains in effect.
- Decision closure reconciles material current-conversation corrections before drafting; it creates no new
  approval state and never turns already settled decisions into another question set.
- Confirm the next implementation step. Rerun [`spec-quality-check`](spec-quality-check.md) whenever scope
  viability, current necessity, impact baseline, or a high-impact rule changed; otherwise state why it is
  unnecessary.
