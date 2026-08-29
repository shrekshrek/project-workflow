# spec-quality-check

Canonical semantic readiness check before implementation or after a material accepted revision.

## Use When

A feature record is ready to guide implementation, or the user explicitly asks to check it. The same check
applies to a short spec with or without optional design/work notes; missing optional plan/tasks or particular
headings are not failures. Reuse a completed check when its decision sources and affected inputs remain unchanged.

A pending correction to an accepted contract returns `N/A(route: spec-revise)` before mechanical checks or
reviewer dispatch. Drafts can be edited normally. This action does not implement code or change requirements.

## Inputs

Read the active accepted/proposed record, relevant current truth/ADRs and the current user decisions. Open
optional linked design or task content only when it affects the judgment. For a material correction use the
exact user statement or stable accepted source, normalized replacement and the rule it supersedes. A
caller-authored confirmation label alone is not authority. Preserve the decision-closure result rather than
asking the user to reconfirm it. Do not copy ordinary spec prose into another source ledger.

## Requirements Reconciliation

Apply the [reviewer method](../reviewers/spec-quality-reviewer.md#requirements-reconciliation) to compare
sources with the proposed record in both directions. The transient source map is just the necessary source
references, not a new persisted artifact. Report `ALIGNED`, `MISMATCH` or `SOURCE GAP`; a material mismatch or
source gap blocks the affected implementation. Existing code proves what happens, not what the user accepted.
A recorded experiment is evidence; it is not automatically an acceptance decision.

## Checks

Check meaning, not template completion:

1. The problem, present consumer, observable outcome, boundary and meaningful exclusions are understood.
2. Critical unknowns affecting the chosen direction, contract or acceptance have adequate evidence or an
   explicit user decision. A trial that did not run or failed its criterion is not validated evidence. Ordinary
   details that can safely be discovered during implementation remain open without blocking the whole change.
3. Concrete acceptance examples and expected results have the smallest non-redundant proof obligations and
   executable evidence. Preserve actual regression/risk coverage; do not require generic test-layer quotas.
4. The approach is necessary for the current outcome and addresses applicable responsibilities, data,
   authorization, recovery, cost and rollout constraints. Scope is coherent; independent outcomes are not
   silently bundled. Size alone is not a failure and a bundle does not need a new document category.
5. Accepted decisions, negative constraints, supersessions and unresolved questions survive into the record.
   Related current truth is referenced and deviations are explicit. Do not demand a `Delta` heading or empty
   Added/Modified/Removed subsections when prose already states the change.
6. The next implementation step and its verification are actionable. Do not require an exhaustive task list,
   module table or optional files. When useful steps exist, their dependency checkpoints and accepted changes
   agree. READY, receipt/status writes and archive eligibility are endpoint outputs, not prerequisites that
   must be checked off before the endpoint itself can run.
7. Explicit project/convention commitments can be satisfied. Merely touching several modules does not require
   an alignment table. A promised Codify decision needs its owner/source/enforcement; only then read the
   [Guidance Placement Contract](agents-md-revise.md#guidance-placement-contract).

Mechanical checks establish readable inputs, usable references and detect literal unresolved placeholders
where an actual decision is needed. They cannot establish clarity or readiness from heading counts, file
counts, a filled template, or the presence of a word. A blank scaffold is not an accepted contract.

## Reviewer Execution

The main session performs the above semantic check in the current flow. Run a fresh independent
[spec-quality reviewer](../reviewers/spec-quality-reviewer.md) when requested, required by the project, or
when the change affects security/authorization, data migration, shared contracts, durable architecture or
release/recovery boundaries requiring independent judgment. Simple well-understood work does not require
another review merely because it has a spec. Reconciliation remains required when independent review is N/A.

Dispatch only after required inputs and source decisions are available, under the shared
[reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Record applicable review
execution truthfully; missing required execution blocks READY. Do not dispatch a reviewer to invent a missing
user decision. Review the affected boundary, not every project document or unrelated historical decision.

## Verdict and continuation

- `READY`: required checks pass, critical direction questions are resolved, acceptance is actionable and
  any applicable independent review completed reliably.
- `BORDERLINE`: a concrete residual risk is identified with an explicit decision needed before affected
  implementation; reuse existing unchanged risk acceptance instead of asking twice.
- `BLOCKED`: a material mismatch, unsupported decision, unexecutable acceptance or missing required evidence
  prevents reliable implementation. State the specific gap and next useful action.

A pure check remains read-only. For an already authorized implementation request, READY can mark the record
`已确认` and return to the enclosing workflow. Continue into implementation only with an accepted approach;
reuse a previously accepted execution preview. Do not make the user repeat authorization merely because
this check ran. Neither a review verdict nor a template status creates user approval.

## Invariants

- This checks the implementation basis, not whether the code is delivered.
- No format quota, fixed section list, extra document or planned-test count establishes readiness.
- Unchanged settled decisions and evidence remain valid; new material discoveries use
  [Implementation Scope Stop](feature-init.md#implementation-scope-stop).
- Findings cite the affected decision and evidence; source authority is fail-closed.
- Do not rewrite expectations to accommodate a failed trial or test.
