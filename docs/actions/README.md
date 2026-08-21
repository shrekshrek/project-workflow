# Workflow actions

This directory is the canonical action layer for project-workflow.

Each file defines one methodology action: when it applies, required inputs, outputs, invariants, and validation. Runtime adapters such as Claude Code skills, Codex skills, shell scripts, or a manual operator may add execution detail, but they should not redefine the action.

If an adapter conflicts with an action spec, the action spec wins. Update this directory first, then update adapters.

## Contract ownership

Keep one normative definition for each workflow concern. Other surfaces consume that contract instead of
copying its decision table or inventing a second gate.

| Concern | Normative owner | Downstream use |
|---|---|---|
| Impact/necessity, DIRECT/LIGHT/FULL routing, scope viability, implementation scope stop, and planning-time minimum evidence | [`feature-init`](feature-init.md) | `spec-quality-check` verifies the full-lane artifact applied the accepted boundary; `feature-done` compares the actual change with it |
| Bidirectional requirements reconciliation and pre-implementation full-lane quality | [`spec-quality-check`](spec-quality-check.md) | The spec-quality reviewer supplies the assessment method; it does not own routing or implementation scope. A defensive applicability check hands a pending frozen-contract correction to `spec-revise` before review |
| Frozen-contract correction, reopening, and synchronized scope-delta handling | [`spec-revise`](spec-revise.md) | It reuses `feature-init` viability rules only when the accepted boundary changes |
| Actual-diff completion preflight, L1/L2/L3 aggregation, current-truth decision, and delivery receipt | [`feature-done`](feature-done.md) | Reviewers consume the action-owned snapshot and never add a delivery layer |
| Archive eligibility, current-truth merge, and physical lifecycle closure | [`feature-archive`](feature-archive.md) | It consumes the complete `feature-done` receipt and never infers READY from partial or historical fields |
| Durable root/tier/module guidance maintenance | [`agents-md-revise`](agents-md-revise.md) | Feature actions may select or verify a placement, but do not run a convention-maintenance sweep |

The action specs are the executable contract. Reviewer documents own assessment methods, adapters own
host execution mechanics, and templates own only the fields materialized into a target project. `README`,
`quickstart`, `workflow`, and `spec-driven` are explanatory surfaces: they may summarize a rule and link to
its owner, but must not become an alternative normative source.

## Architecture risk routing

Product/application architecture uses the normal feature lifecycle rather than a separate mandatory
review flow:

- At planning, `feature-init` selects the full lane and conditionally loads
  [`architecture-design`](../architecture-design.md) only when the proposed outcome establishes or materially
  changes runtime tiers, responsibility/module boundaries, data/API ownership, durable trust/authorization
  ownership boundaries, deployment components, or another durable cross-feature structure.
- During implementation, the `feature-init` Implementation Scope Stop pauses an undeclared architecture
  delta before more production code, tests, migrations, compatibility paths, or documentation are added.
- At delivery, `feature-done` compares the actual change with the accepted impact boundary and leaves
  convention/spec judgment to L2/L3. It does not add another architecture reflection.

Tiny local work, ordinary same-boundary implementation detail, speculative future concerns, and file/test/
line counts never trigger architecture review by themselves. There is no standalone architecture action,
endpoint observation, reviewer layer, receipt slot, mandatory N/A output, or full-repository architecture sweep.

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

Architecture-shaped full-lane work remains part of `feature-init`. It conditionally reads the shared [`architecture-design` guidance](../architecture-design.md); this reference is not another action, lane, gate, reviewer, or artifact type.
