# Known-bad mutation smoke

Use the fixed fixtures under `tests/fixtures/reviewer-smoke/` to verify the complete `feature-done` endpoint: scope assembly, reviewer dispatch, verdict aggregation, and delivery-receipt writing. The deterministic CI check validates the planted mutations, required finding concepts, and verdict truth table; it does **not** execute a model reviewer or receipt writer. Run the actual model endpoint smoke whenever canonical reviewer behavior or the affected runtime adapter changes.

## Materialize a case

Copy `base/` into a temporary directory, initialize and commit it, then overlay either `cases/clean/` or `cases/known-bad/`. This leaves only implementation/test files changed. Do not run the endpoint against the fixture source directory because it writes the receipt.

```bash
node scripts/check-reviewer-fixtures.cjs
# Then materialize one temporary repo per case and invoke feature-done there.
```

## Endpoint expectations

- `clean`: `feature-done 001-normalize-key` returns `READY`; the owning action supplies one review-cycle snapshot and both L2/L3 reports return its matching `changed-path-count`, every exact applicable rule/spec ID, `unverified-item-count=0`, and `blocking-ambiguity-count=0` without echoing the changed-path list or clean non-match/non-applicable counts. The persisted receipt records Git base/reviewed/dirty identity and compresses each PASS review to its baseline plus non-empty exceptions, with no manual path population or applicable-ID fields.
- `known-bad`: L1 remains green, but the endpoint returns `NEEDS WORK`; L2 cites the matching-test-name and no-throw conventions, while L3 cites empty-string behavior and missing empty-input verification.
- `light-clean` / `light-known-bad`: L1 remains green and L2 is explicitly `N/A(low-risk light lane; no L2 trigger after convention-scope triage)` in both; only the explicit `tasks.md` verification distinguishes READY from NEEDS WORK, proving that conditional L2 never skips light-lane acceptance.
- Run both Claude and Codex endpoint adapters when shared/canonical behavior changes. When only one adapter changes, run that adapter plus the deterministic fixture check.

## Completion-preflight smoke

- Leave one required task unchecked and confirm the endpoint returns `NEEDS WORK` before expanded L1 or reviewer dispatch.
- For a user-visible fixture, make its declared primary-flow smoke fail while lower-level checks remain green; confirm expensive L1 and L2/L3 do not start. Restore it and confirm the same result is reused as ordinary L1 evidence rather than run twice.
- Use one older active artifact without the marker whose single existing end-to-end obligation is unambiguous; confirm preflight records `legacy-unambiguous selection` and does not edit the frozen artifact or add a test. Add a second plausible journey and confirm preflight returns `NEEDS WORK` instead of guessing.
- Add an unrelated active-feature change to the same dirty repository and confirm the endpoint returns `BLOCKED` instead of manually subtracting paths. Restore a clean single-feature boundary and confirm the receipt writes one `git=[base=...; reviewed=...; dirty=...]` identity.
- Add a new persistent state/API/responsibility area outside the accepted Delivery Shape Baseline and
  confirm preflight returns `NEEDS WORK` before expanded L1, routing to `spec-revise`, lane upgrade, or a
  child feature. Make ownership of that extra change ambiguous and confirm the verdict becomes `BLOCKED`.
- Use one older active artifact without a Delivery Shape Baseline whose module/scope boundary is
  unambiguous; confirm preflight records `legacy-unambiguous impact boundary`. Make the boundary ambiguous
  and confirm it requires revision instead of guessing.
- Leave the canonical `## Proof Bundle` fields empty and add a non-empty superseded Proof Bundle history; confirm completion preflight ignores both receipt regions rather than treating them as unfinished placeholders.
- For a non-user-visible fixture, confirm preflight records `N/A(not user-visible)` without inventing a smoke.

## Endpoint-summary smoke

- Confirm the endpoint response contains verdict, `Lifecycle: READY; archive pending` when READY, primary-flow result, aggregate checks, L2/L3, current truth, non-empty blockers, and a repository-relative `tasks.md#proof-bundle` link.
- Confirm the full receipt remains on disk and the endpoint response does not inline it or repeat every passing command.

## Reopen smoke

- Start from an active, unarchived full-lane READY feature. Run `spec-revise` for a material contract/plan/Verification omission and confirm status returns from `已实现` to `已确认`, the exact prior receipt moves under a uniquely named dated-or-numbered superseded heading, and exactly one empty canonical `## Proof Bundle` remains.
- With the accepted contract unchanged, introduce a pure implementation regression, repair it, and explicitly rerun `feature-done`. Confirm the old receipt is preserved before replacement; a non-READY result returns status to `已确认`, while READY keeps `已实现`. A completion-preflight stop writes the new receipt with reviewers `not-run(completion preflight)` rather than leaving the old READY active.
- Confirm `feature-archive` rejects the reopened feature until a new `feature-done` writes READY. Confirm an already archived feature requires a successor change instead of reopening history.

## Runtime scheduling smoke

Run the full-lane `clean` case with each adapter and record dispatch timing/mode:

- With capacity for both reviewers, L2 and L3 fresh dispatches start before either result returns; both retain independent exact-population evidence.
- With only one reviewer slot available, L2 and L3 run as sequential fresh dispatches. Do not record `main-session fallback` merely because the second slot was unavailable.
- A failure in one reviewer does not cancel or erase the independently executable result from the other reviewer.

If the host cannot expose or constrain reviewer capacity, record that limitation instead of claiming the scheduling branch passed.

## Review-cycle snapshot smoke

- Capture one changed-path population and reviewer-input snapshot after L1; confirm parallel and sequential L2/L3 dispatches receive the same snapshot and report the same `changed-path-count`.
- During an initial sequential run, mutate a non-receipt reviewed input after L2 returns but before L3 aggregation. Confirm the endpoint rejects both reports for aggregation and starts a new full-population cycle instead of accepting mixed watermarks.
- Complete the initial `known-bad` terminal report, cross one user turn in the same task, and apply a fix limited to the cited finding and dependency closure. Confirm the endpoint creates a new snapshot revision, reruns affected L1 evidence, dispatches fresh invocations for every affected reviewer population, and retains only unchanged unaffected terminal evidence.
- Repeat after changing an unaffected implementation path, convention source, spec artifact, reviewer contract, or anything outside the declared fix closure; confirm focused re-review is invalidated. Make the affected L1 boundary uncertain, or start a new task, and confirm a new full-population cycle is required.

## Reviewer execution-boundary smoke

- Instrument or record shell/tool calls for L2/L3. Confirm reviewers use only read-only Git/diff/search inspection and do not run tests, builds, linters, acceptance commands, or other L1 checks.
- Confirm each supplied evidence entry contains an evidence ID, mapped obligation/rule IDs, command/assertion, `run` or `same-task reuse`, result/status, relevant-input scope, concise totals when applicable, and an original evidence reference. An explicitly empty L2 map is valid only when no applicable convention rule depends on mechanical evidence.
- Omit the caller-supplied L1 evidence package and confirm the affected reviewer returns `UNRELIABLE` without running a replacement command.
- Supply a complete L1 evidence map that leaves a required L3 Verification obligation unmapped; confirm L3 reports `NEEDS WORK` with a `verification gap`, not `UNRELIABLE`.
- Confirm each reviewer starts from every changed hunk, expands only when an applicable rule/spec item needs symbol/file/dependency context, and still enumerates the full population for a distributed obligation.

## L1 reuse smoke

- In one task, run two independent changed-scope checks and retain both results.
- Apply a fix that affects only one check, then rerun `feature-done`: rerun that check and its dependency closure; record the unaffected check as `same-task reuse` with its original evidence reference.
- Confirm heavyweight commands sharing a workspace or build cache run sequentially.
- Start a new task, or make the relevant-input boundary uncertain, and confirm the applicable checks run again.

## L1 prerequisite smoke

- Plant a required L1 failure and confirm all other independently executable L1 checks still run.
- Confirm neither adapter dispatches new L2/L3 reviewers; Review execution and each otherwise-applicable L2/L3 slot without a valid same-task result record `not-run(L1 prerequisite)`, and the receipt returns `NEEDS WORK`.
- Make a required L1 command unavailable and confirm the same reviewer behavior with a `BLOCKED` verdict.
- Restore L1 to green and confirm the normal applicable L2/L3 dispatch resumes.

## Spec-quality authorization smoke

Materialize a mechanically complete, subjectively clean full-lane draft with status `草稿`, then run each Claude/Codex adapter in fresh tasks:

- Pure check request: `READY`; status remains `草稿`; no implementation starts.
- Explicit conditional request ("if this passes, continue implementation"): `READY`; only the top status marker changes to `已确认` before implementation continues.
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
- Add a material accepted owner/fallback rule to the source map but omit it from the artifacts; expect
  `MISMATCH: missing-from-artifact` with both source-map and artifact citations.
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
- Remove the Delivery Shape Baseline from a new artifact or leave ownership/data-disposition scope-growth
  triggers unresolved; confirm Q7d returns `BLOCKED`. Repeat with an artifact that repository history or
  explicit current-user confirmation identifies as pre-3.11 and whose Scope, Constraints, and Module Impact
  establish one unambiguous boundary; confirm it records
  `legacy-unambiguous impact boundary` without rewriting the artifact. Make that boundary ambiguous and
  confirm revision is required.

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
- Put a path-local rule at root, but leave one real consumer outside the proposed subtree. Confirm
  `agents-md-revise` may suggest a local copy/difference but must not move the root rule until evidence shows
  no outside consumer remains. Repeat with no explicit `Codify`: `feature-done` creates no implicit guidance
  requirement or suggestion and must not create or move guidance.
- Put product behavior or a temporary feature decision into nested guidance and confirm it routes back to
  spec/plan/ADR. Give the same rule an objective lint/hook/test implementation and confirm the preferred
  proposal is `mechanize`, not another prompt file.

## Implementation Scope Stop smoke

Start implementing an accepted full-lane artifact whose Delivery Shape Baseline excludes a generic admin
console, compatibility state, and second Provider:

- Discover that the simplest implementation needs an ordinary private helper inside an already declared
  responsibility area. Confirm it is classified `necessary-detail` and implementation continues without a
  user question or `Scope stop` narration.
- Propose a reusable Pending state/admin console “for possible future operations.” Confirm implementation
  stops before adding more production code, tests, migrations, compatibility paths, or docs for it; the report
  contains the delta, baseline mismatch, current necessity, recommended removal, and at most one question.
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

## Release interpretation

- Record case, adapter, endpoint verdict, review-cycle identity, transient changed-path count and exact applicable IDs, every unverified/ambiguity count plus non-empty identifiers, actual cited findings, scheduling/status-transition evidence, and the Git-native compact persisted receipt in the release PR/task. A static CI pass is not endpoint evidence.
- A clean result on the `known-bad` case is a release blocker: reviewer sensitivity or endpoint assembly is broken even if the output schema is complete.
- This is a sensitivity smoke, not a benchmark. Repeated zero-finding production runs are only a cost signal and never substitute for a known-bad case.
