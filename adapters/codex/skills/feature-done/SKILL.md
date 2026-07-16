---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md) completely before acting. Do not read reviewer specs in the main session before dispatch; each fresh subagent reads its linked spec. Main-session reading is fallback-only.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run project checks and capture evidence even when another independently executable layer fails.
- Dispatch fresh general subagents for [`agents-md-reviewer`](../../../../docs/reviewers/agents-md-reviewer.md) and [`spec-reviewer`](../../../../docs/reviewers/spec-reviewer.md) under the canonical execution contract.
- Reuse completed same-session results, never reviewer instances, only when the canonical reviewer spec, scope, inputs, applicable population, and relevant endpoint outputs are provably unchanged; record `result-reuse` and retain or reference the original execution evidence.
- Reviewers are read-only. This skill may update only the canonical receipt and allowed READY status marker; never auto-fix code or commit.
- For a full-lane PASS, persist only reviewer verdict and baseline; never persist applicable IDs or populations.
- Persist `Reviewer execution`, re-read the receipt structurally, and return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
