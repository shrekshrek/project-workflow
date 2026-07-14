# feature-init

Canonical P2 action for starting a tracked feature artifact under `docs/specs/changes/<NNN>-<slug>/`.

## Use When

- Beginning a feature, API/data model change, architecture change, or multi-file work that needs explicit requirements before implementation.
- A small change still benefits from a numbered task/proof artifact.

Do not use this action when the task does not need a new project-workflow artifact. Tiny bugfixes, wording/style tweaks, local test expectation fixes, low-risk documentation edits, and implementation under an accepted spec should continue directly and close with checks.

**Behavior-change floor**: a change that alters user-visible behavior or a durable rule already declared in `docs/specs/<area>.md` takes **at least the light lane** — domain docs update only via `feature-done` → `feature-archive`.

Do not use for mid-implementation frozen-spec changes; use [`spec-revise`](spec-revise.md). Do not write implementation code during this action.

## Inputs

- Feature slug, optionally with a short description.
- Target project root containing `AGENTS.md` and `docs/specs/`; all created files must be written under this root, not under an incidental cwd.
- Existing project conventions from `AGENTS.md`, nested `AGENTS.md`, and path-scoped rules when present.
- Existing substantive E-class domain docs (`docs/specs/<area>.md`) when present; prefer over `docs/specs/changes/archive/` when pre-filling. Do not create an empty domain doc just to make a feature brownfield.
- Explicit feature facts already provided in the current conversation.

Read the active tree only: `docs/specs/changes/archive/` is closed history — exclude it when searching for context (its durable conclusions live in `docs/specs/`). If the active tree still has several related historical specs that look contradictory, recommend running [`spec-reconcile`](spec-reconcile.md) before implementation.

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

- `docs/specs/changes/<NNN>-<slug>/spec.md` (brownfield lean or greenfield full template)
- `docs/specs/changes/<NNN>-<slug>/plan.md`
- `docs/specs/changes/<NNN>-<slug>/tasks.md`

Light lane:

- `docs/specs/changes/<NNN>-<slug>/tasks.md`

The directory number is the next available three-digit number (shared active+archive sequence, see [Shared runtime conventions](README.md#shared-runtime-conventions)) unless the user supplied a non-conflicting number. When the user supplies a number: equal to the computed next number → use it silently; greater than the computed number → ask which to use; less than or equal to an existing number → report the collision and switch to the computed number or another unused number (the slug may also change, but changing it alone never frees an occupied number). Never overwrite an existing `docs/specs/changes/<NNN>-<slug>/` directory.

Adapters materialize the selected template through the packaged `scripts/materialize-feature-artifact.cjs`. The script validates the target root and number, atomically reserves the requested NNN for the short materialization window, creates the final feature directory with a no-clobber gate, copies only the selected lane files with exclusive creation, and rolls back files from a failed copy. A refusal leaves every pre-existing file untouched. Active or stale reservation files count as occupied numbers; on a reservation collision, retry once with the next NNN reported by the materializer and never delete an unknown reservation automatically.

## Codex Adapter Contract

When `.claude/rules/` compatibility files exist, the Codex adapter resolves and fresh-reads global, matching, and ambiguous rules through the [Codex scoped-rule bridge](../adapters/codex-scoped-rule-bridge.md). Report compact counts plus applicable/ambiguous paths; full skipped paths are debug-only. The handoff names global and matched paths.

## Invariants

- Resolve the target project root before creating files. Prefer cwd, then nearest parent, then a single matching child; if multiple candidates exist, ask and do not guess.
- Preserve unresolved `{{TODO ...}}` markers for unknown details.
- Do not plant endpoints, entities, field names, error codes, module paths, or technology choices without traceable support.
- If pre-filling from conversation, mark the source briefly.
- New module decisions must be explicit in plan/tasks; unclear ownership is a question, not a guess.
- The full-lane handoff tells the main session to create an ADR during conversational fill only when `ADR_REQUIRED` is satisfied; feature-init does not create speculative ADRs before the decision exists.
- Full-lane features must pass [`spec-quality-check`](spec-quality-check.md) before implementation.

## Validation

- Confirm created files match the selected lane.
- Report lane, module decision, unresolved placeholders, and next action.
- For Codex, report compact bridge counts and include applicable/ambiguous paths in the handoff.
