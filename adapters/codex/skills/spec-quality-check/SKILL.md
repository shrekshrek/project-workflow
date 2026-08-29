---
name: spec-quality-check
description: "Run the Codex-native pre-implementation requirements-reconciliation and quality gate for a proposed or accepted feature record. Do not use for a material correction to an accepted contract; use spec-revise first."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../../../docs/actions/spec-quality-check.md`](../../../../docs/actions/spec-quality-check.md) completely before reviewing. Use the canonical semantic method in the current conversation; an applicable independent subagent reads its own role contract.

- Resolve an active feature through shared runtime rules; read the actual record and relevant optional attachments.
- Perform the canonical readiness and requirements-reconciliation checks using the relevant method in
  [`spec-quality-reviewer`](../../../../docs/reviewers/spec-quality-reviewer.md).
- Only when the canonical independent-review boundary applies, dispatch a fresh general subagent to run
  that role with the necessary decision sources and affected record under the shared execution contract.
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
