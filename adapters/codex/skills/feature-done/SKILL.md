---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md), [`../../../../docs/reviewers/agents-md-reviewer.md`](../../../../docs/reviewers/agents-md-reviewer.md), and [`../../../../docs/reviewers/spec-reviewer.md`](../../../../docs/reviewers/spec-reviewer.md) completely before acting.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run project checks and capture evidence even when another independently executable layer fails.
- At each applicable L2/L3 boundary, when Codex dispatch is available and capacity is not reported exhausted, you MUST spawn a general subagent with the canonical reviewer spec and exact scope. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Reuse same-session results only when scope and inputs are provably unchanged; state reuse explicitly.
- Reviewers are read-only. This skill may update only the canonical receipt and allowed READY status marker; never auto-fix code or commit.
- Persist `Review execution` evidence for L2/L3, including reviewer, mode, completion status, and fallback reason or `none`.
- Re-read the receipt structurally and include the exact on-disk `## Proof Bundle` block verbatim.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
