# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the endpoint gate: completion preflight, L1, applicable L2, full-lane L3, current-truth check,
and delivery receipt. Adapters implement it as one entry point.
Each invocation reviews one stable final snapshot and returns its terminal verdict. A non-READY verdict ends
that invocation; the original implementation/change request does not implicitly authorize another L2/L3 cycle.
After a fix, a later explicit user request may run the gate again with a fresh reviewer snapshot while reusing
only L1 evidence whose command and relevant inputs remain unchanged.

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
- Derive the changed scope from Git. If the dirty repository contains changes from another
  active feature or unrelated work that cannot be separated confidently, return `BLOCKED` and ask for a
  commit/worktree boundary. Never construct READY by manually subtracting ambiguous paths.
- Compare the actual changed responsibility areas and high-impact surfaces with the accepted Scope,
  Constraints, Module Impact, and any conditional delivery boundary (or the light-lane expected-impact boundary). A new persistent state, API,
  role, workflow, management surface, queue, runtime, Provider/responsibility area, contract, migration,
  authorization rule, or release boundary that was not declared returns `NEEDS WORK` before expanded L1
  and routes to `spec-revise`, lane upgrade, or a child feature; this gate never absorbs it automatically.
  If ownership of the extra change is ambiguous, return `BLOCKED`.
- Close every explicit Guidance Placement commitment before expanded L1. When plan Sibling Alignment or an
  accepted task says `Codify`, mechanically require either the named root/tier/module `AGENTS.md` target plus
  any project-adopted one-line `CLAUDE.md` alias, or the named mechanical enforcement. Verify the named subtree
  exists (or is created by this feature) and an adopted alias is byte-equivalent to `@AGENTS.md\n`. A missing
  promised target returns `NEEDS WORK` and reviewers record `not-run(completion preflight)`; an unresolvable
  promised owner returns `BLOCKED`. Difference-only content, inheritance, and semantic placement belong to L2,
  not this preflight. Do not infer a Codify commitment or require files solely from directory shape.
- When a declared user-visible actor-to-result journey is a cheap, high-value early signal, run it before
  broader or lower-level checks. A failure returns `NEEDS WORK` before expanded L1. Otherwise continue with
  the artifact's ordered Verification without adding a placeholder field or synthetic smoke test.
- A passing preflight journey becomes an ordinary L1 evidence entry and is not rerun unless its relevant inputs
  change.

A preflight failure still runs the current-truth check and writes the canonical receipt. Record applicable
reviewer slots as `not-run(completion preflight)`; do not leave an older READY receipt as the active verdict.
For an explicit rerun of an active `已实现` feature, preserve the exact prior non-empty receipt under a
uniquely named `## Previous Proof Bundle (superseded <date-or-sequence>)` heading before writing the new canonical
receipt. A non-READY rerun returns the status to `已确认`; a READY rerun keeps `已实现`. These receipt-history
and status writes are endpoint-owned lifecycle outputs, not contract repair.

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

- L1 Mechanical: run the feature artifact's explicit Verification checks plus the standard mechanical
  commands for each changed project scope. Expand to repository-wide or release suites only when the
  feature spec requires them, applicable project conventions explicitly require them for this change,
  or a changed shared surface has a project-defined shared check. Do not treat every command listed in a
  root convention file as mandatory for every feature. Do not add unit/integration/e2e layers beyond
  those inputs merely for symmetry; repeat a behavior across layers only when each layer proves a distinct risk.
- L1 execution: within the same task, reuse a passing check only while its command, relevant inputs, and
  changed-scope classification are provably unchanged; uncertainty requires a rerun. After a fix, rerun the failed or affected checks and their
  dependency closure; rerun the full changed-scope L1 population only when the fix invalidates it, such as a
  shared surface, contract, dependency, or build-configuration change. Run heavyweight commands that share a
  workspace or build cache sequentially by default; parallelize them only when their isolation and available
  resources are known.
- L1 prerequisite: complete all independently executable required L1 checks before the first new L2/L3
  dispatch. If a required check fails or cannot run reliably, do not dispatch new reviewers; complete the
  current-truth check and assemble the receipt with applicable reviewer slots marked `not-run(L1 prerequisite)`. A failed
  check yields `NEEDS WORK`; an unavailable required check yields `BLOCKED`.
- L2 Project conventions: always required for full lane. For light lane, run it only when the user/project explicitly requires it, the diff spans more than one applicable convention scope or a shared project-wide surface, or a plausible qualitative convention conflict cannot be resolved mechanically. Otherwise record `N/A(low-risk light lane; no L2 trigger after convention-scope triage)`.
- L3 Change-spec compliance: compare implementation to `docs/specs/changes/.../spec.md` via `spec-reviewer`; **brownfield** = Delta + Constraints + Verification; **greenfield** = §1–§4; domain docs are context only, not the L3 baseline.
- Light-lane verification: when no `spec.md` exists, execute or mechanically check every item under `tasks.md` `## 验证`; L3 remains N/A, but an unverified or failed item blocks READY.
- Evidence deduplication: when one command/assertion proves several related Verification items, execute it once and map that result to each obligation. A matrix runs only when its declared dimensions remain applicable to the final change; do not expand one late for test-layer, endpoint, status-code, or case symmetry.
- Domain doc check: compare only a declared/relevant `docs/specs/<area>.md`. Resolved durable behavior with no existing area document is `update pending`; genuinely unknown ownership is `area unresolved`; internal/non-durable work is `no relevant domain doc`.
- Delivery receipt: write compact, decision-relevant evidence to the canonical `## Proof Bundle` section in `tasks.md`. The endpoint response shows a human summary and links the receipt; it does not inline the full receipt.

## Reviewer Execution

Run applicable L2/L3 under the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) only after required L1 passes.
After L1 passes, missing execution evidence for an
applicable reviewer blocks `READY`. When L1 fails or is unavailable, record new reviewer execution as
`not-run(L1 prerequisite)` without treating that expected non-execution as a separate reviewer failure. An
allowed light-lane `N/A` is an applicability decision, not missing evidence.

Before L2/L3 dispatch, finish planned implementation and non-receipt spec/plan/tasks edits. This action reports
failed checks and findings; reviewers never repair implementation or artifacts. After the endpoint returns, an
enclosing implementation request may apply an unambiguous in-scope fix, but it must not re-enter `feature-done`
automatically. Material scope or product decisions return to the user; a later explicit user request starts a
new gate run.

Treat the accepted feature artifact as the requirements baseline. Do not reconstruct or reinterpret the full
conversation at delivery time. If the current request itself supplies a later material decision that conflicts
with that baseline, stop the stale delivery review and route the blocker to `spec-revise`; otherwise verify
implementation fidelity without reopening requirements discovery.

After required L1 passes and before reviewer dispatch, create one transient review snapshot containing the
reviewed repository identity, authoritative Git/non-Git changed paths, L1 evidence map, applicable convention
sources, and applicable spec/artifact paths. Supply the same snapshot to every reviewer. Inability to assess a
supplied path or required input returns `UNRELIABLE`. Reviewers consume rather than rerun L1 evidence.

Validate the review package before dispatch: reviewed identity, changed paths, readable L1 evidence, applicable
convention sources, and applicable spec/artifacts. Each Verification obligation has evidence or an explicit
gap. A missing or unreadable required input returns `BLOCKED` and records applicable reviewer slots as
`not-run(review-package incomplete)`.

Resolve L2 convention sources from every changed path: collect root `AGENTS.md` and applicable ancestor
tier/module files through the nearest nested source, then union the chains. Keep this applicability map
transient and exclude unrelated sibling guidance.

Each L1 evidence entry records the obligation, command or assertion, execution mode (`run` or `same-task reuse`),
result, relevant-input scope, and original evidence reference. The L2 evidence map may be empty when no
convention depends on mechanical evidence. For L3, an explicit gap or failed mapped evidence is a finding;
missing or unreadable supplied evidence makes the review `UNRELIABLE`.

When capacity permits, dispatch L2 and L3 in parallel; otherwise use sequential fresh dispatch. Revalidate the
reviewed inputs before aggregation. Material drift returns `BLOCKED` and records applicable slots as
`invalidated(review-input drift)`. A later explicitly requested invocation waits for stable inputs and creates
a fresh reviewer snapshot. The snapshot and applicability map remain transient and are not persisted in the receipt.

## Delivery Receipt (`## Proof Bundle` on disk)

Persist only fields with a downstream consumer. The exact prose layout is flexible, but the receipt must make
these facts unambiguous:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: in Git, write `git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` for an immutable reviewed state, or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` for the current dirty worktree. Other reviewed/dirty pairings are invalid. Also record endpoint-owned output paths (`tasks.md` receipt and READY status marker when written). Capture `base`, `reviewed`, and `dirty` before writing those endpoint-owned outputs; the receipt/status edits do not change the recorded dirty status. `base` is the actual left side of the reviewed diff: use an explicit PR base or target-branch merge base for committed branch work, and use `HEAD` only when all reviewed work is uncommitted. An ambiguous repository, base, or feature boundary blocks a reliable verdict. Derive changed paths from Git; do not copy a manual population or persist a population hash. Outside Git, record the explicit reviewed input paths.
- `Checks`: commands, execution mode (`run` or `same-task reuse`), exit status, and concise test totals. A reused check must retain or reference its original same-task result and must not be presented as newly executed.
- `Reviews`: for L2 and L3, record `completed`, `N/A`, `not-run`, or `invalidated`, with the verdict and
  baseline for completed reviews and a concise reason for every other state. Add findings, unverified
  obligations, or ambiguities only when non-empty. A full-lane PASS still needs valid L2/L3 coverage; light
  lane records its verification results and may mark L3 `N/A(light lane)`. Reviewer identifiers or dispatch
  mode are optional diagnostics and never replace coverage evidence.
- `Current truth`: no relevant domain doc / aligned / update pending / area unresolved. Use `area unresolved` only for durable behavior whose ownership is genuinely unknown.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Next`: only for a non-READY verdict, classify each blocker or coherent blocker group as `direct-repair`,
  `spec-revise`, `user-decision`, or `separate-boundary`. Keep the route tied to the existing blocker; it
  does not authorize an automatic repair or another gate run.
- `Drift`: only actionable project-convention suggestions already produced by L2; omit when empty. Persist it
  elsewhere only when the user explicitly asks to revise conventions. Guidance-placement suggestions name the
  evidence, proposed root/tier/module/mechanical owner, and whether `agents-md-revise` should handle it; they
  never claim automatic creation approval.

Validate each applicable L2/L3 PASS against its reviewed-scope identity and coverage declaration before
compacting it. The receipt contains the review identity, endpoint outputs, verdict, checks, review outcomes,
relevant exceptions, and current truth.

Return a concise human-facing delivery summary containing: verdict; aggregate check result; L2/L3 result or
reason they did not run; current-truth state; `Lifecycle: READY; archive pending` when READY;
blocking findings and `Next` routes when non-empty; and the repository-relative `tasks.md#proof-bundle` path.
Do not inline the full receipt or repeat individual passing commands in the
endpoint response.

For light lane, when the project already declares disaster-invariant/high-blast-radius paths, re-check the actual diff against them; a match is a misclassification. Projects without this optional declaration rely on the semantic high-risk conditions from `feature-init` and do not need an empty path list.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

Run completion preflight first. Only after it passes, run all independently executable required L1 checks before qualitative review. A required L1 failure or unavailable environment suppresses L2/L3 dispatch but not the current-truth check or receipt assembly; record every applicable reviewer slot as `not-run(L1 prerequisite)`.

- Verdict contract: failed required checks or blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; missing required inputs or an environment that prevents required checks from running reliably = `BLOCKED`; after L1 passes, missing applicable reviewer evidence also = `BLOCKED`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.
- `READY`: L1 passes, applicable L2/L3 are evidence-backed PASS or an allowed explicit `N/A`, light-lane verification passes when applicable, no blocking current-truth issue remains, and the delivery receipt is complete. Explicitly nonblocking advisories are allowed.
- `NEEDS WORK`: blocking or fixable findings remain.
- `BLOCKED`: required context/spec is missing, required checks cannot run for an environmental/input reason,
  the owner-supplied review package is incomplete, reviewed inputs drift after dispatch, or applicable required
  reviewer-dispatch/execution evidence is missing in a way that prevents a reliable verdict.

`READY` means the implementation passes checks against the feature artifact. It does not mean the feature is closed: every delivered feature is eventually moved to `docs/specs/changes/archive/` by [`feature-archive`](feature-archive.md) (its sweep mode makes this a cheap periodic batch, not a per-feature ceremony). If the current-truth check reported "update pending", the delivery receipt must say so explicitly and archiving that feature must include the current-truth merge — a READY feature with a pending merge is not silently complete.

## Gate Health

L2/L3/Drift finding counts live in the delivery receipt; do not add a duplicate gate-health block. Repeated zero findings are a cost/calibration signal only. Inspect history only when the user requests calibration. Reviewer sensitivity is established with the repeatable [known-bad endpoint smoke](../examples/reviewer-mutation-smoke.md), not production silence.

## Invariants

- L1/L2/L3 are separate because they answer different questions.
- Each `feature-done` invocation reviews one stable final snapshot and ends on its terminal verdict. A non-READY
  result never triggers an automatic fix-review loop; a later explicit user request uses a fresh reviewer snapshot.
- The delivery receipt is written at the endpoint, not guessed early.
- Implementation checklists contain only outcomes that can complete before this endpoint; READY, receipt/status
  writes, and archive eligibility remain endpoint or lifecycle outputs.
- Completion preflight is an early safety net for incomplete, actor-to-result-broken, mixed-feature, scope-drifted,
  or unfulfilled explicit Guidance work; it neither replaces eligible L1/L2/L3 nor excuses missed Scope Stops.
- Delivery review uses the accepted artifact rather than replaying the conversation. Only a visible later
  material correction makes the baseline stale and routes to `spec-revise`.
- Reviewer evidence—not `findings=none`—proves applicable coverage; allowed N/A requires applicability evidence.
  Compact only after reviewed-scope and coverage validation.
- Endpoint-owned receipt/history and status writes preserve otherwise valid same-task evidence. Other relevant
  input drift invalidates it; same-task L1 reuse is execution evidence, never a durable cache.
- Failed/unavailable required L1 suppresses new review dispatch but not current-truth or receipt work. Package
  gaps block before dispatch; post-dispatch input drift ends the invocation without an automatic replacement.
- A later explicitly requested invocation creates a fresh reviewer result for its snapshot. Never reuse or
  retask a reviewer instance across tasks; only still-valid L1 execution evidence may be reused.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
