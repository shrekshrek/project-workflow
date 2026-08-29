---
name: spec-revise
description: Revise a materially wrong accepted or delivered-but-unarchived contract, including when the user corrects, rejects, removes, or replaces accepted behavior, while updating affected decisions, acceptance, optional work notes, and any conditional ADR.
---

# Spec Revise

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely before acting; it owns the revision workflow and contract.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules and apply the canonical record/lifecycle routing.
- Read root/applicable nested `AGENTS.md`, recomputing applicability if the affected module population changes.
- When canonical `ADR_REQUIRED` applies, search only relevant ADR metadata/references and instantiate only from
  `${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md`.
- Apply the canonical revision workflow under the current authorization.
- Dispatch a fresh `decision-completeness-auditor` only at its narrowed canonical boundary, with fallback under
  the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.

Report the canonical revision result and applicable `Reviewer execution` without adding an adapter-specific schema.
