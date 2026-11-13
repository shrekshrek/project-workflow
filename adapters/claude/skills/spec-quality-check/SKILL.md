---
name: spec-quality-check
description: Run the canonical pre-implementation requirements-reconciliation and quality gate for a proposed or accepted feature record. Do not use for a material correction to an accepted contract; use spec-revise first.
---

# Spec Quality Check

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-quality-check.md` completely before reviewing. Use the canonical semantic method in the current conversation; an applicable independent reviewer reads its own role contract. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

Claude execution details:

- For a revised contract, consult `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md#validation` first.
- For record assessment read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#document-updates-and-context` and `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#record-and-authorization`; Q7a uses `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#conversation-and-discovery`.
- Only for guidance placement read `${CLAUDE_PLUGIN_ROOT}/docs/actions/agents-md-revise.md#guidance-placement-contract`; for material discoveries read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#implementation-scope-stop`.

- Resolve `$ARGUMENTS` using the shared active-feature rules; exclude `archive/`. Read the actual record and relevant optional attachments.
- Perform the canonical readiness and requirements-reconciliation checks. Read the relevant method from
  `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/spec-quality-reviewer.md` for this semantic work.
- Only when the canonical independent-review boundary applies, dispatch a fresh `spec-quality-reviewer`
  with these direct references, necessary decision sources and affected record under the `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/README.md#reviewer-execution-contract`.
- Apply the canonical verdict, status, and implementation-handoff rules; never repair artifact content or commit.
