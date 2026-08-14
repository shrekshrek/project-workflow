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
- Explicit feature facts already provided in the current conversation.
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

Keep the action boundary separate from the enclosing task's continuation. An artifact-initialization-only request stops after this action reports/materializes its route. For an original implementation/change request, completion returns control to that request without another confirmation: `DIRECT/APPLY` continues implementation immediately, `LIGHT/APPLY` continues after `tasks.md` is created, and `FULL/APPLY` proceeds through `spec-quality-check` before implementation under that gate's authorization rules. The feature-init action itself never edits implementation code.

A blocking impact/necessity, scope-viability, selection, or required-handoff decision remains `Route: pending` until the required answer, selection, acceptance, or reference exists; `pending` is not a fourth completed route and never authorizes materialization. Resolve an existing active feature that covers the same outcome before allocating a number. Reuse it when compatible, route accepted-spec implementation as `DIRECT`, and never create a duplicate merely because `feature-init` was invoked.

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
- likely responsibility areas plus contract/API, data/schema/migration, authorization/security,
  runtime/configuration, release, and rollback signals
- the disposition of legacy, missing, invalid, or unowned data when the requested change can encounter it
- known dirty-worktree overlap that may belong to another change
- every material unknown in business behavior, ownership, authorization, data disposition, or release
  coupling
- a qualitative delivery-risk signal: small, medium, large, or extra-large

Every proposed persistent state, API, role, workflow, management surface, queue, or runtime component must
name a current consumer and explain why the selected outcome cannot be completed safely without it.
Speculative future capability is removed from the selected outcome or treated as a candidate deferred
outcome; it is never added merely to make the design look complete.

Large or extra-large impact is a mandatory closer-review signal, not an automatic split and not permission
to bundle. State the concrete coupling when the outcome is still indivisible. When the impact contains
separable results, route them through the scope-viability decision below. Module count, path count, and
estimated effort remain signals rather than substitutes for outcome/coupling analysis.

If a material unknown can change scope, ownership, authorization, data handling, or delivery shape, keep
the route pending and ask one material question at a time across turns. Do not materialize a speculative
spec and fill these decisions afterward. Low-level implementation details that do not change the contract
may remain explicit TODOs.

Bundle related small changes into one tracked feature when they share a user goal and must ship together; do not create fragmentary specs for button state, table columns, and details drawer separately. Before materializing an artifact, run a **scope-viability check**:

- identify the independently demonstrable outcomes
- ask whether each outcome can be accepted, enabled, and reverted on its own
- record the concrete transaction, contract, or release coupling when several outcomes truly must ship together

Infer candidate outcomes from the requested actors, observable results, release boundaries, migrations, and responsibility areas even when the user does not say "independently shippable." Do not split merely because work spans several modules, contains many tasks, or is large. Keep an evident single-outcome decision internal and continue without extra gate narration, even when supplied coupling evidence explains why it stays together. Never report a nonblocking Scope Viability result.

When separability is materially unclear, several independent outcomes need a selection, or the user must accept bundled-delivery risk, surface a compact Scope Viability result with the current outcome, candidate outcomes, coupling evidence or uncertainty, and `clarification-required`, `split-required`, or `bundled-risk-accepted`. Ask at most one question that resolves the decision. Use `pending-selection` or `pending-handoff` only when that state applies; do not emit empty fields or an N/A result for the normal single-outcome or no-artifact path. Block materialization until the required decision, selection, and handoff are complete.

Broad responsibility, migration, or external-contract surfaces prompt closer scope review, but size alone never requires a split. A large indivisible vertical slice may stay together when its coupling is explicit.

Two or more independently shippable outcomes without such coupling require a decomposition decision before materialization. Default to ordinary light/full child features and keep any parent initiative in the team's issue/PM system. If the user accepts one bundled delivery instead, use the full lane and record its coordination/rollback risk and decision source in the existing `plan.md` prior-decisions or risks section. Do not introduce an epic lane or epic artifact.

When the user chooses decomposition, create only the selected child in this invocation. Require a **durable decomposition handoff** only for deferred outcomes the user expects the workflow to preserve across sessions or people: each such outcome needs a stable reference in an existing issue/PM system, either as its own item or as an addressable child entry under one parent. If the user explicitly narrows the current scope and accepts other outcomes as untracked and out of scope, report that consequence and proceed without references. Do not name or summarize untracked outcomes anywhere in the selected artifact, including its out-of-scope sections. Do not create a repository backlog. When preservation intent is unclear, ask one question instead of guessing. Creating or updating external items remains a separate external write that requires the user's explicit authorization and an available integration.

Record an applicable handoff without adding a new artifact schema: full-lane work uses `plan.md` Prior decisions; light-lane work adds a `Tracking:` entry under `目标 / 边界`. Include the parent/current references when available and every preserved deferred reference. These are stable pointers plus the selected-scope snapshot, not a live requirements feed: later tracker edits never mutate an active feature automatically. Explicitly untracked outcomes stay out of the artifact. Use `spec-revise` only when an explicit tracker change is accepted as a change to the active feature contract.

When the selected outcome creates/changes a tier or module boundary, introduces a durable local exception,
or chooses `Codify` in Sibling Alignment, resolve **Guidance Placement** inside the existing plan/tasks:

- root `AGENTS.md` for genuinely cross-project rules;
- tier `AGENTS.md` when sibling modules in one runtime share a difference from the root;
- module `AGENTS.md` only for a durable exception from its parent;
- existing plan/spec/ADR for feature/product/decision content that is not a working convention; or
- lint/hook/test for a rule that is better enforced mechanically.

For a nested guidance target, record the exact target path, the difference-only rule, its evidence/source,
and whether this project uses the one-line nested `CLAUDE.md` alias. Do not create guidance merely because a
directory exists, copy parent content, or turn temporary implementation detail into policy. Ordinary features
with no placement signal remain silent and create no guidance work.

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

- Inside the same accepted outcome and baseline, with no contract change: treat it as `necessary-detail`,
  record only a durable implementation decision when useful, and continue without asking the user.
- A simpler implementation that preserves the accepted contract: remove the unnecessary work and continue;
  do not create a revision or follow-up merely to preserve it.
- A material contract correction or inseparable wider boundary: present a compact `Scope stop` containing
  the discovered delta, baseline mismatch, present necessity, and recommended direction. Ask at most one
  decision question and wait; use `spec-revise` after the user chooses the changed direction.
- A separable outcome or speculative capability: recommend excluding/removing it or routing it to a child
  only when the user wants it preserved. Do not silently implement it or create a backlog.

While a material direction question is pending, do not continue unrelated parts of the same feature merely
to stay busy when they could deepen rework. User acceptance of a material change is recorded with its source
in the existing Prior decisions/revision trace. Do not emit a `Scope stop` report for ordinary details that
are clearly inside the accepted boundary.

## Outputs

Always return a compact route decision after classification:

- `Route`: `DIRECT` / `LIGHT` / `FULL`, or `pending` while a blocking impact/necessity, scope-viability, selection, or required-handoff decision remains unresolved.
- `Execution`: `PREVIEW` / `APPLY`.
- `Reason`: concrete evidence for why `DIRECT` is sufficient, which durable consumer prevents `DIRECT` and triggers `LIGHT`, or which contract/high-risk condition triggers `FULL`. Do not use an unexplained label such as "durable change".
- `Feature`: `none`, `create=<path>`, or `reuse=<path>`.
- `Next gates`: the actual remaining sequence — implementation → proportionate direct checks for an enclosing `DIRECT/APPLY` implementation request; implementation → `feature-done` for light; or `spec-quality-check` → implementation → `feature-done` for full. For an artifact-initialization-only request, report the same handoff sequence without executing implementation.

Add a compact `Impact` section only when a material unknown, large/extra-large signal, decomposition,
or bundled-risk decision affected the route. List concrete responsibility and contract/data/security/
migration/release signals plus unresolved decisions; do not report guessed file counts, durations, or
empty categories.

For `PREVIEW`, `Feature` cannot be `create=<path>`. For reuse, cite the matching active feature and do not allocate a number.

Full lane:

- `docs/specs/changes/<NNN>-<slug>/spec.md` (brownfield lean or greenfield full template)
- `docs/specs/changes/<NNN>-<slug>/plan.md`
- `docs/specs/changes/<NNN>-<slug>/tasks.md`

Light lane:

- `docs/specs/changes/<NNN>-<slug>/tasks.md`

For either lane, write Verification as the smallest set of **proof obligations**, not a planned test-case inventory. Every obligation must trace to a stated outcome, boundary, constraint, material risk, or applicable project convention; do not derive generic edge, error, status-code, or unspecified-input cases from testing habit alone. State the behavior or material risk that must be proved and the minimum executable evidence; one command or assertion may satisfy several related obligations. For a user-visible full-lane outcome, mark exactly one obligation `Primary flow` in `spec.md` Verification; `tasks.md` maps its execution without repeating the marker. For a user-visible light-lane outcome, mark exactly one obligation in `tasks.md` `## 验证`. This selects preflight ordering and does not add a second smoke. Non-user-visible work has no such marker. Choose unit, integration, e2e, CLI, data assertions, or manual release evidence only when that source adds distinct confidence. Use a matrix only when interacting dimensions can change the result (for example role × state, supported platform × packaging mode, or migration source × target), the project already owns a relevant regression matrix, or an explicit release/compliance contract requires it. Do not create a test-layer, endpoint, status-code, or happy/boundary/error matrix for symmetry.

During implementation, add or retain a distinct test layer/case only when it proves a material obligation or
risk not already covered by cheaper existing evidence, or an applicable project/release convention requires
it. Prefer extending the nearest existing test over adding a new file/layer when that remains clear. Remove
tests that only protect superseded behavior; consolidate overlapping cases and commands. Use focused checks
while editing, then execute the final check population selected by the feature artifact, changed scope, shared-
surface impact, and applicable project/release conventions. Execute each unchanged final evidence source once;
test counts, layer counts, and large matrices never improve a verdict by themselves.

The directory number is the next available three-digit number (shared active+archive sequence, see [Shared runtime conventions](README.md#shared-runtime-conventions)) unless the user supplied a non-conflicting number. When the user supplies a number: equal to the computed next number → use it silently; greater than the computed number → ask which to use; less than or equal to an existing number → report the collision and switch to the computed number or another unused number (the slug may also change, but changing it alone never frees an occupied number). Never overwrite an existing `docs/specs/changes/<NNN>-<slug>/` directory.

Adapters materialize the selected template through the packaged `scripts/materialize-feature-artifact.cjs`. The script validates the target root and requested number, normalizes an existing target-root symlink to its real directory, creates the final feature directory with an atomic no-clobber gate, copies only the selected lane files with exclusive creation, rejects symlinked destinations beneath the resolved root, and rolls back files created by a failed copy. A refusal leaves every pre-existing file untouched. If another process or earlier action occupied the number first, report the conflict and rerun feature-init to recompute the next number.

## Workflow

1. Resolve the target root, parse the requested slug/optional description, and classify `PREVIEW` versus `APPLY` from the user's requested operation. Invocation alone is not write authorization.
2. Read active conventions, search current-truth indexes/headings and compatible active features, and open
   only domain documents and bounded implementation surfaces relevant to the feature; exclude archived and
   unrelated artifacts. Inspect current Git overlap when available without treating a dirty path as owned
   by the proposed feature.
3. Run the impact and necessity preflight proportionately. For an evidently local, reversible change, use
   the bounded evidence already opened rather than expanding discovery. Remove speculative capability,
   surface only decision-relevant impact, and keep the route pending while a material business, ownership,
   authorization, data-disposition, or release-coupling question remains. Ask one material question per turn.
4. Decide whether a new artifact has a durable consumer and whether an active feature already covers the outcome. If not, return `DIRECT`; if an accepted feature covers implementation, report `Feature: reuse=<path>` and do not create a duplicate. Stop this action's artifact work, then return control to an enclosing implementation/change request when one exists.
5. Run the scope-viability check. Continue silently for an evident single outcome. If separable outcomes would be bundled, report the compact decision and ask the user to choose a child or accept the bundled-delivery risk. When the user chooses a child, require a durable decomposition handoff only for deferred outcomes they expect preserved; an explicit untracked/out-of-scope decision may proceed without one. Create nothing before the required decision, selection, and handoff are complete.
   While clarification, selection, or a required handoff is pending, stop after the compact result and the one allowed blocking question. Do not pre-read lane-specific templates, the materializer, conditional architecture guidance, or reviewer contracts before an outcome is selected and the owning boundary applies.
6. Choose `LIGHT` or `FULL` for the selected outcome and record the concrete trigger. Ask only when the business goal, ownership, impact boundary, or decomposition is unclear.
7. If execution is `PREVIEW`, report the route decision and stop before reading lane templates or conditional architecture guidance, computing a number, invoking the materializer, or dispatching an auditor.
8. For `FULL`, choose brownfield only when a substantive domain document exists; otherwise use greenfield.
   When the selected change establishes or materially changes project-wide application architecture, read
   the conditional [`architecture-design` guidance](../architecture-design.md) and use only its applicable
   topics. Complete any remaining high-impact conversational fill before materialization, one material
   question per turn. Use the existing spec/plan sections; do not create a new artifact schema. Low-level
   implementation TODOs may remain. Multiple components alone do not establish multiple tiers. Only when
   explicit user or repository evidence establishes durable separate runtime tiers, read the tier concepts
   in [`workflow.md §0.3`](../workflow.md#03-概念区分钉死再读后续), the nested-guidance rules in
   [`§1.4`](../workflow.md#14-agentsmd--claudemd-嵌套层次子级覆盖父级), and the conditional
   [`_multi_tier_examples`](../../template/_multi_tier_examples/README.md). Single-tier or tier-undecided
   work skips tier files and examples.
9. Compute the next number across active and archived directories and invoke the packaged materializer with atomic no-clobber behavior.
10. Replace structural placeholders and prefill only traceable facts. Removing a template TODO closes that decision, so do it only when user input or repository evidence determines the value; reasonable defaults, generic best practices, and implementation-stage discovery are not evidence. Verification prefill records proof obligations and known evidence sources, not speculative test files or case inventories. Do not promote unspecified or out-of-scope inputs into artifact decisions, open questions, or placeholders unless implementation is actually blocked on them. Record the accepted impact boundary, current-consumer decisions, and any bundled-delivery decision or required durable decomposition handoff in the existing spec/plan/tasks sections. Keep outcomes, scope, constraints, and exclusions in `spec.md`; do not copy them into plan Prior decisions. Use Prior decisions only for non-obvious material choices, external-source interpretations, conflict resolutions, bundled-risk acceptance, and supersede decisions that need a durable why/source trace. Use a repository path/section or a dated/current-feature user confirmation, not a raw transcript. Preserve unresolved low-level TODOs elsewhere.
   If Guidance Placement applies, put the target and difference-only rule in Sibling Alignment/module impact,
   and add the create/update/alias or mechanical-enforcement work to tasks. Do not add a new artifact type.
11. Use an inline value-to-source trace for repository- or user-sourced prefill and make only the non-obvious,
   externally derived, conflict-resolving, bundled-risk, or superseding decisions durable in the Prior
   decisions source column before `spec-quality-check`; ordinary spec content keeps one owner. Dispatch the
   decision-completeness auditor only when newly generated content contains unconfirmed high-impact
   architecture, ownership, infrastructure, port, package/API, or ADR choices, or conflicting/weak evidence.
   Directly traceable values and ordinary full-lane work without such choices are `N/A`; do not dispatch merely
   because the route is `FULL`.
12. Validate the created population. When the user named explicitly untracked outcomes, check the selected artifact for those names or descriptions, remove any occurrence, and validate again before reporting route, execution, feature action, shape, ownership, impact when applicable, unresolved placeholders, evidence, and next gates.
13. If the original request was implementation/change rather than artifact initialization alone, return control to that request without asking for another confirmation: continue after `DIRECT`, continue after light-lane materialization, or invoke `spec-quality-check` for full lane. This action owns only routing and artifact work, so implementation edits occur after it exits.

## Reviewer Execution

When the auditor boundary applies, follow the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) and report `Reviewer execution` with role, mode, status, and observed reason. Missing required execution evidence is blocking: keep any safely materialized artifact intact, but do not claim the handoff is complete or recommend the next gate.

## Invariants

- Resolve the target project root before creating files. Prefer cwd, then nearest parent, then a single matching child; if multiple candidates exist, ask and do not guess.
- Read-only discussion, assessment, diagnosis, implementation-status review, and route preview never create or modify an artifact. Explicit artifact initialization or implementation/change intent is required for `APPLY`.
- An explicit feature-routing assessment invokes this action in `PREVIEW`; general discussion or diagnosis without a routing request does not. Read-only intent controls authorization, not whether a requested route assessment can be classified.
- Completed route labels are stable: `DIRECT` creates nothing, `LIGHT` creates only `tasks.md`, and `FULL` creates `spec.md` / `plan.md` / `tasks.md`. Invocation itself never changes the route or forces creation.
- Finishing this action does not silently cancel an enclosing implementation/change request. Continue according to the selected route and gate sequence; stop after the route/artifact report only when that was the whole request or a blocking decision remains.
- Preserve unresolved `{{TODO ...}}` markers for unknown details.
- Do not plant endpoints, entities, field names, error codes, module paths, or technology choices without traceable support. Knowing that a component or tier exists does not determine its responsibilities, ownership, call direction, sync/async relationship, or coupling; preserve those as TODOs unless the user or repository evidence determines them.
- If pre-filling from conversation, mark the source briefly.
- New module decisions must be explicit in plan/tasks; unclear ownership is a question, not a guess.
- Verification breadth follows traceable behavior and distinct risk, not derived edge-case habit, document size, test-layer count, or case-count symmetry. Consolidate obligations when the same evidence proves them; retain a matrix only with an explicit interaction, regression, release, or compliance reason.
- Implementation Scope Stop applies to every route, including accepted full-lane work; full lane is not
  blanket permission for adjacent capability or test expansion.
- Artifact materialization follows impact/necessity and high-impact decision closure. Creating placeholders is
  not a substitute for clarifying business behavior, ownership, authorization, data disposition, or
  release coupling.
- Every new persistent state, API, role, workflow, management surface, queue, or runtime component has a
  current consumer and a necessity trace. Speculative future capability stays outside the selected outcome.
- Scope-review breadth signals are prompts for judgment, never automatic verdict thresholds. Unreasoned bundling of independently shippable outcomes is the blocking condition.
- Require durable references only for deferred outcomes the user expects preserved. Explicitly accepted untracked out-of-scope outcomes do not block the selected child and do not enter its artifact; never infer permission to drop tracking when preservation intent is unclear.
- Scope viability is always checked before materialization, but only decisions that need clarification, decomposition, handoff, or bundled-risk acceptance require a user-facing gate result. Module count, task count, and estimated effort are not substitutes for outcome/coupling analysis.
- The full-lane handoff tells the main session to create an ADR during conversational fill only when `ADR_REQUIRED` is satisfied; feature-init does not create speculative ADRs before the decision exists.
- Architecture-shaped work remains an ordinary full-lane change. Do not force a separate foundation artifact, a multi-tier layout, nested guidance, or a project-local architecture document when the selected outcome does not need one.
- Nested `AGENTS.md` is an optional convention placement, not proof of a good module boundary and not a
  substitute for an ADR/spec when architecture or product semantics change.
- Full-lane features must pass [`spec-quality-check`](spec-quality-check.md) before implementation.

## Validation

- Confirm created files match the selected lane.
- Report lane, module decision, literal unresolved template placeholders, and next action. For the normal single-outcome path, omit the Scope Viability field completely; add that decision, a required decomposition handoff, an explicit untracked-outcome decision, or a bundled-risk decision only when one affected the flow.
