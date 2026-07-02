# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action composes L1, L2, L3, and proof-bundle responsibilities. Adapters may expose those as separate helper commands, but their meaning is defined here.

## Inputs

- Feature directory or slug.
- Current diff or changed files.
- Project conventions from `AGENTS.md`, nested `AGENTS.md`, and path-scoped rules.
- Full-lane `spec.md` when present.
- Test/check command results.

## Review Layers

- L1 Mechanical: run the project's check/lint/type/test commands.
- L2 Project conventions: compare changed code to A-class conventions.
- L3 Spec compliance: compare implementation to `spec.md`; skip or narrow for light-lane work without a frozen spec.
- Proof bundle: write delivery evidence to `tasks.md`.

## Proof Bundle

Record at least:

- diff summary
- tests/checks run and result
- L2 convention verdict
- L3 spec verdict, or explicit light-lane skip rationale
- A-class convention changes or drift suggestions
- open questions

For light lane, also re-check that actual diff did not touch declared high-blast-radius paths; if it did, report misclassification.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

- `READY`: L1 passes, no blocking L2/L3 findings, proof bundle written.
- `NEEDS WORK`: fixable findings remain.
- `BLOCKED`: missing required context, missing spec, or checks cannot run for a reason that prevents a reliable verdict.

## Invariants

- L1/L2/L3 are separate because they answer different questions.
- Proof bundle is written at the endpoint, not guessed early.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
