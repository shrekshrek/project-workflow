# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the full endpoint gate: L1, L2, L3, current-truth check, and delivery receipt. Adapters implement it as one entry point; partial reruns (for example re-running only L2 after a fix) are done by re-invoking this action or by dispatching the relevant reviewer directly, not through a second set of public commands.

## Inputs

- Feature directory or slug.
- Current diff or changed files.
- Project conventions from root and applicable nested `AGENTS.md`, plus host-specific convention files when the active adapter supplies them.
- Full-lane `spec.md` when present.
- Related domain documents (`docs/specs/<area>.md`) when the feature touches a declared product/system area.
- Test/check command results.

## Review Layers

- L1 Mechanical: run the project's check/lint/type/test commands.
- L2 Project conventions: compare changed code to A-class conventions via the `agents-md-reviewer` spec.
- L3 Change-spec compliance: compare implementation to `docs/specs/changes/.../spec.md` via `spec-reviewer`; **brownfield** = Delta + Constraints + Verification; **greenfield** = §1–§4; domain docs are context only, not the L3 baseline.
- Light-lane verification: when no `spec.md` exists, execute or mechanically check every item under `tasks.md` `## 验证`; L3 remains N/A, but an unverified or failed item blocks READY.
- Domain doc check: contradiction vs `docs/specs/<area>.md` and update-pending for `feature-archive`. A greenfield full-lane delivery that establishes durable user/system behavior is `update pending` even when no area document exists yet; archive creates the concrete area doc from the plugin template. If spec/plan do not declare an area, record `area unresolved` rather than inventing a filename. Purely internal/non-durable work may report no relevant domain doc.
- Delivery receipt: write compact, decision-relevant evidence to the legacy-compatible `## Proof Bundle` section in `tasks.md`, and show the same receipt in the endpoint response.

## Reviewer Execution

- When the active host exposes reviewer dispatch capability and capacity is available, each applicable L2/L3 reviewer must run in a fresh host-native subagent invocation. Do not retask an existing reviewer instance. No extra workflow confirmation is required; host security approvals still apply.
- Main-session fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity. The endpoint must still execute the same canonical reviewer contract and record the observed reason; preference or convenience is not a valid reason.
- Reused same-session results retain their original execution evidence only while the canonical reviewer contract, every reviewer input, relevant endpoint output, and the exact review population remain provably unchanged. Reuse the completed result, never the reviewer instance.
- If required dispatch was skipped, or execution evidence is missing for an applicable reviewer, that layer is unreliable and blocks `READY`; aggregate the endpoint as `BLOCKED`, not as a zero-finding pass.

## Delivery Receipt (`## Proof Bundle` on disk)

Persist only fields with a downstream consumer:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: the exact **review population** used by L2/L3 or light verification, endpoint-owned output paths (`tasks.md` receipt and READY status marker when written), and the Git base/worktree context when available. This is review traceability, not a cache key or claim about unrelated user changes; Git remains the full content-diff source.
- `Checks`: commands, exit status, and concise test totals.
- `Review execution`: for every applicable L2/L3 reviewer, record reviewer identifier, execution mode (`fresh-subagent`, `result-reuse`, `main-session fallback`, or allowed `N/A`), completion status, and fallback reason or `none`. `result-reuse` must retain or reference the original execution evidence.
- `L2`: verdict, findings, exact applicable rule identifiers, applicable-but-unverified identifiers, and ambiguities. A PASS must account for every applicable rule; do not replace the population with a percentage.
- `L3`: verdict, findings, exact applicable spec-item identifiers, applicable-but-unverified identifiers, and ambiguities for full lane; for light lane record `N/A` plus each verification item and result.
- `Current truth`: no relevant domain doc / aligned / update pending. Name the document when the feature declares a reliable area; otherwise record `area unresolved` for `feature-archive` to resolve.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Drift`: only actionable A-class convention changes or suggestions; omit when empty. Persist it elsewhere only when the user explicitly asks to revise conventions.

Before verdict finalization, validate the receipt structurally: exact review-scope paths, endpoint-owned output paths, reviewer execution and any fallback reason, applicable and unverified L2/L3 identifiers (or light-verification identifiers), ambiguities, Verdict, Checks, and Current truth must be present. Missing evidence makes the endpoint unreliable. The response must include the exact on-disk `## Proof Bundle` block verbatim, not a summary or link. PR workflows may copy it verbatim; `feature-archive` consumes Verdict and Current truth.

For light lane, when the project already declares disaster-invariant/high-blast-radius paths, re-check the actual diff against them; a match is a misclassification. Projects without this optional declaration rely on the semantic high-risk conditions from `feature-init` and do not need an empty path list.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

Run every review layer that remains independently executable even after an earlier layer fails. In particular, an L1 failure prevents `READY` but does not by itself suppress L2, L3, the current-truth check, or receipt assembly. Record non-execution only for a layer whose own required inputs or environment are unavailable, with the exact reason.

- Verdict contract: failed required checks or blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; missing required inputs or an environment that prevents required checks from running reliably = `BLOCKED`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.
- `READY`: L1 passes, L2/L3 are evidence-backed PASS or an allowed explicit skip, light-lane verification passes when applicable, no blocking current-truth issue remains, and the delivery receipt is complete. Explicitly nonblocking advisories are allowed.
- `NEEDS WORK`: blocking or fixable findings remain.
- `BLOCKED`: required context/spec is missing, required checks cannot run for an environmental/input reason, or required reviewer-dispatch/execution evidence is missing in a way that prevents a reliable verdict.

`READY` means the implementation passes checks against the feature artifact. It does not mean the feature is closed: every delivered feature is eventually moved to `docs/specs/changes/archive/` by [`feature-archive`](feature-archive.md) (its sweep mode makes this a cheap periodic batch, not a per-feature ceremony). If the current-truth check reported "update pending", the delivery receipt must say so explicitly and archiving that feature must include the current-truth merge — a READY feature with a pending merge is not silently complete.

## Gate Health

L2/L3/Drift finding counts live in the delivery receipt; do not add a duplicate gate-health block. Repeated zero findings are a cost/calibration signal only. Inspect history only when the user requests calibration. Reviewer sensitivity is established with the repeatable [known-bad endpoint smoke](../examples/reviewer-mutation-smoke.md), not production silence.

## Invariants

- L1/L2/L3 are separate because they answer different questions.
- The delivery receipt is written at the endpoint, not guessed early.
- An empty findings array without reviewer evidence is unreliable and blocks READY.
- Main-session reviewer output without an allowed, explicit fallback reason is not reviewer evidence when host-native dispatch was available.
- Endpoint-owned receipt-only edits and the status-only `已确认` → `已实现` transition do not invalidate cached L2/L3 results; changes to tasks outside `## Proof Bundle` or to the spec contract still invalidate them.
- Reuse completed reviewer results only inside the same task when the canonical reviewer contract, exact scope, every reviewer input, applicable population, and relevant endpoint outputs are provably unchanged. Never reuse or retask the reviewer instance. A later invocation reruns the relevant gates instead of relying on a persisted cache identity.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
