---
name: spec-revise
description: "Revise a materially wrong accepted or delivered-but-unarchived full-lane contract in Codex, including when the user corrects, rejects, removes, or replaces accepted behavior, while synchronizing spec, plan, tasks, and any conditional ADR."
---

# Spec Revise (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/spec-revise.md`](../../../../docs/actions/spec-revise.md) completely before acting; it owns the revision workflow and contract.

- Require an accepted spec, or an active unarchived delivered spec whose contract/plan/Verification is materially wrong and must reopen, in the full lane. An implementation regression under an unchanged contract is repaired directly and reruns `$feature-done`; it does not invoke this skill. Read applicable root/nested `AGENTS.md`, recomputing applicability when module scope changes.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; when
  canonical `ADR_REQUIRED` applies, search only relevant ADR metadata/references and instantiate the bundled
  `template/docs/adr/0000-template.md`.
- Apply the canonical revision workflow under the current authorization.
- At the narrowed canonical boundary, dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md), with fallback
  under the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.

Report the canonical revision result and applicable `Reviewer execution` without adding an adapter-specific schema.
