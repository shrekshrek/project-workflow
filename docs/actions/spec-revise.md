# spec-revise

Correct agreed requirements or plans for a feature that has not been archived, before or after implementation.

## Use When

- An accepted `spec.md` needs a material correction, including before implementation starts.
- The user's latest instruction materially changes previously accepted behavior, even if the user does not name this action.
- A delivered-but-unarchived feature needs to reopen because a material contract, scope, plan, or Verification omission was discovered after `feature-done`.
- Implementation reveals an important scope change: an undeclared
  [declarable surface](README.md#shared-runtime-conventions), or a simpler solution that removes capability
  with no current need.
- A module boundary or architecture decision must be adjusted after the original plan.
- The change would otherwise rewrite history or hide a requirement shift.

Unaccepted drafts may be edited directly; acceptance follows the user's decisions, not the file's status label.
If agreed behavior is unchanged and the code is wrong, fix the code instead of revising the requirements.
Then explicitly rerun `feature-done`; it replaces the delivery verdict and handles any `已实现` → `已确认` rollback.

## Inputs

- Feature directory.
- Requested change and reason.
- For a current-conversation contract correction: the exact user statement, its normalized decision, and the
  older accepted rule it supersedes. A caller-authored "user confirmed" paraphrase alone is not authority.
- The accepted record and affected linked content; organize revised material under feature-init’s record rules.

## Outputs

- A revised `spec.md` with the current behavior, acceptance example and dated reason for the change.
- Affected design notes, module responsibilities, delivery conditions and implementation tasks updated
  where they already live. Record the difference from the agreed plan. Include an ADR when step 4 applies.

## Workflow

1. Resolve the active accepted record under [feature-init's record rules](feature-init.md#record-and-authorization). A delivered feature may reopen while active and unarchived; archived work requires a successor change. Neither a new task nor a different file layout requires a new feature.
2. Check whether requirements, verification, scope, plan or module responsibilities need an important correction.
   While the direction is unresolved, stop affected code, tests, migrations and compatibility work that could
   deepen rework. Apply the [implementation scope-stop rule](feature-init.md#implementation-scope-stop)
   and discuss any inseparable wider impact with the user.

   A user correction that conflicts with agreed behavior is a `contract-correction`: do not run
   `spec-quality-check` against the stale artifact or continue affected implementation before updating
   the spec and affected linked records.
3. Identify the agreed scope, affected modules/files and overlap with other Git changes. Reread applicable
   project conventions. Code already written does not authorize expanding the feature.
4. An ADR is required (`ADR_REQUIRED`) for a change to architecture or module boundaries, a durable
   cross-feature technical decision, or replacement of an existing ADR. Only then check filenames, titles, status
   and references, then read only relevant Accepted or Proposed records. When replacing an ADR, identify
   it in the new decision and obtain approval before marking the old one `Superseded by NNNN`.
5. Use the [conversation rules](feature-init.md#conversation-and-discovery) to identify what must change
   and resolve remaining choices. A brief readback can confirm the replacement and its effects. If scope changes, check what needs to be delivered together and why.
6. Update the affected behavior and acceptance example together in their existing sections.
   Keep a short dated revision entry with the reason and exact current user statement or durable source.
   Reference the normalized replacement rule in the updated text and identify the older rule it supersedes,
   instead of appending a second set of current requirements and acceptance criteria.
   Check the draft against that source, including exclusions and any affected references or tests.
   A removed behavior must also disappear from fallback paths. Follow [document maintenance](feature-init.md#document-updates-and-context).
   Identify affected checks and any dependent checks to rerun. Retain evidence for unchanged inputs and
   obligations. When reopening a delivery,
   preserve the old receipt under [feature-done’s receipt-history rule](feature-done.md#completion-preflight),
   restore `已确认` and leave one empty canonical `## Proof Bundle`. A fresh READY verdict is required for archive.
7. Check whether changed tier/module rules establish a lasting difference from inherited parent rules,
   or include an agreed `Codify` task to record or enforce a rule. Only then read the
   [Guidance Placement Contract](agents-md-revise.md#guidance-placement-contract), update sibling alignment,
   and identify where the rule belongs and its source. Otherwise skip this guidance.
8. Use inline trace or independent audit under the [decision-completeness auditor's dispatch boundary](../reviewers/decision-completeness-auditor.md#dispatch-boundary).
9. Apply the revision to the spec and affected records when the user's request already authorizes it.
   Ask only for an unresolved important decision or an external write; rejection or a blocking audit leaves
   the worktree unchanged.

When the active spec cites a Blueprint, check whether the revision stays within its agreed feature scope.
A change to project goals, project scope, lasting architecture, data ownership or trust boundaries is an
upstream Blueprint impact. Keep the local revision record, stop affected work and return the project-level
decision to Blueprint. Do not silently edit or replace the upstream plan from Workflow.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking and leaves the worktree unchanged.

## Invariants

- The accepted record and any affected existing attachments stay consistent after the revision; no optional file is mandatory.
- External tracker edits do not revise this feature implicitly. Adopt them only through an explicit draft edit or this action when they change the active contract.
- Module-boundary changes update affected module notes and future validation expectations.
- Specific decisions must be traceable to user input, existing project convention, revision record, or an applicable ADR.
- If the revision changes durable behavior recorded in `docs/specs/<area>.md`, keep the domain document read-only during this in-flight revision and record `current truth update pending` for [`feature-done`](feature-done.md) → [`feature-archive`](feature-archive.md). If it supersedes earlier specs, record a follow-up for [`feature-archive`](feature-archive.md) or [`spec-reconcile`](spec-reconcile.md) to mark and archive them.

## Validation

- For a clear local correction, the source-to-draft check above completes the revision. Report the
  changed behavior and acceptance example. A plan-only request ends with the updated plan. For
  implementation, follow the [current step and checkpoint rules](feature-init.md#implementation-scope-stop).
- Use [spec-quality-check](spec-quality-check.md) on the affected boundary when the user or project
  requires it, sources conflict, or the correction changes delivery viability, ownership, permissions,
  data handling or another high-impact contract. Reuse the resolved decision and its source.
