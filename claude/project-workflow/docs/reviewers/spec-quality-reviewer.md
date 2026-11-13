# spec-quality-reviewer

Canonical reviewer for pre-implementation requirements reconciliation and subjective quality checks on
the accepted/proposed record and any relevant existing attachments.

## Scope

Assess whether a feature record still matches its accepted requirement sources and is good enough
to implement. Apply Requirements Reconciliation followed by Review below, whether called in the main
session or as an independent reviewer. The calling action owns dispatch, verdict and continuation.

Do not review code-level implementation feasibility, AGENTS.md compliance, or mechanical presence checks that the calling action can run directly. Do review delivery-shape feasibility: whether the proposed outcomes can ship independently.

When an accepted multi-boundary or materially high-risk delivery boundary establishes or changes runtime/tier/module
responsibility, a cross-component contract, data/state ownership, a durable trust/authorization ownership
boundary, or deployment ownership, perform one bounded architecture-adequacy check inside Q5/Q7c/Q7d. Verify
that a coherent responsibility/component set, applicable cross-boundary contracts and state,
trust/deployment ownership, and material failure/migration/recovery behavior support the stated outcomes and
quality constraints. Keep the assessment within the accepted delivery boundary and the existing Q5/Q7c/Q7d
findings. Ordinary same-boundary permissions and internal refactors skip it.

## Requirements Reconciliation

The caller supplies the exact transient Requirements Source Map plus exact artifact paths. Treat user decisions,
applicable current truth/ADRs/issues, and their durable Prior decisions or revision-record source trace as
authority. A spec explicitly supplied or confirmed by the user may be referenced by section as that user's
proposed/accepted contract; generated draft text is not self-authorizing. Do not search for remembered
conversation, infer a requirement from current implementation, or demand that ordinary spec content be copied
into a separate provenance ledger.

Use the supplied decision-closure result to verify faithful representation of resolved material decisions;
missing authority remains `SOURCE GAP` for the caller to resolve.

For a current-conversation correction or supersede decision, require the caller to provide the exact user
statement, normalized replacement, and older rule it supersedes. A caller-authored "user confirmed" summary
without that direct statement or a stable external/durable source is `SOURCE GAP`, not authority.

Before Q3-Q7, read both directions. Also distinguish an observed trial result, an accepted expected result,
and delivery evidence. A failed/unavailable trial cannot silently become an accepted outcome. Check that
condensed records preserve exclusions, unresolved questions and the authorization boundary:


- Requirements to artifacts: locate every material accepted outcome, rule, constraint, exclusion, fallback,
  and supersede decision in the record and any affected attachments.
- Artifacts to requirements: identify every material business behavior, ownership/authorization/data state,
  durable workflow, or scope commitment that is neither explicitly user-supplied/confirmed, traceable to an
  applicable external source, nor surfaced as a proposed decision requiring acceptance. Retention, retry, overwrite and failure semantics also need this trace when they change observable results. Ordinary implementation
  detail may be derived in the record when it adds no behavior or scope; accepted spec content needs no duplicate
  Prior decisions row.
- Temporal/cross-artifact consistency: apply [document maintenance](../actions/feature-init.md#document-updates-and-context).
  Flag competing current rules or stale semantics in prose, verification, tasks, fallback or migration handling;
  a “history” label is insufficient when current obligations still require reconstructing those revisions.
- Exclusion and ownership semantics: when an authoritative source says "remove", "no longer", "only",
  "single source", or equivalent, flag any retained optional, conditional, fallback, or compatibility path as
  `superseded-remnant` unless that source explicitly preserves it.
- Counterexamples: when ownership, authorization, hierarchy, fallback, unknown-data, or migration rules can
  change the result, test at least one materially different case rather than accepting only the happy path.

Report exactly one `Requirements Reconciliation` status before the Q findings:

- `ALIGNED` when both directions agree and material decisions have authoritative sources.
- `MISMATCH` with one of `missing-from-artifact`, `unsupported-artifact`, `superseded-remnant`, or
  `cross-artifact-conflict`, citing both source and artifact evidence.
- `SOURCE GAP` when a material external claim, contradiction, or supersede claim lacks enough authority to
  resolve. Name the decision/source required; do not choose a side. Missing duplicate provenance for ordinary
  user-supplied/confirmed spec content is not a source gap.

Latest wins only when a later authoritative source explicitly replaces the earlier decision. Otherwise a
conflict is `SOURCE GAP`. `MISMATCH` and `SOURCE GAP` are blocking regardless of the later Q results. Continue
Q3-Q7 in the same invocation so the caller receives one consolidated repair set.

## Review

Fresh-read the relevant record and assess every applicable item, regardless of layout. Preserve accepted
constraints, exclusions and open questions; do not require a `Delta` heading, optional files, exhaustive tasks
or an alignment table merely because several modules are touched. Check material choices and handoffs against
[execution preview](../actions/feature-init.md#record-and-authorization).

Before implementation, require the smallest non-redundant proof obligations and an executable verification path:
a credible plan plus decision evidence, not completed delivery evidence. Distinguish implementation feedback
from delivery proof. Failed or unavailable trials do not resolve critical unknowns; safely deferred details
and operational choices only knowable at execution time remain nonblocking. Known material cost and permission
constraints must be explicit.

When the spec cites a Blueprint handoff, verify its slice, decision and contract references resolve and the
change stays within the accepted upstream boundary. A material contradiction or project-level impact routes
to `spec-revise` and the upstream Blueprint; with no Blueprint reference, skip this check.

- Q3 verification: a compact, traceable behavior/risk → executable verification path = pass; uncheckable assertions = fail; planned proof and already-run evidence remain distinct, and documented repeatable manual observation can be evidence. Remove obligations invented from generic edge/error habits or unspecified inputs unless a contract, project convention, or concrete risk requires them. Apply the shared [verification escalation](../actions/README.md#shared-runtime-conventions) rule. One command may prove several obligations; unjustified or duplicate layers fail Q3 and should be deleted or consolidated. Optional implementation ideas remain nonblocking suggestions. For user-visible work, order the shortest meaningful actor-to-result journey first when one is declared.
- Q4 outcomes: actor/system + action + success condition = pass; vague aspiration = fail; missing success condition = borderline.
- Q5 constraints: hard/external/measurable = pass; wish = fail; a preference should be identified as such; it blocks only when an unresolved choice changes acceptance or material risk.
  For architecture-shaped work, a material quality constraint without an applicable responsibility,
  contract/state, trust/deployment, or failure/recovery decision that can satisfy it = fail; a traceable and
  proportionate mapping = pass.
- Q6 sibling/guidance alignment: `Align` uses an applicable existing rule; `Deviate` names why the feature
  exception stays local; `Codify` names a durable difference, evidence/source, and exact target = pass.
  When Q6 contains a placement decision, read and apply the canonical
  [Guidance Placement Contract](../actions/agents-md-revise.md#guidance-placement-contract); otherwise do not
  load it. A violation, missing promised target/alias task, or uncertain owner is fail or borderline according
  to whether it can change implementation.
- Q7a next work: the next step and its check must be actionable even without a checklist. When a checklist is useful, independently actionable or reviewable output/check that can finish before `feature-done` = pass;
  a broad bucket that hides separate decisions or a material dependency checkpoint = fail; work without
  verification = borderline. READY, Proof Bundle/status writes, and archive eligibility are endpoint/lifecycle
  outputs rather than task checkboxes; a checklist item that depends on them is circular and fails Q7a. Each
  real dependency or risk checkpoint should close an inspectable result and own its smallest relevant check
  before dependent work. Check the first slice against [feature-init's discovery rule](../actions/feature-init.md#conversation-and-discovery)
  and its [execution preview](../actions/feature-init.md#record-and-authorization): can the user judge a
  representative result before dependent work amplifies a mistaken interpretation? Do not require all layers at once.
- Q7b delivery coherence: one independently demonstrable/acceptable/revertible outcome with resolved material risks = pass regardless of size; several separable outcomes with no coupling or traceable bundled-risk decision in the record = fail; an explicitly accepted bundle, or one coherent delivery with material unresolved coordination/rollback risk, = borderline.
- Q7c current necessity: every [declarable surface](../actions/README.md#shared-runtime-conventions) names a
  present actor, owner or consumer and a selected-outcome necessity =
  pass; a capability justified only by possible future need = fail; an unclear current need, affected party or simpler
  safe alternative = borderline.
  Prefer removing or deferring speculative capability over making its implementation more complete.
- Q7d impact completeness: Scope, constraints, affected responsibilities, and acceptance agree across the record and any affected attachments =
  pass for ordinary same-boundary work. Multi-boundary, architecture-shaped, or materially high-risk work also
  records the relevant coupling, rollback boundary, and scope-growth triggers; omitting an applicable
  cross-boundary contract/state, durable trust/authorization ownership, deployment, or material
  failure/migration/recovery decision = fail; an undeclared high-impact surface or unresolved data/ownership
  disposition = fail;
  broad delivery with concrete inseparable coupling and accepted risk = pass or borderline according to the
  remaining coordination risk, never an automatic fail by size alone.

Report the reconciliation status, reviewed items, skipped items with reasons, blocking ambiguity, citations,
and concise rewrites. Use a pass/borderline/fail matrix only when several items fail. A mostly empty artifact
is not a reliable pass.

## Rules

- Cite exact file/section/line when possible.
- Cite the Requirements Source Map entry as well as the artifact location for every reconciliation mismatch.
- Suggest rewrites but do not edit files.
- A material unresolved decision blocks affected implementation; a safely deferred low-level detail does not. Do not require empty chapters or reject clear prose solely for lacking template headings.
- Treat broad responsibility, migration, and external-contract surfaces as review signals, not automatic verdict thresholds.
- If a dispatched artifact is mechanically complete but substantively mostly empty, mark the applicable Q
  items `fail` with blocking evidence. Never return `N/A` after dispatch; the owning action alone records N/A
  when no independent review is needed or required inputs are unavailable.
