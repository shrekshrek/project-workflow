# feature-init

Canonical P2 action for starting a tracked feature artifact under `docs/specs/<NNN>-<slug>/`.

## Use When

- Beginning a feature, API/data model change, architecture change, or multi-file work that needs explicit requirements before implementation.
- A small change still benefits from a numbered task/proof artifact.

Do not use this action when the task does not need a new project-workflow artifact. Tiny bugfixes, wording/style tweaks, local test expectation fixes, low-risk documentation edits, and implementation under an accepted spec should continue directly and close with checks.

Do not use for mid-implementation frozen-spec changes; use [`spec-revise`](spec-revise.md). Do not write implementation code during this action.

## Inputs

- Feature slug, optionally with a short description.
- Existing project conventions from `AGENTS.md`, nested `AGENTS.md`, and path-scoped rules when present.
- Explicit feature facts already provided in the current conversation.

## Lane Classification

First decide whether the task needs a new project-workflow artifact at all. If no durable artifact is useful, or an accepted spec already covers the work, do not create a pseudo-lane; skip this action and implement directly under `AGENTS.md`, path rules, and relevant checks.

When an artifact is useful, choose between two lanes. Use full lane for high-risk or contract-shaped work. Use light lane only when all are true:

- small change within one cohesive module or responsibility area; file count alone is not decisive
- additive, bugfix, or polish; no API/schema/data migration/architecture contract change
- no new module
- no declared disaster-invariant or high-blast-radius path is touched

Uncertainty is graded:

- uncertain about API/schema, DB/data migration, security, auth/permissions, multi-tenant behavior, cross-module contract, new module ownership, or high-blast-radius impact → full lane
- uncertain about UI wording, styling, component splitting, local refactor shape, or how to write tests → do not force full lane for that reason alone
- uncertain about business goal or user-visible outcome → ask the user before creating artifacts

Bundle related small changes into one tracked feature when they share a user goal or delivery surface; do not create fragmentary specs for button state, table columns, and details drawer separately. Classification happens once at feature creation.

If direct implementation or light-lane work later touches API/schema, DB/data migration, security, auth/permissions, multi-tenant behavior, evidence/data invariants, cross-module contracts, or high-blast-radius paths, stop and upgrade to the appropriate light/full artifact flow before continuing.

## Outputs

Full lane:

- `docs/specs/<NNN>-<slug>/spec.md`
- `docs/specs/<NNN>-<slug>/plan.md`
- `docs/specs/<NNN>-<slug>/tasks.md`

Light lane:

- `docs/specs/<NNN>-<slug>/tasks.md`

The directory number is the next available three-digit number unless the user supplied a non-conflicting number.

## Invariants

- Preserve unresolved `{{TODO ...}}` markers for unknown details.
- Do not plant endpoints, entities, field names, error codes, module paths, or technology choices without traceable support.
- If pre-filling from conversation, mark the source briefly.
- New module decisions must be explicit in plan/tasks; unclear ownership is a question, not a guess.
- Full-lane features must pass [`spec-quality-check`](spec-quality-check.md) before implementation.

## Validation

- Confirm created files match the selected lane.
- Report lane, module decision, unresolved placeholders, and next action.
