---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their own canonical specs; read a reviewer spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run the canonical completion preflight before expanded L1 or reviewer dispatch; ignore receipt/history
  fields while checking completion, and stop early for unfinished artifacts, a failed required primary-flow
  smoke, an ambiguous mixed-feature worktree, or actual high-impact scope outside the accepted Delivery
  Shape Baseline. A preflight stop still writes the current receipt and marks reviewers
  `not-run(completion preflight)`.
- Close explicit Guidance Placement/Codify commitments mechanically in the same preflight: require the named
  target/enforcement and exact adopted one-line alias. Missing commitments stop before L1; difference-only,
  inheritance, and semantic-placement judgment remains in L2. Never create/move guidance or require files
  from directory shape inside this gate.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly with Bash. Do not expand checks or dispatch reviewers beyond those rules, and do not repair a failure inside this gate.
- Validate the complete owner-supplied review package before dispatch. After snapshot creation, any non-endpoint
  review-input drift stops this invocation as `BLOCKED`; never auto-start a replacement review cycle.
- After required L1 passes, dispatch fresh `agents-md-reviewer` / `spec-reviewer` agents for applicable
  boundaries under the canonical execution contract. Run them in parallel when capacity permits, otherwise
  sequentially; limited simultaneous slots are not fallback. Light lane uses conditional L2 and records L3 as
  N/A. L2 may include only project-root `.claude/rules/`, never user-level `~/.claude/rules/` unless the user
  explicitly selects them. Record `Reviewer execution` as required by the action.
- Reviewers are read-only. This skill may update only receipt/history sections and allowed delivery-status markers; never auto-fix code or commit. On an explicit rerun of an active delivered feature, preserve the prior non-empty receipt before replacement and return the status to accepted when the new verdict is not READY.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to `tasks.md#proof-bundle`; do not inline the full receipt.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
