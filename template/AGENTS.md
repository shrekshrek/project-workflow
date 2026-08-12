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
- When a proposed implementation may need tracked acceptance, cross-session handoff, current-truth synchronization, or contract/risk protection, use the host's `feature-init` action to check whether the request is one independently deliverable outcome or needs decomposition before returning DIRECT/no artifact, LIGHT/tasks-only, or FULL/spec-plan-tasks. An explicit feature-routing question uses read-only PREVIEW; general discussion/review/diagnosis without that question does not invoke the action. Only authorized LIGHT/FULL APPLY creates an artifact; DIRECT creates none and an enclosing implementation request continues.
- Resolve current behavior from `docs/specs/` and the selected active feature; exclude `docs/specs/changes/archive/` unless tracing history.
- If direct or light work grows into contract-shaped, cross-module, architecture, data, security, or other high-risk scope, stop and upgrade the lane before continuing.

## Working Rules

- Read this file and any nearer nested `AGENTS.md` before editing.
- Preserve unrelated user changes.
- Prefer existing project commands and conventions over invented defaults.
- Keep generated files and historical artifacts unchanged unless the task explicitly targets them.
- Follow KISS: make the smallest sufficient, coherent change that solves the task and preserves relevant contracts; avoid speculative abstraction, unrelated refactors, and scope expansion.
- For domain-rich code, prefer domain-oriented modules and consistent language across specs, code, APIs, and tests.
- Respect established module boundaries: keep behavior and invariants with their owner, and use public interfaces instead of another module's internals.
- Update necessary tests and documentation, then run the narrowest relevant checks before claiming completion.
- Cite concrete evidence when a required check cannot run.

## Boundaries

- Do not add secrets, credentials, or private data.
- Do not claim a check ran when it did not.
- Do not use destructive version-control commands without explicit approval.
