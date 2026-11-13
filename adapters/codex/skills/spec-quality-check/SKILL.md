---
name: spec-quality-check
description: "Run the Codex-native pre-implementation requirements-reconciliation and quality gate for a proposed or accepted feature record. Do not use for a material correction to an accepted contract; use spec-revise first."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) completely before reviewing. Use the canonical semantic method in the current conversation; an applicable independent subagent reads its own role contract. Apply [runtime conventions](../../../../docs/actions/README.md#shared-runtime-conventions).

- For a revised contract, consult [revision validation](../../../../docs/actions/spec-revise.md#validation) first.
- For record assessment read [maintenance](../../../../docs/actions/feature-init.md#document-updates-and-context) and [preview](../../../../docs/actions/feature-init.md#record-and-authorization); Q7a uses [discovery](../../../../docs/actions/feature-init.md#conversation-and-discovery).
- Only for guidance placement read [guidance placement](../../../../docs/actions/agents-md-revise.md#guidance-placement-contract); for material discoveries read [scope stops](../../../../docs/actions/feature-init.md#implementation-scope-stop).

- Resolve an active feature through shared runtime rules; read the actual record and relevant optional attachments.
- Perform the canonical readiness and requirements-reconciliation checks using the relevant method in
  [`spec-quality-reviewer`](../../../../docs/reviewers/spec-quality-reviewer.md).
- Only when the canonical independent-review boundary applies, dispatch a fresh general subagent to run
  that role with these direct references, necessary decision sources and affected record under the [review execution](../../../../docs/reviewers/README.md#reviewer-execution-contract).
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
