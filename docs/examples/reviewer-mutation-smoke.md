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

## Delivery-shape smoke

Run `spec-quality-check` against two full-lane artifacts whose individual tasks are concrete:

- A large artifact with several outcomes that can be accepted, shipped, and reverted independently and no mandatory coupling returns `BLOCKED` with a decomposition finding.
- A similarly large but atomic migration returns `READY` when coupling, verification, and material rollback risk are resolved. It is `BORDERLINE` only while a material coordination/rollback risk still requires acceptance; size and breadth signals alone never change the verdict.
- A bundled-delivery risk already accepted and sourced in the plan remains `BORDERLINE`, but satisfies its risk-acceptance prerequisite while the outcomes and risk remain unchanged; the adapter does not ask twice.

## Release interpretation

- Record case, adapter, endpoint verdict, review-cycle identity, transient changed-path count and exact applicable IDs, every unverified/ambiguity count plus non-empty identifiers, actual cited findings, scheduling/status-transition evidence, and the Git-native compact persisted receipt in the release PR/task. A static CI pass is not endpoint evidence.
- A clean result on the `known-bad` case is a release blocker: reviewer sensitivity or endpoint assembly is broken even if the output schema is complete.
- This is a sensitivity smoke, not a benchmark. Repeated zero-finding production runs are only a cost signal and never substitute for a known-bad case.
