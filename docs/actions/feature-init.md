# feature-init

Canonical P2 action for starting a feature artifact under `docs/specs/<NNN>-<slug>/`.

## Use When

- Beginning a feature, API/data model change, architecture change, or multi-file work that needs explicit requirements before implementation.
- A small change still benefits from a numbered task/proof artifact.

Do not use for mid-implementation frozen-spec changes; use [`spec-revise`](spec-revise.md). Do not write implementation code during this action.

## Inputs

- Feature slug, optionally with a short description.
- Existing project conventions from `AGENTS.md`, nested `AGENTS.md`, and path-scoped rules when present.
- Explicit feature facts already provided in the current conversation.

## Lane Classification

Use full lane by default. Use light lane only when all are true:

- small change, about one module or a few files
- additive, bugfix, or polish; no API/schema/data migration/architecture contract change
- no new module
- no declared disaster-invariant or high-blast-radius path is touched

If uncertain, use full lane. Classification happens once at feature creation.

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
