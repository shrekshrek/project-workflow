---
name: spec-revise
description: "Revise a materially wrong accepted or delivered-but-unarchived full-lane contract in Codex while synchronizing spec, plan, tasks, and any conditional ADR."
---

# Spec Revise (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/spec-revise.md`](../../../../docs/actions/spec-revise.md) completely before acting; it owns the revision workflow and contract.

- Require an accepted spec, or an active unarchived delivered spec whose contract/plan/Verification is materially wrong and must reopen, in the full lane. An implementation regression under an unchanged contract is repaired directly and reruns `$feature-done`; it does not invoke this skill. Read applicable root/nested `AGENTS.md`, recomputing applicability when module scope changes.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; when `ADR_REQUIRED`, search ADR filenames, titles, status fields, and references first, open only candidates relevant to the affected area or decision, then instantiate the bundled `template/docs/adr/0000-template.md`.
- Classify every material scope delta as necessary-detail, contract-correction, separable-outcome,
  speculative-capability, or bundled-risk. Re-run impact/necessity and scope viability when the accepted
  responsibility or contract boundary changes; already-written implementation never justifies absorption.
- While a material delta's direction is unresolved, stop extending code, tests, migrations, and compatibility
  paths. Report one compact Scope stop with the delta, baseline mismatch, current necessity, recommended
  remove/narrow/child/revise direction, and the smallest useful decision set.
- If the revision changes a tier/module boundary or selects Codify, resolve the exact root/tier/module/
  mechanical Guidance Placement and any difference-only `AGENTS.md`/one-line alias work. Do not create
  guidance for ordinary modules or product/temporary semantics.
- Ask only about unresolved revision/ADR ambiguity. Apply changes when the current request authorizes them;
  request additional approval only for a materially different or external write.
- Use inline trace for sourced corrections; only at the narrowed canonical boundary dispatch a fresh subagent for [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md), with fallback under the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.
- When reopening a delivered feature, preserve the prior receipt under a uniquely named dated-or-numbered superseded heading, move the full-lane status from delivered back to accepted, and leave one empty canonical `## Proof Bundle` for the next `$feature-done`.

Report the revision record, ADR decision/file, synchronized sections, `Reviewer execution` for every applicable audit, audit result, current-truth follow-up, and whether to rerun spec-quality-check.
