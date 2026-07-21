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

- L1 Mechanical: run the project's check/lint/type/test commands.
- L2 Project conventions: always required for full lane. For light lane, run it only when the user/project explicitly requires it, the diff spans more than one applicable convention scope or a shared project-wide surface, or a plausible qualitative convention conflict cannot be resolved mechanically. Otherwise record `N/A(low-risk light lane; no L2 trigger after convention-scope triage)`.
- L3 Change-spec compliance: compare implementation to `docs/specs/changes/.../spec.md` via `spec-reviewer`; **brownfield** = Delta + Constraints + Verification; **greenfield** = §1–§4; domain docs are context only, not the L3 baseline.
- Light-lane verification: when no `spec.md` exists, execute or mechanically check every item under `tasks.md` `## 验证`; L3 remains N/A, but an unverified or failed item blocks READY.
- Domain doc check: compare only a declared/relevant `docs/specs/<area>.md`. Resolved durable behavior with no existing area document is `update pending`; genuinely unknown ownership is `area unresolved`; internal/non-durable work is `no relevant domain doc`.
- Delivery receipt: write compact, decision-relevant evidence to the legacy-compatible `## Proof Bundle` section in `tasks.md`, and show the same receipt in the endpoint response.

## Reviewer Execution

Run applicable L2/L3 under the shared [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Same-session result reuse requires an unchanged contract, scope, reviewer inputs, and exact population. The only allowed output difference is this action's declared receipt/status write after review; any other endpoint-output change invalidates reuse. Missing execution evidence for an applicable reviewer blocks `READY`. An allowed light-lane `N/A` is an applicability decision, not missing evidence.

For full lane, resolve the shared Git scope, L2 convention-source paths, and L3 spec/artifact paths before dispatch; each reviewer independently enumerates its exact applicable population. When capacity allows two fresh invocations, dispatch L2 and L3 in parallel; otherwise use sequential fresh dispatch. Capacity for only one reviewer is not a fallback condition while sequential dispatch remains available. Each reviewer records evidence independently, and `feature-done` aggregates only after both applicable results return or fail under their own execution contract.

Focused re-review is a same-task optimization. After findings, a fresh invocation may cover the findings and their dependency closure only while the original full-population evidence remains available and the unaffected population is unchanged. A later task, missing original evidence, or a material change to implementation scope, convention sources, spec contract, or endpoint outputs requires a full-population review. Narrowing scope never authorizes retasking an old reviewer instance.

## Delivery Receipt (`## Proof Bundle` on disk)

Persist only fields with a downstream consumer:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: in a Git repository, record exactly one valid reviewed-state identity: `reviewed=<commit SHA>; dirty=no` for an immutable Git state (including a commit that was the PR head when reviewed), or `reviewed=worktree; dirty=yes` for the current dirty worktree. Other pairings are invalid. Also record the base commit SHA and endpoint-owned output paths (`tasks.md` receipt and READY status marker when written). Capture `base`, `reviewed`, and `dirty` from the reviewed input state before writing those endpoint-owned outputs; the receipt/status edits do not change the recorded dirty status. `base` is the actual left side of the reviewed diff: use an explicit PR base or target-branch merge base for committed branch work, and use `HEAD` only when all reviewed work is uncommitted. An ambiguous base blocks a reliable verdict. Derive changed paths from Git; do not copy a manual file population or persist a population hash. Outside Git, record the explicit reviewed input paths.
- `Checks`: commands, exit status, and concise test totals.
- `Review execution`: for each L2/L3 slot, record the reviewer identifier, execution mode (`fresh-subagent`, `result-reuse`, or `main-session fallback`), completion status, and fallback reason or `none` when applicable; otherwise record the allowed `N/A` reason. `result-reuse` must retain or reference the original execution evidence.
- `L2` / `L3` for full lane: always persist verdict and baseline; add findings, applicable-but-unverified identifiers, or ambiguities only when non-empty. A PASS never persists applicable IDs or populations, including inside baseline; those remain transient validation evidence.
- `L2` / `L3` for light lane: record the L2 verdict and baseline when applicable, adding only non-empty exceptions; otherwise record the allowed `N/A` reason. Record `L3=N/A(light lane)` plus every verification item and result because `tasks.md` is the feature-local acceptance baseline.
- `Current truth`: no relevant domain doc / aligned / update pending / area unresolved. Use `area unresolved` only for durable behavior whose ownership is genuinely unknown.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Drift`: only actionable A-class convention changes or suggestions; omit when empty. Persist it elsewhere only when the user explicitly asks to revise conventions.

Validate each applicable reviewer result against its transient exact-population contract before compacting it. The receipt must contain Git/non-Git review identity, endpoint outputs, reviewer execution, verdict, checks, applicable baselines, relevant exceptions, and current truth. Return one verdict line plus the exact on-disk `## Proof Bundle`; do not restate its layer details outside the block.

For light lane, when the project already declares disaster-invariant/high-blast-radius paths, re-check the actual diff against them; a match is a misclassification. Projects without this optional declaration rely on the semantic high-risk conditions from `feature-init` and do not need an empty path list.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

Run every review layer that remains independently executable even after an earlier layer fails. In particular, an L1 failure prevents `READY` but does not by itself suppress L2, L3, the current-truth check, or receipt assembly. Record non-execution only for a layer whose own required inputs or environment are unavailable, with the exact reason.

- Verdict contract: failed required checks or blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; missing required inputs or an environment that prevents required checks from running reliably = `BLOCKED`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.
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
- Reviewer compaction follows transient exact changed-file/applicable-item validation; never infer coverage from `findings=none`, and never persist applicable-rule/spec IDs, manual file populations, or population hashes.
- Endpoint-owned receipt-only edits and the status-only `已确认` → `已实现` transition do not invalidate completed same-task L2/L3 results; changes to tasks outside `## Proof Bundle` or to the spec contract still invalidate them.
- Reuse completed reviewer results only inside the same task when the canonical reviewer contract, exact scope, every reviewer input, and applicable population are provably unchanged. The declared receipt/status write is the only permitted endpoint-output difference. Never reuse or retask the reviewer instance. A later task reruns the full applicable population instead of relying on transient evidence.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
