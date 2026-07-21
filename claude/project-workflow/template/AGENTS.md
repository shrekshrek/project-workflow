# Project Working Agreement

This file is the cross-tool source of truth for working in this repository. Keep it short and replace deferred entries from repository evidence after the code scaffold exists.

## Commands

- Build: deferred until a scaffold defines it.
- Test: deferred until a scaffold defines it.
- Lint/type checks: deferred until a scaffold defines them.

## Project Structure

- Source paths: deferred until the scaffold exists.
- Test paths: deferred until the scaffold exists.
- Persistent product truth: `docs/specs/`.
- Active tracked changes: `docs/specs/changes/`.
- Durable architecture decisions: `docs/adr/`.

## Change Workflow

- Make tiny, local, low-risk fixes directly, including reversible behavior work not declared in current truth, and report the checks run.
- When a new feature or durable behavior change may need tracked acceptance, cross-session handoff, current-truth synchronization, or contract/risk protection, use the host's `feature-init` action to choose no-artifact/direct work, a light tracked change, or a full spec/plan/tasks change.
- Resolve current behavior from `docs/specs/` and the selected active feature; exclude `docs/specs/changes/archive/` unless tracing history.
- If direct or light work grows into contract-shaped, cross-module, architecture, data, security, or other high-risk scope, stop and upgrade the lane before continuing.

## Working Rules

- Read this file and any nearer nested `AGENTS.md` before editing.
- Preserve unrelated user changes.
- Prefer existing project commands and conventions over invented defaults.
- Keep generated files and historical artifacts unchanged unless the task explicitly targets them.
- Run the narrowest relevant mechanical checks before claiming completion.
- Cite concrete evidence when a required check cannot run.

## Boundaries

- Do not add secrets, credentials, or private data.
- Do not claim a check ran when it did not.
- Do not use destructive version-control commands without explicit approval.
