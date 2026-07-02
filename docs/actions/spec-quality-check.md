# spec-quality-check

Canonical pre-implementation gate for full-lane feature artifacts.

## Use When

- `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md` exists.
- The user believes the spec is ready for implementation.

Do not use as the main gate for light-lane features; check their `tasks.md` goal/boundary, verification, tasks, and proof bundle directly.

## Inputs

- `spec.md`
- `plan.md`
- `tasks.md`
- Relevant project conventions from `AGENTS.md` and path-scoped rules.

## Checks

Required quality questions:

1. Outcomes describe concrete user/system behavior, not generic intent.
2. Scope boundaries include explicit "do" and "do not" items.
3. Constraints are concrete enough to constrain implementation.
4. Verification is executable and maps to the risky behavior.
5. Plan identifies affected modules/tier boundaries.
6. Multi-module work has sibling alignment: align, deviate with reason, or codify.
7. Tasks are implementation-sized and include validation/proof work.

Mechanical checks may detect missing sections and placeholders; subjective checks judge clarity, traceability, and risk.

## Verdict

- `READY`: no failed checks.
- `BORDERLINE`: implementation may proceed only with explicitly recorded risk and follow-up.
- `BLOCKED`: at least one failed check that must be fixed before implementation.

## Invariants

- This gate validates the artifact, not the implementation.
- Failed checks block full-lane implementation.
- Review findings cite the file/section they refer to.
