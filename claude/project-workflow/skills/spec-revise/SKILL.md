---
name: spec-revise
description: Revise a materially wrong accepted or delivered-but-unarchived contract, including when the user corrects, rejects, removes, or replaces accepted behavior, while updating affected decisions, acceptance, optional work notes, and any conditional ADR.
---

# Spec Revise

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely before acting. Apply `${CLAUDE_PLUGIN_ROOT}/docs/actions/README.md#shared-runtime-conventions`.

Claude execution details:

- For material decision closure read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#conversation-and-discovery`; for reopening read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md#completion-preflight`; for convention placement read `${CLAUDE_PLUGIN_ROOT}/docs/actions/agents-md-revise.md#guidance-placement-contract`.

- Resolve `$ARGUMENTS` through the shared active-feature rules and apply the canonical record/lifecycle routing.
- Read root/applicable nested `AGENTS.md`, recomputing applicability if the affected module population changes.
- When canonical `ADR_REQUIRED` applies, search only relevant ADR metadata/references and instantiate only from
  `${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md`.
- Apply the authorized revision using `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#record-and-authorization` and `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md#document-updates-and-context`.
- Dispatch a fresh `decision-completeness-auditor` (`${CLAUDE_PLUGIN_ROOT}/docs/reviewers/decision-completeness-auditor.md#dispatch-boundary`) only at its narrowed canonical boundary, with fallback under
  the `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/README.md#reviewer-execution-contract`. Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.
