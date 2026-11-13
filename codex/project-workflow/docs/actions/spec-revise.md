# spec-revise

Canonical action for materially correcting an accepted, unarchived feature contract before or after implementation.

## Use When

- An accepted `spec.md` needs a material correction, including before implementation starts.
- The latest user instruction materially corrects, rejects, removes, or replaces behavior in an accepted
  contract, even when the user does not name this action and phrases the request as "fix it" or "continue".
- A delivered-but-unarchived feature needs to reopen because a material contract, scope, plan, or Verification omission was discovered after `feature-done`.
- Implementation discovers a material scope delta: an undeclared
  [declarable surface](README.md#shared-runtime-conventions), or a simpler outcome that removes speculative
  capability.
- A module boundary or architecture decision must be adjusted after the original plan.
- The change would otherwise rewrite history or hide a requirement shift.

Unaccepted drafts may be edited directly; acceptance follows the user's decisions, not the file's status label.
An implementation regression under an unchanged accepted contract does not use this action: repair the implementation and explicitly rerun `feature-done`, which owns delivery-verdict replacement and any `已实现` → `已确认` rollback.

## Inputs

Implementation can reveal new tasks and better boundaries. Ordinary details under unchanged acceptance
continue directly; material findings first pause affected work and get a user decision. After the confirmed
local revision, return to the already authorized implementation rather than restarting initialization or
reconfirming unchanged choices. Preserve valid unaffected tests and evidence; rerun only affected checks and
their dependency closure. A test failure alone is not a requirement change.


- Feature directory.
- Requested change and reason.
- For a current-conversation contract correction: the exact user statement, its normalized decision, and the
  older accepted rule it supersedes. A caller-authored "user confirmed" paraphrase alone is not authority.
- The accepted record and affected linked content; organize revised material under feature-init’s record rules.
- ADR directory state.

## Outputs

- Updated `spec.md`, the active feature's sole accepted record, with changed text and a revision record.
- Updated affected decisions/design notes where they already live, without duplicating the accepted rules.
- Updated affected implementation/checklist items if task order, scope, or validation changed; the checklist may be inline.
- The accepted scope, constraints, affected responsibilities, any conditional delivery boundary, and the actual discovered impact delta.
- New ADR only when the revision changes architecture/module boundaries, establishes a durable cross-feature technical decision, or supersedes an existing ADR.
- For a reopened delivery: status returned to `已确认`, the prior receipt preserved under [feature-done’s receipt-history rule](feature-done.md#completion-preflight), and a fresh empty canonical `## Proof Bundle` ready for the next `feature-done`.

## Workflow

1. Resolve the active accepted record under [feature-init's record rules](feature-init.md#record-and-authorization). A delivered feature may reopen while active and unarchived; archived work requires a successor change. Neither a new task nor a different file layout requires a new feature.
2. Confirm that the discovery is a material contract, verification, scope, plan, or module-boundary error.
   Stop implementation work for the discovered delta while its direction is unresolved; do not keep adding
   code, tests, migrations, or compatibility paths that could deepen the rework.
   Route the delta through `feature-init`'s accepted-boundary and scope-viability rules. Necessary detail inside
   the same outcome continues; an independent outcome becomes a child only if the user chooses it; capability without a current need is
   removed or deferred; and materially wider inseparable work needs concrete coupling and user acceptance. A
   current user correction that conflicts with accepted behavior is a `contract-correction`: do not run
   `spec-quality-check` against the stale artifact or continue the affected work before revising the
   synchronized artifacts.
3. Resolve the accepted boundary, actual affected modules/files and Git overlap, then
   fresh-read applicable conventions. Do not treat already-written implementation as evidence that the
   expansion belongs in the feature.
4. Classify `ADR_REQUIRED`: yes only for architecture/module boundaries, durable cross-feature technical decisions, or superseding an ADR. When yes, search ADR filenames, titles, status fields, and existing references first, then open only candidates relevant to the affected area or decision.
5. Close the material correction set using [conversation rules](feature-init.md#conversation-and-discovery).
   Reuse accepted replacements. Ask only about consequences the user has not decided. For changed scope,
   revisit the affected delivery boundary and current need.
6. Draft the affected behavior and acceptance example together. Record the exact current user statement
   or durable source, normalized replacement rule, and older rule it supersedes in one dated entry.
   Check the draft against that source, including exclusions and any affected references or tests.
   A removed behavior must also disappear from fallback paths. Follow [document maintenance](feature-init.md#document-updates-and-context).
   Invalidate only evidence whose inputs or obligations changed. For reopened delivery preserve the previous
   receipt and reset the status and current receipt as specified under Outputs.
7. Update sibling alignment only when a changed tier/module introduces a durable parent difference or selects
   Codify. At that boundary, read and apply the canonical
   [Guidance Placement Contract](agents-md-revise.md#guidance-placement-contract) and name the exact owner and
   source; otherwise do not load it.
8. Use inline trace or independent audit under the [decision-completeness auditor's dispatch boundary](../reviewers/decision-completeness-auditor.md#dispatch-boundary).
9. Apply the synchronized revision when the user's request already authorizes it. Ask only for an unresolved
    material decision or an external write; rejection or a blocking audit leaves the worktree unchanged.

When the active spec cites a Blueprint, classify whether the revision remains inside its slice and accepted
contracts. A project-goal, scope, durable-architecture, data-ownership or trust-boundary change is an upstream
Blueprint impact: preserve the local revision trace, stop affected work, and route the project decision back to
Blueprint. Do not silently edit or replace the upstream plan from Workflow.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking and leaves the worktree unchanged.

## Invariants

- Do not silently rewrite an accepted spec.
- Every material spec change has a dated revision record with reason and decision source. ADRs are conditional, not a generic change log.
- The accepted record and any affected existing attachments stay consistent after the revision; no optional file is mandatory.
- Reopening preserves historical evidence but makes it ineligible for archive until a new `feature-done` writes READY; there is exactly one canonical `## Proof Bundle` and any superseded receipt uses a differently named heading.
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
- For a clear local correction, the source-to-draft check above completes the revision. Report the
  changed behavior and acceptance example, then resume any previously authorized work. A request
  limited to revising the plan ends with the updated plan.
- Use [spec-quality-check](spec-quality-check.md) on the affected boundary when the user or project
  requires it, sources conflict, or the correction changes delivery viability, ownership, permissions,
  data handling or another high-impact contract. Reuse the resolved decision and its source.
