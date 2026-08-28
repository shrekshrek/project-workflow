# Project Working Agreement

This file is the cross-tool source of truth for working in this repository. Keep it short and replace deferred entries when repository evidence exists.

## Commands

- Build: deferred until repository evidence defines it.
- Test: deferred until repository evidence defines it.
- Lint/type checks: deferred until repository evidence defines them.

## Project Structure

- Source paths: deferred until repository evidence exists.
- Test paths: deferred until repository evidence exists.
- Persistent product truth: `docs/specs/`.
- Active tracked changes: `docs/specs/changes/`.
- Durable architecture decisions: `docs/adr/`.

## Change Workflow

- Make tiny, local, low-risk fixes directly, including reversible behavior work not declared in current truth, and report the checks run.
- Before the first implementation edit, give the user a proportionate preview of the intended outcome,
  approach, boundary, rationale, verification, and meaningful phases; wait for the user's acceptance. After each phase, report its result,
  evidence, deviations, and next phase, then wait before continuing.
- When a proposed implementation may need tracked acceptance, cross-session handoff, current-truth synchronization, or contract/risk protection, use the host's `feature-init` action to check whether the request is one independently deliverable outcome or needs decomposition before returning DIRECT/no artifact, LIGHT/tasks-only, or FULL/spec-plan-tasks. An explicit feature-routing question uses read-only PREVIEW; general discussion/review/diagnosis without that question does not invoke the action. Only authorized LIGHT/FULL APPLY creates an artifact; DIRECT creates none and an enclosing implementation request continues.
- Resolve current behavior from `docs/specs/` and the selected active feature; exclude `docs/specs/changes/archive/` unless tracing history.
- Choose the lightest sufficient artifact via `feature-init`; reassess when the accepted boundary or decision needs change, not merely when a risk category is touched. Verification remains proportionate to actual risk.
- For every lane, stop before extending implementation when work discovers an outcome, persistent state,
  API, role, workflow, management surface, queue, runtime, responsibility area, contract, migration,
  authorization rule, or release boundary outside the accepted scope/impact baseline. Full lane is not
  blanket permission for adjacent capability. Report the discovered delta, why it is or is not necessary
  now, the recommended remove/narrow/child/revise direction, and ask the smallest useful set of material questions. Continue
  only after a required direction is confirmed and recorded; already-written code is never a reason to absorb it.

## Working Rules

- Read this file and any nearer nested `AGENTS.md` before editing.
- Preserve unrelated user changes.
- Prefer existing project commands and conventions over invented defaults.
- Keep generated files and historical artifacts unchanged unless the task explicitly targets them.
- Follow KISS: make the smallest sufficient, coherent change that solves the task and preserves relevant contracts; avoid speculative abstraction, unrelated refactors, and scope expansion.
- For domain-rich code, prefer domain-oriented modules and consistent language across specs, code, APIs, and tests.
- Respect established module boundaries: keep behavior and invariants with their owner, and use public interfaces instead of another module's internals.
- Create nested `AGENTS.md` only for a durable rule that applies to a clear subtree, materially differs from
  inherited guidance, and is costly or unsafe to infer repeatedly. Keep cross-project rules at root, prefer one
  tier rule over duplicated sibling-module files, and keep nested files difference-only. Do not create them for
  directory symmetry, line-count reduction, feature/product semantics, temporary instructions, or decisions
  better owned by a spec/plan/ADR or mechanical lint/test. If this project adopts nested Claude aliases,
  each matching `CLAUDE.md` contains exactly `@AGENTS.md` plus one newline.
- Keep verification sufficient for declared behavior, material risks, and applicable project/release
  conventions. Prefer clear existing tests, consolidate redundant coverage, and remove tests for superseded
  behavior while preserving relevant regression coverage.
- During implementation run focused checks for the changed boundary. Before delivery, select the final check
  population from the feature's proof obligations, actual changed scope, shared-surface impact, and applicable
  project/release conventions. Run a repository-wide or release suite only when one of those inputs requires
  it, and execute each unchanged final evidence source once. Update necessary documentation before the final
  affected checks; do not rerun a focused check separately when unchanged final evidence subsumes it.
- Cite concrete evidence when a required check cannot run.

## Boundaries

- Do not add secrets, credentials, or private data.
- Do not claim a check ran when it did not.
- Do not use destructive version-control commands without explicit approval.
