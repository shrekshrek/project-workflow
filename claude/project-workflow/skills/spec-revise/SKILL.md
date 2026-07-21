---
name: spec-revise
description: Revise a materially wrong accepted full-lane contract during implementation while synchronizing spec, plan, tasks, and any conditional ADR.
---

# Spec Revise

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely before acting; it owns the revision workflow and contract.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules. This action requires an accepted spec; light lane stops for an explicit upgrade decision.
- Read root/applicable nested `AGENTS.md`, recomputing applicability if the affected module population changes.
- If `ADR_REQUIRED`, search ADR filenames, titles, status fields, and references first; open only candidates relevant to the affected area or decision, then instantiate only from `${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md`.
- Ask only about unresolved revision/ADR ambiguity, then use one consolidated apply approval. Draft proposed diff contents in memory/staging so the worktree remains unchanged before approval.
- Use inline trace for sourced corrections; dispatch a fresh `decision-completeness-auditor` only at its narrowed canonical boundary, with fallback under the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the approved consolidated diff once. Do not restore with checkout, rewrite unrelated history, or commit.

Report the revision record, ADR decision/file, synchronized sections, `Reviewer execution` for every applicable audit, trace/audit result, current-truth follow-up, and whether to rerun spec-quality-check.
