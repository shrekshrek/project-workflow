# feature-done

Check whether a feature is ready to deliver and record the result and supporting evidence in its spec.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action runs the delivery check: completion preflight, tests and automated checks (L1), applicable
project-convention and requirement reviews (L2/L3), comparison with current product documentation,
and a delivery receipt. Both adapters provide one entry point for this process.
Each gate run reviews one stable final snapshot and returns its terminal verdict. It never repairs
implementation or non-receipt artifacts; a non-READY verdict returns control to the enclosing request.

## Completion Preflight

Before running broader checks or starting reviewers, check that the work is ready for review:

- The selected artifact is active and has no unfinished checklist item or unresolved material placeholder
  in its contract, plan, task checklist, Verification, or implementation record. Ignore the canonical
  `## Proof Bundle`, any `## Previous Proof Bundle ...` history, and endpoint-owned receipt/status fields;
  those are outputs of this action, not completion inputs.
  Keep task checklists limited to implementation, review, and check outcomes that can finish before this
  endpoint runs. Represent `feature-done`, READY, receipt/status writes, and archive eligibility only as
  endpoint or lifecycle outputs. A circular checklist item that depends on one of those outputs returns
  `NEEDS WORK` for artifact cleanup before expanded L1.
  A tracked feature normally enters at `已确认`; `已实现` is accepted only for an explicit same-feature
  rerun whose non-receipt contract has not changed. Draft, superseded,
  abandoned, or archived artifacts do not enter this gate. A knowingly incomplete artifact returns
  `NEEDS WORK` without running expanded L1.
- For a reused accepted artifact, confirm that its accepted outcome/boundary remain current and its
  Verification/tasks are actionable. Apply [document maintenance](feature-init.md#document-updates-and-context):
  if current obligations, authorization or next actions require reconstructing competing revisions, return
  `NEEDS WORK` for in-place consolidation before expanded L1. Necessary detail or length alone is not a blocker.
  Any declared phase-focused checks must be complete; valid same-task results are
  consumed under the normal L1 reuse rules rather than recreated at the endpoint.
- Use Git to identify all changes belonging to this feature before judging its scope.
  With uncommitted changes, review everything from `base` to the working tree, including Git-reported
  untracked paths. Use `HEAD` as `base` only when all feature work is uncommitted. Otherwise use the explicit
  PR base or target-branch merge base so committed work is included too.
  With a clean working tree, use one exact `base..reviewed` commit range.
  If the repository has no first commit, return `BLOCKED` before expanded L1 and explain that a baseline commit excluding the feature changes is needed before retrying.
  When onboarding and the first feature are both uncommitted, use the setup record and actual diff
  (individual hunks for shared files) to identify which changes belong to each. If ownership is clear,
  accept the feature in place without a separate commit. Note the distinction in the existing receipt,
  apply the project conventions in the working tree, and cover any setup changes the feature depends on.
  If ownership is unclear, name the ambiguous changes and ask the user before expanded L1. Other mixed
  features or unrelated work still require isolation or a commit range, as does an ambiguous base.
- Compare actual changes to responsibilities and important behavior with the agreed behavior, constraints
  and delivery scope. For each new option or mode, identify who needs it and which agreed scenario needs
  its settings. Options without that support return `NEEDS WORK`.
  An undeclared [declarable surface](README.md#shared-runtime-conventions) returns `NEEDS WORK` before
  expanded L1 and routes through [Implementation Scope Stop](feature-init.md#implementation-scope-stop).
  If it is unclear which feature owns the extra change, return `BLOCKED`.
- Before expanded L1, verify any agreed task to record or enforce project rules (Guidance Placement).
  When plan Sibling Alignment or an accepted task says `Codify`, check that the promised root/tier/module
  `AGENTS.md` and any adopted one-line `CLAUDE.md` alias exist, or that the promised automated enforcement exists.
  Verify the named subtree
  exists (or is created by this feature) and an adopted alias is byte-equivalent to `@AGENTS.md\n`. A missing
  promised target returns `NEEDS WORK` and reviewers record `not-run(completion preflight)`; an unresolvable
  promised owner returns `BLOCKED`. Difference-only content, inheritance, and semantic placement belong to L2.
  Only an accepted artifact or project convention establishes a Codify commitment.
- When an agreed user flow is quick to check and likely to expose important failures, test it before
  broader or lower-level checks. A failure returns `NEEDS WORK` before expanded L1; otherwise continue with the
  artifact's ordered Verification.
- A passing preflight journey becomes an ordinary L1 evidence entry and is not rerun unless its relevant inputs
  change.

A preflight failure replaces the canonical receipt with reviewers `not-run(completion preflight)` and current truth
`not-run(non-READY prerequisite)`. An explicit rerun of an active `已实现` feature preserves its exact prior
non-empty READY receipt under a uniquely named
`## Previous Proof Bundle (superseded <date-or-sequence>)` heading. A superseded receipt may instead be a short
entry retaining its verdict, reviewed identity, invalidation reason and exact retrievable immutable commit/path
reference to the original receipt. Verify that reference contains the receipt, not merely the reviewed code;
otherwise retain the original in place. Do not require a new file or commit just for compaction.
Ordinary non-READY reruns replace the canonical receipt in place; full Previous Proof Bundles are reserved
for reopened deliveries whose old receipt has no verified immutable reference. A dated one-line attempt
summary is enough for other retries when useful.
A non-READY rerun returns the status to `已确认`; a READY rerun keeps `已实现`.
This action owns these receipt and status updates; they do not revise the requirements.

## Inputs

- Feature directory or slug.
- Current diff or changed files.
- Project conventions from root and applicable nested `AGENTS.md`, plus host-specific convention files when the active adapter supplies them.
- The accepted `spec.md`, any relevant optional design/work notes, and directly cited accepted ADR/current-truth
  sources needed by its impact boundary, Codify commitments, or current-truth decision.
- Related domain documents (`docs/specs/<area>.md`) when the feature touches a declared product/system area.
- Test/check command results.

## Review Layers

- L1 Mechanical: run explicit Verification plus standard commands for each changed project. Follow the shared
  [verification escalation](README.md#shared-runtime-conventions) rule.
- L1 execution: reuse a passing same-task check only while its command, relevant inputs, and scope classification
  are unchanged. After a fix, rerun affected checks and checks that depend on them. Expand coverage only when
  the fix changes shared code or interfaces, a contract, dependency or build configuration. Run expensive commands
  sequentially when they share caches. Start with cheaper checks that can expose the relevant failure;
  run independent checks of similar cost together.
  Once a necessary lower-cost failure makes READY impossible, skip unrelated higher-cost checks unless needed
  for diagnosis or an explicitly requested full sweep.
- L1 prerequisite: a final READY candidate must finish all independently executable required checks before
  review. An early necessary failure may return `NEEDS WORK` without unrelated higher-cost checks; unavailability
  yields `BLOCKED`. Either suppresses L2/L3 and current-truth checks but still writes the receipt, with applicable
  reviewer slots `not-run(L1 prerequisite)` and current truth `not-run(non-READY prerequisite)`.
- L2 Project conventions: required when the project/user asks for it, convention sources change, or a
  qualitative convention/architecture concern cannot be settled by mechanical checks. Otherwise record a
  reasoned N/A. Documentation size does not determine applicability.
- L3 Change-spec compliance: required for a concrete behavior, security, data, recovery or shared-contract
  concern requiring independent judgment, or an explicit project/user requirement. Otherwise record a
  reasoned N/A. Use `spec-reviewer` against the accepted behavior and verification, regardless of record layout.
- All acceptance verification: execute or mechanically check every applicable obligation, whether independent
  reviewers apply or not. An unverified or failed obligation blocks READY. Optional files and headings do not
  create or remove obligations. A failed test is not permission to rewrite an expected result.
- Evidence deduplication: when one command/assertion proves several related Verification items, execute it once and
  map that result to each obligation.
- Long-run execution: before a materially long, paid, external, opaque, high-volume or restart-costly endpoint
  check, present the actual next run at `feature-init`'s slice handoff, reusing its concise execution envelope.
  Apply [feature-init’s feedback and stop boundaries](feature-init.md#implementation-scope-stop); an accepted
  envelope does not waive a pending handoff. Report observable progress and disclose unavailable counts.
- Domain doc check: defer it until L1 and applicable L2/L3 and acceptance verification form a READY candidate. Earlier
  failures record `not-run(non-READY prerequisite)`. For a candidate, compare only a declared/relevant
  `docs/specs/<area>.md`: resolved durable behavior with no existing area document is `update pending`; genuinely
  unknown ownership is `area unresolved`; internal/non-durable work is `no relevant domain doc`.
- Delivery receipt: write compact, decision-relevant evidence to the canonical `## Proof Bundle` section in `spec.md`. The endpoint response shows a human summary and links the receipt; it does not inline the full receipt.

## Reviewer Execution

Follow the prerequisites and applicability in [Review Layers](#review-layers), then the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Finish implementation and non-receipt
artifact edits first. Reviewers and this action are read-only outside endpoint-owned receipt/status writes.
A non-READY verdict reports its blockers and `Next` routes, then ends this gate. A review-only request stops
at the verdict. For a current authorized implementation or delivery request, a `direct-repair` blocker may
continue outside the gate as one focused repair slice after that report; other routes keep their decision and
permission boundaries. Rerun only the affected closure within that repair slice, then hand off the blocker,
fix, changed evidence and remaining risk. Before a fresh endpoint run, apply
[feature-init's feedback and stop boundaries](feature-init.md#implementation-scope-stop), including
non-converging repair/verification. Each run creates a fresh snapshot, reuses only unchanged same-task L1 evidence, and reruns affected checks
and applicable reviews; reference valid evidence instead of restating the plan or copying failed receipts.

Treat the accepted feature artifact as the requirements baseline; handle later material decisions through
[Implementation Scope Stop](feature-init.md#implementation-scope-stop) before reviewing implementation fidelity.

Prepare one temporary review snapshot: repository identity, Git-derived changed paths, L1 evidence,
relevant specs and supporting records, and project rules.
Collect applicable project rules from the filesystem: for every changed path, collect the
root `AGENTS.md` and applicable nested `AGENTS.md` files along its directory path. Combine them without
duplicates, then add project-local host rules selected by the active adapter. Caller-supplied
paths are hints only. Verify the collected rules before starting reviewers.
For every required verification item, supply the result or state what remains unverified. Missing or unreadable
required input returns `BLOCKED` with `not-run(review-package incomplete)`. Each evidence entry records the
requirement, command/assertion, `run` or `same-task reuse`, result, inputs covered and original reference.
Reviewers use these results instead of rerunning checks. If promised evidence is missing, their result is
`UNRELIABLE`; a supplied failure or explicit gap is a review finding.
Route convention sources to L2 and the change-spec package to L3.

When both reviews apply, dispatch L2 and L3 together for changes to convention sources, shared boundaries,
security/authorization, migration or release/recovery, or when the user/project requests parallel review.
If capacity prevents parallel execution, use sequential fresh dispatch. Otherwise dispatch L3 first;
if it passes and the snapshot is unchanged, dispatch the applicable L2 once against that same snapshot.
When only one reviewer applies, run only that reviewer. If L3 does not pass, end the run and record L2 as
`not-run(awaiting final L3 candidate)`; this is valid only for a non-READY verdict.
Before combining results, check that the reviewed inputs have not changed in a way that affects the verdict.
Such a change returns `BLOCKED` with `invalidated(review-input drift)`.

Apply the shared reviewer's single execution-fallback rule. If it still produces no terminal result, return
`BLOCKED`. A later gate run creates a fresh snapshot. Keep snapshots and applicability maps transient.

## Delivery Receipt (`## Proof Bundle` on disk)

Append the receipt to `spec.md` only at delivery; do not prefill empty result fields. `feature-archive`
consumes that single canonical receipt without requiring optional attachments.

Persist only fields with a downstream consumer. The exact prose layout is flexible, but the receipt must make
these facts unambiguous:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: in Git, record either `git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` for an immutable state,
  or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` for the current worktree. For a `BLOCKED` receipt in a repository with no first commit,
  state in this field that the baseline commit is unavailable in place of the Git coordinates. Also record endpoint-owned
  output paths. Capture the [preflight population](#completion-preflight) coordinates before endpoint writes;
  do not substitute a manual list or hash. Outside Git, record the explicit reviewed input paths.
- `Checks`: commands, execution mode (`run` or `same-task reuse`), exit status, and concise test totals. A reused check must retain or reference its original same-task result and must not be presented as newly executed.
- `Reviews`: for L2 and L3, record `completed`, `N/A`, `not-run`, or `invalidated`, with the verdict and
  baseline for completed reviews and a concise reason for every other state. Add findings, unverified
  obligations, or ambiguities only when non-empty. READY needs valid completed coverage for each applicable reviewer;
  a non-READY sequential run may record L2 `not-run(awaiting final L3 candidate)`. Record actual applicability,
  never infer a review exemption from the presence or absence of a file.
  Record for each completed review whether it ran as an independent dispatch or in the main session; the
  mechanism does not change applicability or block the gate, but a main-session review is never presented as
  an independent one. Reviewer identifiers remain optional diagnostics; coverage evidence remains
  required.
- `Current truth`: `not-run(non-READY prerequisite)` / no relevant domain doc / aligned / update pending / area
  unresolved. Use `area unresolved` only for durable behavior whose ownership is genuinely unknown.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Next`: only for a non-READY verdict, classify each blocker or coherent blocker group as `direct-repair`,
  `spec-revise`, `user-decision`, or `separate-boundary`. Keep the route tied to its blocker; continuation follows
  [Reviewer Execution](#reviewer-execution) above.
- `Drift`: only actionable project-convention suggestions already produced by L2; omit when empty. Persist it
  elsewhere only when the user explicitly asks to revise conventions. Guidance-placement suggestions name the
  evidence, proposed root/tier/module/mechanical owner, and whether `agents-md-revise` should handle it. Convention
  edits still require user authorization.

Validate each applicable L2/L3 PASS against its reviewed-scope identity and coverage declaration before compacting it.

For `READY`, change only `spec.md`'s top status marker to `已实现`; non-READY reruns follow the lifecycle rule above.

## User handoff

Start with the actual change against the accepted approach, including material deviations or limitations.
When the user needs to operate the result to assess it, include the shortest useful entry point or usage
example with its expected result. Otherwise a clear explanation of the change is sufficient. Do not invent
access or claim an unperformed user test.
Report the verdict, evidence summary, material limitations and receipt link. Include blockers and
their next actions when present. For READY, report archive pending if acceptance ends the request.
When the request includes immediate closure, pass the receipt to archive and give one final handoff
with the observed archive outcome and receipt location. If closure stops, report the READY delivery
and the specific pending archive work.

## Verdict

- `READY`: L1 passes, applicable L2/L3 are evidence-backed PASS or an allowed explicit `N/A`, all applicable acceptance verification passes, no blocking current-truth issue remains, and the delivery receipt is complete. Explicitly nonblocking advisories are allowed.
- `NEEDS WORK`: required checks fail, or applicable reviews, acceptance verification, or current-truth checks identify blocking, fixable findings.
- `BLOCKED`: required context/spec is missing, required checks cannot run for an environmental/input reason,
  the owner-supplied review package is incomplete, reviewed inputs drift after dispatch, or applicable required
  reviewer-dispatch/execution evidence is missing in a way that prevents a reliable verdict.

`READY` means the implementation passes checks against the feature artifact; a request to finish or deliver stops
here with archive pending. When [closure authorization](feature-archive.md#closure-authorization) is established,
continue to explicit-candidate `feature-archive` without asking again. Periodic sweep
remains available. Record `update pending` in the receipt and merge it during archive.

## Gate Health

Use the receipt's L2/L3/Drift counts for gate health. Repeated zero findings are a cost/calibration signal; inspect
history only when the user requests calibration. Establish reviewer sensitivity with the repeatable
[known-bad endpoint smoke](https://github.com/shrekshrek/project-workflow/blob/main/docs/examples/reviewer-mutation-smoke.md).

## Invariants

- Historical specs remain archived; delivery evidence goes to the canonical receipt.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
