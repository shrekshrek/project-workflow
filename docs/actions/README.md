# Workflow actions

This directory is the canonical action layer for project-workflow.

Each public action defines its discovery metadata, behavior and runtime references in one file. The build generates its portable skill entry from that source.

## Contract ownership

Keep one normative definition for each workflow concern. Other surfaces consume that contract instead of
copying its decision table or inventing a second gate.

| Concern | Normative owner | Downstream use |
|---|---|---|
| Neutral baseline creation and already-initialized detection | [`project-init`](project-init.md) | It routes to `project-personalize` whenever project evidence or a partial/custom baseline exists |
| Evidence-backed working agreement and its adaptation | [`project-personalize`](project-personalize.md) | Feature actions consume the resulting conventions; later objective drift belongs to `agents-md-revise` |
| Conversation, discovery, record need, authorization, context continuity, implementation scope stop and minimum evidence | [`feature-init`](feature-init.md) | `spec-quality-check` checks the record against accepted decisions; `feature-done` compares the actual change with it |
| Bidirectional requirements reconciliation and semantic implementation readiness | [`spec-quality-check`](spec-quality-check.md) | The spec-quality reviewer supplies the assessment method; pending accepted-contract corrections route to `spec-revise` before review |
| Accepted-contract correction, reopening, and synchronized scope-delta handling | [`spec-revise`](spec-revise.md) | It reuses `feature-init` viability rules only when the accepted boundary changes |
| Actual-diff completion preflight, L1/L2/L3 aggregation, current-truth decision, and delivery receipt | [`feature-done`](feature-done.md) | Reviewers consume the action-owned snapshot and never add a delivery layer |
| Archive eligibility, current-truth merge, and physical lifecycle closure | [`feature-archive`](feature-archive.md) | It consumes the complete `feature-done` receipt and never infers READY from partial or historical fields |
| Cross-spec conflict repair within one area (retrofit) | [`spec-reconcile`](spec-reconcile.md) | It reuses `feature-archive`'s move mechanics and current-truth discipline instead of redefining them |
| Durable root/tier/module guidance maintenance | [`agents-md-revise`](agents-md-revise.md) | Feature actions may select or verify a placement, but do not run a convention-maintenance sweep |

The action specs and Shared runtime conventions below are executable contracts. Reviewer documents own
assessment methods, and templates own the fields materialized into
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

- Only the caller commits changes made by setup, planning, spec checks, revision, reconciliation or archive.
- **Project documentation**: when creating or updating project documents, follow [feature-init's writing and maintenance rules](feature-init.md#document-updates-and-context). Apply them to the documents involved in the task; this does not authorize a documentation-wide cleanup.
- **Reference reading**: read the current action fully; load supporting references only when applicable. For `feature-done` and `project-personalize`, only the reviewer reads its role instructions unless the main session performs the allowed fallback. For a named section, read from its heading through its children, stopping at the next equal/higher heading; fragments do not slice files automatically. Do not recursively load links or pre-read later actions. Reuse unchanged context; fresh reviewers read their selected role and supporting inputs.
- **Feature directory resolution**: a feature lives in `docs/specs/changes/<NNN>-<slug>/`. Resolve an explicit slug/number/path to its matching active directory. For an empty or `current` argument, reuse the feature unambiguously selected in the current conversation; otherwise use the sole active candidate. Ask when the selection is missing or ambiguous. Exclude `archive/`. An action's explicit sweep mode selects a candidate set instead of one feature.
- **NNN numbering**: three digits, one global sequence shared by the active tree and `archive/`; next number = max across both + 1 (zero-padded, `001` when empty). Archived numbers are never reused.
- **Skill resources**: follow the entry’s links to the shared docs, templates and scripts in `project-init/resources/`. Resolve project files against the target repository. If a required bundled file is missing, report an incomplete installation.
- **Project planning gaps**: During onboarding or feature discovery, check known project specs, accepted ADRs and any relevant Blueprint decision when a shared rule is unclear. If multiple features would otherwise guess at the same rule, name the open decision, affected features and what Blueprint could clarify. Recommend bounded planning with `plan-project` and use the user's authorization before starting it. Once decided, reference the owning document and resume the affected work.
- **Declarable surface**: a new persistent state, API, role, workflow, management surface, queue, runtime component, contract, migration, authorization rule, release boundary, or durable responsibility boundary. Internal structure that preserves the accepted behavior — a new class, helper, module split or refactor with no new external or durable consequence — is not a declarable surface and follows ordinary implementation rules. Each action applies its own rule to this population: planning requires a current need and affected actor, owner or consumer; delivery requires prior declaration; revision treats an undeclared surface as a scope delta.
- **Verification escalation**: a matrix, E2E and a repository-wide/release suite are independent escalation options, never a package. Use only the necessary type at its narrowest useful scope, and only when cheaper evidence cannot prove a distinct remaining risk or a project/release requirement selects it. Record presence, size, file count and step count are not escalation reasons.

| Action | Purpose |
|---|---|
| [`project-init`](project-init.md) | Inspect the target and complete neutral setup or hand off to existing-project adaptation |
| [`project-personalize`](project-personalize.md) | Establish or adapt project-workflow from repository evidence |
| [`feature-init`](feature-init.md) | Clarify the change and create, reuse or omit its record |
| [`spec-quality-check`](spec-quality-check.md) | Reconcile accepted requirements and check an actionable record before implementation |
| [`spec-revise`](spec-revise.md) | Correct and synchronize a materially wrong accepted contract |
| [`feature-done`](feature-done.md) | Validate the actual delivery, aggregate applicable review, and write the delivery receipt |
| [`feature-archive`](feature-archive.md) | Close delivered features: merge durable conclusions into current truth, move directories to `docs/specs/changes/archive/` (default sweep mode) |
| [`spec-reconcile`](spec-reconcile.md) | Repair conflicts across accumulated specs in one area (retrofit tool): pick source of truth, mark and archive losing specs |
| [`agents-md-revise`](agents-md-revise.md) | Refresh evidence-backed project conventions and their placement |

Architecture work remains part of `feature-init` and conditionally reads the shared [`architecture-design` guidance](../architecture-design.md).
