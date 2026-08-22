# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the endpoint gate: completion preflight, L1, full-lane L2/L3, current-truth check,
and delivery receipt. Adapters implement it as one entry point.
Each gate run reviews one stable final snapshot and returns its terminal verdict. A readiness check ends there;
finish/delivery intent follows the bounded repair rule under Reviewer Execution.

## Completion Preflight

Run this cheap completion check before expanded L1 commands or reviewer dispatch. It is ordering, not a
new review layer:

- The selected artifact is active and has no unfinished checklist item or unresolved material placeholder
  in its contract, plan, task checklist, Verification, or implementation record. Ignore the canonical
  `## Proof Bundle`, any `## Previous Proof Bundle ...` history, and endpoint-owned receipt/status fields;
  those are outputs of this action, not completion inputs.
  Keep task checklists limited to implementation, review, and check outcomes that can finish before this
  endpoint runs. Represent `feature-done`, READY, receipt/status writes, and archive eligibility only as
  endpoint or lifecycle outputs. A circular checklist item that depends on one of those outputs returns
  `NEEDS WORK` for artifact cleanup before expanded L1.
  A full-lane feature normally enters at `已确认`; `已实现` is accepted only for an explicit same-feature
  rerun whose non-receipt contract has not changed. Draft, superseded,
  abandoned, or archived artifacts do not enter this gate. A knowingly incomplete artifact returns
  `NEEDS WORK` without running expanded L1.
- For a reused accepted full-lane artifact, confirm that its accepted outcome/boundary remain current and its
  Verification/tasks are actionable. Any declared phase-focused checks must be complete; valid same-task results are
  consumed under the normal L1 reuse rules rather than recreated at the endpoint.
- Establish one Git-derived feature population before interpreting scope. A dirty state uses the complete
  `base`-to-worktree population: tracked changes plus untracked paths reported by Git. `base` is `HEAD` when all
  selected-feature work is uncommitted; otherwise use the explicit PR base or target-branch merge base to include
  committed and uncommitted work. A clean state uses one exact `base..reviewed` commit range. Treat the resulting
  population as indivisible and require it all to belong to the selected feature. An ambiguous base/ownership or
  mixed feature/unrelated population returns `BLOCKED` before expanded L1 and asks for isolation or a commit range.
- Compare the actual changed responsibility areas and high-impact surfaces with the accepted Scope,
  Constraints, Module Impact, and any conditional delivery boundary (or the light-lane expected-impact boundary). A new persistent state, API,
  role, workflow, management surface, queue, runtime, Provider/responsibility area, contract, migration,
  authorization rule, or release boundary that was not declared returns `NEEDS WORK` before expanded L1
  and routes to `spec-revise`, lane upgrade, or a child feature.
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
- Full-lane `spec.md` when present.
- Full-lane `plan.md` and directly cited accepted ADR/current-truth sources needed by its impact boundary,
  Codify commitments, or current-truth decision.
- Related domain documents (`docs/specs/<area>.md`) when the feature touches a declared product/system area.
- Test/check command results.

## Review Layers

- L1 Mechanical: run explicit Verification plus standard commands for each changed project. Repository-wide,
  release, or duplicate test layers require distinct evidence from the spec, an applicable convention, or a
  defined shared-surface risk.
- L1 execution: reuse a passing same-task check only while its command, relevant inputs, and scope classification
  are unchanged. After a fix, rerun affected checks and their dependency closure; expand only when the fix changes
  a shared surface, contract, dependency, or build configuration. Sequence cache-sharing heavyweight commands.
- L1 prerequisite: finish all independently executable required checks before review. Failure yields `NEEDS WORK`,
  unavailability yields `BLOCKED`, and applicable reviewer slots record `not-run(L1 prerequisite)`.
- L2 Project conventions: required for full lane and risk-routed only for light lane. For full lane, risk controls
  scheduling rather than applicability. Use parallel review when the user/project explicitly requires it, or when
  convention sources change or the change spans multiple convention scopes/shared surfaces, durable
  architecture/ownership, security/authorization/multi-tenant behavior, migration, or release/rollback boundaries.
  Reviewer Execution owns full-lane dispatch order. For light lane, run L2 under the same risk triggers or a plausible qualitative convention conflict
  that cannot be resolved mechanically; otherwise record `N/A(low-risk light lane; no L2 trigger)`.
- L3 Change-spec compliance: always required for full lane. Compare implementation to
  `docs/specs/changes/.../spec.md` via `spec-reviewer`; **brownfield** = Delta + Constraints + Verification;
  **greenfield** = §1–§4. Domain docs remain context, not the L3 baseline.
- Light-lane verification: when no `spec.md` exists, execute or mechanically check every item under `tasks.md` `## 验证`; L3 remains N/A, but an unverified or failed item blocks READY.
- Evidence deduplication: when one command/assertion proves several related Verification items, execute it once and
  map that result to each obligation. A matrix runs only while its declared dimensions remain applicable and prove
  distinct risk.
- Domain doc check: defer it until L1 and applicable L2/L3/light verification form a READY candidate. Earlier
  failures record `not-run(non-READY prerequisite)`. For a candidate, compare only a declared/relevant
  `docs/specs/<area>.md`: resolved durable behavior with no existing area document is `update pending`; genuinely
  unknown ownership is `area unresolved`; internal/non-durable work is `no relevant domain doc`.
- Delivery receipt: write compact, decision-relevant evidence to the canonical `## Proof Bundle` section in `tasks.md`. The endpoint response shows a human summary and links the receipt; it does not inline the full receipt.

## Reviewer Execution

Run applicable review only after L1 passes, under the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Missing applicable execution
evidence blocks `READY`; an allowed N/A is an applicability decision. Finish implementation and non-receipt
artifact edits first. Reviewers are read-only; the enclosing finish/delivery workflow owns the one permitted repair
pass and fresh gate run. A readiness check ends at the verdict. A second non-READY verdict, material decision,
external/destructive write, or unavailable prerequisite returns to the user.

The bounded repair pass records the first snapshot and repair delta, reruns affected L1 evidence, and creates a
fresh final snapshot. Same-run repair-delta reconciliation applies when the prior role report declared complete
coverage, every blocker maps to `direct-repair`, the delta stays within named finding paths/evidence, and the spec,
conventions, feature boundary, and runtime contract are unchanged. A fresh same-role reviewer rechecks all findings
and delta-affected obligations and returns a terminal verdict for the complete final snapshot. Other repairs use a
fresh full review; reconciliation state exists only for the current run.

Treat the accepted feature artifact as the requirements baseline. A visible later material decision routes to
`spec-revise`; otherwise verify implementation fidelity against that artifact.

Create one transient snapshot with repository identity, authoritative changed paths, L1 evidence, applicable
spec/artifacts, and convention sources. Resolve the authoritative convention population from the filesystem: for
every changed path, walk from the project root through its ancestors to the nearest applicable nested `AGENTS.md`,
then union those chains; add project-local host convention sources selected by the active adapter. Caller-supplied
paths are hints only. Validate this population before dispatch.
Every Verification obligation has evidence or an explicit gap; missing or unreadable required input returns
`BLOCKED` with `not-run(review-package incomplete)`. Each evidence entry records obligation, command/assertion,
`run` or `same-task reuse`, result, relevant-input scope, and original reference. Reviewers consume rather than
rerun it; missing supplied evidence is `UNRELIABLE`, while an explicit failed/gap entry is a finding. Supply
Route convention sources to L2 and the change-spec package to L3; eligible same-run repair-delta reconciliation
also supplies that role's prior terminal report and exact repair delta.

For a parallel-scheduled full-lane review, dispatch L2 and L3 together when capacity permits; otherwise use
sequential fresh dispatch. For ordinary full-lane work, dispatch L3 first; if it passes and the snapshot is unchanged, dispatch L2
once against that same snapshot. If L3 does not pass, end the run with L2 recorded as
`not-run(awaiting final L3 candidate)`; this is valid only for a non-READY verdict. Revalidate reviewed inputs before
aggregation. Material drift returns `BLOCKED` with `invalidated(review-input drift)`.

Apply the shared reviewer's single execution-fallback rule. If it still produces no terminal result, return
`BLOCKED`. A later gate run creates a fresh snapshot. Keep snapshots and applicability maps transient.

## Delivery Receipt (`## Proof Bundle` on disk)

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
  obligations, or ambiguities only when non-empty. A full-lane READY needs valid completed L2 and L3 coverage;
  a non-READY ordinary full-lane run may record L2 `not-run(awaiting final L3 candidate)`. Light lane records its verification results and may mark L3
  `N/A(light lane)`. When a completed review used same-run repair-delta reconciliation, record its prior-report
  reference and repair-delta identity. Reviewer identifiers and dispatch mode are optional diagnostics; coverage
  evidence remains required.
- `Current truth`: `not-run(non-READY prerequisite)` / no relevant domain doc / aligned / update pending / area
  unresolved. Use `area unresolved` only for durable behavior whose ownership is genuinely unknown.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Next`: only for a non-READY verdict, classify each blocker or coherent blocker group as `direct-repair`,
  `spec-revise`, `user-decision`, or `separate-boundary`. Keep the route tied to its blocker; repair authority comes
  from the enclosing finish/delivery request.
- `Drift`: only actionable project-convention suggestions already produced by L2; omit when empty. Persist it
  elsewhere only when the user explicitly asks to revise conventions. Guidance-placement suggestions name the
  evidence, proposed root/tier/module/mechanical owner, and whether `agents-md-revise` should handle it. Convention
  edits still require user authorization.

Validate each applicable L2/L3 PASS against its reviewed-scope identity and coverage declaration before
compacting it. The receipt contains the review identity, endpoint outputs, verdict, checks, review outcomes,
relevant exceptions, and current truth.

Return a concise summary containing: verdict; aggregate check result; L2/L3 result or non-execution reason;
current-truth state; `Lifecycle: READY; archive pending` when READY; non-empty blockers and `Next` routes; and the
repository-relative `tasks.md#proof-bundle` path. The linked receipt holds command-level detail.

For light lane, when the project already declares disaster-invariant/high-blast-radius paths, re-check the actual diff against them; a match is a misclassification. Projects without this optional declaration rely on the semantic high-risk conditions from `feature-init` and do not need an empty path list.

For full-lane `READY`, change only the top `spec.md` status marker to `已实现`; light lane and non-READY results keep
their existing status.

## Verdict

Run completion preflight first. Only after it passes, run all independently executable required L1 checks before qualitative review. A required L1 failure or unavailable environment suppresses L2/L3 and current-truth checks but not receipt assembly; record every applicable reviewer slot as `not-run(L1 prerequisite)` and current truth as `not-run(non-READY prerequisite)`.

- Verdict contract: failed required checks or blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; missing required inputs or an environment that prevents required checks from running reliably = `BLOCKED`; after L1 passes, missing applicable reviewer evidence also = `BLOCKED`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.
- `READY`: L1 passes, applicable L2/L3 are evidence-backed PASS or an allowed explicit `N/A`, light-lane verification passes when applicable, no blocking current-truth issue remains, and the delivery receipt is complete. Explicitly nonblocking advisories are allowed.
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

- One stable snapshot produces one terminal verdict. Full-lane READY requires independent L2/L3 PASS; risk selects
  their scheduling.
- The accepted artifact is the delivery baseline; a visible later material correction routes to `spec-revise`.
- READY, receipt/status writes, and archive eligibility are endpoint/lifecycle outputs, not implementation tasks.
- Reviewer coverage evidence supports the verdict. Each gate run creates fresh reviewer results; unchanged
  same-task L1 evidence remains reusable.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
