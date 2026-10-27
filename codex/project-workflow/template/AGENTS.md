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

- Discuss the problem and resolve consequential unknowns before implementation. Use bounded, authorized trials when evidence is missing; distinguish observed results from user-accepted expectations.
- Make well-understood local changes directly and report focused checks; a feature name, file count or step count does not require a record. When acceptance, handoff, current-truth synchronization or material risk needs one, use `feature-init`: reuse an active record or default to one `spec.md`.
- Before implementation, make the proposed behavior, approach, material assumptions and planned handoffs understandable in plain language that requires no repository or testing knowledge while preserving the user's decision authority. Follow `feature-init`'s execution-preview rule; reuse an accepted approach. Carry each functional outcome through its ordinary implementation and checks, report useful progress, stop for a material discovery, then hand off an inspectable result for user feedback under feature-init’s scope-stop rule; continue across that boundary only when explicitly authorized.
- Resolve current behavior from `docs/specs/` and the selected active feature; exclude `docs/specs/changes/archive/` unless tracing history.
- Batch document updates at conclusions, before implementation and at handoffs. Preserve decisions, exclusions, open questions, permission limits and next steps; do not interrupt every exchange or reset context for bookkeeping.
- Continue ordinary implementation discoveries within the accepted behavior. When new evidence changes direction, scope, contracts, data, authorization, material cost or acceptance, pause affected work, explain the finding, confirm the change, update the affected record through `spec-revise`, then continue. Existing code never justifies absorbing scope.
- Match checks and independent review to actual risk and project requirements, not the number of documents. A failed test with unchanged requirements calls for repair, not lower expectations.

## Working Rules

- Read this file and any nearer nested `AGENTS.md` before editing.
- Preserve unrelated user changes.
- Prefer existing project commands and conventions over invented defaults.
- Keep generated files and historical artifacts unchanged unless the task explicitly targets them.
- Follow KISS: choose a clear, coherent solution by balancing correctness, implementation and verification cost, compatibility, and maintenance. A justified refactor may be simpler overall than a smaller patch. Keep the accepted scope; use feature-init for material trade-offs.
- For domain-rich code, prefer domain-oriented modules and consistent language across specs, code, APIs, and tests.
- Respect established module boundaries: keep behavior and invariants with their owner, and use public interfaces instead of another module's internals.
- Create nested `AGENTS.md` only for a durable rule that applies to a clear subtree, materially differs from
  inherited guidance, and is costly or unsafe to infer repeatedly. Keep cross-project rules at root, prefer one
  tier rule over duplicated sibling-module files, and keep nested files difference-only. Do not create them for
  directory symmetry, line-count reduction, feature/product semantics, temporary instructions, or decisions
  better owned by a feature record/ADR or mechanical lint/test. If this project adopts nested Claude aliases,
  each matching `CLAUDE.md` contains exactly `@AGENTS.md` plus one newline.
- Keep verification sufficient for declared behavior, material risks, and applicable project/release
  conventions. Prefer clear existing tests, consolidate redundant coverage, and remove tests for superseded
  behavior while preserving relevant regression coverage.
- During implementation run focused checks for the changed boundary. Before delivery, select the final check
  population from the feature's proof obligations, actual changed scope, shared-surface impact, and applicable
  project/release conventions. Run a repository-wide or release suite only when one of those inputs requires
  it, and execute each unchanged final evidence source once. Update necessary documentation before the final
  affected checks; do not rerun a focused check separately when unchanged final evidence subsumes it.
- Start with the cheapest useful evidence and expand only for remaining risk; a blocking low-cost failure stops
  unrelated expensive checks until repaired. Matrix, E2E and repository-wide suites are independent options,
  not a package; use only a necessary type and narrow scope. Before a long, paid, external or opaque check, explain the scale,
  cost/permission, observable progress and restart consequence, and use a smaller canary when it can answer first.
  Report progress from observable facts, never invented percentages.
- Cite concrete evidence when a required check cannot run.

## Boundaries

- Do not add secrets, credentials, or private data.
- Do not claim a check ran when it did not.
- Do not use destructive version-control commands without explicit approval.
