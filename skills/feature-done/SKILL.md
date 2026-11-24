---
name: feature-done
description: "Run the end-of-feature gate and write the canonical delivery receipt."
metadata:
  version: "4.0.1"
---

# Feature Done

Match the user's language. Read [`resources/docs/actions/feature-done.md`](resources/docs/actions/feature-done.md) completely before acting. Each fresh subagent reads its linked reviewer spec; the main session reads one only when executing the allowed fallback. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

- Before scope routing or post-gate continuation, read [scope stops](resources/docs/actions/feature-init.md#implementation-scope-stop); for long-run checks also read [execution envelope](resources/docs/actions/feature-init.md#record-and-authorization).

- Resolve the active feature through shared runtime rules and exclude `archive/`.
- Execute the complete canonical action against its selected Git population. A stop still writes the canonical
  receipt. For preflight, read [record maintenance](resources/docs/actions/feature-init.md#document-updates-and-context).
- Resolve the canonical convention population and use general subagents for the linked
  [`spec-reviewer`](resources/docs/reviewers/spec-reviewer.md) and
  [`agents-md-reviewer`](resources/docs/reviewers/agents-md-reviewer.md) contracts when required by the canonical applicability rules and [review execution](resources/docs/reviewers/README.md#reviewer-execution-contract).
- Include applicable project-root Claude rules when running in Claude Code; include user-level rules only when selected.
- Persist and structurally re-read the canonical `## Proof Bundle` receipt.

Apply the canonical verdict and closure-authorization rules; check [closure authorization](resources/docs/actions/feature-archive.md#closure-authorization) and, when authorized, continue to
`feature-archive` for the explicit feature. Otherwise leave archive pending.
