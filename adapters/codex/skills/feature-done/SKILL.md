---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md) completely before acting. Do not read reviewer specs in the main session before dispatch; each fresh subagent reads its linked spec. Main-session reading is fallback-only.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run the canonical completion preflight before expanded L1/review, including semantic implementation readiness,
  unfinished work, completed tasks and declared checks, any useful early actor-to-result journey,
  Git/scope boundaries, and explicit Guidance Placement
  commitments. A stop still writes the canonical receipt.
  The preflight evaluates only phases, proof obligations, and guidance already declared by the accepted
  artifact and project conventions. Keep checklist work to implementation/review/check outcomes that finish
  before this endpoint; record READY, receipt/status writes, and archive eligibility as endpoint/lifecycle outputs.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly. Do not expand checks
  or dispatch reviewers beyond those rules. Review one stable final snapshot and end on its terminal verdict.
  After an in-scope fix, only a later explicit user request runs a fresh reviewer snapshot; reuse only still-valid
  L1 evidence.
- Validate the owner-supplied review package before dispatch; later non-endpoint input drift stops the cycle.
- After required L1 passes, dispatch fresh general subagents for applicable
  [`agents-md-reviewer`](../../../../docs/reviewers/agents-md-reviewer.md) and
  [`spec-reviewer`](../../../../docs/reviewers/spec-reviewer.md) boundaries under the canonical execution contract.
  Use available scheduling without changing the review contract. Light lane uses conditional L2 and records
  L3 as N/A.
- Reviewers are read-only. After this endpoint returns, the enclosing implementation may apply an unambiguous
  in-scope fix, but it must not re-enter this skill automatically. Reviewer agents never edit code or commit;
  material product or scope decisions return to the user.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. For a non-READY verdict, map each blocker or blocker group to the canonical `Next` route without starting repair or another gate run. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to `tasks.md#proof-bundle`; do not inline the full receipt.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
