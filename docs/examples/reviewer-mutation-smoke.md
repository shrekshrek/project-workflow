# Known-bad mutation smoke

Use the fixed fixtures under `tests/fixtures/reviewer-smoke/` to verify the complete `feature-done` endpoint: scope assembly, reviewer dispatch, verdict aggregation, and delivery-receipt writing. The deterministic CI check validates the planted mutations, required finding concepts, and verdict truth table; it does **not** execute a model reviewer or receipt writer. Run the actual model endpoint smoke whenever canonical reviewer behavior or the affected runtime adapter changes.

## Materialize a case

Copy `base/` into a temporary directory, initialize and commit it, then overlay either `cases/clean/` or `cases/known-bad/`. This leaves only implementation/test files changed. Do not run the endpoint against the fixture source directory because it writes the receipt.

```bash
node scripts/check-reviewer-fixtures.cjs
# Then materialize one temporary repo per case and invoke feature-done there.
```

## Endpoint expectations

- `clean`: `feature-done 001-normalize-key` returns `READY`; transient L2/L3 evidence lists exact changed paths, every applicable rule/spec-item ID, no applicable-but-unverified items, and no blocking ambiguity. The persisted receipt keeps the exact review scope but compresses each PASS review to its baseline plus empty findings/unverified/ambiguities.
- `known-bad`: L1 remains green, but the endpoint returns `NEEDS WORK`; L2 cites the matching-test-name and no-throw conventions, while L3 cites empty-string behavior and missing empty-input verification.
- `light-clean` / `light-known-bad`: L1 and L2 remain green in both; only the explicit `tasks.md` verification distinguishes READY from NEEDS WORK, proving that light-lane validation is not silently skipped.
- Run both Claude and Codex endpoint adapters when shared/canonical behavior changes. When only one adapter changes, run that adapter plus the deterministic fixture check.

## Release interpretation

- Record case, adapter, endpoint verdict, transient exact applicable/unverified IDs and ambiguities, actual cited findings, and the compact persisted receipt in the release PR/task. A static CI pass is not endpoint evidence.
- A clean result on the `known-bad` case is a release blocker: reviewer sensitivity or endpoint assembly is broken even if the output schema is complete.
- This is a sensitivity smoke, not a benchmark. Repeated zero-finding production runs are only a cost signal and never substitute for a known-bad case.
