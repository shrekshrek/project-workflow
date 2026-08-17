# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the endpoint gate: completion preflight, L1, applicable L2, full-lane L3, current-truth check,
and delivery receipt. Adapters implement it as one entry point.
Same-task partial reruns may narrow to a finding plus its dependency closure under the evidence rules below.

## Completion Preflight

Run this cheap completion check before expanded L1 commands or reviewer dispatch. It is ordering, not a
new review layer:

- The selected artifact is active and has no unfinished checklist item or unresolved material placeholder
  in its contract, plan, task checklist, Verification, or implementation record. Ignore the canonical
  `## Proof Bundle`, any `## Previous Proof Bundle ...` history, and endpoint-owned receipt/status fields;
  those are outputs of this action, not completion inputs.
  A full-lane feature normally enters at `已确认`; `已实现` is accepted only for an explicit same-feature
  rerun or receipt-schema migration whose non-receipt contract has not changed. Draft, superseded,
  abandoned, or archived artifacts do not enter this gate. A knowingly incomplete artifact returns
  `NEEDS WORK` without running expanded L1.
- Derive the changed scope from Git. If the dirty repository contains changes from another
  active feature or unrelated work that cannot be separated confidently, return `BLOCKED` and ask for a
  commit/worktree boundary. Never construct READY by manually subtracting ambiguous paths.
- Compare the actual changed responsibility areas and high-impact surfaces with the accepted plan
  `Delivery Shape Baseline` (or the light-lane expected-impact boundary). A new persistent state, API,
  role, workflow, management surface, queue, runtime, Provider/responsibility area, contract, migration,
  authorization rule, or release boundary that was not declared returns `NEEDS WORK` before expanded L1
  and routes to `spec-revise`, lane upgrade, or a child feature; this gate never absorbs it automatically.
  If ownership of the extra change is ambiguous, return `BLOCKED`. For an older active artifact created
  before the baseline existed, use its module-impact/scope sections only when they establish one
  unambiguous boundary and record `legacy-unambiguous impact boundary`; otherwise require revision.
- Close every explicit Guidance Placement commitment before expanded L1. When plan Sibling Alignment or an
  accepted task says `Codify`, mechanically require either the named root/tier/module `AGENTS.md` target plus
  any project-adopted one-line `CLAUDE.md` alias, or the named mechanical enforcement. Verify the named subtree
  exists (or is created by this feature) and an adopted alias is byte-equivalent to `@AGENTS.md\n`. A missing
  promised target returns `NEEDS WORK` and reviewers record `not-run(completion preflight)`; an unresolvable
  promised owner returns `BLOCKED`. Difference-only content, inheritance, and semantic placement belong to L2,
  not this preflight. Do not infer a Codify commitment or require files solely from directory shape.
- For a user-visible outcome, identify and run the artifact's declared primary-flow smoke first. It must
  exercise the shortest meaningful actor-to-result journey, not merely render a component or call an
  isolated helper. Select it from an existing Verification obligation explicitly marked `Primary flow`;
  preflight must not invent an additional smoke or proof obligation. For an older active artifact created
  before this marker existed, one existing obligation may be selected only when it unambiguously already
  exercises that journey; record `legacy-unambiguous selection` in the evidence map without editing the
  frozen artifact. Zero or several plausible legacy choices return `NEEDS WORK` for an explicit revision.
  A missing or failed required smoke returns `NEEDS WORK` before expanded L1. Non-user-visible changes
  record `N/A(not user-visible)`.
- A passing primary-flow result becomes an ordinary L1 evidence entry and is not rerun unless its relevant
  inputs change. This preflight never adds a second smoke or a new test layer.

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
  dispatch. If a required check fails or cannot run reliably, do not dispatch new reviewers; preserve any
  still-valid same-task reviewer results, complete the current-truth check, and assemble the receipt. A failed
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
Same-session result reuse requires an unchanged contract, review cycle, scope, reviewer inputs, and exact
population. The only allowed output difference is this action's declared receipt/status write after review;
any other endpoint-output change invalidates reuse. After L1 passes, missing execution evidence for an
applicable reviewer blocks `READY`. When L1 fails or is unavailable, record new reviewer execution as
`not-run(L1 prerequisite)` without treating that expected non-execution as a separate reviewer failure. An
allowed light-lane `N/A` is an applicability decision, not missing evidence.

Before the first full L2/L3 dispatch, finish planned implementation and non-receipt spec/plan/tasks edits. Do not interleave bookkeeping edits outside the declared receipt/status outputs between completed review and aggregation. This action reports failed checks and findings; it never repairs implementation or non-receipt artifacts. Separate implementation work may fix them before a later invocation or focused re-review under the rules below.

After required L1 passes and before the first applicable reviewer dispatch, create one transient review-cycle snapshot
containing the reviewed repository identity, the authoritative Git/non-Git changed-path population, the L1 command/result evidence map,
and every applicable reviewer input. For full lane this includes the L2 convention-source paths
and L3 spec/artifact paths. Supply the same snapshot revision and changed-path population to
every reviewer dispatched for that revision; reviewers independently enumerate only their exact applicable
populations. Inability to assess a supplied path or required evidence returns `UNRELIABLE`. Reviewers consume
the L1 evidence map and must not rerun, substitute, or expand L1 commands.

Validate the complete owner-supplied review package before dispatch: reviewed identity, authoritative changed-path
population, L1 evidence entries and mappings, applicable L2 convention sources, and applicable L3 artifact plus
one representation for every Verification obligation. Each L3 obligation must have either an evidence mapping or
an explicit `verification gap`; this owner check validates package structure, presence, and readability, not the
mapped result. A missing, unreadable, or unrepresented required item returns `BLOCKED` without dispatching a
reviewer to discover or repair it; record every applicable review slot as
`not-run(review-package incomplete)`.

Resolve the L2 convention-source paths from the full authoritative changed-path population, not from one
representative file: for each path, collect root `AGENTS.md` and every ancestor tier/module `AGENTS.md` through
the nearest nested source, then union the chains. Keep the transient path-to-source applicability map in the
review-cycle snapshot so L2 can independently verify completeness and root-to-nearest inheritance; do not
include unrelated sibling guidance or persist this map in the delivery receipt.

The L1 evidence map is a structured transient package, not a prose summary. Each evidence entry records an evidence ID, mapped obligation or convention-rule IDs, command or assertion, execution mode (`run` or `same-task reuse`), result/status, relevant-input scope, concise totals when applicable, and the original execution-evidence reference. The L2 package may be explicitly empty when no applicable convention rule depends on mechanical evidence. For L3, every Verification obligation must map to an evidence entry or remain an explicit `verification gap`; an explicit gap or failed mapped evidence is a finding, while a package that becomes missing or unreadable after owner validation is `UNRELIABLE`.

When capacity permits, dispatch L2 and L3 in parallel. Otherwise use sequential fresh dispatch.
Capacity for fewer simultaneous reviewers is not a fallback condition while sequential dispatch remains
available. L2/L3 record their existing population fields independently. After both
initial terminal reports return or fail, revalidate the current reviewed inputs against the transient snapshot
before initial aggregation. Endpoint-owned receipt/status writes remain the only allowed difference during
this dispatch-to-aggregation window; any other material path, content, convention source,
spec/artifact, L1-evidence, or contract drift invalidates the cycle. Stop the current invocation with `BLOCKED`
and record every applicable review slot as `invalidated(review-input drift)`; never auto-start another full-population
cycle inside the same invocation. A later explicit `feature-done` invocation creates the required new cycle after
the worktree and review package are stable.
The snapshot is transient validation evidence: do not persist its path list or a population/content hash in
the receipt.

Focused re-review is a same-task, same-review-cycle optimization implemented as a new revision of the cycle snapshot. A task is the host conversation/thread and may span multiple user turns; crossing a user turn alone does not invalidate retained evidence. After an initial terminal `NEEDS WORK` report, a fix limited to the cited findings and their dependency closure may create a revised snapshot: rerun affected L1 checks, refresh their evidence entries and reviewed identity, dispatch fresh invocations for every affected reviewer population, and retain only unaffected terminal evidence whose inputs and population remain unchanged. The revision may change content and paths inside that declared closure; that expected fix does not by itself force a new full-population cycle.

A later task, missing original full-population terminal evidence, a change outside the finding/dependency closure, a change to the unaffected changed-path population, convention sources, spec contract, reviewer contract, or endpoint outputs, or uncertainty about which L1/reviewer populations the fix affects requires a new full-population review cycle. Narrowing scope never authorizes retasking an old reviewer instance.

## Delivery Receipt (`## Proof Bundle` on disk)

Persist only fields with a downstream consumer:

- `Verdict`: READY / NEEDS WORK / BLOCKED.
- `Change`: in Git, write `git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` for an immutable reviewed state, or `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` for the current dirty worktree. Other reviewed/dirty pairings are invalid. Also record endpoint-owned output paths (`tasks.md` receipt and READY status marker when written). Capture `base`, `reviewed`, and `dirty` before writing those endpoint-owned outputs; the receipt/status edits do not change the recorded dirty status. `base` is the actual left side of the reviewed diff: use an explicit PR base or target-branch merge base for committed branch work, and use `HEAD` only when all reviewed work is uncommitted. An ambiguous repository, base, or feature boundary blocks a reliable verdict. Derive changed paths from Git; do not copy a manual population or persist a population hash. Outside Git, record the explicit reviewed input paths.
- `Checks`: commands, execution mode (`run` or `same-task reuse`), exit status, and concise test totals. A reused check must retain or reference its original same-task result and must not be presented as newly executed.
- `Review execution`: for each L2/L3 slot, record exactly one state: `completed`, an allowed `N/A` reason,
  `not-run(completion preflight)`, `not-run(L1 prerequisite)`, `not-run(review-package incomplete)`, or
  `invalidated(review-input drift)`. When a reviewer was dispatched, also record its identifier, execution mode
  (`fresh-subagent`, `result-reuse`, or `main-session fallback`), completion status, and fallback reason or `none`;
  an invalidated dispatched result retains those execution details. `result-reuse` must retain or reference the
  original execution evidence.
- `L2` / `L3` for full lane: persist verdict and baseline for every valid reviewer result; add findings, applicable-but-unverified identifiers, or ambiguities only when non-empty. Without a valid result, record the slot's exact `not-run(...)` or `invalidated(review-input drift)` state instead of verdict and baseline. A PASS never persists applicable IDs or populations, including inside baseline; those remain transient validation evidence.
- `L2` / `L3` for light lane: record the L2 verdict and baseline when applicable, adding only non-empty exceptions; without a valid applicable L2 result, record its exact `not-run(...)` or `invalidated(review-input drift)` state; otherwise record the allowed `N/A` reason. Record `L3=N/A(light lane)` plus every verification item and result after preflight passes; a preflight stop records `L3=not-run(completion preflight)`.
- `Current truth`: no relevant domain doc / aligned / update pending / area unresolved. Use `area unresolved` only for durable behavior whose ownership is genuinely unknown.
- `Open questions`: only unresolved items that affect handoff or release; omit when empty.
- `Drift`: only actionable project-convention suggestions already produced by L2; omit when empty. Persist it
  elsewhere only when the user explicitly asks to revise conventions. Guidance-placement suggestions name the
  evidence, proposed root/tier/module/mechanical owner, and whether `agents-md-revise` should handle it; they
  never claim automatic creation approval.

Validate each applicable L2/L3 PASS against the authoritative `changed-path-count`, its exact applicable
rule/spec IDs, `unverified-item-count=0`, and `blocking-ambiguity-count=0` before compacting it. The receipt must
contain the Git/non-Git review identity, endpoint outputs, reviewer execution, verdict, checks, applicable
baselines, relevant exceptions, and current truth.

Return a concise human-facing delivery summary containing: verdict; primary-flow result; aggregate check
result; L2/L3 result or N/A/not-run/invalidated; current-truth state; `Lifecycle: READY; archive pending` when READY;
blocking findings when non-empty; and the repository-relative `tasks.md#proof-bundle` path.
Do not inline the full receipt or repeat individual passing commands in the
endpoint response.

For light lane, when the project already declares disaster-invariant/high-blast-radius paths, re-check the actual diff against them; a match is a misclassification. Projects without this optional declaration rely on the semantic high-risk conditions from `feature-init` and do not need an empty path list.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

Run completion preflight first. Only after it passes, run all independently executable required L1 checks before qualitative review. A required L1 failure or unavailable environment suppresses new L2/L3 dispatch but not the current-truth check or receipt assembly. Preserve valid reviewer evidence already completed in the same task, and record every skipped new reviewer slot as `not-run(L1 prerequisite)`.

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
- The delivery receipt is written at the endpoint, not guessed early.
- Completion preflight stops knowingly incomplete, primary-flow-broken, mixed-feature, or accepted-scope-
  drifted work before expensive checks; it never replaces L1/L2/L3 for an eligible feature.
- Completion preflight is the safety net, not permission to defer scope control: implementation should have
  stopped at the first undeclared trigger under the Implementation Scope Stop contract.
- Guidance Placement preflight is mechanical and applies only to an explicit Codify/accepted commitment;
  difference-only and semantic-placement judgment remains in L2. Potential local guidance never creates an
  implicit delivery requirement.
- An empty findings array for an applicable reviewer without reviewer evidence is unreliable and blocks READY; an allowed `N/A` is governed by applicability evidence instead.
- Reviewer compaction follows one snapshot revision shared by all reviewers dispatched for that revision plus transient exact applicable-item validation; a clean terminal report carries `changed-path-count`, exact applicable rule/spec IDs, `unverified-item-count=0`, and `blocking-ambiguity-count=0` without echoing the changed-path list or clean non-match/non-applicable counts. Never infer coverage from `findings=none`, and never persist applicable-rule/spec IDs, manual file populations, or population/content hashes.
- Endpoint-owned receipt/history edits and the allowed status-only `已确认` ↔ `已实现` transitions do not invalidate completed same-task L2/L3 results; changes to tasks outside receipt/history sections or to the spec contract still invalidate them.
- Same-task L1 reuse is execution evidence, not a durable cache: reuse it only while the command, relevant inputs, and changed-scope classification are provably unchanged. Documentation-only receipt/status writes do not invalidate it; later tasks rerun the applicable checks.
- Do not dispatch new L2/L3 reviewers while required L1 is failed or unavailable. This prerequisite does not erase still-valid same-task reviewer evidence and does not suppress current-truth or receipt work.
- Within one snapshot revision, reuse completed reviewer results only when the canonical reviewer contract, snapshot identity, exact scope, every reviewer input, L1 evidence, and applicable population are provably unchanged. Across a permitted focused-re-review revision, retain only an unaffected reviewer's terminal evidence whose reviewer-specific scope, inputs, evidence dependencies, and applicable population remain unchanged; the cycle-level reviewed identity itself advances for the fix. The declared receipt/status write is the only permitted endpoint-output difference outside that fix revision. A user turn alone is not an invalidator. Never reuse or retask the reviewer instance. A later task starts a new full-population cycle instead of relying on transient evidence.
- Review-package gaps block before dispatch. Material review-input drift after dispatch terminates the current
  invocation; it never triggers an automatic replacement cycle.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
