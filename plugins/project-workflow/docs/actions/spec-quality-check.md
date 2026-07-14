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
- Relevant project conventions from `AGENTS.md` and path-scoped rules.

## Checks

Required checks: seven core quality questions, plus conditional current-truth checks:

1. Outcomes describe concrete user/system behavior, not generic intent.
2. Scope boundaries include explicit "do" and "do not" items.
3. Constraints are concrete enough to constrain implementation.
4. Verification is executable and maps to the risky behavior.
5. Plan identifies affected modules/tier boundaries.
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
| M3 | Verification has ≥3 testable items |
| M4 | plan §1.1 Sibling Alignment filled (multi-module work only) |
| M5 | tasks.md has ≥3 items |
| M6 / M7 | N/A (first archive creates/updates the domain doc) |

Brownfield shape (M1/M2 replaced by M1b/M2b; M4/M5 shared):

| # | Check |
|---|---|
| M1b | Motivation + Domain References + Delta + Constraints + Verification + both plan elements present |
| M2b | Delta has Added/Modified/Removed subsections, ≥1 non-TODO |
| M3b | Verification has ≥2 testable items (brownfield default) |
| M6 | Spec cites `docs/specs/<area>.md` without contradiction, or records an explicit deviation |
| M7 | Delta non-empty (may be judged together with M2b) |

## Verdict

- `READY`: no failed checks.
- `BORDERLINE`: implementation may proceed only with explicitly recorded risk and follow-up.
- `BLOCKED`: at least one failed check that must be fixed before implementation.

`spec.md` status handling: this gate does not automatically mark `已确认`. That status means the user has accepted the spec and is starting implementation. After `READY`, or after accepted `BORDERLINE` risk is recorded, adapters should tell the user to mark `已确认` before implementation; update the status only when the user explicitly asks.

## Invariants

- This gate validates the artifact, not the implementation.
- Failed checks block full-lane implementation.
- Review findings cite the file/section they refer to.
