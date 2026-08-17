# project-personalize

Canonical action for adapting a target whose project evidence must shape the working agreement, including a generated or copied scaffold, an existing codebase, or project-specific documentation. The target may have a complete, partial, unrelated, or missing project-workflow baseline.

## Use When

- The target contains project evidence that should shape the working agreement: for example, a generated or copied scaffold, existing codebase, project configuration, or project-specific documentation that establishes commands, source/test paths, conventions, architecture, product truth, or current truth.
- Any of the six neutral baseline destinations is partial, custom, or otherwise occupied and requires preservation or reconciliation.
- `AGENTS.md` may be complete, partial, unrelated to project-workflow, or absent.
- Default names, commands, ports, database names, tier paths, or rule path patterns still reflect the scaffold.
- An existing codebase needs its project conventions aligned with actual structure.

Use [`project-init`](project-init.md) when all six baseline destinations are absent and the target is empty or contains only incidental material that does not establish project facts. When the exact neutral baseline plus only incidental material exists, report N/A because there is no project evidence to personalize; keep deferred values and recommend a scaffold, direct work, or an architecture-shaped full-lane change as applicable. A target with project evidence but no `AGENTS.md` remains a `project-personalize` case. If shallow inspection cannot distinguish incidental material from project evidence, ask one focused routing question instead of guessing.

## Inputs

- Target directory.
- User-selected scope: replace scaffold defaults, add missing tier-level guidance, infer project structure, or all of these.
- Actual project names, database/container names, commands, tier paths, and known conventions.

## Outputs

- Created or updated root `AGENTS.md`, preserving useful existing guidance.
- A minimum evidence-backed working agreement: real build/test/lint commands with their observed scope or trigger when known, observed source/test paths, project-specific rules or boundaries that an agent cannot safely infer, and durable tier ownership when the repository actually has tiers. Record only test layers, matrices, coverage gates, and release suites that the repository already uses or the user explicitly selects; unknown items remain deferred.
- Updated host-specific convention files when they already exist or the user explicitly chooses them; for example, Claude may use `.claude/rules/`.
- Existing hook adapter preserved unless the user approves a repair; a new hook adapter is generated only for an `active + verified` command, otherwise report `not installed + reason`.
- Added or repaired tier-level `AGENTS.md` and one-line `CLAUDE.md` aliases when relevant.
- A guidance-placement report when repository evidence shows root rules that are actually path-local, a
  durable tier/module exception without local guidance, duplicated parent/child guidance, a missing or
  malformed one-line `CLAUDE.md` alias, or guidance whose directory no longer exists. Report `none` only
  when this scope was selected and no candidate exists; do not create empty nested guidance.
- Removed stale scaffold placeholders/defaults.
- Compact summary of values changed, deferred items, and exceptions requiring human review. Do not restate unchanged evidence or expand an ordinary successful role execution beyond its required one-line evidence.

## Evidence-led Decision Conversation

Keep the target unchanged while material decisions remain. Present only applicable findings as **Observed**
(repository evidence), **Proposed** (the smallest evidence-backed adjustment), and **Unresolved** (a decision
whose answer changes the working agreement). Ask one material question per turn, prefer a bounded choice, and
after each answer update the in-memory/staged draft plus its source trace without restating settled evidence.
When no material gap remains, proceed to the existing single consolidated preview and apply approval.

Do not ask about facts the repository already proves, values that may safely remain deferred, or architecture/
product decisions owned by `feature-init`. This conversation creates no additional feature, spec, lane, gate,
reviewer, status, or approval cycle.

## Workflow

1. Resolve the target and inspect its complete population including dotfiles, excluding version-control metadata from content classification. Classify the six baseline destinations and inspect other content only far enough to identify project evidence. All destinations absent plus only incidental material uses `project-init`; all six matching plus only incidental material is N/A; project evidence or any partial/custom/occupied baseline destination continues here. Ask one focused routing question only when the distinction is genuinely ambiguous.
2. Inspect root/nested `AGENTS.md`, aliases, manifests, shallow structure, commands, source/test paths, project-specific boundaries, existing test/CI configuration, and existing host-private assets. Preserve useful custom guidance.
3. Start the Evidence-led Decision Conversation with only applicable scopes: create/complete the minimum working agreement, replace demonstrably stale scaffold values, repair real tier guidance, survey structure, or explicitly selected host-private rules/hooks.
4. For a missing baseline, stage the neutral six-file template with `scripts/materialize-project-baseline.cjs`; do not write the target yet.
5. Use the codebase-explorer methodology only for a nontrivial or unclear structure survey. When observed project content shows multiple durable runtime tiers and the user selects tier-level guidance, read the conditional [`_multi_tier_examples`](../../template/_multi_tier_examples/README.md) reference before drafting it. When a material stack, library, or tool choice remains unresolved and current external evidence would change the result, run the tech-researcher methodology, present 2-3 suitable candidates and one recommendation, and let the user make the final choice. Derive commands, their actual scope/trigger, source/test paths, project-specific rules, and tier ownership from repository evidence. A command being available does not make it mandatory for every feature.
   When structure/guidance scope is selected, perform a bounded guidance-placement survey. A nested
   `AGENTS.md` candidate must be a durable rule for a clear existing or intentionally planned subtree,
   differ materially from its parent, be costly or unsafe to infer repeatedly, and be neither temporary
   feature/product behavior nor better enforced mechanically. Keep cross-project and cross-Provider rules
   at the root. Prefer one tier file over many module files when siblings share the rule; create a module
   file only for a real exception. A selected nested `CLAUDE.md` contains exactly `@AGENTS.md` plus a newline.
   Findings propose narrow moves/creation/deletion; they do not establish that the architecture itself is good.
6. Validate selected host-private rules and hooks only when they already exist or the user chose them. Never copy optional assets by default.
7. Run an inline trace for repository- or user-sourced synchronization and the decision-completeness auditor only for unconfirmed high-impact choices, ADRs, or conflicting/weak evidence.
8. Preflight unchanged baselines and staged destinations, show one consolidated diff/new-file list, and apply once after approval. Normalize an existing target-root symlink to its real directory, but reject symlinked destination components and an absent target below a symlinked ancestor. Conflicts, rejection, or a blocking audit leave the target unchanged.
9. Validate placeholders, commands, source/test paths, project-specific rules/boundaries, real tier ownership, aliases, selected rule scopes, hook status, and `AGENTS.md` concision.

## Reviewer Execution

Every applicable explorer, researcher, or auditor boundary follows the canonical [reviewer execution contract](../reviewers/README.md#reviewer-execution-contract). Report `Reviewer execution` with role, mode, status, and observed reason; missing required evidence is blocking and leaves the target unchanged.

## Invariants

- Replace only scaffold/default values that are demonstrably stale or selected by the user.
- Missing baseline sections are added in place; existing custom headings or guidance are not grounds for redirecting to `project-init`.
- When `AGENTS.md` is absent in a target with project evidence, render the minimum baseline from objective repository evidence and user answers, with a preview before writing.
- Missing-baseline bootstrap keeps all reusable templates in the plugin and renders `AGENTS.md` indexes from files that will actually exist; absent hooks/templates are not advertised as project-local assets.
- Activate a new edit-time lint hook only for a user-confirmed, safe, sub-five-second per-file command; otherwise do not add hook files/config. Existing project hooks are reported as active/verified, existing/unverified, or user-approved for repair.
- Do not invent product semantics from directory names.
- Align observed structure and conventions with repository evidence, explicit user decisions, and accepted specs/ADRs when present. Do not claim that an architecture is suitable without goals and quality constraints, and do not redesign it inside this action; route a material architecture change to the ordinary full lane in [`feature-init`](feature-init.md).
- Architecture-design conversational fill is out of scope. Report the relevant repository and accepted-decision evidence for a material architecture change so `feature-init` can consume it; do not load the architecture guide or make foundation decisions here.
- `AGENTS.md` remains concise; put tier-specific guidance in tier files.
- Nested guidance follows the difference-only rule: never repeat inherited parent text, never create a file
  solely because a directory is named module/tier, and never move a root rule whose consumers cross the
  proposed subtree.
- Do not leave an existing scaffold's commands and source/test paths deferred when objective repository evidence resolves them. Do not invent style, Git, coverage, deployment, or tier policies that the repository and user do not establish.
- Do not introduce a missing test layer, matrix, coverage gate, or release suite for completeness. Preserve an existing matrix only with its observed command and purpose; add a new one only after the user explicitly selects it for concrete interacting risks or a release/compliance contract.
- When the selected host uses path-scoped convention files, their path patterns must match existing or intentionally planned paths. Do not translate one host's private files into another host's runtime format unless the user explicitly requests a migration.
- Historical feature specs are not rewritten.
- Successful completion means the evidence-backed working agreement is aligned with the currently observable project. The target is ready for direct work or [`feature-init`](feature-init.md); this is not an architecture-quality verdict.
- Compose every proposed patch in memory or a disposable staging directory, then run trace/audit and show one consolidated diff before applying it. Rejection or a blocking audit leaves the target unchanged. Missing-baseline apply uses strict no-clobber preflight: any approval-time conflict or symlinked destination beneath the resolved project root rejects the whole staged population before copying anything.

## Validation

- Search for unresolved placeholders and old scaffold names.
- Check path-scoped rule frontmatter / path matching against the actual directory layout.
- Verify a newly activated hook against a matching file; otherwise report `hook: not installed` and its reason without claiming runtime enforcement.
- Confirm testing guidance distinguishes available commands from per-change requirements and does not manufacture layer or matrix symmetry.
- Confirm no example-only assets became active project files.
