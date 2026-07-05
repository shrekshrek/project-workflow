# Workflow actions

This directory is the canonical action layer for project-workflow.

Each file defines one methodology action: when it applies, required inputs, outputs, invariants, and validation. Runtime adapters such as Claude Code skills, Codex skills, shell scripts, or a manual operator may add execution detail, but they should not redefine the action.

If an adapter conflicts with an action spec, the action spec wins. Update this directory first, then update adapters.

| Action | Purpose |
|---|---|
| [`project-init`](project-init.md) | Create a greenfield project-workflow baseline |
| [`project-personalize`](project-personalize.md) | Adapt a copied or existing project-workflow-shaped project |
| [`feature-init`](feature-init.md) | Create a feature artifact only when needed |
| [`spec-quality-check`](spec-quality-check.md) | Gate full-lane feature specs before implementation |
| [`spec-revise`](spec-revise.md) | Revise frozen spec/plan/tasks during implementation |
| [`feature-done`](feature-done.md) | Run endpoint review and write the proof bundle |
| [`feature-archive`](feature-archive.md) | Close delivered features: merge durable conclusions into current truth, move directories to `docs/specs/changes/archive/` (default sweep mode) |
| [`spec-reconcile`](spec-reconcile.md) | Repair conflicts across accumulated specs in one area (retrofit tool): pick source of truth, mark and archive losing specs |
| [`agents-md-revise`](agents-md-revise.md) | Refresh A-class project conventions |
