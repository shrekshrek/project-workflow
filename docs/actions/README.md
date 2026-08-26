# Workflow actions

This directory is the canonical action layer for project-workflow.

Each file defines one methodology action: when it applies, required inputs, outputs, invariants, and validation. Runtime adapters such as Claude Code skills, Codex skills, shell scripts, or a manual operator may add execution detail, but they should not redefine the action.

If an adapter conflicts with an action spec, the action spec wins. Update this directory first, then update adapters.

## Contract ownership

Keep one normative definition for each workflow concern. Other surfaces consume that contract instead of
copying its decision table or inventing a second gate.

| Concern | Normative owner | Downstream use |
|---|---|---|
| Impact/necessity, DIRECT/LIGHT/FULL routing, scope viability, the execution preview and phase handoffs, implementation scope stop, and planning-time minimum evidence | [`feature-init`](feature-init.md) | `spec-quality-check` verifies the full-lane artifact applied the accepted boundary and preserves the preview handoff; `feature-done` compares the actual change with it |
| Bidirectional requirements reconciliation and pre-implementation full-lane quality | [`spec-quality-check`](spec-quality-check.md) | The spec-quality reviewer supplies the assessment method; pending frozen-contract corrections route to `spec-revise` before review |
| Frozen-contract correction, reopening, and synchronized scope-delta handling | [`spec-revise`](spec-revise.md) | It reuses `feature-init` viability rules only when the accepted boundary changes |
| Actual-diff completion preflight, L1/L2/L3 aggregation, current-truth decision, and delivery receipt | [`feature-done`](feature-done.md) | Reviewers consume the action-owned snapshot and never add a delivery layer |
| Archive eligibility, current-truth merge, and physical lifecycle closure | [`feature-archive`](feature-archive.md) | It consumes the complete `feature-done` receipt and never infers READY from partial or historical fields |
| Durable root/tier/module guidance maintenance | [`agents-md-revise`](agents-md-revise.md) | Feature actions may select or verify a placement, but do not run a convention-maintenance sweep |

The action specs and Shared runtime conventions below are executable contracts. Reviewer documents own
assessment methods, adapters own host execution mechanics, and templates own only the fields materialized into
a target project. Other `README` content, `quickstart`, `workflow`, and `spec-driven` are explanatory surfaces:
they may summarize a rule and link to its owner, but must not become an alternative normative source.

## Architecture risk routing

The normal feature lifecycle owns product/application architecture work:

- At planning, architecture-shaped work stays in `feature-init` and conditionally reads
  [`architecture-design`](../architecture-design.md); ordinary work skips it.
- During implementation, `feature-init` owns scope-stop behavior: ordinary details continue, while a material
  direction concern pauses affected or dependent work.
- At delivery, `feature-done` compares the actual change with the accepted boundary and L2/L3 apply their
  existing convention/spec contracts.

Architecture review requires an accepted durable boundary signal. Tiny local work, ordinary same-boundary
implementation detail, speculative future concerns, and file/test/line counts remain on their normal paths.

## Shared runtime conventions

Single authoritative home for rules that several actions need. Action specs and runtime skills cite this section instead of restating it.

- **Feature directory resolution**: a feature lives in `docs/specs/changes/<NNN>-<slug>/`. Resolve a slug/number argument to the matching directory; resolve an empty or `current` argument to the most recently modified active feature (artifact-file mtime), always excluding `archive/`. Multiple or zero candidates is a user question, not a guess.
- **NNN numbering**: three digits, one global sequence shared by the active tree and `archive/`; next number = max across both + 1 (zero-padded, `001` when empty). Archived numbers are never reused.
- **Plugin root resolution**: the active runtime adapter resolves the installed package that contains its own skill and the required asset. Claude adapters require a valid `CLAUDE_PLUGIN_ROOT`; Codex adapters walk upward from the active skill to the nearest `.codex-plugin/plugin.json`. Do not scan another host's cache or select an unrelated installation. If the host-local root or required asset is unavailable, stop — never recreate plugin assets inside the target project.

| Action | Purpose |
|---|---|
| [`project-init`](project-init.md) | Create the neutral baseline when its destinations are absent and existing content needs no personalization |
| [`project-personalize`](project-personalize.md) | Establish or adapt project-workflow from repository evidence |
| [`feature-init`](feature-init.md) | Choose no artifact, light tracking, or a full contract and carry its accepted boundary into implementation |
| [`spec-quality-check`](spec-quality-check.md) | Reconcile accepted requirements and gate a completed full-lane artifact before implementation |
| [`spec-revise`](spec-revise.md) | Correct and synchronize a materially wrong frozen contract |
| [`feature-done`](feature-done.md) | Validate the actual delivery, aggregate applicable review, and write the delivery receipt |
| [`feature-archive`](feature-archive.md) | Close delivered features: merge durable conclusions into current truth, move directories to `docs/specs/changes/archive/` (default sweep mode) |
| [`spec-reconcile`](spec-reconcile.md) | Repair conflicts across accumulated specs in one area (retrofit tool): pick source of truth, mark and archive losing specs |
| [`agents-md-revise`](agents-md-revise.md) | Refresh evidence-backed project conventions and their placement |

Architecture-shaped full-lane work remains part of `feature-init` and conditionally reads the shared [`architecture-design` guidance](../architecture-design.md).
