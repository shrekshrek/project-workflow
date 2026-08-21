# Feature-init behavior scenario matrix

Behavior-equivalence harness for the generative `feature-init` action. Deterministic validation covers the full fixture set; model smoke covers only affected behavior. Scenarios and mechanical expectations live in `tests/fixtures/feature-init-scenarios/expected.json`.

Twenty-three scenarios cover lane classification (full / light / no-artifact), including ambiguous
real-work boundaries that do not name the expected lane: implementation already covered by an accepted
spec, a multi-file behavior-preserving refactor, an existing-contract UI change with a durable handoff
consumer, and a docs-only cross-module contract change. They also cover target-root resolution from a
subdirectory, NNN numbering over the shared active+archive sequence, brownfield/greenfield shape detection,
exact lane file sets, no-artifact whole-tree preservation, `{{TODO}}` retention, plant refusal, and
module-ownership non-guessing, pre-materialization decomposition of several independently shippable
outcomes, implicit decomposition when the user does not name separability, explicit `pending-selection` /
selection of the current child without making external tracking a prerequisite, preservation of coupled migrations and
cross-module vertical outcomes, optional reuse of supplied issue/PM references without requiring a fixed tracking field,
and exclusion of untracked deferred outcomes from the selected child. They additionally cover
pre-materialization clarification of unknown data disposition, exclusion of speculative capability without
a current consumer, concrete coupled-impact reporting, and decomposition of independently releasable Provider
rollouts. The deterministic check separately covers no-clobber, failed-copy rollback,
and symlink safety; it does not claim model behavior.

## Run protocol

1. `node scripts/check-feature-init-fixtures.cjs` — deterministic coherence check (CI-safe, no model).
2. Select the smallest model-smoke set that covers the changed behavior. Shared behavior runs at least one affected scenario on each supported host; host-only behavior runs on that host. Run the full matrix only when the affected behavior cannot be bounded.
3. For each selected scenario, copy its base into a temp directory, `git init && git add -A && git commit`, then run the `feature-init` runtime adapter there with the scenario `prompt` (from the scenario `cwd` when set). When the adapter asks a question covered by `prescribedAnswers`, answer exactly that; any other business question stays unanswered (the run must not need it). Grade file-level outcomes with `node scripts/check-feature-init-fixtures.cjs --grade <scenario> <temp-dir>`.
4. Interaction-only scenarios are judged from the transcript against `expectedBehavior`: they must ask when required, must not fabricate ownership, tracking references, a repository backlog, or an epic artifact, and must create no files before the required answer. Any materialized scenario with `expectedBehavior` is mechanically graded for its files and manually graded for the stated transcript behavior, including its Scope Viability decision and coupling rationale.
5. Record scenarios, hosts, and selection reason in the release task; state any known coverage limitation.

## Implicit activation smoke

Run this only when skill discovery or lane routing changed. In a fresh host task with the plugin installed, issue ordinary implementation requests without naming `feature-init`: one tiny local fix, one bounded reversible user-visible behavior change not declared in current truth, one low-risk change that explicitly needs a cross-session acceptance checklist, and one contract-shaped or cross-module feature. Confirm that the host keeps the first two direct, invokes `feature-init` for the latter two, selects light then full respectively, and does not search `docs/specs/changes/archive/` for current behavior. Record this manual smoke in the release task; it tests skill discovery and is intentionally not a second CI harness.

## Route and authorization smoke

Run these transcript-level cases on both hosts without grading fixture files as model output:

- Ask only "评估这个改动是否需要 feature" for a schema migration. Confirm the explicit routing request triggers `feature-init` despite being read-only. Expect `Route: FULL`, `Execution: PREVIEW`, a concrete schema/migration reason, `Feature: none`, and zero writes/materializer/auditor calls.
- Ask to implement a local reversible wording fix through `feature-init`. Expect `Route: DIRECT`, `Execution: APPLY`, a concrete no-durable-consumer reason, `Feature: none`, and no feature number or artifact; the enclosing implementation continues in the same task without another confirmation.
- Ask to implement a change that needs a current-truth update but no contract change. Expect `Route: LIGHT`, `Execution: APPLY`, `Feature: create=<tasks-only path>`, and `Next gates` ending in `feature-done` without `spec-quality-check`; after materialization, the enclosing implementation continues without another confirmation.
- Ask to implement an API/schema migration. Expect `Route: FULL`, `Execution: APPLY`, `Feature: create=<full-lane path>`, and `Next gates` beginning with `spec-quality-check`.
- Ask only to initialize an otherwise identical light/full feature artifact. Expect materialization and a route report, but no implementation continuation because artifact initialization was the whole request.
- Repeat a covered request when a compatible active or accepted feature already exists. Expect
  `Feature: reuse=<path>` and no new number. Confirm `Next gates` come from the reused artifact's lane/status,
  not the `DIRECT` no-creation label: accepted full first passes the semantic implementation-readiness recheck,
  then continues implementation → `feature-done` without another subjective review; a failure routes through
  repair/`spec-revise` plus `spec-quality-check`. Draft full begins with `spec-quality-check`, and light continues implementation → `feature-done`. Discussion, diagnosis,
  reasonableness review, and implementation-status inspection remain read-only even if their preview route is
  `LIGHT` or `FULL`.
- With an accepted full artifact under implementation, tell the host that one accepted behavior must be
  removed or replaced and ask it to continue. Expect a handoff to `spec-revise` before implementation; it
  must not run `spec-quality-check` against the stale artifact. After the synchronized revision, expect the
  normal `spec-quality-check` gate when the changed boundary requires it. In the same scenario, state that the
  behavior is removed and another owner is the single source. Expect synchronized spec/plan/tasks/ADR content
  with no optional, fallback, or compatibility path for the superseded owner.
- Invoke `spec-quality-check` explicitly while the same frozen-contract correction is still pending. Expect
  `N/A(route: spec-revise)`, no mechanical/reviewer run, and no artifact edit. Repeat with an unimplemented
  draft: expect ordinary draft repair before the quality gate, not a frozen-contract revision.
- Contrast the correction case with an unchanged accepted contract whose implementation is wrong. Expect a
  direct implementation repair followed by an explicit `feature-done` rerun, not `spec-revise`.
- Provide a multi-turn full-feature conversation whose final explicit decision replaces an earlier alternative,
  with no remaining material ambiguity. Expect one compact decision closure, no duplicate confirmation, and a
  spec/plan/tasks population that contains the final rule and explicit supersession without retaining the old
  alternative as an optional or compatibility path. Repeat with two materially conflicting statements and no
  authoritative resolution; expect the smallest useful question before any artifact is materialized.
- Give a multi-outcome request whose scope viability is unresolved. Expect `Route: pending`, `Execution: PREVIEW`, no files, and only the smallest useful question set needed for direction/selection; `pending` must not be treated as a fourth completed route.

## Equivalence interpretation

- Pre/post comparison is per selected model scenario: same lane, same directory name, same shape, sentinels untouched, no planted specifics, TODO markers retained. Wording differences in reports are not deviations.
- Any scenario regression after a thinning batch reverts that batch (batches are independently revertible by design).
- The deterministic script never executes a model. Report deterministic matrix results separately from the risk-routed model smoke; neither may be presented as the other. Record selected runtime executions in the PR/task like the [reviewer mutation smoke](reviewer-mutation-smoke.md).
