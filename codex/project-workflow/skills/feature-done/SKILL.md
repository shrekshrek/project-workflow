---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../docs/actions/feature-done.md`](../../docs/actions/feature-done.md) completely before acting. Do not read reviewer specs in the main session before dispatch; each fresh subagent reads its linked spec. Main-session reading is fallback-only.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run project checks and capture evidence even when another independently executable layer fails.
- Dispatch fresh general subagents for applicable [`agents-md-reviewer`](../../docs/reviewers/agents-md-reviewer.md) and [`spec-reviewer`](../../docs/reviewers/spec-reviewer.md) boundaries under the canonical execution contract. Full lane requires both: dispatch them in parallel when capacity permits, otherwise sequentially; single-slot capacity is not fallback. Light lane uses conditional L2 and always records L3 as N/A.
- Use focused re-review only in the same task while the original full-population evidence remains available and unaffected inputs are unchanged. Otherwise rerun the full population. Reuse completed same-session results, never reviewer instances, only when the canonical reviewer spec, scope, inputs, and applicable population are provably unchanged; the declared receipt/status write is the only allowed endpoint-output difference. Record `result-reuse` and retain or reference the original execution evidence.
- Reviewers are read-only. This skill may update only the canonical receipt and allowed READY status marker; never auto-fix code or commit.
- Before writing endpoint-owned receipt/status outputs, capture exactly one valid Git identity: exact commit SHA with `dirty=no`, or current worktree with `dirty=yes`; those edits do not change the recorded dirty status. Reject other pairings. Do not persist a manual path list or population hash. For a PASS, persist only applicable reviewer verdict and baseline; never persist applicable IDs or populations.
- Persist `Reviewer execution`, re-read the receipt structurally, and return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
