---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md) completely before acting. Do not read reviewer specs in the main session before dispatch; each fresh subagent reads its linked spec. Main-session reading is fallback-only.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Run the artifact's explicit Verification checks and standard mechanical commands for changed project scopes.
  Expand to repository-wide/release suites only for canonical spec, convention, or changed-shared-surface
  triggers; never treat every root command as mandatory. Complete all independently executable required L1
  checks before dispatching new reviewers.
- Within the same task, reuse a passing L1 check only while its command, relevant inputs, and changed-scope classification are provably unchanged; uncertainty requires a rerun. After a fix, rerun affected checks and their dependency closure; rerun the full changed-scope population only when invalidated. Run heavyweight commands sharing a workspace or build cache sequentially by default. Label reused checks as `same-task reuse` and retain or reference their original evidence.
- Finish planned implementation and non-receipt spec/plan/tasks edits before the first full reviewer dispatch;
  do not invalidate completed review with later bookkeeping edits.
- If a required L1 check fails or cannot run reliably, do not dispatch new L2/L3 reviewers or repair the failure. Preserve still-valid same-task reviewer results, complete current-truth and receipt work, record new reviewer slots as `not-run(L1 prerequisite)`, and return the failing evidence.
- After required L1 passes, dispatch fresh general subagents for applicable [`agents-md-reviewer`](../../../../docs/reviewers/agents-md-reviewer.md) and [`spec-reviewer`](../../../../docs/reviewers/spec-reviewer.md) boundaries under the canonical execution contract. Full lane requires both: dispatch them in parallel when capacity permits, otherwise sequentially; single-slot capacity is not fallback. Light lane uses conditional L2 and always records L3 as N/A.
- Use focused re-review only in the same task while the original full-population evidence remains available and unaffected inputs are unchanged. Otherwise rerun the full population. Reuse completed same-session results, never reviewer instances, only when the canonical reviewer spec, scope, inputs, and applicable population are provably unchanged; the declared receipt/status write is the only allowed endpoint-output difference. Record `result-reuse` and retain or reference the original execution evidence.
- Reviewers are read-only. This skill may update only the canonical receipt and allowed READY status marker; never auto-fix code or commit.
- Before writing endpoint-owned receipt/status outputs, capture exactly one valid Git identity: exact commit SHA with `dirty=no`, or current worktree with `dirty=yes`; those edits do not change the recorded dirty status. Reject other pairings. Do not persist a manual path list or population hash. For a PASS, persist only applicable reviewer verdict and baseline; never persist applicable IDs or populations.
- Persist `Reviewer execution`, re-read the receipt structurally, and return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
