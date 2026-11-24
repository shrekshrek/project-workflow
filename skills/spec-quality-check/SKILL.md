---
name: spec-quality-check
description: "Run the pre-implementation requirements-reconciliation and quality gate for a proposed or accepted feature record. Do not use for a material correction to an accepted contract; use spec-revise first."
metadata:
  version: "4.0.1"
---

# Spec Quality Check

Match the user's language. Read [`resources/docs/actions/spec-quality-check.md`](resources/docs/actions/spec-quality-check.md) completely before reviewing. Use the canonical semantic method in the current conversation; an applicable independent subagent reads its own role contract. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

- For a revised contract, consult [revision validation](resources/docs/actions/spec-revise.md#validation) first.
- For record assessment read [maintenance](resources/docs/actions/feature-init.md#document-updates-and-context) and [preview](resources/docs/actions/feature-init.md#record-and-authorization); Q7a uses [discovery](resources/docs/actions/feature-init.md#conversation-and-discovery).
- Only for guidance placement read [guidance placement](resources/docs/actions/agents-md-revise.md#guidance-placement-contract); for material discoveries read [scope stops](resources/docs/actions/feature-init.md#implementation-scope-stop).

- Resolve an active feature through shared runtime rules; read the actual record and relevant optional attachments.
- Perform the canonical readiness and requirements-reconciliation checks using the relevant method in
  [`spec-quality-reviewer`](resources/docs/reviewers/spec-quality-reviewer.md).
- Only when the canonical independent-review boundary applies, dispatch a fresh general subagent to run
  that role with these direct references, necessary decision sources and affected record under the [review execution](resources/docs/reviewers/README.md#reviewer-execution-contract).
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
