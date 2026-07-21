# Known-bad mutation smoke

Use the fixed fixtures under `tests/fixtures/reviewer-smoke/` to verify the complete `feature-done` endpoint: scope assembly, reviewer dispatch, verdict aggregation, and delivery-receipt writing. The deterministic CI check validates the planted mutations, required finding concepts, and verdict truth table; it does **not** execute a model reviewer or receipt writer. Run the actual model endpoint smoke whenever canonical reviewer behavior or the affected runtime adapter changes.

## Materialize a case

Copy `base/` into a temporary directory, initialize and commit it, then overlay either `cases/clean/` or `cases/known-bad/`. This leaves only implementation/test files changed. Do not run the endpoint against the fixture source directory because it writes the receipt.

```bash
node scripts/check-reviewer-fixtures.cjs
# Then materialize one temporary repo per case and invoke feature-done there.
```

## Endpoint expectations

- `clean`: `feature-done 001-normalize-key` returns `READY`; transient L2/L3 evidence lists exact changed paths, every applicable rule/spec-item ID, no applicable-but-unverified items, and no blocking ambiguity. The persisted receipt records Git base/reviewed/dirty identity and compresses each PASS review to its baseline plus non-empty exceptions, with no manual path population or applicable-ID fields.
- `known-bad`: L1 remains green, but the endpoint returns `NEEDS WORK`; L2 cites the matching-test-name and no-throw conventions, while L3 cites empty-string behavior and missing empty-input verification.
- `light-clean` / `light-known-bad`: L1 remains green and L2 is explicitly `N/A(low-risk light lane; no L2 trigger after convention-scope triage)` in both; only the explicit `tasks.md` verification distinguishes READY from NEEDS WORK, proving that conditional L2 never skips light-lane acceptance.
- Run both Claude and Codex endpoint adapters when shared/canonical behavior changes. When only one adapter changes, run that adapter plus the deterministic fixture check.

## Runtime scheduling smoke

Run the full-lane `clean` case with each adapter and record dispatch timing/mode:

- With capacity for both reviewers, L2 and L3 fresh dispatches start before either result returns; both retain independent exact-population evidence.
- With only one reviewer slot available, L2 and L3 run as sequential fresh dispatches. Do not record `main-session fallback` merely because the second slot was unavailable.
- A failure in one reviewer does not cancel or erase the independently executable result from the other reviewer.

If the host cannot expose or constrain reviewer capacity, record that limitation instead of claiming the scheduling branch passed.

## Spec-quality authorization smoke

Materialize a mechanically complete, subjectively clean full-lane draft with status `草稿`, then run each Claude/Codex adapter in fresh tasks:

- Pure check request: `READY`; status remains `草稿`; no implementation starts.
- Explicit conditional request ("if this passes, continue implementation"): `READY`; only the top status marker changes to `已确认` before implementation continues.
- `BORDERLINE` result under a pass-only conditional request: status remains `草稿`; the adapter reports the concrete risk/follow-up and asks for explicit acceptance.
- `BLOCKED` result: status and implementation remain unchanged; subjective review is N/A when mechanical prerequisites failed.

## Release interpretation

- Record case, adapter, endpoint verdict, transient exact applicable/unverified IDs and ambiguities, actual cited findings, scheduling/status-transition evidence, and the Git-native compact persisted receipt in the release PR/task. A static CI pass is not endpoint evidence.
- A clean result on the `known-bad` case is a release blocker: reviewer sensitivity or endpoint assembly is broken even if the output schema is complete.
- This is a sensitivity smoke, not a benchmark. Repeated zero-finding production runs are only a cost signal and never substitute for a known-bad case.
