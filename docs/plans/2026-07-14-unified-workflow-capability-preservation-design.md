# Unified workflow capability-preservation design

> Date: 2026-07-14
> Status: implemented and locally validated, including generated-package validation and isolated Claude/Codex installs; not committed or released

## Goal

Keep one project-workflow for both personal and team use. The unit of execution is one developer completing one bounded change. A team may use the same workflow independently per change; project-workflow does not require a separate collaboration layer, concurrency coordinator, branch policy, PR policy, or ownership system.

Default usage must stay light without deleting on-demand analysis, research, review, traceability, or safety capabilities.

## Design rule

Distinguish three ideas that were previously conflated:

1. **Available capability**: the plugin can perform the work when the situation needs it.
2. **Default step**: the action runs on the normal path.
3. **Generated baseline**: files copied into a target project.

An optional capability may remain installed without becoming a default step or a generated project file. Repository line count and agent count are not optimization targets.

## Chosen approach

Use the pre-contraction repository as the baseline and apply a narrow, capability-preserving patch.

Rejected alternatives:

- Continue repairing the heavily contracted version: too easy to miss capabilities removed together with their tests.
- Restore everything unchanged: retains known overdesign such as feature-number reservation, commit-based freeze, numeric review metrics, and default speculative project files.

## Universal workflow

The core remains identical for personal and team development:

1. Initialize or personalize project guidance.
2. Choose no artifact, light lane, or full lane.
3. Define and accept the change contract when full lane applies.
4. Implement within scope.
5. Run L1 mechanical checks, L2 convention review, and L3 spec review when applicable.
6. Update current truth and archive delivered feature artifacts.

Git branches, pull requests, issue assignment, approvals, CODEOWNERS, and release governance are project choices outside the required workflow.

## Capability matrix

| Capability | Default behavior | Retention decision |
|---|---|---|
| Nine lifecycle actions | Available through both adapters | Keep all |
| No-artifact / light / full routing | Choose the smallest useful path | Keep |
| Feature numbering | Serial next-number calculation; conflict means rerun | Remove reservation/lock/retry machinery |
| Spec freeze | Freeze when implementation begins | Remove Git-commit prerequisite |
| Project baseline | Copy six neutral files only | Keep optional rules/hooks/tier examples in plugin library, not target baseline |
| High-impact path guardrail | Honor an existing project declaration or explicit opt-in | Keep optional; do not add an empty baseline section or default personalization question |
| Codebase exploration | Use for nontrivial retrofit or unclear structure | Keep `codebase-explorer`; do not dispatch for obvious repositories |
| Technical research | Use only for an unresolved current technical choice | Keep `tech-researcher` on demand |
| Decision trace audit | Inline trace for simple synchronization; independent audit for complex generated multi-file decisions | Keep `decision-completeness-auditor` conditionally |
| Spec quality | Mechanical checks plus independent subjective review for full lane | Keep `spec-quality-reviewer` |
| Delivery review | L1 plus independent L2/L3 | Keep `agents-md-reviewer` and `spec-reviewer` |
| Reviewer evidence | Enumerate supplied population, applicable rules/items, ambiguity, and incomplete verification | Keep; remove numeric coverage/confidence requirements |
| Tool-private scoped rules | Claude projects may use them as optional local assets | Keep examples; remove Codex bridge and do not call them portable core |
| Hooks | Optional project-owned automation | Keep examples; do not generate by default |
| Reviewer model | Host chooses the model | Remove hardcoded model fields |
| Apply approval | One consolidated preview/apply gate when modifying existing conventions/specs; deterministic no-clobber project-init needs no duplicate approval | Ask only for real ambiguity or high-impact decisions |
| File safety | No-clobber, rollback, normalize existing target-root aliases, reject internal destination symlinks and absent targets below symlinked ancestors | Keep and test |
| Physical archive | Merge current truth, ordinary directory move, relocate links, move back on relocation failure | Support tracked and untracked artifacts without a transaction layer |

## Reviewer requirements

Removing percentages must not weaken the review method. L2/L3/spec-quality reviewers retain:

- fresh reads of complete supplied inputs;
- explicit changed-file and applicable rule/spec-item populations;
- full verification when practical and an `UNRELIABLE` result when required scope is missing;
- distributed-item matrices when they make a failure understandable;
- ambiguity reporting with blocking/advisory classification;
- cited findings;
- L3 categories for missing behavior, deviation, scope creep, and verification gaps;
- compact zero-finding evidence.

They do not calculate coverage percentages or confidence scores.

## Skill and agent structure

- Keep nine Claude skills and nine Codex skills.
- Keep six Claude named agents as available capabilities.
- Remove fixed model selection from every agent.
- Keep canonical methodology in `docs/actions/` and `docs/reviewers/`.
- Adapters may be concise, but must preserve host-specific execution details that are not present in canonical docs.
- Optional detailed assets remain discoverable and are read only when needed.

Plugin-root lookup is adapter-owned: Claude uses its injected plugin root; Codex resolves the package containing the active skill. Canonical actions do not prescribe cross-host cache scanning.

## Adapter boundary

Canonical action and reviewer documents own every portable decision: classification, workflow order, evidence requirements, approval gates, verdicts, outputs, and failure semantics.

Runtime skills keep only host execution details:

- argument and target resolution;
- installed-plugin root and packaged-script invocation;
- host-native question/approval cadence;
- named-agent or general-subagent dispatch and main-session fallback;
- host-private convention files;
- concise reporting syntax that the host needs.

Adapters may restate a one-line safety invariant where execution would otherwise be dangerous, but must not maintain a second receipt schema, verdict table, lane policy, or lifecycle SOP. When rich behavior exists only in one adapter, move the portable part into the canonical action before trimming the adapter. Thinness is judged by responsibility, not a line-count target.

## Validation strategy

1. Start from the original test suite instead of replacing it wholesale.
2. Change an old expectation only when this design explicitly changes the contract.
3. Add capability-preservation checks for all six agents, optional asset presence, reviewer evidence categories, six-file baseline output, serial numbering, symlink safety, and executable host-self-contained packaged hooks.
4. Run adapter parity, workflow contracts, feature-init fixtures, reviewer fixtures, template contracts, lifecycle links, Markdown links, skill validation, JavaScript syntax checks, and `git diff --check`.
5. Treat deterministic fixtures as non-model tests. Actual model endpoint smoke remains a separate release check.

## Non-goals

- No team mode or team overlay.
- No concurrent `feature-init` coordination.
- No mandatory hooks or scoped rules.
- No requirement to run every optional agent for every action.
- No optimization target based on repository lines, skill lines, or agent count.
- No commit, release, or replacement of the user's active plugin installation in this change; isolated test installs are validation only.
