---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../docs/actions/feature-done.md`](../../docs/actions/feature-done.md) completely before acting. Do not read reviewer specs in the main session before dispatch; each fresh subagent reads its linked spec. Main-session reading is fallback-only.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly. Do not expand checks or dispatch reviewers beyond those rules, and do not repair a failure inside this gate.
- After required L1 passes, dispatch fresh general subagents for applicable [`agents-md-reviewer`](../../docs/reviewers/agents-md-reviewer.md) and [`spec-reviewer`](../../docs/reviewers/spec-reviewer.md) boundaries under the canonical execution contract. Full lane requires both: dispatch them in parallel when capacity permits, otherwise sequentially; single-slot capacity is not fallback. Light lane uses conditional L2 and always records L3 as N/A. Record `Reviewer execution` as required by the action.
- Reviewers are read-only. This skill may update only the canonical receipt and allowed READY status marker; never auto-fix code or commit.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical receipt. Return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `$feature-archive`.
