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
- Whether the current user request explicitly authorizes implementation after this gate passes.

## Checks

Required checks: seven core quality questions, plus conditional current-truth checks:

1. The spec/plan minimum set exists: Outcomes, Scope, Constraints, Verification, prior decisions, and module impact.
2. Scope includes explicit "do" and "do not" items.
3. Verification is executable and maps to the risky behavior.
4. Outcomes describe concrete user/system behavior, not generic intent.
5. Constraints are concrete enough to constrain implementation.
6. Multi-module work has sibling alignment: align, deviate with reason, or codify.
7. Tasks are implementation-sized and include validation/proof work.
8. Only when the touched area has a `docs/specs/<area>.md`: the spec cites it and does not contradict it, or explicitly records why it deviates. Projects without current-truth documents skip this check.
9. When check 8 applies: the spec includes a `## Delta` section with `Added`, `Modified`, and `Removed` subsections; at least one subsection has concrete content (not placeholders or bare N/A).

Mechanical checks may detect missing sections and placeholders; subjective checks judge clarity, traceability, and risk.

### Mechanical check table

Canonical mechanical materialization of the checks above. Adapters run this table verbatim and report per-item pass/fail with the failure reason; do not maintain adapter-local variants.

Shape detection (spec.md section headers): `## Delta` or `## Motivation` → brownfield; `## 1. Outcomes` → greenfield; otherwise brownfield only if `## Domain References` exists.

Greenfield shape:

| # | Check |
|---|---|
| M1 | Six required elements present (spec §1–§4 + plan Prior decisions + plan module impact) |
| M2 | Scope has explicit `做` and `不做` lists, each with ≥1 non-TODO item |
| M3 | Verification is non-empty, contains no unresolved TODO, and identifies executable checks; outcome/risk coverage is judged by Q3 |
| M4 | plan §1.1 Sibling Alignment filled (multi-module work only) |
| M5 | tasks.md has a non-empty implementation/validation checklist with no unresolved TODO; task completeness and verifiability are judged by Q7 |
| M6 / M7 | N/A (first archive creates/updates the domain doc) |

Brownfield shape (M1/M2 replaced by M1b/M2b; M4/M5 shared):

| # | Check |
|---|---|
| M1b | Motivation + Domain References + Delta + Constraints + Verification + both plan elements present |
| M2b | Delta has Added/Modified/Removed subsections, ≥1 non-TODO |
| M3b | Verification is non-empty, contains no unresolved TODO, and identifies executable checks; Delta/risk coverage is judged by Q3 |
| M6 | Spec cites `docs/specs/<area>.md` without contradiction, or records an explicit deviation |
| M7 | Delta non-empty (may be judged together with M2b) |

## Verdict

- `READY`: no failed checks.
- `BORDERLINE`: implementation may proceed only with explicitly recorded risk and follow-up.
- `BLOCKED`: at least one failed check that must be fixed before implementation.

`spec.md` status handling:

- If the current request explicitly authorizes implementation contingent on this gate passing (for example, "if the check passes, continue implementation"), `READY` consumes that authorization: change only the top status marker from `草稿` to `已确认`, preserve the rest of the artifact, and continue the requested implementation.
- A pure check/review request remains read-only and reports that `已确认` is still required before implementation.
- `BORDERLINE` never consumes a pass-only authorization. Record the concrete risk/follow-up and require explicit acceptance of that risk before changing status or implementing.
- An already `已确认` spec needs no status edit. A missing, malformed, or ambiguous status marker blocks an automatic transition.

## Reviewer Execution

Run the canonical subjective reviewer under the shared [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract) only after every applicable mechanical prerequisite passes. If one fails, return `BLOCKED` and record `Reviewer execution: N/A(mechanical prerequisites failed)`; no reviewer-dispatch evidence is required. Once dispatch is applicable, record reviewer, mode, status, and fallback reason; missing required execution evidence returns `BLOCKED`.

## Workflow

1. Resolve an active feature and stop as N/A when it is light lane.
2. Detect greenfield or brownfield shape from the canonical section markers.
3. Run the applicable mechanical table above without maintaining an adapter-local copy. If any required mechanical check fails, report `BLOCKED` and stop before subjective review.
4. Only when mechanical prerequisites pass, run the canonical spec-quality reviewer against the exact spec/plan/tasks population under the reviewer-execution contract above.
5. Deduplicate findings by root cause, cite exact evidence, and apply the verdict contract above.
6. Apply the status-only transition above when its authorization and verdict conditions hold. Otherwise keep the gate read-only unless the user separately asks to repair the artifacts.

## Invariants

- This gate validates the artifact, not the implementation.
- Conditional implementation authorization permits only the status transition owned by this gate; it does not authorize spec/plan/tasks content repair.
- Failed checks block full-lane implementation.
- Review findings cite the file/section they refer to.
- Reviewer execution is fail-closed: an unexplained main-session run cannot satisfy this gate when host-native dispatch was available.
