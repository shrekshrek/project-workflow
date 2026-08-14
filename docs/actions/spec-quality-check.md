# spec-quality-check

Canonical pre-implementation gate for full-lane feature artifacts.

## Use When

- `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` exists.
- The user believes the spec is ready for implementation.

Do not use as the main gate for light-lane features; `feature-done` checks their `tasks.md` goal/boundary, executes each verification item, and writes the delivery receipt directly.

## Inputs

- `spec.md`
- `plan.md`
- `tasks.md`
- The existing `plan.md` prior-decisions or risks entry when a bundled-delivery decision exists.
- The accepted impact boundary and current-consumer/necessity trace recorded in existing spec/plan sections.
  For an active artifact that repository history or explicit current-user confirmation identifies as
  pre-3.11 and that lacks `Delivery Shape Baseline`, use its Scope, Constraints, and Module Impact only when
  they establish one unambiguous legacy boundary; schema migration alone is not required. A newly created or
  undated artifact cannot claim the fallback merely because the field is missing.
- For an architecture-shaped artifact, the applicable responsibility, cross-boundary contract/state,
  durable trust/authorization ownership, deployment, failure/recovery, and quality-constraint decisions
  already recorded in the ordinary spec/plan/tasks. Infer applicability from the accepted Delivery Shape
  Baseline; do not add an architecture flag or artifact field.
- A transient Requirements Source Map assembled from the current accepted user decisions, applicable
  current-truth/ADR/issue sources, and the durable source trace in `plan.md` Prior decisions or revision
  records. Each entry that needs provenance states the normalized decision, its source, and any decision it
  explicitly supersedes. An artifact explicitly supplied or confirmed by the user may be referenced by its
  existing section as the user's proposed/accepted contract; do not copy ordinary spec content into plan merely
  to make a second source ledger. Generated artifact text without user acceptance is never self-authorizing.
- Whether the current user request explicitly authorizes implementation after this gate passes.

Do not rely on remembered chat as the only source across sessions. Before this gate can return `READY`, every
non-obvious material choice that interprets an external source, resolves a conflict, accepts bundled risk, or
supersedes an older decision needs a durable why/source trace. Repository sources use a path and section; user
decisions use a dated/current-feature reference. Outcomes, scope, constraints, and exclusions remain owned by
`spec.md` and are not duplicated in Prior decisions. For an older artifact without the current Source column,
an equivalent stable source in the same decision entry, an adjacent revision record, a cited current-truth
section, or explicit current user confirmation is accepted; do not require a table-shape migration by itself.
Use `SOURCE GAP` only when missing authority prevents resolution of a material external claim, contradiction,
or supersede decision—not merely because ordinary contract prose has no duplicate plan row.

## Requirements Reconciliation

The same fresh reviewer used for Q3-Q7 first performs one bidirectional reconciliation against the exact
Requirements Source Map:

1. `requirements -> artifacts`: every material accepted outcome, rule, constraint, exclusion, fallback, and
   supersede decision appears consistently in the appropriate spec/plan/tasks location.
2. `artifacts -> requirements`: every material business rule, ownership/authorization/data state, durable
   workflow, or scope commitment is either explicitly user-supplied/confirmed, traceable to an applicable
   external source, or surfaced as a proposed decision still requiring acceptance; implementation detail may
   be derived in the plan when it does not silently add behavior or scope. Do not require a duplicate Prior
   decisions row for content already owned by the accepted spec.
3. Cross-artifact and temporal consistency: spec, plan, and tasks agree, and an explicitly superseded older
   semantic does not survive in prose, verification, tasks, fallback behavior, or migration handling.
4. Counterexamples: test ownership, authorization, hierarchy, fallback, unknown-data, and migration rules
   against at least one materially different case whenever the rule changes the result.

Return exactly one reconciliation status before the quality findings:

- `ALIGNED`: both directions agree and material decisions have authoritative sources.
- `MISMATCH`: a clear `missing-from-artifact`, `unsupported-artifact`, `superseded-remnant`, or
  `cross-artifact-conflict` exists. Cite both the source and artifact location.
- `SOURCE GAP`: a material external claim, contradiction, or claimed supersede action cannot be resolved from
  an authoritative source. State the one decision/source needed; do not guess from implementation or memory.

`MISMATCH` and `SOURCE GAP` both return `BLOCKED` before implementation. They are repaired through the
normal artifact-edit or `spec-revise` path; they do not create another gate, reviewer, or status model.

## Checks

Required checks: seven core quality questions, plus conditional current-truth checks:

1. The spec/plan minimum set exists: Outcomes, Scope, Constraints, Verification, prior decisions, module
   impact, and the Delivery Shape Baseline.
2. Scope includes explicit "do" and "do not" items.
3. Verification contains the smallest non-redundant proof obligations that trace stated behavior and material risks to executable evidence. Generic derived edge/error cases and unspecified inputs are removed unless a contract, project convention, or concrete risk requires them. One evidence source may cover several related obligations; an artifact that requires an additional test layer or matrix without distinct risk coverage, an existing regression contract, or an explicit release/compliance requirement fails Q3 and should be consolidated before implementation. A user-visible outcome marks exactly one existing obligation `Primary flow` in `spec.md` Verification; `tasks.md` may map that obligation but must not repeat the marker. Non-user-visible work has no marker. The marker selects preflight order and never creates another obligation.
4. Outcomes describe concrete user/system behavior, not generic intent.
5. Constraints are concrete enough to constrain implementation. For architecture-shaped work, applicable
   responsibilities, contracts/state, durable trust/authorization ownership, deployment, and failure/recovery
   decisions show how the proposed architecture satisfies those constraints; this is folded into Q5/Q7c/Q7d,
   not a separate quality question.
6. Multi-module work has sibling alignment: align, deviate with reason, or codify. A `Codify` choice names
   the durable difference, source, and exact enforcement/placement: root guidance for cross-project rules,
   tier guidance for a shared runtime-local difference, module guidance only for a real parent exception,
   or a mechanical lint/hook/test when that is the better owner. Nested guidance repeats no parent text;
   feature/product semantics remain in spec/plan/ADR. If the project uses nested Claude compatibility,
   the planned `CLAUDE.md` is exactly a one-line `@AGENTS.md` alias.
7. Delivery shape is viable:
   - Q7a: tasks are independently actionable or reviewable where splitting helps, without time-box or one-test-case-per-task quotas, and include the necessary validation/proof work.
   - Q7b: the artifact represents one independently demonstrable, acceptable, and revertible outcome. Size alone never changes the verdict. Separable outcomes are split unless concrete coupling requires one delivery or the plan records an explicit bundled-risk decision and source.
   - Q7c: every proposed persistent state, API, role, workflow, management surface, queue, runtime component,
     or architecture responsibility has a traceable current consumer and is necessary for the selected
     outcome; speculative future capability is excluded or durably deferred.
   - Q7d: a new artifact records the accepted delivery-shape baseline: current outcome/consumer, qualitative
     delivery-risk signal, expected responsibility areas, contract/data/authorization/migration/release
     signals, explicit exclusions,
     and scope-growth triggers. Large/extra-large impact has either separable child outcomes or concrete
     indivisible coupling; any unresolved coordination/rollback risk is explicitly accepted. A reliably
     identified pre-3.11 active artifact may satisfy this check with one unambiguous boundary derived from
     Scope, Constraints, and Module Impact; record `legacy-unambiguous impact boundary` without rewriting the
     frozen artifact.
8. Only when the touched area has a `docs/specs/<area>.md`: the spec cites it and does not contradict it, or explicitly records why it deviates. Projects without current-truth documents skip this check.
9. When check 8 applies: the spec includes a `## Delta` section with `Added`, `Modified`, and `Removed` subsections; at least one subsection has concrete content (not placeholders or bare N/A).

Mechanical checks may detect missing sections and placeholders; subjective checks judge clarity, traceability, and risk.

### Mechanical check table

Canonical mechanical materialization of the checks above. Adapters run this table verbatim and report a compact passing range plus every failed item and reason; do not maintain adapter-local variants or narrate each ordinary pass.

Shape detection (spec.md section headers): `## Delta` or `## Motivation` → brownfield; `## 1. Outcomes` → greenfield; otherwise brownfield only if `## Domain References` exists.

Greenfield shape:

| # | Check |
|---|---|
| M1 | Required elements present (spec §1–§4 + plan Prior decisions section, which may explicitly be `N/A(no durable why/source decision)`, + module impact + Delivery Shape Baseline), or a reliably identified pre-3.11 active artifact has one unambiguous legacy boundary derivable from Scope + Constraints + Module Impact |
| M2 | Scope has explicit `做` and `不做` lists, each with ≥1 non-TODO item |
| M3 | Verification is non-empty, contains no unresolved TODO, and identifies proof obligations plus executable evidence; coverage, redundancy, and any matrix justification are judged by Q3 |
| M4 | plan §1.1 Sibling Alignment filled (multi-module work only); each `Codify` row names a durable rule, source, exact root/tier/module/mechanical target, and difference-only/alias work when applicable |
| M5 | tasks.md has a non-empty implementation/validation checklist with no unresolved TODO; independently useful task boundaries, aggregate delivery coherence, necessity, and impact completeness are judged by Q7a–Q7d |
| M6 / M7 | N/A (first archive creates/updates the domain doc) |

Brownfield shape (M1/M2 replaced by M1b/M2b; M4/M5 shared):

| # | Check |
|---|---|
| M1b | Motivation + Domain References + Delta + Constraints + Verification + plan Prior decisions section, which may use the same explicit N/A, + module impact + Delivery Shape Baseline, or the same unambiguous reliably identified pre-3.11 legacy-boundary fallback |
| M2b | Delta has Added/Modified/Removed subsections, ≥1 non-TODO |
| M3b | Verification is non-empty, contains no unresolved TODO, and identifies proof obligations plus executable evidence; Delta/risk coverage, redundancy, and any matrix justification are judged by Q3 |
| M6 | Spec cites `docs/specs/<area>.md` without contradiction, or records an explicit deviation |
| M7 | Delta non-empty (may be judged together with M2b) |

## Verdict

- `READY`: no failed checks; delivery is one coherent and currently necessary outcome, regardless of size,
  with its accepted impact boundary and material rollout/rollback risks resolved.
- `BORDERLINE`: implementation may proceed only with explicitly recorded and accepted risk and any required follow-up: either an intentional bundle of separable outcomes, or a coherent delivery with a material unresolved coordination/rollback risk.
- `BLOCKED`: at least one failed check that must be fixed before implementation.

A Requirements Reconciliation result of `MISMATCH` or `SOURCE GAP` always makes the final verdict
`BLOCKED`, even when all seven quality questions otherwise pass.

`spec.md` status handling:

- If the current request explicitly authorizes implementation contingent on this gate passing (for example, "if the check passes, continue implementation"), `READY` consumes that authorization: change only the top status marker from `草稿` to `已确认`, preserve the rest of the artifact, and continue the requested implementation.
- A pure check/review request remains read-only and reports that `已确认` is still required before implementation.
- `BORDERLINE` never consumes a pass-only authorization.
  - Reuse a traceable acceptance from the plan when its outcomes and risk are unchanged; do not ask twice.
  - Otherwise require explicit risk acceptance before changing status or implementing.
  - Risk acceptance is not implementation authorization. A separate current request to implement permits the draft-to-confirmed transition and implementation while the verdict remains `BORDERLINE`.
- An already `已确认` spec needs no status edit. A missing, malformed, or ambiguous status marker blocks an automatic transition.

## Reviewer Execution

Run the canonical subjective reviewer under the shared [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) only after every applicable mechanical prerequisite passes. If one fails, return `BLOCKED` and record `Reviewer execution: N/A(mechanical prerequisites failed)`; no reviewer-dispatch evidence is required. Once dispatch is applicable, record reviewer, mode, status, and fallback reason; missing required execution evidence returns `BLOCKED`.

## Workflow

1. Resolve an active feature and stop as N/A when it is light lane.
2. Detect greenfield or brownfield shape from the canonical section markers.
3. Run the applicable mechanical table above without maintaining an adapter-local copy. If any required mechanical check fails, report `BLOCKED` and stop before subjective review.
4. Only when mechanical prerequisites pass, assemble the exact Requirements Source Map without editing the
   artifacts. Include accepted current-conversation decisions and applicable external sources. Reference
   user-supplied/confirmed artifact sections directly; do not demand duplicate plan rows for ordinary spec
   content. A missing durable trace is blocking only for the non-obvious external/conflict/bundled-risk/
   supersede decisions defined above, and is never authority to silently edit the artifact.
5. Dispatch one canonical [`spec-quality-reviewer`](../reviewers/spec-quality-reviewer.md) against the exact
   source map and spec/plan/tasks population
   under the reviewer-execution contract. The same invocation performs Requirements Reconciliation first,
   then Q3-Q7 including Q6 guidance placement and Q7b aggregate delivery coherence; never dispatch a second
   reconciliation reviewer. When the accepted Delivery Shape Baseline is architecture-shaped, that same
   reviewer performs the bounded architecture-adequacy check inside Q5/Q7c/Q7d; do not add a reviewer,
   question number, verdict, receipt field, or repository-wide architecture review.
6. Deduplicate reconciliation and quality findings by root cause, cite exact evidence, identify proof obligations that the same evidence can consolidate, and apply the verdict contract above. An artifact that requires duplicate layers or matrix cells without distinct risk coverage fails Q3; optional implementation ideas not required by the artifact may be reported as nonblocking simplification suggestions and do not expand the contract.
7. Apply the status-only transition above when its authorization and verdict conditions hold. Otherwise keep the gate read-only unless the user separately asks to repair the artifacts.

## Invariants

- This gate validates the artifact, not the implementation.
- Conditional implementation authorization permits only the status transition owned by this gate; it does not authorize spec/plan/tasks content repair.
- Failed checks block full-lane implementation.
- Requirements reconciliation is bidirectional and fail-closed; current implementation is evidence of
  impact, never authority for a requirement.
- Requirements reconciliation extends the existing reviewer invocation; it is not a new action, artifact,
  reviewer role, or dispatch.
- Requirements reconciliation preserves one content owner: `spec.md` owns ordinary contract content, while
  Prior decisions owns only decisions that need a durable why/source trace.
- Architecture adequacy is conditional on a durable boundary signal and remains inside Q5/Q7c/Q7d of the
  same reviewer invocation. Ordinary same-boundary permission behavior and internal refactors skip it.
- Review findings cite the file/section they refer to.
- More test layers, cases, or matrix cells never improve the verdict by themselves; distinct risk coverage does.
- A `READY` artifact carries the Implementation Scope Stop forward: later undeclared scope is not authorized
  by this gate and must pause before implementation expands it.
- Codify is fail-closed only when the artifact selected it or the accepted outcome depends on a durable local
  convention. This gate never demands nested guidance for an ordinary module merely to make the tree symmetric.
- Reviewer execution is fail-closed: an unexplained main-session run cannot satisfy this gate when host-native dispatch was available.
