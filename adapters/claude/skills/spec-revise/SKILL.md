---
name: spec-revise
description: Revise a materially wrong accepted or delivered-but-unarchived full-lane contract while synchronizing spec, plan, tasks, and any conditional ADR.
---

# Spec Revise

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely before acting; it owns the revision workflow and contract.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules. This action requires an accepted spec or an active unarchived delivered spec whose contract/plan/Verification is materially wrong and must reopen; an implementation regression under an unchanged contract is repaired directly and reruns `feature-done`. Light lane stops for an explicit upgrade decision.
- Read root/applicable nested `AGENTS.md`, recomputing applicability if the affected module population changes.
- If `ADR_REQUIRED`, search ADR filenames, titles, status fields, and references first; open only candidates relevant to the affected area or decision, then instantiate only from `${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md`.
- Classify every material scope delta as necessary-detail, contract-correction, separable-outcome,
  speculative-capability, or bundled-risk. Re-run impact/necessity and scope viability when the accepted
  Delivery Shape Baseline changes; already-written implementation never justifies automatic absorption.
- While a material delta's direction is unresolved, stop extending code, tests, migrations, and compatibility
  paths. Report one compact Scope stop with the delta, baseline mismatch, current necessity, recommended
  remove/narrow/child/revise direction, and at most one decision question.
- If the revision changes a tier/module boundary or selects Codify, resolve the exact root/tier/module/
  mechanical Guidance Placement and any difference-only `AGENTS.md`/one-line alias work. Do not create
  guidance for ordinary modules or product/temporary semantics.
- Ask only about unresolved revision/ADR ambiguity, then use one consolidated apply approval. Draft proposed diff contents in memory/staging so the worktree remains unchanged before approval.
- Use inline trace for sourced corrections; dispatch a fresh `decision-completeness-auditor` only at its narrowed canonical boundary, with fallback under the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the approved consolidated diff once. Do not restore with checkout, rewrite unrelated history, or commit.
- When reopening a delivered feature, preserve the prior receipt under a uniquely named dated-or-numbered superseded heading, move the full-lane status from delivered back to accepted, and leave one empty canonical `## Proof Bundle` for the next `feature-done`.

Report the revision record, ADR decision/file, synchronized sections, `Reviewer execution` for every applicable audit, trace/audit result, current-truth follow-up, and whether to rerun spec-quality-check.
