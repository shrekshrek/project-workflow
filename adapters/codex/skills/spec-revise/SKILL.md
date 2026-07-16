---
name: spec-revise
description: "Revise a materially wrong accepted full-lane contract in Codex while synchronizing spec, plan, tasks, and any conditional ADR."
---

# Spec Revise (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/spec-revise.md`](../../../../docs/actions/spec-revise.md) completely before acting; it owns the revision workflow and contract.

- Require an accepted spec in the full lane and read applicable root/nested `AGENTS.md`, recomputing applicability when module scope changes.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; when `ADR_REQUIRED`, search ADR filenames, titles, status fields, and references first, open only candidates relevant to the affected area or decision, then instantiate the bundled `template/docs/adr/0000-template.md`.
- Ask only about unresolved revision/ADR ambiguity, then use one consolidated apply approval. Draft the proposed diff without changing the worktree.
- Use inline trace for sourced corrections; only at the narrowed canonical boundary dispatch a fresh subagent for [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md), with fallback under the shared execution contract. Blocking or unreliable audit evidence prevents apply.
- Apply the approved consolidated diff once. Do not restore with checkout, rewrite unrelated history, or commit.

Report the revision record, ADR decision/file, synchronized sections, `Reviewer execution` for every applicable audit, audit result, current-truth follow-up, and whether to rerun spec-quality-check.
