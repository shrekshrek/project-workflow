# Feature-init behavior scenario matrix

Behavior-equivalence harness for the generative `feature-init` action. Adapter thinning (or any material `feature-init` skill/action edit) must show equivalent outcomes on this matrix before and after the change. Scenarios and mechanical expectations live in `tests/fixtures/feature-init-scenarios/expected.json`.

Eight model scenarios cover lane classification (full / light / no-artifact), target-root resolution from a subdirectory, NNN numbering over the shared active+archive sequence, brownfield/greenfield shape detection, exact lane file sets, no-artifact whole-tree preservation, `{{TODO}}` retention, plant refusal, and module-ownership non-guessing. The deterministic check separately covers no-clobber, failed-copy rollback, and symlink safety; it does not claim model behavior.

## Run protocol

1. `node scripts/check-feature-init-fixtures.cjs` — deterministic coherence check (CI-safe, no model).
2. Per scenario: copy the scenario's base into a temp directory, `git init && git add -A && git commit`, then run the `feature-init` runtime adapter there with the scenario `prompt` (from the scenario `cwd` when set). When the adapter asks a question covered by `prescribedAnswers`, answer exactly that; any other business question stays unanswered (the run must not need it).
3. Grade file-level outcomes mechanically: `node scripts/check-feature-init-fixtures.cjs --grade <scenario> <temp-dir>`.
4. `module-ownership-ask` is interaction-only: pass/fail is judged from the transcript against `expectedBehavior` (must ask, must not fabricate ownership, no files before the answer).

## Equivalence interpretation

- Pre/post comparison is per scenario: same lane, same directory name, same shape, sentinels untouched, no planted specifics, TODO markers retained. Wording differences in reports are not deviations.
- Any scenario regression after a thinning batch reverts that batch (batches are independently revertible by design).
- The deterministic script never executes a model; a matrix pass requires the actual runtime executions in step 2, recorded in the PR/task like the [reviewer mutation smoke](reviewer-mutation-smoke.md).
