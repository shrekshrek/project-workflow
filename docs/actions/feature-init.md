# feature-init

Canonical action for starting a tracked feature artifact under `docs/specs/changes/<NNN>-<slug>/`.

## Use When

- Beginning a feature, API/data model change, architecture change, or multi-file work that needs explicit requirements before implementation.
- A small change benefits from a durable acceptance checklist, cross-session handoff, or current-truth tracking.
- The user explicitly asks whether proposed work needs a project-workflow feature; classify it in read-only preview mode even when the answer is `DIRECT`.

Absent an explicit feature-routing assessment, do not use this action when the task does not need a new project-workflow artifact. Tiny bugfixes, wording/style tweaks, local test expectation fixes, low-risk documentation edits, and implementation under an accepted spec should continue directly and close with checks.

General discussion, reasonableness assessment, diagnosis, and implementation-status review that does not ask for feature routing does not invoke this action. When the user explicitly asks whether work needs a feature or asks for a routing assessment, invoke it and return a read-only route preview; that assessment never authorizes artifact creation. Automatic skill invocation is not write authorization. Artifact creation is authorized by an explicit request to start/create/initialize the feature artifact, or by an explicit implementation/change request for which the selected route requires a durable artifact as a normal prerequisite.

An application-foundation or architecture request uses this same classification; there is no reserved `project-foundation` action, lane, or slug. Use the ordinary full lane when the work establishes or materially changes project-wide runtime tiers, module boundaries, data/API contracts, or other architecture. Keep minimal structure inside the first feature when it is inseparable from that outcome; create a separate architecture-shaped change only when it has its own durable consumer or governs several later features.

**Behavior-change floor**: a change to user-visible behavior or a durable rule **already declared** in `docs/specs/<area>.md` takes **at least the light lane** — domain docs update only via `feature-done` → `feature-archive`. A local, low-risk user-visible change that is not declared in current truth does not by itself require an artifact.

Do not use for mid-implementation frozen-spec changes; use [`spec-revise`](spec-revise.md). Do not write implementation code during this action.

## Inputs

- Feature slug, optionally with a short description.
- Target project root containing `AGENTS.md` and `docs/specs/`; all created files must be written under this root, not under an incidental cwd.
- Existing project conventions from root and applicable nested `AGENTS.md`. A host adapter may also supply its own project-local convention files.
- Existing substantive current-truth domain docs (`docs/specs/<area>.md`) when present; prefer over `docs/specs/changes/archive/` when pre-filling. Do not create an empty domain doc just to make a feature brownfield.
- Explicit feature facts already provided in the current conversation, including later accepted decisions and
  the earlier alternatives they explicitly supersede.
- A bounded read-only impact sketch from active current truth, relevant implementation surfaces, declared
  runtime/module boundaries, and the current Git worktree when available. This is not exhaustive
  implementation discovery or a time estimate.
- Existing root/tier/module guidance relevant to the selected paths, plus any explicit durable local
  exception or `Sibling Alignment: Codify` decision that needs a guidance-placement choice.

Read the active tree only: `docs/specs/changes/archive/` is closed history — exclude it when searching for context (its durable conclusions live in `docs/specs/`). If the active tree still has several related historical specs that look contradictory, recommend running [`spec-reconcile`](spec-reconcile.md) before implementation.

## Route Decision

Every completed classification returns exactly one route:

- `DIRECT`: no new feature number or artifact. Continue the requested change directly under applicable project conventions and proportionate checks, or reuse an existing accepted feature without creating a duplicate.
- `LIGHT`: create only `tasks.md` because a concrete durable consumer exists, such as cross-session or multi-person handoff, several retained acceptance steps, audit/release evidence, or a pending current-truth update, and no full-lane trigger applies.
- `FULL`: create `spec.md`, `plan.md`, and `tasks.md` because the change is high-risk or contract-shaped. Triggers include API/schema/data migration, security/auth/permissions, multi-tenant behavior, evidence/data invariants, architecture/runtime boundaries, cross-module contracts, new-module ownership, project-declared high-blast-radius surfaces, or an accepted bundled-delivery risk. This is a risk class, not a closed keyword list.

Also classify execution authorization independently:

- `PREVIEW`: report the proposed route and reasons, but create or modify nothing. A read-only request that explicitly asks for feature routing always uses this mode; general discussion/review/diagnosis without that request does not invoke the action.
- `APPLY`: apply the route to feature artifacts when the user explicitly requested artifact initialization or implementation/change. `APPLY` authorizes only the artifact work owned by this action; this action still writes no implementation code.

Keep the action boundary separate from the enclosing task's continuation. An artifact-initialization-only request stops after this action reports/materializes its route. An implementation/change request authorizes routing and required artifact preparation, not an unseen implementation approach. Before the first implementation edit for a feature or direct change, present a proportionate, self-contained execution preview that makes clear the current outcome and consumer; the included and excluded change boundary; relevant current facts to preserve or change; the minimum sufficient approach and key rationale; material responsibility and operating-cost boundaries; the verification direction; and meaningful phases when more than one is useful. Use natural prose or a few bullets rather than a fixed form. Resolve evidence-backed facts directly, surface only unresolved decisions that could materially change the result, boundary, approach, risk, or verification, then wait for the user's acceptance. Acceptance starts the first phase; later phases use the handoff below. A material departure uses **Implementation Scope Stop**. The feature-init action itself never edits implementation code.

A blocking impact/necessity, scope-viability, or selection decision remains `Route: pending` until the required answer, selection, or acceptance exists; `pending` is not a fourth completed route and never authorizes materialization. Resolve an existing active feature that covers the same outcome before allocating a number. Reuse it when compatible, route accepted-spec implementation as `DIRECT`, and never create a duplicate merely because `feature-init` was invoked.

## Lane Classification

First decide whether the task needs a new project-workflow artifact at all. If no durable artifact is useful, or an accepted spec already covers the work, return `DIRECT`; do not create a pseudo-lane. Skip this action's artifact work and implement directly under the applicable project conventions and checks. Direct work may include a bounded user-visible behavior change when it is local, reversible, not declared in current truth, contract-free, and finishable in the current task with proportionate checks.

Create a light artifact only when its durable checklist has a consumer: cross-session or multi-person handoff, several acceptance steps worth retaining, an explicit audit/release need, or a pending current-truth update. Do not create `tasks.md` merely because code is user-visible or touches several closely related files.

When an artifact is useful, choose between two lanes. Use full lane for high-risk or contract-shaped work. Use light lane only when all are true:

- small change within one cohesive module or responsibility area; file count alone is not decisive
- additive, bugfix, or polish; no API/schema/data migration/architecture contract change
- no new module
- no project-declared disaster-invariant or high-blast-radius path is touched, when the project uses such an optional declaration

Uncertainty is graded:

- uncertain about API/schema, DB/data migration, security, auth/permissions, multi-tenant behavior, cross-module contract, new module ownership, or high-blast-radius impact → full lane
- uncertain about UI wording, styling, component splitting, local refactor shape, or how to write tests → do not force full lane for that reason alone
- uncertain about business goal or user-visible outcome → ask the user before creating artifacts

Before lane selection or materialization, run an **impact and necessity preflight**. It is a bounded
decision aid, not an implementation plan. Establish:

- the selected current outcome and its present actor/consumer
- likely affected responsibility boundaries and only the high-impact signals needed for route and boundary decisions
- the disposition of existing, legacy, missing, invalid, or unowned state when the requested change can encounter it
- any unresolved question that could materially change the outcome, boundary, approach, risk, or verification

Use the bounded sources above to test the current interpretation and proposed direction. Resolve apparent
conflicts or missing constraints from authoritative applicable project conventions, current truth, and accepted
decisions. Use existing behavior to test that interpretation and expose remaining conflicts. Surface only
unresolved questions that could materially change the outcome, boundary, approach, risk, or verification.

Judge necessity at the outcome and responsibility level: persistent state, APIs, roles, workflows,
management surfaces, queues, or runtime components need a present consumer and a concrete reason to exist.
Do not require a ledger row for every implementation element. Remove speculative future capability from the
selected outcome or treat it as a candidate deferred outcome. Breadth, module count, and estimated effort are
signals for closer review, never substitutes for outcome and coupling analysis.

If such an unresolved question remains, keep the route pending and ask the smallest useful set of material
questions. Ask dependent decisions in sequence;
closely related independent decisions may be grouped. Do not materialize a speculative
spec and fill these decisions afterward.

Use conversational judgment and apply the questions above proportionately. If continuing would risk building the
wrong thing or committing the project to a meaningfully different direction, pause, explain the concern and
recommended direction, and ask the focused question needed to proceed. Settled choices normally carry forward;
reopen one only when new evidence or a newly discovered material consequence changes the recommendation, then
explain why and ask the focused question needed to proceed. Ordinary implementation details continue without
interruption.

Before drafting a full-lane artifact, close the material decisions from the current conversation: normalize
the latest explicitly accepted rule, retain the source and any explicit supersession or exclusion, and identify
only contradictions or missing interpretations that could change the contract. Do not replay the conversation
or ask for ceremonial reconfirmation. Consistent decisions proceed directly into the artifact; a materially
ambiguous decision keeps the route pending until the smallest useful question is answered.

Bundle related small changes into one tracked feature when they share a user goal and must ship together; do not create fragmentary specs for button state, table columns, and details drawer separately. Before materializing an artifact, run a **scope-viability check**:

- identify the independently demonstrable outcomes
- ask whether each outcome can be accepted, enabled, and reverted on its own
- record the concrete transaction, contract, or release coupling when several outcomes truly must ship together

Infer candidate outcomes from the requested actors, observable results, release boundaries, migrations, and responsibility areas even when the user does not say "independently shippable." Do not split merely because work spans several modules, contains many tasks, or is large. Keep an evident single-outcome decision internal and continue without extra gate narration, even when supplied coupling evidence explains why it stays together. Never report a nonblocking Scope Viability result.

When separability is materially unclear, several independent outcomes need a selection, or bundled delivery
needs the user's acceptance, explain the current outcome, candidate outcomes, and concrete coupling evidence
or uncertainty. Recommend a direction and ask only what is needed to choose it. Do not narrate this check for
the normal single-outcome or no-artifact path. Block materialization until the required direction is clear.

Broad responsibility, migration, or external-contract surfaces prompt closer scope review, but size alone never requires a split. A large indivisible vertical slice may stay together when its coupling is explicit.

Two or more independently shippable outcomes without such coupling require a decomposition decision before materialization. Default to ordinary light/full child features and keep any parent initiative in the team's issue/PM system. If the user accepts one bundled delivery instead, use the full lane and record its coordination/rollback risk and decision source in the existing `plan.md` prior-decisions or risks section. Do not introduce an epic lane or epic artifact.

When the user chooses decomposition, create only the selected child in this invocation. State the selected
outcome and briefly identify deferred outcomes when that helps preserve the decision boundary. Reuse an
existing issue/PM reference when one is already available or the user explicitly asks to preserve the deferred
work there. Creating or updating an external item remains a separate write requiring explicit authorization and
an available integration; it is not a prerequisite for starting the selected child. A later tracker change affects
the active feature only after the user accepts it through `spec-revise`.

When the selected outcome creates or changes a tier/module boundary, introduces a durable local exception, or
chooses `Codify` in Sibling Alignment, read and apply the canonical
[Guidance Placement Contract](agents-md-revise.md#guidance-placement-contract), then record the exact owner,
rule, and source in existing plan/tasks. Ordinary features with no placement signal remain silent and do not
load that contract or create guidance work.

Lane classification happens once per artifact; scope viability and the accepted impact boundary do not
freeze. Recheck them at `spec-quality-check`, after a material `spec-revise`, and whenever implementation
discovers an undeclared persistent state, API, role, workflow, management surface, queue, runtime,
Provider/responsibility area, contract, migration, authorization rule, or release boundary.

If direct implementation or light-lane work later touches API/schema, DB/data migration, security, auth/permissions, multi-tenant behavior, evidence/data invariants, cross-module contracts, or high-blast-radius paths, stop and upgrade to the appropriate light/full artifact flow before continuing.

### Implementation Scope Stop

The selected route authorizes only the accepted outcome and impact boundary, not every plausibly related
improvement. During implementation, stop extending the change **before** writing more production code,
tests, migrations, compatibility paths, or documentation for any undeclared trigger above, a second
independently acceptable outcome, or a proposed capability with no current consumer. Safe read-only
inspection and isolating already-written speculative work may continue; the existence of that work never
justifies absorbing it.

Classify the discovery before resuming:

- Inside the same accepted outcome and baseline, with no contract change or other direction concern: treat it
  as `necessary-detail`, record only a durable implementation decision when useful, and continue without asking
  the user.
- A simpler implementation that preserves the accepted contract: remove the unnecessary work and continue;
  do not create a revision or follow-up merely to preserve it.
- A material contract correction, inseparable wider boundary, or other direction concern: explain the
  discovered delta or concern, present necessity, and recommended direction. Ask the focused question needed
  to resume; use `spec-revise` when the accepted artifact changes.
- A separable outcome or speculative capability: recommend excluding/removing it or routing it to a child
  only when the user wants it preserved. Do not silently implement it or create a backlog.

While a material direction question is pending, do not continue unrelated parts of the same feature merely
to stay busy when they could deepen rework. User acceptance of a material change is recorded with its source
in the existing Prior decisions/revision trace. Ordinary details clearly inside the accepted boundary continue
without a stop report.

Use a dependency-ordered phase at a real dependency or risk checkpoint. Each phase closes an inspectable
responsibility, contract/state transition, or actor-to-result segment.

Within the current phase, fix a failure and rerun only affected evidence; if the same failure repeats without
new diagnostic evidence, stop and report the concrete blocker. After a meaningful phase, run its smallest
relevant check, update its existing task, and return a compact handoff naming the closed result and evidence,
any material deviation, and the next proposed phase. Wait for the user before beginning that phase. At the
handoff or after context/session resume, re-read the accepted behavior, applicable delivery boundary,
Verification, and remaining tasks; a material mismatch invokes Implementation Scope Stop. L2/L3 dispatch,
lifecycle status, and receipts remain endpoint concerns. A small or direct result may be one phase.

## Outputs

Return a compact route decision after classification. It must make the route, authorization mode, reason,
artifact disposition, and actual next step unambiguous; a fixed report layout is not required.

- `Route`: `DIRECT` / `LIGHT` / `FULL`, or `pending` while a blocking impact/necessity, scope-viability, or selection decision remains unresolved.
- `Execution`: `PREVIEW` / `APPLY`.
- `Reason`: concrete evidence for why `DIRECT` is sufficient, which durable consumer prevents `DIRECT` and triggers `LIGHT`, or which contract/high-risk condition triggers `FULL`. Do not use an unexplained label such as "durable change".
- `Feature`: `none`, `create=<path>`, or `reuse=<path>`.
- `Next gates`: the actual remaining sequence; every implementation path includes the execution preview and,
  when applicable, phase handoffs above. For `Feature: none`, use implementation →
  proportionate direct checks. For `Feature: create=<path>`, light uses implementation → `feature-done`, while
  full uses `spec-quality-check` → implementation → `feature-done`.
  For `Feature: reuse=<path>`, derive the sequence from that artifact's lane and lifecycle instead of from the
  `DIRECT` no-creation label: draft full begins with `spec-quality-check`; accepted full first rechecks that
  its accepted outcome/boundary remain current and its Verification/tasks are actionable, then uses
  implementation → `feature-done`; light uses implementation → `feature-done`. Repair or revise a reused
  artifact only when that semantic readiness check exposes a real gap; an actionable artifact continues from
  its accepted boundary and tasks. For an
  artifact-initialization-only request, report the same handoff sequence without executing implementation.

Explain impact separately only when a material unknown, decomposition, or bundled-risk decision affected
the route. List concrete responsibility and contract/data/security/
migration/release signals plus unresolved decisions; do not report guessed file counts, durations, or
empty categories.

For `PREVIEW`, `Feature` cannot be `create=<path>`. For reuse, cite the matching active feature and do not allocate a number.

Full lane:

- `docs/specs/changes/<NNN>-<slug>/spec.md` (brownfield lean or greenfield full template)
- `docs/specs/changes/<NNN>-<slug>/plan.md`
- `docs/specs/changes/<NNN>-<slug>/tasks.md`

Light lane:

- `docs/specs/changes/<NNN>-<slug>/tasks.md`

For either lane, write Verification as the smallest set of **proof obligations**, not a planned test-case inventory. Every obligation must trace to a stated outcome, boundary, constraint, material risk, or applicable project convention; do not derive generic edge, error, status-code, or unspecified-input cases from testing habit alone. State the behavior or material risk that must be proved and the minimum executable evidence; one command or assertion may satisfy several related obligations. For user-visible work, order the shortest meaningful actor-to-result verification first, followed by broader or lower-level evidence. Choose unit, integration, e2e, CLI, data assertions, or manual release evidence only when that source adds distinct confidence. Use a matrix only when interacting dimensions can change the result (for example role × state, supported platform × packaging mode, or migration source × target), the project already owns a relevant regression matrix, or an explicit release/compliance contract requires it. Do not create a test-layer, endpoint, status-code, or happy/boundary/error matrix for symmetry.

Use the shared [NNN numbering](README.md#shared-runtime-conventions) rule. A user-supplied unused number greater
than the computed next number needs confirmation; an occupied or older number never overwrites or becomes free
through a slug change.

Adapters materialize through the packaged `scripts/materialize-feature-artifact.cjs`; never bypass its atomic
no-clobber and symlink-safety checks. A refusal leaves existing files untouched. If the number becomes occupied,
report the conflict and rerun feature-init to recompute it.

## Workflow

1. Resolve the target root, parse the requested slug/optional description, and classify `PREVIEW` versus `APPLY` from the user's requested operation. Invocation alone is not write authorization.
2. Read active conventions, search current-truth indexes/headings and compatible active features, and open
   only domain documents and bounded implementation surfaces relevant to the feature; exclude archived and
   unrelated artifacts. Inspect current Git overlap when available without treating a dirty path as owned
   by the proposed feature.
3. Run the impact and necessity preflight proportionately. For an evidently local, reversible change, use the
   bounded evidence already opened rather than expanding discovery. Remove speculative capability, surface
   only decision-relevant impact, and keep the route pending while an unresolved material question defined above
   remains. Apply the conversational-judgment rule above and ask only what is useful for the next decision.
4. Decide whether a new artifact has a durable consumer and whether an active feature already covers the outcome. If not, return `DIRECT`; if an accepted feature covers implementation, report `Feature: reuse=<path>` and do not create a duplicate. Recheck its accepted boundary and actionable Verification/tasks for semantic implementation readiness. Stop this action's artifact work, then return control to an enclosing implementation/change request when one exists.
5. Apply the scope-viability rules above. Surface only a required decomposition or bundled-risk decision, and
   create nothing until it is resolved. External tracking is never a prerequisite for the selected child; defer
   lane-only reads until its outcome and owning boundary are selected.
6. Choose `LIGHT` or `FULL` for the selected outcome and record the concrete trigger. Ask only when a decision
   material to the selected direction remains unclear.
7. If execution is `PREVIEW`, report the route decision and stop before reading lane templates or conditional architecture guidance, computing a number, invoking the materializer, or dispatching an auditor.
8. For `FULL`, choose brownfield only when a substantive domain document exists; otherwise use greenfield.
   First perform the compact decision closure above. If all material conversation decisions are consistent,
   draft without another confirmation; if a contradiction or missing interpretation can change the contract,
   ask the smallest useful question before materialization.
   When the selected change establishes or materially changes project-wide application architecture, read
   the conditional [`architecture-design` guidance](../architecture-design.md) and use only its applicable
   topics. Complete any remaining high-impact conversational fill before materialization, one material
   decision set, asking dependent questions in sequence and optionally grouping closely related independent
   questions. Use the existing spec/plan sections; do not create a new artifact schema. Low-level
   details that do not change the contract may remain as bounded implementation-time decisions. Multiple
   components alone do not establish multiple tiers. Only when
   explicit user or repository evidence establishes durable separate runtime tiers, read the tier concepts
   in [`workflow.md §0.3`](../workflow.md#03-概念区分钉死再读后续), the nested-guidance rules in
   [`§1.4`](../workflow.md#14-agentsmd--claudemd-嵌套层次子级覆盖父级), and the conditional
   [`_multi_tier_examples`](../../template/_multi_tier_examples/README.md). Single-tier or tier-undecided
   work skips tier files and examples.
9. Compute the next number across active and archived directories and invoke the packaged materializer with atomic no-clobber behavior.
10. Populate the selected templates under the Outputs, source-ownership, Guidance Placement, and implementation-
    phase rules above. Use only traceable facts; keep unsupported low-level details as bounded implementation-
    time decisions/tasks. Organize implementation order by real dependencies and independently verifiable
    results, recording useful phase results in the existing plan/tasks sections. Keep outcomes, scope, constraints, and
    exclusions in `spec.md`; do not copy them into plan Prior decisions. That table holds only non-obvious
    choices needing durable why/source trace, not a raw transcript.
11. Use an inline value-to-source trace for repository- or user-sourced prefill and make only the non-obvious,
   externally derived, conflict-resolving, bundled-risk, or superseding decisions durable in the Prior
   decisions source column before `spec-quality-check`; ordinary spec content keeps one owner. Dispatch the
   decision-completeness auditor only when newly generated content makes an unconfirmed choice whose
   consequences are material to the accepted direction or boundary, or when evidence is conflicting or weak.
   Directly traceable values and ordinary full-lane work without such choices are `N/A`; do not dispatch merely
   because the route is `FULL`.
12. Validate the created population before reporting route, execution, feature action, shape, ownership, impact
    when applicable, unresolved placeholders, evidence, and next gates.
13. If the original request was implementation/change rather than artifact initialization alone, complete the
   contract-level fill needed for the selected gate and keep genuine low-level choices as bounded implementation-
   time decisions/tasks. Then return control through the execution-preview handoff above after `DIRECT` or
   light-lane materialization, or after `spec-quality-check` permits full-lane implementation. A reused artifact
   follows its own lane/lifecycle gates and the semantic readiness recheck in step 4.
   This action owns only routing and artifact work,
   so implementation edits occur after it exits.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking: keep any safely materialized artifact intact, but do not claim the handoff is complete or recommend the next gate.

## Invariants

- Resolve the target project root before creating files. Prefer cwd, then nearest parent, then a single matching child; if multiple candidates exist, ask and do not guess.
- Read-only discussion, assessment, diagnosis, status review, and route preview never write. An explicit routing
  assessment uses `PREVIEW`; artifact initialization or implementation/change intent is required for `APPLY`.
- Completed route labels are stable: `DIRECT` creates nothing, `LIGHT` creates only `tasks.md`, and `FULL` creates `spec.md` / `plan.md` / `tasks.md`. Invocation itself never changes the route or forces creation.
- Finishing this action preserves an enclosing implementation/change request; the execution-preview and phase
  handoffs above control when implementation proceeds.
- Never plant unsupported endpoints, entities, fields, codes, paths, technologies, ownership, or coupling.
  Resolve material unknowns before implementation; keep genuine low-level choices as bounded implementation-
  time decisions/tasks and briefly trace sourced prefill.
- Decision closure follows the conversational-judgment rule above: consistent material decisions flow into the
  draft, while unresolved material ambiguity blocks artifact creation.
- Verification breadth follows traceable behavior and distinct risk, not derived edge-case habit, document size, test-layer count, or case-count symmetry. Consolidate obligations when the same evidence proves them; retain a matrix only with an explicit interaction, regression, release, or compliance reason.
- Scope Stop applies to every route. Materialization requires closed high-impact decisions, and every new durable
  surface has a current consumer/necessity trace; FULL is not permission for adjacent or speculative expansion.
- Scope viability uses outcome and coupling, never size proxies. Only clarification, decomposition, or
  bundled-risk decisions are surfaced; existing tracking references are reused when relevant.
- The full-lane handoff tells the main session to create an ADR during conversational fill only when `ADR_REQUIRED` is satisfied; feature-init does not create speculative ADRs before the decision exists.
- Architecture-shaped work remains ordinary FULL; do not force foundation artifacts, tiers, local architecture
  docs, or nested guidance. Nested `AGENTS.md` is optional convention placement, never an ADR/spec substitute.
- Full-lane features must pass [`spec-quality-check`](spec-quality-check.md) before implementation.

## Validation

- Confirm created files match the selected lane.
- Report lane, module decision, literal unresolved template placeholders, and next action. Mention decomposition
  or accepted bundled risk only when it affected the flow.
