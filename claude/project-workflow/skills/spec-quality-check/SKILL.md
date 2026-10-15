---
name: spec-quality-check
description: Run the canonical pre-implementation requirements-reconciliation and quality gate for a proposed or accepted feature record. Do not use for a material correction to an accepted contract; use spec-revise first.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. Use the canonical semantic method in the current conversation; an applicable independent reviewer reads its own role contract.

Claude execution details:

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. Read the actual record and relevant optional attachments.
- Perform the canonical readiness and requirements-reconciliation checks. Read the relevant method from
  `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/spec-quality-reviewer.md` for this semantic work.
- Only when the canonical independent-review boundary applies, dispatch a fresh `spec-quality-reviewer`
  with the necessary decision sources and affected record under the shared execution contract.
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
Report the canonical reconciliation and verdict compactly, plus blocking findings, any status transition, and
the next action. Do not add an adapter-specific report schema or narrate every ordinary pass.
