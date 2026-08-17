---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md) completely before acting. Do not read reviewer specs in the main session before dispatch; each fresh subagent reads its linked spec. Main-session reading is fallback-only.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run the canonical completion preflight before expanded L1 or reviewer dispatch; ignore receipt/history
  fields while checking completion, and stop early for unfinished artifacts, a failed required primary-flow
  smoke, an ambiguous mixed-feature worktree, or actual high-impact scope outside the accepted Delivery
  Shape Baseline. A preflight stop still writes the current receipt and marks reviewers
  `not-run(completion preflight)`.
- Close explicit Guidance Placement/Codify commitments mechanically in the same preflight: require the named
  target/enforcement and exact adopted one-line alias. Missing commitments stop before L1; difference-only,
  inheritance, and semantic-placement judgment remains in L2. Never create/move guidance or require files
  from directory shape inside this gate.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly. Do not expand checks or dispatch reviewers beyond those rules, and do not repair a failure inside this gate.
- Validate the complete owner-supplied review package before dispatch. After snapshot creation, any non-endpoint
  review-input drift stops this invocation as `BLOCKED`; never auto-start a replacement review cycle.
- After required L1 passes, dispatch fresh general subagents for applicable
  [`agents-md-reviewer`](../../../../docs/reviewers/agents-md-reviewer.md) and
  [`spec-reviewer`](../../../../docs/reviewers/spec-reviewer.md) boundaries under the canonical execution contract.
  Run them in parallel when capacity permits, otherwise sequentially; limited simultaneous slots are
  not fallback. Light lane uses conditional L2 and records L3 as N/A. Record `Reviewer execution` as required
  by the action.
- Reviewers are read-only. This skill may update only receipt/history sections and allowed delivery-status markers; never auto-fix code or commit. On an explicit rerun of an active delivered feature, preserve the prior non-empty receipt before replacement and return the status to accepted when the new verdict is not READY.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to `tasks.md#proof-bundle`; do not inline the full receipt.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
