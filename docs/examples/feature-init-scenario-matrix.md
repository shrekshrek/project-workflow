# Feature-init behavior scenario matrix

Behavior-equivalence harness for the generative `feature-init` action. Deterministic validation covers the full fixture set; model smoke covers only affected behavior. Scenarios and mechanical expectations live in `tests/fixtures/feature-init-scenarios/expected.json`.

Nineteen scenarios cover lane classification (full / light / no-artifact), including ambiguous
real-work boundaries that do not name the expected lane: implementation already covered by an accepted
spec, a multi-file behavior-preserving refactor, an existing-contract UI change with a durable handoff
consumer, and a docs-only cross-module contract change. They also cover target-root resolution from a
subdirectory, NNN numbering over the shared active+archive sequence, brownfield/greenfield shape detection,
exact lane file sets, no-artifact whole-tree preservation, `{{TODO}}` retention, plant refusal, and
module-ownership non-guessing, pre-materialization decomposition of several independently shippable
outcomes, implicit decomposition when the user does not name separability, explicit `pending-selection` /
`pending-handoff` tracking while a required split is blocked, preservation of large coupled migrations and
cross-module vertical outcomes, refusal when deferred children lack durable issue/PM references,
and preservation of supplied tracking references in a selected light-lane child. The deterministic check separately covers no-clobber, failed-copy rollback,
and symlink safety; it does not claim model behavior.

## Run protocol

1. `node scripts/check-feature-init-fixtures.cjs` — deterministic coherence check (CI-safe, no model).
2. Select the smallest model-smoke set that covers the changed behavior. Shared behavior runs at least one affected scenario on each supported host; host-only behavior runs on that host. Run the full matrix only when the affected behavior cannot be bounded.
3. For each selected scenario, copy its base into a temp directory, `git init && git add -A && git commit`, then run the `feature-init` runtime adapter there with the scenario `prompt` (from the scenario `cwd` when set). When the adapter asks a question covered by `prescribedAnswers`, answer exactly that; any other business question stays unanswered (the run must not need it). Grade file-level outcomes with `node scripts/check-feature-init-fixtures.cjs --grade <scenario> <temp-dir>`.
4. Interaction-only scenarios are judged from the transcript against `expectedBehavior`: they must ask when required, must not fabricate ownership, tracking references, a repository backlog, or an epic artifact, and must create no files before the required answer. Any materialized scenario with `expectedBehavior` is mechanically graded for its files and manually graded for the stated transcript behavior, including its Scope Viability decision and coupling rationale.
5. Record scenarios, hosts, and selection reason in the release task; state any known coverage limitation.

## Implicit activation smoke

Run this only when skill discovery or lane routing changed. In a fresh host task with the plugin installed, issue ordinary implementation requests without naming `feature-init`: one tiny local fix, one bounded reversible user-visible behavior change not declared in current truth, one low-risk change that explicitly needs a cross-session acceptance checklist, and one contract-shaped or cross-module feature. Confirm that the host keeps the first two direct, invokes `feature-init` for the latter two, selects light then full respectively, and does not search `docs/specs/changes/archive/` for current behavior. Record this manual smoke in the release task; it tests skill discovery and is intentionally not a second CI harness.

## Equivalence interpretation

- Pre/post comparison is per selected model scenario: same lane, same directory name, same shape, sentinels untouched, no planted specifics, TODO markers retained. Wording differences in reports are not deviations.
- Any scenario regression after a thinning batch reverts that batch (batches are independently revertible by design).
- The deterministic script never executes a model. Report deterministic matrix results separately from the risk-routed model smoke; neither may be presented as the other. Record selected runtime executions in the PR/task like the [reviewer mutation smoke](reviewer-mutation-smoke.md).
