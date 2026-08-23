---
name: spec-revise
description: Revise a materially wrong accepted or delivered-but-unarchived full-lane contract, including when the user corrects, rejects, removes, or replaces accepted behavior, while synchronizing spec, plan, tasks, and any conditional ADR.
---

# Spec Revise

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely before acting; it owns the revision workflow and contract.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules. This action requires an accepted spec or an active unarchived delivered spec whose contract/plan/Verification is materially wrong and must reopen; an implementation regression under an unchanged contract is repaired directly and reruns `feature-done`. Light lane stops for an explicit upgrade decision.
- Treat a latest-user correction to accepted behavior as the canonical `contract-correction`; never validate the
  stale artifact first.
- Read root/applicable nested `AGENTS.md`, recomputing applicability if the affected module population changes.
- When canonical `ADR_REQUIRED` applies, search only relevant ADR metadata/references and instantiate only from
  `${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md`.
- Use the canonical scope-delta, decision-closure, proportional recheck, Guidance Placement, and reopen rules.
  Apply the authorized revision unless a canonical material decision or a
  materially different/external write still needs the user.
- Dispatch a fresh `decision-completeness-auditor` only at its narrowed canonical boundary, with fallback under
  the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.

Report the canonical revision result and applicable `Reviewer execution` without adding an adapter-specific schema.
