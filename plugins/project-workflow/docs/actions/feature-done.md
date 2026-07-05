# feature-done

Canonical endpoint action for deciding whether a feature is ready and recording proof in `tasks.md`.

## Use When

- Implementation for a feature is believed complete.
- The user wants a single readiness verdict.

This action owns the full endpoint gate: L1, L2, L3, current-truth check, and proof bundle. Adapters implement it as one entry point; partial reruns (for example re-running only L2 after a fix) are done by re-invoking this action or by dispatching the relevant reviewer directly, not through a second set of public commands.

## Inputs

- Feature directory or slug.
- Current diff or changed files.
- Project conventions from `AGENTS.md`, nested `AGENTS.md`, and path-scoped rules.
- Full-lane `spec.md` when present.
- Related domain documents (`docs/specs/<area>.md`) when the feature touches a declared product/system area.
- Test/check command results.

## Review Layers

- L1 Mechanical: run the project's check/lint/type/test commands.
- L2 Project conventions: compare changed code to A-class conventions via the `agents-md-reviewer` spec.
- L3 Change-spec compliance: compare implementation to `docs/specs/changes/.../spec.md` via `spec-reviewer`; **brownfield** = Delta + Constraints + Verification; **greenfield** = §1–§4; domain docs are context only, not the L3 baseline.
- Domain doc check: contradiction vs `docs/specs/<area>.md` and update-pending for `feature-archive`.
- Proof bundle: write delivery evidence to `tasks.md`.

## Proof Bundle

Record at least:

- diff summary
- tests/checks run and result
- L2 convention verdict
- L3 spec verdict, or explicit light-lane skip rationale
- A-class convention changes or drift suggestions (also append each suggestion as a plain-text line to the project's drift ledger; write-side is append-only free text — recurrence clustering happens at read time, in this action's recurrence hint and in `agents-md-revise`)
- current-truth status: no relevant domain doc / aligned / update pending (name the document)
- open questions

For light lane, also re-check that actual diff did not touch declared high-blast-radius paths; if it did, report misclassification.

For full-lane `READY`, move the top `spec.md` status marker to `已实现`. This is a delivery status update, not a contract revision; do not change spec body content, and skip this for light-lane or non-READY results.

## Verdict

- `READY`: L1 passes, no blocking L2/L3 findings, proof bundle written.
- `NEEDS WORK`: fixable findings remain.
- `BLOCKED`: missing required context, missing spec, or checks cannot run for a reason that prevents a reliable verdict.

`READY` means the implementation passes checks against the feature artifact. It does not mean the feature is closed: every delivered feature is eventually moved to `docs/specs/changes/archive/` by [`feature-archive`](feature-archive.md) (its sweep mode makes this a cheap periodic batch, not a per-feature ceremony). If the current-truth check reported "update pending", the proof bundle must say so explicitly and archiving that feature must include the current-truth merge — a READY feature with a pending merge is not silently complete.

## Gate Health

The final report should include a one-line gate-health signal: finding counts per gate (L2 / L3 / drift suggestions) for this run, plus a hint when a gate has produced zero findings of any severity across the last 3+ delivered features (read from their proof bundles; no extra storage). This feeds the "quiet gate / noisy gate" calibration anti-patterns — a persistently silent gate is a candidate for downscoping, not proof of health. The action only reports the signal; the user decides whether to recalibrate.

## Invariants

- L1/L2/L3 are separate because they answer different questions.
- Proof bundle is written at the endpoint, not guessed early.
- Historical specs remain archived; delivery evidence goes to `tasks.md`.
- `已实现` is a delivery marker, not a claim that the spec is still the current product baseline; the spec's final resting place is `docs/specs/changes/archive/` (see [`feature-archive`](feature-archive.md) / [`spec-reconcile`](spec-reconcile.md)).
