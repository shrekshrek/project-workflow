---
name: feature-done
description: "Run the Codex-native end-of-feature gate and write the canonical delivery receipt."
---

# Feature Done (Codex)

Match the user's language. Read [`../../../../docs/actions/feature-done.md`](../../../../docs/actions/feature-done.md) completely before acting. Each fresh subagent reads its linked reviewer spec; the main session reads one only when executing the allowed fallback.

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Execute the complete canonical action against its selected Git population. A stop still writes the canonical
  receipt.
- Resolve the canonical convention population and use general subagents for the linked
  [`spec-reviewer`](../../../../docs/reviewers/spec-reviewer.md) and
  [`agents-md-reviewer`](../../../../docs/reviewers/agents-md-reviewer.md) contracts when available.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical `## Proof Bundle` receipt. For a non-READY verdict, map each blocker or blocker group to the canonical `Next` route before returning control under the action's continuation rules. Return the action's concise human summary with `Lifecycle: READY; archive pending` when applicable and a repository-relative link to `tasks.md#proof-bundle`; the full receipt remains on disk.

Apply the canonical verdict contract. Finish/delivery stops at `READY` with archive pending; enclosing
close/archive/submit intent continues to `$feature-archive` for the explicit feature.
