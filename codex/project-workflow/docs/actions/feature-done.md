# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in the feature record.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the endpoint gate: completion preflight, L1, applicable L2/L3, current-truth check,
and delivery receipt. Adapters implement it as one entry point.
Each gate run reviews one stable final snapshot and returns its terminal verdict. It never repairs
implementation or non-receipt artifacts; a non-READY verdict returns control to the enclosing request.

## Completion Preflight

Run this cheap completion check before expanded L1 commands or reviewer dispatch:

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
  Verification/tasks are actionable. Any declared phase-focused checks must be complete; valid same-task results are
  consumed under the normal L1 reuse rules rather than recreated at the endpoint.
- Establish one Git-derived feature population before interpreting scope. A dirty state uses the complete
  `base`-to-worktree population: tracked changes plus untracked paths reported by Git. `base` is `HEAD` when all
  selected-feature work is uncommitted; otherwise use the explicit PR base or target-branch merge base to include
  committed and uncommitted work. A clean state uses one exact `base..reviewed` commit range. Treat the resulting
  population as indivisible and require it all to belong to the selected feature. An ambiguous base/ownership or
  mixed feature/unrelated population returns `BLOCKED` before expanded L1 and asks for isolation or a commit range.
- Compare the actual changed responsibility areas and high-impact surfaces with the accepted behavior, constraints and any applicable delivery boundary. An undeclared
  [declarable surface](README.md#shared-runtime-conventions) returns `NEEDS WORK` before expanded L1
  and routes through [Implementation Scope Stop](feature-init.md#implementation-scope-stop).
  If ownership of the extra change is ambiguous, return `BLOCKED`.
- Close every explicit Guidance Placement commitment before expanded L1. When plan Sibling Alignment or an
  accepted task says `Codify`, mechanically require either the named root/tier/module `AGENTS.md` target plus
  any project-adopted one-line `CLAUDE.md` alias, or the named mechanical enforcement. Verify the named subtree
  exists (or is created by this feature) and an adopted alias is byte-equivalent to `@AGENTS.md\n`. A missing
  promised target returns `NEEDS WORK` and reviewers record `not-run(completion preflight)`; an unresolvable
  promised owner returns `BLOCKED`. Difference-only content, inheritance, and semantic placement belong to L2.
  Only an accepted artifact or project convention establishes a Codify commitment.
- When a declared user-visible actor-to-result journey is a cheap, high-value early signal, run it before
  broader or lower-level checks. A failure returns `NEEDS WORK` before expanded L1; otherwise continue with the
  artifact's ordered Verification.
- A passing preflight journey becomes an ordinary L1 evidence entry and is not rerun unless its relevant inputs
  change.

A preflight failure replaces the canonical receipt with reviewers `not-run(completion preflight)` and current truth
`not-run(non-READY prerequisite)`. An explicit rerun of an active `已实现` feature preserves its exact prior
non-empty READY receipt under a uniquely named
`## Previous Proof Bundle (superseded <date-or-sequence>)` heading. Ordinary non-READY reruns replace the canonical
receipt in place; full Previous Proof Bundles are reserved for the active `已实现` rerun above. When a trail is
useful, keep a dated one-line attempt summary in the implementation record. A non-READY rerun returns the status to `已确认`; a READY rerun keeps
`已实现`. These receipt-history and status writes are endpoint-owned lifecycle outputs, not contract repair.

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
  are unchanged. After a fix, rerun affected checks and their dependency closure; expand only when the fix changes
  a shared surface, contract, dependency, or build configuration. Sequence cache-sharing heavyweight commands.
  Order necessary evidence by cost and discrimination; batch independent checks at the current cost tier.
  Once a necessary lower-cost failure makes READY impossible, skip unrelated higher-cost checks unless needed
  for diagnosis or an explicitly requested full sweep.
- L1 prerequisite: a final READY candidate must finish all independently executable required checks before
  review. An early necessary failure may return `NEEDS WORK` without unrelated higher-cost checks; unavailability
  yields `BLOCKED`, and applicable reviewer slots record `not-run(L1 prerequisite)`.
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
  Prior acceptance avoids re-deciding unchanged details; it does not skip that handoff or its wait. Report
  observable counts or milestones and disclose unavailable progress rather than inventing it.
- Domain doc check: defer it until L1 and applicable L2/L3 and acceptance verification form a READY candidate. Earlier
  failures record `not-run(non-READY prerequisite)`. For a candidate, compare only a declared/relevant
  `docs/specs/<area>.md`: resolved durable behavior with no existing area document is `update pending`; genuinely
  unknown ownership is `area unresolved`; internal/non-durable work is `no relevant domain doc`.
- Delivery receipt: write compact, decision-relevant evidence to the canonical `## Proof Bundle` section in `spec.md`. The endpoint response shows a human summary and links the receipt; it does not inline the full receipt.

## Reviewer Execution

Run applicable review only after L1 passes, under the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Missing applicable execution
evidence blocks `READY`; an allowed N/A is an applicability decision. Finish implementation and non-receipt
artifact edits first. Reviewers and this action are read-only outside endpoint-owned receipt/status writes.
A non-READY verdict reports its blockers and `Next` routes, then ends this gate. A review-only request stops
at the verdict. For a current authorized implementation or delivery request, a `direct-repair` blocker may
continue outside the gate as one focused repair slice after that report; other routes keep their decision and
permission boundaries. Apply [feature-init's Scope Stop](feature-init.md#implementation-scope-stop) to material
changes and non-converging repair/verification. At the repair-slice boundary, rerun only the affected closure,
hand off the blocker, fix, changed evidence and remaining risk, then wait before a fresh endpoint run. A later
authorized run creates a fresh snapshot, reuses only unchanged same-task L1 evidence, and reruns affected checks
and applicable reviews; reference valid evidence instead of restating the plan or copying failed receipts.

Treat the accepted feature artifact as the requirements baseline; handle later material decisions through
[Implementation Scope Stop](feature-init.md#implementation-scope-stop) before reviewing implementation fidelity.

Create one transient snapshot with repository identity, authoritative changed paths, L1 evidence, applicable
spec/artifacts, and convention sources. Resolve the authoritative convention population from the filesystem: for
every changed path, walk from the project root through its ancestors to the nearest applicable nested `AGENTS.md`,
then union those chains; add project-local host convention sources selected by the active adapter. Caller-supplied
paths are hints only. Validate this population before dispatch.
Every Verification obligation has evidence or an explicit gap; missing or unreadable required input returns
`BLOCKED` with `not-run(review-package incomplete)`. Each evidence entry records obligation, command/assertion,
`run` or `same-task reuse`, result, relevant-input scope, and original reference. Reviewers consume rather than
rerun it; missing supplied evidence is `UNRELIABLE`, while an explicit failed/gap entry is a finding.
Route convention sources to L2 and the change-spec package to L3.

When both reviews apply, dispatch L2 and L3 together for changes to convention sources, shared boundaries,
security/authorization, migration or release/recovery, or when the user/project requests parallel review.
If capacity prevents parallel execution, use sequential fresh dispatch. Otherwise dispatch L3 first;
if it passes and the snapshot is unchanged, dispatch the applicable L2 once against that same snapshot.
When only one reviewer applies, run that reviewer without manufacturing another requirement. If L3 does not pass, end the run with L2 recorded as
`not-run(awaiting final L3 candidate)`; this is valid only for a non-READY verdict. Revalidate reviewed inputs before
aggregation. Material drift returns `BLOCKED` with `invalidated(review-input drift)`.

Apply the shared reviewer's single execution-fallback rule. If it still produces no terminal result, return
`BLOCKED`. A later gate run creates a fresh snapshot. Keep snapshots and applicability maps transient.

## Delivery Receipt (`## Proof Bundle` on disk)

Append the receipt to `spec.md` only at delivery; do not prefill empty result fields. `feature-archive`
consumes that single canonical receipt without requiring optional attachments.

Persist only fields with a downstream consumer. The exact prose layout is flexible, but the receipt must make
these facts unambiguous:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: in Git, record either `git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` for an immutable state,
  or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` for the current worktree. Also record endpoint-owned
  output paths. Capture these coordinates before endpoint writes. `base` is the actual left side: an explicit PR
  base or target-branch merge base when feature commits exist, and `HEAD` when all reviewed work is uncommitted. A
  worktree population covers tracked changes since `base` plus untracked paths reported by Git. Ambiguous
  repository/base/ownership blocks the verdict. Git-derived coordinates, rather than a manual list or hash,
  identify the population. Outside Git, record the explicit reviewed input paths.
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

Validate each applicable L2/L3 PASS against its reviewed-scope identity and coverage declaration before
compacting it. The receipt contains the review identity, endpoint outputs, verdict, checks, review outcomes,
relevant exceptions, and current truth.

Return a concise summary containing: verdict; aggregate check result; L2/L3 result or non-execution reason;
current-truth state; `Lifecycle: READY; archive pending` when READY; non-empty blockers and `Next` routes; and the
repository-relative canonical receipt path (normally `spec.md#proof-bundle`). The linked receipt holds command-level detail.

For `READY`, change only `spec.md`'s top status marker to `已实现`; non-READY reruns follow the lifecycle rule above.

## Verdict

Run completion preflight first. Only after it passes, run all independently executable required L1 checks before qualitative review. A required L1 failure or unavailable environment suppresses L2/L3 and current-truth checks but not receipt assembly; record every applicable reviewer slot as `not-run(L1 prerequisite)` and current truth as `not-run(non-READY prerequisite)`.

- Verdict contract: failed required checks or blocking L2/L3/acceptance-verification/current-truth findings = `NEEDS WORK`; missing required inputs or an environment that prevents required checks from running reliably = `BLOCKED`; after L1 passes, missing applicable reviewer evidence also = `BLOCKED`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.
- `READY`: L1 passes, applicable L2/L3 are evidence-backed PASS or an allowed explicit `N/A`, all applicable acceptance verification passes, no blocking current-truth issue remains, and the delivery receipt is complete. Explicitly nonblocking advisories are allowed.
- `NEEDS WORK`: blocking or fixable findings remain.
- `BLOCKED`: required context/spec is missing, required checks cannot run for an environmental/input reason,
  the owner-supplied review package is incomplete, reviewed inputs drift after dispatch, or applicable required
  reviewer-dispatch/execution evidence is missing in a way that prevents a reliable verdict.

`READY` means the implementation passes checks against the feature artifact; a request to finish or deliver stops
here with archive pending. Only an explicit request to close, archive, or submit the feature continues directly to
the explicit-candidate [`feature-archive`](feature-archive.md) lifecycle action without asking again. Periodic sweep
remains available. Record `update pending` in the receipt and merge it during archive.

## Gate Health

Use the receipt's L2/L3/Drift counts for gate health. Repeated zero findings are a cost/calibration signal; inspect
history only when the user requests calibration. Establish reviewer sensitivity with the repeatable
[known-bad endpoint smoke](https://github.com/shrekshrek/project-workflow/blob/main/docs/examples/reviewer-mutation-smoke.md).

## Invariants

- One stable snapshot produces one terminal verdict. Actual risk and project/user requirements determine
  independent review applicability and scheduling; every applicable reviewer must complete reliably.
- The accepted artifact is the delivery baseline; material corrections follow the scope-stop route above.
- READY, receipt/status writes, and archive eligibility are endpoint/lifecycle outputs, not implementation tasks.
- Reviewer coverage evidence supports the verdict. Each gate run creates fresh reviewer results; unchanged
  same-task L1 evidence remains reusable.
- Historical specs remain archived; delivery evidence goes to the canonical receipt.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
