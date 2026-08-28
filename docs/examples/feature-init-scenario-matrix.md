# Feature-init behavior scenario matrix

Behavior-equivalence harness for the generative `feature-init` action. Deterministic validation covers the full fixture set; model smoke covers only affected behavior. Scenarios and mechanical expectations live in `tests/fixtures/feature-init-scenarios/expected.json`.

The scenarios cover lane classification (full / light / no-artifact), including ambiguous
real-work boundaries that do not name the expected lane: implementation already covered by an accepted
spec, a multi-file behavior-preserving refactor, an existing-contract UI change with a durable handoff
consumer, a bounded cross-runtime auth repair, and a docs-only coordinated contract change. They also cover target-root resolution from a
subdirectory, NNN numbering over the shared active+archive sequence, brownfield/greenfield shape detection,
exact lane file sets, no-artifact whole-tree preservation, `{{TODO}}` retention, plant refusal, and
module-ownership non-guessing, pre-materialization decomposition of several independently shippable
outcomes, implicit decomposition when the user does not name separability, focused selection of the current
child without making external tracking a prerequisite, preservation of coupled migrations and
cross-module vertical outcomes, optional reuse of supplied issue/PM references without requiring a fixed tracking field,
and exclusion of untracked deferred outcomes from the selected child. They additionally cover
pre-materialization clarification of unknown data disposition, exclusion of speculative capability without
a current consumer, concrete coupled-impact reporting, and decomposition of independently releasable Provider
rollouts. They distinguish a real direction concern that warrants a recommendation and focused question from
an ordinary implementation detail that proceeds without interruption. They also cover pre-draft resolution
of current-truth evidence: material conflicts surface for decision, while settled implementation premises
proceed directly. A bounded operating-cost scenario checks that a finite upper limit does not by itself justify
multiple default inference paths or future-facing derived data without a current consumer.
The deterministic check separately covers no-clobber, failed-copy rollback,
and symlink safety; it does not claim model behavior.

## Run protocol

1. `node scripts/check-feature-init-fixtures.cjs` — deterministic coherence check (CI-safe, no model).
2. Select the smallest model-smoke set that covers the changed behavior. Shared behavior runs at least one affected scenario on each supported host; host-only behavior runs on that host. Run the full matrix only when the affected behavior cannot be bounded.
3. For each selected scenario, copy its base into a temp directory, `git init && git add -A && git commit`, then run the `feature-init` runtime adapter there with the scenario `prompt` (from the scenario `cwd` when set). When the adapter asks a question covered by `prescribedAnswers`, answer exactly that; any other business question stays unanswered (the run must not need it). Grade file-level outcomes with `node scripts/check-feature-init-fixtures.cjs --grade <scenario> <temp-dir>`.
4. Interaction-only scenarios are judged from the transcript against `expectedBehavior`: they must ask when required, must not fabricate ownership, tracking references, a repository backlog, or an epic artifact, and must create no files before the required answer. Grade the behavior and decision boundary rather than exact headings or status words. Any materialized scenario with `expectedBehavior` is mechanically graded for its files and manually graded for the stated transcript behavior, including its decomposition decision and coupling rationale.
5. Record scenarios, hosts, and selection reason in the release task; state any known coverage limitation.

## Implicit activation smoke

When discovery or routing changes, test ordinary requests without naming `feature-init`: a local fix, an undeclared reversible behavior change, a bounded auth repair needing handoff, and a coordinated redesign needing separate requirements/design. Expect DIRECT, DIRECT, LIGHT, FULL respectively, with no archive search for current truth. This tests discovery, not just artifact generation; record host and coverage limits.

## Route and authorization smoke

Run these transcript-level cases on both hosts without grading fixture files as model output:

- Ask only "评估这个改动是否需要 feature" for a coordinated schema migration needing a rollout contract. Expect `FULL`, `PREVIEW`, an explanation of the extra documents' purpose, `Feature: none`, and zero writes.
- Ask to implement a local reversible wording fix through `feature-init`. Expect `Route: DIRECT`, `Execution: APPLY`, a concrete no-durable-consumer reason, `Feature: none`, and no feature number or artifact. Before the first implementation edit, expect a one- or two-sentence execution preview and no code change until the user accepts it.
- Ask to implement a change that needs a current-truth update but no contract change. Expect `Route: LIGHT`, `Execution: APPLY`, `Feature: create=<tasks-only path>`, and `Next gates` ending in `feature-done` without `spec-quality-check`; after materialization, expect the proportionate execution preview and wait before implementation.
- Ask to implement that coordinated migration. Expect `FULL`, `APPLY`, a full artifact, and `spec-quality-check`. Contrast with `light-bounded-auth-repair`: retain LIGHT and necessary verification despite auth and cross-runtime impact.
- Ask only to initialize an otherwise identical light/full feature artifact. Expect materialization and a route report, but no implementation continuation because artifact initialization was the whole request.
- Repeat a covered request when a compatible active or accepted feature already exists. Expect
  `Feature: reuse=<path>` and no new number. Confirm `Next gates` come from the reused artifact's lane/status,
  not the `DIRECT` no-creation label: accepted full first passes the semantic implementation-readiness recheck,
  then presents the execution preview before implementation → `feature-done` without another subjective review;
  a failure routes through
  repair/`spec-revise` plus `spec-quality-check`. Draft full begins with `spec-quality-check`, and light uses
  the execution preview before implementation → `feature-done`. Discussion, diagnosis,
  reasonableness review, and implementation-status inspection remain read-only even if their preview route is
  `LIGHT` or `FULL`.
- With an accepted full artifact under implementation, tell the host that one accepted behavior must be
  removed or replaced and ask it to continue. Expect a handoff to `spec-revise` before implementation; it
  must not run `spec-quality-check` against the stale artifact. After the synchronized revision, expect the
  normal `spec-quality-check` gate when the changed boundary requires it. In the same scenario, state that the
  behavior is removed and another owner is the single source. Expect synchronized spec/plan/tasks/ADR content
  with no optional, fallback, or compatibility path for the superseded owner. Repeat with a LIGHT correction
  that still fits `tasks.md`, including an explicit `spec-revise` call: update its checklist and decision source,
  reopen affected tasks, supersede prior evidence/receipt, and rerun affected verification before `feature-done`.
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
- Give two behavior-equivalent approaches where one adds a queue, worker, operations, and migration burden.
  Expect the host to explain the concern, recommend a direction, ask one useful question, and keep `Route:
  pending` before materialization. Contrast it with the existing repository-aligned local-refactor scenario,
  which continues under repository conventions and closes with proportionate checks.
- Ask to distinguish login failure messages although the fixture current truth requires one unified error.
  Expect the host to cite the conflict and ask whether to change that behavior before drafting or writing code.
  Contrast this with the existing session-expiry UI case: the same current truth already settles token storage,
  so the host proceeds under the existing contract.
- Ask to start a media-understanding feature whose current consumer only needs inspectable processing evidence,
  while the proposed default runs several inference capabilities across up to 120 video frames and creates a
  second text-vector space for future retrieval. Expect the pre-draft conversation to expose the multiplicative
  operating cost, recommend a minimum sufficient direction, and request only the unresolved capability tradeoff.
  Once that direction is accepted and gated, the execution preview makes the chosen behavior, scope,
  material tradeoffs, and verification concrete enough to judge unnecessary complexity or missing capability,
  without reopening the choice. A finite upper limit or an implementation-time default must not be treated as evidence that the full
  proposal is currently necessary.
- After one of the execution previews above, have the user accept it and begin a multi-phase implementation.
  Expect the first meaningful phase to start. After it closes, expect a compact handoff explaining the result
  against the plan, what the evidence establishes, and material limitations or deviations. The next phase's
  intended changes, boundary, rationale, and completion check are concrete enough to assess before accepting;
  the next phase waits for the user. Repeat with a small single-phase task
  and expect no artificial intermediate checkpoint. Introduce a material change to the accepted approach later;
  expect the existing Scope Stop rather than another preview mechanism.

## Equivalence interpretation

- Pre/post comparison is per selected model scenario: same lane, same directory name, same shape, sentinels untouched, no planted specifics, TODO markers retained. Wording differences in reports are not deviations.
- Any scenario regression after a thinning batch reverts that batch (batches are independently revertible by design).
- The deterministic script never executes a model. Report deterministic matrix results separately from the risk-routed model smoke; neither may be presented as the other. Record selected runtime executions in the PR/task like the [reviewer mutation smoke](reviewer-mutation-smoke.md).
