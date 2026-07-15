---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md), [`../../../../docs/reviewers/agents-md-reviewer.md`](../../../../docs/reviewers/agents-md-reviewer.md), and [`../../../../docs/reviewers/spec-reviewer.md`](../../../../docs/reviewers/spec-reviewer.md) completely before acting.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run project checks and capture evidence even when another independently executable layer fails.
- Run L2/L3 in general subagents when available with their canonical reviewer specs and exact scope; main-session fallback follows the same contracts.
- Reuse same-session results only when scope and inputs are provably unchanged; state reuse explicitly.
- Reviewers are read-only. This skill may update only the canonical receipt and allowed READY status marker; never auto-fix code or commit.
- Re-read the receipt structurally and include the exact on-disk `## Proof Bundle` block verbatim.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
