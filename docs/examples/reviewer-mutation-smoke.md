# Known-bad mutation smoke

Use the fixed fixtures under `tests/fixtures/reviewer-smoke/` to verify the complete `feature-done` endpoint: scope assembly, reviewer dispatch, verdict aggregation, and delivery-receipt writing. The deterministic CI check validates current completion-preflight fixture shape, planted mutations, required finding concepts, and the verdict truth table; it does **not** execute a model reviewer or receipt writer. Run the actual model endpoint smoke whenever canonical reviewer behavior or the affected runtime adapter changes.

## Materialize a case

Copy `base/` into a temporary directory, initialize and commit it, then overlay either `cases/clean/` or `cases/known-bad/`. This leaves only implementation/test files changed. Do not run the endpoint against the fixture source directory because it writes the receipt.

```bash
node scripts/check-reviewer-fixtures.cjs
# Then materialize one temporary repo per case and invoke feature-done there.
```

## Endpoint expectations

- `clean`: `feature-done 001-normalize-key` returns `READY`; the owning action supplies one stable review snapshot, L3 declares complete spec coverage, then L2 passes on the same unchanged snapshot. The persisted receipt records Git base/reviewed/dirty identity and compresses each PASS review to its baseline plus non-empty exceptions.
- `known-bad`: L1 remains green and L3 cites empty-string behavior plus missing empty-input verification, so the
  ordinary endpoint returns `NEEDS WORK` with L2 `not-run(awaiting final L3 candidate)`. Separately run the L2
  reviewer against the same snapshot and confirm it cites the matching-test-name and no-throw conventions; this
  checks L2 sensitivity without contradicting endpoint scheduling.
- `light-clean` / `light-known-bad`: L1 remains green and L2 is explicitly `N/A(low-risk light lane; no L2 trigger)` in both; only the explicit `tasks.md` verification distinguishes READY from NEEDS WORK, proving that conditional L2 never skips light-lane acceptance.
- Run both Claude and Codex endpoint adapters when shared/canonical behavior changes. When only one adapter changes, run that adapter plus the deterministic fixture check.

## Completion-preflight smoke

- Leave one required task unchecked and confirm the endpoint returns `NEEDS WORK` before expanded L1 or reviewer dispatch, records current truth `not-run(non-READY prerequisite)`, and does not preserve the failed receipt as a full Previous Proof Bundle on the next ordinary rerun.
- Reuse or invoke `feature-done` directly on an accepted full-lane artifact whose Prior decisions lacks the
  semantic source column (or its explicit N/A). Confirm implementation/expanded L1 does not start and the
  artifact routes through repair/`spec-revise` plus `spec-quality-check`.
- Use a reused full-lane feature whose tasks omit a focused check that its accepted plan explicitly declares before
  dependent work. Confirm completion preflight returns `NEEDS WORK`. Complete and record that declared check and
  confirm normal preflight resumes from the artifact's declared boundary and evidence.
- For a user-visible fixture, make its declared primary-flow smoke fail while lower-level checks remain green; confirm expensive L1 and L2/L3 do not start. Restore it and confirm the same result is reused as ordinary L1 evidence rather than run twice.
- Reorder a user-visible artifact so a broad matrix precedes its shortest actor-to-result journey; confirm Q3
  requests a clearer evidence order without inventing another smoke.
- Add an unrelated active-feature change to the same dirty repository and confirm the endpoint returns `BLOCKED` instead of manually subtracting paths. Restore a clean single-feature boundary and confirm the receipt writes one `git=[base=...; reviewed=...; dirty=...]` identity.
- Add a new persistent state/API/responsibility area outside the accepted Scope / Constraints / Module Impact and
  confirm preflight returns `NEEDS WORK` before expanded L1, routing to `spec-revise`, lane upgrade, or a
  child feature. Make ownership of that extra change ambiguous and confirm the verdict becomes `BLOCKED`.
- For multi-boundary or materially high-risk work, remove the recorded coupling/rollback boundary and confirm
  preflight returns `NEEDS WORK`; ordinary same-boundary work does not require that conditional section.
- Leave the canonical `## Proof Bundle` fields empty and add a non-empty superseded Proof Bundle history; confirm completion preflight ignores both receipt regions rather than treating them as unfinished placeholders.
- For a non-user-visible fixture, confirm preflight records `N/A(not user-visible)` without inventing a smoke.

## Endpoint-summary smoke

- Confirm the endpoint response contains verdict, `Lifecycle: READY; archive pending` when READY, the first declared actor-to-result result when applicable, aggregate checks, L2/L3, current truth, non-empty blockers, and a repository-relative `tasks.md#proof-bundle` link. Under finish/delivery intent, confirm it stops at READY; under close/archive/submit intent, confirm READY continues to explicit-candidate archive without another question.
- Confirm the full receipt remains on disk and the endpoint response does not inline it or repeat every passing command.

## Reopen smoke

- Start from an active, unarchived full-lane READY feature. Run `spec-revise` for a material contract/plan/Verification omission and confirm status returns from `已实现` to `已确认`, the exact prior receipt moves under a uniquely named dated-or-numbered superseded heading, and exactly one empty canonical `## Proof Bundle` remains.
- Start from an ordinary non-READY feature, rerun the gate, and confirm the canonical receipt is replaced without a full Previous Proof Bundle; at most one dated single-line attempt summary is added to the implementation record.
- With the accepted contract unchanged, introduce a pure implementation regression, repair it, and explicitly rerun `feature-done`. Confirm the old receipt is preserved before replacement; a non-READY result returns status to `已确认`, while READY keeps `已实现`. A completion-preflight stop writes the new receipt with reviewers `not-run(completion preflight)` rather than leaving the old READY active.
- Confirm `feature-archive` rejects the reopened feature until a new `feature-done` writes READY. Confirm an already archived feature requires a successor change instead of reopening history.
- Remove Checks, applicable L2/L3 review outcomes, or Current truth from an otherwise READY receipt and
  confirm `feature-archive` rejects it and reports `rerun feature-done`; optional Open questions/Drift may be absent.

## Runtime scheduling smoke

Run an ordinary full-lane `clean` case and a convention-risk case with each adapter and record dispatch timing/mode:

- Ordinary full lane dispatches pure L3 first, then dispatches L2 once only when L3 passes and the snapshot remains unchanged; READY requires both PASS.
- In the convention-risk case, with capacity for both reviewers, L2 and L3 fresh dispatches start before either result returns; both retain independent reviewed-scope and coverage evidence.
- In the convention-risk case with only one reviewer slot available, L2 and L3 run as sequential fresh dispatches; reserve `main-session fallback` for execution failure.
- A failure in one reviewer does not cancel or erase the independently executable result from the other reviewer.
- Make one reviewer fail to return a terminal result for runtime/transport reasons after a bounded completion attempt; confirm the action makes exactly one fresh same-contract fallback. `NEEDS WORK` and `UNRELIABLE` remain terminal verdicts.
- Omit a nested `AGENTS.md` from a caller-supplied source list while changing a path below it; confirm the mechanically resolved root-to-nearest ancestor chain matches the filesystem before dispatch.
- In an isolated feature worktree, commit an earlier selected-feature change and leave a tracked edit plus an
  untracked selected-feature file dirty. Confirm completion preflight uses the actual feature base to review the
  complete committed-and-uncommitted worktree population, rather than reviewing only `HEAD` to worktree.
- Mix another active feature or unrelated work into that population; confirm completion preflight returns
  `BLOCKED` before L1 instead of subtracting paths or asking reviewers to infer ownership.
- After a non-READY verdict, confirm no implementation repair or reviewer rerun occurs inside that gate.
  After repair outside the gate, invoke `feature-done` again and confirm it creates a fresh final snapshot,
  reruns affected checks and applicable reviews, and reuses only unchanged same-task L1 evidence.

If the host cannot expose or constrain reviewer capacity, record that limitation instead of claiming the scheduling branch passed.

## Review-cycle snapshot smoke

- Capture one changed-path population and reviewer-input snapshot after L1; confirm parallel and sequential L2/L3 dispatches receive the same stable snapshot.
- Omit an owner-required review-package input before dispatch. Confirm the endpoint records every applicable slot as `not-run(review-package incomplete)`, returns `BLOCKED`, and dispatches no reviewer.
- During a sequential or capacity-serialized run, mutate a non-receipt reviewed input after one reviewer returns but
  before final aggregation. Confirm the endpoint rejects the cycle for aggregation, records every applicable slot
  as `invalidated(review-input drift)`, returns `BLOCKED`, and does not auto-start another full-population cycle. A
  later explicit invocation may start the new cycle after inputs stabilize.
- Complete the initial `known-bad` report and confirm implementation and non-receipt artifacts remain unchanged
  inside the gate. With an existing implementation/delivery request, confirm the owning workflow reports and
  repairs ordinary defects within the accepted scope without another confirmation, then runs a fresh gate.
  Let repair and review keep cycling without converging, including when findings change between runs; confirm
  it explains the remaining problems and recommended next step, then waits for the user's decision.
  With a review-only request, confirm it stops at the verdict. A material direction/scope change or an operation
  requiring separate approval still waits for the user. Change the feature boundary, convention source,
  accepted spec, or reviewer contract and confirm the later gate runs the standard full review of the new snapshot.

## Reviewer execution-boundary smoke

- Instrument or record shell/tool calls for L2/L3. Confirm reviewers use only read-only Git/diff/search inspection and do not run tests, builds, linters, acceptance commands, or other L1 checks.
- Confirm each supplied evidence entry identifies the obligation, rule, or coverage area it supports, plus the command/assertion, `run` or `same-task reuse`, result/status, relevant-input scope, concise totals when applicable, and original evidence reference. An explicitly empty L2 map is valid only when no applicable convention rule depends on mechanical evidence.
- Omit the caller-supplied L1 evidence package and confirm the affected reviewer returns one terminal `UNRELIABLE` report without running a replacement command, requesting the missing package, or waiting for supplemental input.
- Supply a complete L1 evidence map that represents a required L3 Verification obligation as an explicit `verification gap`; confirm L3 reports `NEEDS WORK`, not `UNRELIABLE`.
- Confirm each reviewer starts from every changed hunk, expands only when an applicable rule/spec item needs symbol/file/dependency context, and completely assesses the supplied scope plus any whole population required by a distributed obligation.

## L1 reuse smoke

- In one task, run two independent changed-scope checks and retain both results.
- Apply a fix that affects only one check, then rerun `feature-done`: rerun that check and its dependency closure; record the unaffected check as `same-task reuse` with its original evidence reference.
- Confirm heavyweight commands sharing a workspace or build cache run sequentially.
- Start a new task, or make the relevant-input boundary uncertain, and confirm the applicable checks run again.

## L1 prerequisite smoke

- Plant a required L1 failure and confirm all other independently executable L1 checks still run.
- Confirm neither adapter dispatches new L2/L3 reviewers; each otherwise-applicable L2/L3 review records
  `not-run(L1 prerequisite)`, and the receipt returns `NEEDS WORK`.
- Make a required L1 command unavailable and confirm the same reviewer behavior with a `BLOCKED` verdict.
- Restore L1 to green and confirm the normal applicable L2/L3 dispatch resumes.

## Spec-quality authorization smoke

Materialize a mechanically complete, subjectively clean full-lane draft with status `草稿`, then run each Claude/Codex adapter in fresh tasks:

- Pure check request: `READY`; status remains `草稿`; no implementation starts.
- Explicit conditional request ("if this passes, proceed"): `READY`; only the top status marker changes to
  `已确认`. Implementation continues only when the current execution preview was also accepted; otherwise
  the host returns that preview and waits without editing implementation files.
- `BORDERLINE` result under a pass-only conditional request: status remains `草稿`; the adapter reports the concrete risk/follow-up and asks for explicit acceptance.
- `BLOCKED` result: status and implementation remain unchanged; subjective review is N/A when mechanical prerequisites failed.
- A mechanically complete but substantively mostly empty artifact dispatches the reviewer and returns blocking
  Q findings; it never reports reviewer N/A after dispatch.

## Requirements-reconciliation smoke

Run `spec-quality-check` on a mechanically complete artifact with an exact Requirements Source Map and confirm
one fresh reviewer performs reconciliation first and Q3-Q7 second; there is no second dispatch:

- Clean bidirectional mapping returns `Requirements Reconciliation: ALIGNED`, then the ordinary quality
  verdict is evaluated.
- Supply or explicitly confirm an ordinary outcome/scope/constraint in `spec.md` without copying it into plan
  Prior decisions; expect ALIGNED when no external conflict exists. Add a non-obvious external interpretation,
  bundled-risk acceptance, or supersede claim without authority and expect `SOURCE GAP`.
- Remove the source from a non-obvious external/conflict/bundled-risk/supersede decision and confirm the gate
  returns `BLOCKED` before implementation. When no decision requires a durable source trace, the section may be omitted.
- Add a material accepted owner/fallback rule to the source map but omit it from the artifacts; expect
  `MISMATCH: missing-from-artifact` with both source-map and artifact citations.
- Supply a resolved multi-turn decision closure in the Requirements Source Map and confirm reconciliation
  checks artifact coverage without reopening the choice or asking for confirmation. Remove the authoritative
  resolution while retaining conflicting alternatives and expect `SOURCE GAP`, not a guessed latest-wins rule.
- Add a Pending state, management console, or permission workflow to the artifacts without a current accepted
  source/consumer; expect `MISMATCH: unsupported-artifact`, independent of how complete its tasks are.
- Record a later accepted decision that removes `PENDING_OWNER` and makes unknown ownership explicitly shared,
  but leave an older “PMO rejects unowned facts” rule in spec prose, Verification, tasks, fallback, or migration;
  expect `MISMATCH: superseded-remnant` and `BLOCKED`.
- Make spec and tasks encode opposite authorization rules; expect `MISMATCH: cross-artifact-conflict`.
- Claim that a newer rule supersedes an older one without an authoritative source, or supply two conflicting
  sources with no explicit replacement; expect `SOURCE GAP` rather than a guessed winner.
- Confirm ownership, authorization, hierarchy, fallback, unknown-data, and migration decisions are challenged
  with a materially different counterexample when they can change the result.

## Delivery-shape smoke

Run `spec-quality-check` against two full-lane artifacts whose individual tasks are concrete:

- A large artifact with several outcomes that can be accepted, shipped, and reverted independently and no mandatory coupling returns `BLOCKED` with a decomposition finding.
- A similarly large but atomic migration returns `READY` when coupling, verification, and material rollback risk are resolved. It is `BORDERLINE` only while a material coordination/rollback risk still requires acceptance; size and breadth signals alone never change the verdict.
- A bundled-delivery risk already accepted and sourced in the plan remains `BORDERLINE`, but satisfies its risk-acceptance prerequisite while the outcomes and risk remain unchanged; the adapter does not ask twice.
- Add a Pending state, management surface, queue, or CAS workflow justified only by possible future use;
  confirm Q7c returns `BLOCKED` until it is removed, durably deferred, or given a traceable current
  consumer and necessity.
- For multi-boundary or materially high-risk work, leave ownership/data-disposition coupling or scope-growth
  triggers unresolved and confirm Q7d returns `BLOCKED`. Ordinary same-boundary artifacts rely on Scope,
  Constraints, Module Impact, and Verification. When real dependency checkpoints are
  missing, confirm Q7a remains `BLOCKED` until plan/tasks make them actionable with focused checks.

## Architecture-shaped spec-quality smoke

- Use a full-lane artifact that materially changes module responsibility, cross-component state/contract,
  durable trust/authorization ownership, or deployment ownership. Confirm the existing single
  `spec-quality-reviewer` folds architecture adequacy into Q5/Q7c/Q7d with no second dispatch or output field.
- Remove an applicable responsibility owner, contract/state boundary, trust/deployment owner, or material
  failure/migration/recovery decision; expect a blocking Q5/Q7d finding. Add an infrastructure component with
  no current consumer; expect Q7c to reject it.
- Repeat with an ordinary permission rule or internal refactor inside unchanged boundaries and confirm the
  conditional architecture check is skipped.

## Guidance-placement smoke

- Use an ordinary module that inherits all root/tier rules. Confirm `project-personalize` and `feature-init`
  do not propose a nested file merely for symmetry or because the root file is long.
- Give three sibling modules the same durable runtime-local difference. Confirm placement resolves to one tier
  `AGENTS.md`; then add one genuine module exception and confirm only that difference resolves to the module.
- Select `Codify` in Sibling Alignment but omit the exact root/tier/module/mechanical target or source. Confirm
  Q6 blocks `spec-quality-check`; after acceptance, omit the promised file/enforcement and confirm
  `feature-done` returns `NEEDS WORK` at completion preflight.
- Copy inherited parent prose into a nested file and use a nested `CLAUDE.md` whose bytes are not
  `@AGENTS.md\n`. Confirm the placement audit flags duplication and malformed alias without claiming the
  architecture itself is wrong.
- Give one tier a difference-only rule that names and replaces the same root requirement, change files inside that
  tier and in an unrelated sibling tier, and confirm L2 applies the override only inside its subtree while the
  sibling still inherits the root rule. Omit the tier source from the caller package and confirm L2 returns
  `UNRELIABLE` instead of silently reviewing against root alone.
- Put a path-local rule at root, but leave one real consumer outside the proposed subtree. Confirm
  `agents-md-revise` may suggest a local copy/difference but must not move the root rule until evidence shows
  no outside consumer remains. Repeat with no explicit `Codify`: `feature-done` creates no implicit guidance
  requirement or suggestion and must not create or move guidance.
- Put product behavior or a temporary feature decision into nested guidance and confirm it routes back to
  spec/plan/ADR. Give the same rule an objective lint/hook/test implementation and confirm the preferred
  proposal is `mechanize`, not another prompt file.

## Decision conversation smoke

- Give `project-personalize` a manifest and CI file that agree on one test command. Confirm it carries the
  observed command into the draft and asks no question about it; a fixed label is optional.
- Add two conflicting active lint commands with no ownership evidence. Confirm it explains the evidence,
  recommends the smallest adjustment, and asks only the questions needed to resolve the working agreement.
- Answer, then expose a separate hook-policy gap and an objectively stale source path. Confirm the draft/source
  trace updates, independent evidence work continues without restating settled facts, and later material evidence
  reopens only the affected choice with a reason.
- Make the remaining uncertainty an architecture/product decision. Confirm it routes to `feature-init` instead
  of extending personalization.
- Close all material gaps. Confirm the authorized changes apply without an additional
  feature, spec, lane, gate, reviewer, status, or approval cycle created by the conversation.
- For `spec-reconcile`, group only contradictions resolved by one precedence/lifecycle choice; keep independent conflicts separate, present evidence and a recommendation, allow the user to split the group, and choose nothing silently.

## Implementation Scope Stop smoke

Start implementing an accepted full-lane artifact whose accepted scope excludes a generic admin
console, compatibility state, and second Provider:

- Discover that the simplest implementation needs an ordinary private helper inside an already declared
  responsibility area. Confirm it is classified `necessary-detail` and implementation continues without a
  user question or stop narration.
- Propose a reusable Pending state/admin console “for possible future operations.” Confirm implementation
  stops before adding more production code, tests, migrations, compatibility paths, or docs for it; the report
  contains the delta, boundary mismatch, current necessity, recommended removal, and only the questions needed
  to choose direction.
- Choose removal and confirm speculative code/tests are isolated or removed without creating a child feature,
  repository backlog, or `spec-revise` record merely to preserve them.
- Instead discover a real material authorization correction. Confirm work on that delta waits for one user
  direction decision, records the source, runs `spec-revise`, and reruns `spec-quality-check` before resuming.
- Repeat from `DIRECT` and `LIGHT`; confirm a high-risk trigger upgrades the lane. Repeat from `FULL`; confirm
  full lane is not blanket permission for adjacent scope.

## Minimal-evidence smoke

- Give one existing integration assertion complete coverage of a declared serializer behavior, then propose
  duplicate unit, API, e2e, and happy/boundary/error obligations with no distinct risk. Confirm Q3 blocks an
  artifact that requires them until it is consolidated. Once implementation starts, confirm completion
  preflight does not repeat that qualitative judgment; applicable project test conventions remain owned by L2.
- Add a role × visibility matrix where the interaction changes authorization results; confirm it remains because
  it names distinct risk coverage rather than because a matrix is preferred.
- Add a project-required release smoke not covered by cheaper evidence; confirm it remains.
- During implementation run a focused check, then select final checks from the artifact, changed scope, shared
  surfaces, and applicable conventions. Confirm no complete suite is added without one of those triggers and
  each unchanged final evidence source is recorded once.
- Vary file/test counts without changing traceable risk coverage and confirm the verdict does not change.

## Phase-focused validation smoke

Start with one accepted medium, multi-boundary full-lane outcome whose plan and tasks describe three meaningful
dependency-ordered results: domain/state, public contract, and actor operation:

- Complete the domain/state result, run its smallest focused check, and record the result on the existing task.
  Confirm no L2/L3 or Proof Bundle is introduced before endpoint review.
- Resume after context compaction. Confirm implementation re-reads spec Verification, the accepted boundary,
  implementation order, and incomplete tasks before dependent work.
- Keep the next result aligned with the accepted boundary. Confirm work continues under the same active feature,
  tasks, accepted boundary, and endpoint gates.
- Fail the public-contract focused check once and confirm the implementation repairs only that phase and reruns
  affected evidence. Repeat the same failure without new diagnostic evidence and confirm it explains the blocker
  and recommended next step, then waits for the user's decision instead of starting a broad review loop.
- Change the next public DTO so that it contradicts the accepted failure-state contract. Confirm Scope Stop
  activates before dependent UI, tests, or documentation are added.
- Replace the inspectable results with broad technical buckets that hide a real dependency checkpoint. Confirm
  Q7a blocks the missing result/evidence boundary.
- Reduce the same feature to one directly verifiable responsibility and confirm Q7a accepts its existing task and
  evidence boundary.
- Add a material dependency/rollback risk and confirm important dependent phases name an inspectable
  exit, next consumer, and smallest focused evidence where that information helps execution.
- Map phase-focused checks to applicable spec Verification obligations. Confirm the final Verification checklist
  contains only remaining cross-phase/endpoint evidence, or an explicit N/A when all obligations are already
  covered; completed phase checks remain valid evidence for the endpoint.
- Make one result independently acceptable, enableable, and revertible. Confirm scope viability is rechecked and
  it remains bundled only when concrete coupling requires one delivery.
- Complete all declared focused checks, then invoke `feature-done`. Confirm it reuses still-valid same-task evidence,
  runs only remaining final/cross-phase checks, then reviews one stable final snapshot.
- Give a ready-for-gate artifact a checklist item whose result is "run feature-done and become READY". Confirm
  Q7a or completion preflight keeps READY, receipt/status writes, and archive eligibility in the endpoint/lifecycle
  output and returns the task artifact for cleanup before review.
- Produce a non-READY receipt with one implementation defect and one material contract mismatch. Confirm the
  blocker groups use `direct-repair` and `spec-revise` respectively, without starting repair or another gate run.

## Release interpretation

- Record case, adapter, endpoint verdict, reviewed-scope identity, coverage gaps or ambiguities, actual cited findings, scheduling/status-transition evidence, and the Git-native compact persisted receipt in the release PR/task. A static CI pass is not endpoint evidence.
- A clean endpoint result on `known-bad`, or a clean isolated L2 result on its planted convention violations, is a
  release blocker even when the output schema is complete.
- This is a sensitivity smoke, not a benchmark. Repeated zero-finding production runs are only a cost signal and never substitute for a known-bad case.
