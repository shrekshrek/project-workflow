# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the endpoint gate: L1, applicable L2, full-lane L3, current-truth check, and delivery receipt. Adapters implement it as one entry point. Same-task partial reruns may narrow to a finding plus its dependency closure under the evidence rules below.

## Inputs

- Feature directory or slug.
- Current diff or changed files.
- Project conventions from root and applicable nested `AGENTS.md`, plus host-specific convention files when the active adapter supplies them.
- Full-lane `spec.md` when present.
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
  dispatch. If a required check fails or cannot run reliably, do not dispatch new reviewers; preserve any
  still-valid same-task reviewer results, complete the current-truth check, and assemble the receipt. A failed
  check yields `NEEDS WORK`; an unavailable required check yields `BLOCKED`.
- L2 Project conventions: always required for full lane. For light lane, run it only when the user/project explicitly requires it, the diff spans more than one applicable convention scope or a shared project-wide surface, or a plausible qualitative convention conflict cannot be resolved mechanically. Otherwise record `N/A(low-risk light lane; no L2 trigger after convention-scope triage)`.
- L3 Change-spec compliance: compare implementation to `docs/specs/changes/.../spec.md` via `spec-reviewer`; **brownfield** = Delta + Constraints + Verification; **greenfield** = §1–§4; domain docs are context only, not the L3 baseline.
- Light-lane verification: when no `spec.md` exists, execute or mechanically check every item under `tasks.md` `## 验证`; L3 remains N/A, but an unverified or failed item blocks READY.
- Evidence deduplication: when one command/assertion proves several related Verification items, execute it once and map that result to each obligation. A matrix runs only when its declared dimensions remain applicable to the final change; do not expand one late for test-layer, endpoint, status-code, or case symmetry.
- Domain doc check: compare only a declared/relevant `docs/specs/<area>.md`. Resolved durable behavior with no existing area document is `update pending`; genuinely unknown ownership is `area unresolved`; internal/non-durable work is `no relevant domain doc`.
- Delivery receipt: write compact, decision-relevant evidence to the canonical `## Proof Bundle` section in `tasks.md`, and show the same receipt in the endpoint response.

## Reviewer Execution

Run applicable L2/L3 under the shared [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) only after required L1 passes. Same-session result reuse requires an unchanged contract, scope, reviewer inputs, and exact population. The only allowed output difference is this action's declared receipt/status write after review; any other endpoint-output change invalidates reuse. After L1 passes, missing execution evidence for an applicable reviewer blocks `READY`. When L1 fails or is unavailable, record new reviewer execution as `not-run(L1 prerequisite)` without treating that expected non-execution as a separate reviewer failure. An allowed light-lane `N/A` is an applicability decision, not missing evidence.

Before the first full L2/L3 dispatch, finish planned implementation and non-receipt spec/plan/tasks edits. Do not interleave bookkeeping edits outside the declared receipt/status outputs between completed review and aggregation. This action reports failed checks and findings; it never repairs implementation or non-receipt artifacts. Separate implementation work may fix them before a later invocation or focused re-review under the rules below.

After required L1 passes, resolve the authoritative Git/non-Git changed-path population before every applicable L2/L3 dispatch and supply it to each reviewer. For full lane also resolve the L2 convention-source paths and L3 spec/artifact paths before dispatch. Each reviewer consumes the supplied population and independently enumerates its exact applicable rule/spec population; inability to read or assess any supplied path returns `UNRELIABLE`. When capacity allows two fresh invocations, dispatch L2 and L3 in parallel; otherwise use sequential fresh dispatch. Capacity for only one reviewer is not a fallback condition while sequential dispatch remains available. Each reviewer records `changed-path-count`, exact applicable rule/spec IDs, `unverified-item-count`, and `blocking-ambiguity-count` independently, and `feature-done` aggregates only after both terminal reports return or fail under their own execution contract.

Focused re-review is a same-task optimization. After findings, a fresh invocation may cover the findings and their dependency closure only while the original full-population evidence remains available and the unaffected population is unchanged. A later task, missing original evidence, or a material change to implementation scope, convention sources, spec contract, or endpoint outputs requires a full-population review. Narrowing scope never authorizes retasking an old reviewer instance.

## Delivery Receipt (`## Proof Bundle` on disk)

Persist only fields with a downstream consumer:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: in a Git repository, record exactly one valid reviewed-state identity: `reviewed=<commit SHA>; dirty=no` for an immutable Git state (including a commit that was the PR head when reviewed), or `reviewed=worktree; dirty=yes` for the current dirty worktree. Other pairings are invalid. Also record the base commit SHA and endpoint-owned output paths (`tasks.md` receipt and READY status marker when written). Capture `base`, `reviewed`, and `dirty` from the reviewed input state before writing those endpoint-owned outputs; the receipt/status edits do not change the recorded dirty status. `base` is the actual left side of the reviewed diff: use an explicit PR base or target-branch merge base for committed branch work, and use `HEAD` only when all reviewed work is uncommitted. An ambiguous base blocks a reliable verdict. Derive changed paths from Git; do not copy a manual file population or persist a population hash. Outside Git, record the explicit reviewed input paths.
- `Checks`: commands, execution mode (`run` or `same-task reuse`), exit status, and concise test totals. A reused check must retain or reference its original same-task result and must not be presented as newly executed.
- `Review execution`: for each L2/L3 slot, record the reviewer identifier, execution mode (`fresh-subagent`, `result-reuse`, or `main-session fallback`), completion status, and fallback reason or `none` when applicable; otherwise record the allowed `N/A` reason or `not-run(L1 prerequisite)`. `result-reuse` must retain or reference the original execution evidence.
- `L2` / `L3` for full lane: persist verdict and baseline for every valid reviewer result; add findings, applicable-but-unverified identifiers, or ambiguities only when non-empty. When L1 prevents a new dispatch and no valid same-task result exists, record `not-run(L1 prerequisite)` instead of verdict and baseline. A PASS never persists applicable IDs or populations, including inside baseline; those remain transient validation evidence.
- `L2` / `L3` for light lane: record the L2 verdict and baseline when applicable, adding only non-empty exceptions; record `not-run(L1 prerequisite)` when applicable L2 is suppressed and no valid same-task result exists; otherwise record the allowed `N/A` reason. Record `L3=N/A(light lane)` plus every verification item and result because `tasks.md` is the feature-local acceptance baseline.
- `Current truth`: no relevant domain doc / aligned / update pending / area unresolved. Use `area unresolved` only for durable behavior whose ownership is genuinely unknown.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Drift`: only actionable project-convention changes or suggestions; omit when empty. Persist it elsewhere only when the user explicitly asks to revise conventions.

Validate each applicable reviewer PASS against the authoritative `changed-path-count`, its exact applicable rule/spec IDs, `unverified-item-count=0`, and `blocking-ambiguity-count=0` before compacting it. The receipt must contain Git/non-Git review identity, endpoint outputs, reviewer execution, verdict, checks, applicable baselines, relevant exceptions, and current truth. Return one verdict line plus the exact on-disk `## Proof Bundle`; do not restate its layer details outside the block.

For light lane, when the project already declares disaster-invariant/high-blast-radius paths, re-check the actual diff against them; a match is a misclassification. Projects without this optional declaration rely on the semantic high-risk conditions from `feature-init` and do not need an empty path list.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

Run all independently executable required L1 checks before qualitative review. A required L1 failure or unavailable environment suppresses new L2/L3 dispatch but not the current-truth check or receipt assembly. Preserve valid reviewer evidence already completed in the same task, and record every skipped new reviewer slot as `not-run(L1 prerequisite)`.

- Verdict contract: failed required checks or blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; missing required inputs or an environment that prevents required checks from running reliably = `BLOCKED`; after L1 passes, missing applicable reviewer evidence also = `BLOCKED`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.
- `READY`: L1 passes, applicable L2/L3 are evidence-backed PASS or an allowed explicit `N/A`, light-lane verification passes when applicable, no blocking current-truth issue remains, and the delivery receipt is complete. Explicitly nonblocking advisories are allowed.
- `NEEDS WORK`: blocking or fixable findings remain.
- `BLOCKED`: required context/spec is missing, required checks cannot run for an environmental/input reason, or applicable required reviewer-dispatch/execution evidence is missing in a way that prevents a reliable verdict.

`READY` means the implementation passes checks against the feature artifact. It does not mean the feature is closed: every delivered feature is eventually moved to `docs/specs/changes/archive/` by [`feature-archive`](feature-archive.md) (its sweep mode makes this a cheap periodic batch, not a per-feature ceremony). If the current-truth check reported "update pending", the delivery receipt must say so explicitly and archiving that feature must include the current-truth merge — a READY feature with a pending merge is not silently complete.

## Gate Health

L2/L3/Drift finding counts live in the delivery receipt; do not add a duplicate gate-health block. Repeated zero findings are a cost/calibration signal only. Inspect history only when the user requests calibration. Reviewer sensitivity is established with the repeatable [known-bad endpoint smoke](../examples/reviewer-mutation-smoke.md), not production silence.

## Invariants

- L1/L2/L3 are separate because they answer different questions.
- The delivery receipt is written at the endpoint, not guessed early.
- An empty findings array for an applicable reviewer without reviewer evidence is unreliable and blocks READY; an allowed `N/A` is governed by applicability evidence instead.
- Reviewer compaction follows authoritative changed-path input plus transient exact applicable-item validation; a clean terminal report carries `changed-path-count`, exact applicable rule/spec IDs, `unverified-item-count=0`, and `blocking-ambiguity-count=0` without echoing the changed-path list. Never infer coverage from `findings=none`, and never persist applicable-rule/spec IDs, manual file populations, or population hashes.
- Endpoint-owned receipt-only edits and the status-only `已确认` → `已实现` transition do not invalidate completed same-task L2/L3 results; changes to tasks outside `## Proof Bundle` or to the spec contract still invalidate them.
- Same-task L1 reuse is execution evidence, not a durable cache: reuse it only while the command, relevant inputs, and changed-scope classification are provably unchanged. Documentation-only receipt/status writes do not invalidate it; later tasks rerun the applicable checks.
- Do not dispatch new L2/L3 reviewers while required L1 is failed or unavailable. This prerequisite does not erase still-valid same-task reviewer evidence and does not suppress current-truth or receipt work.
- Reuse completed reviewer results only inside the same task when the canonical reviewer contract, exact scope, every reviewer input, and applicable population are provably unchanged. The declared receipt/status write is the only permitted endpoint-output difference. Never reuse or retask the reviewer instance. A later task reruns the full applicable population instead of relying on transient evidence.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
