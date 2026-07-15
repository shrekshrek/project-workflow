---
name: spec-revise
description: "Revise a materially wrong accepted full-lane contract in Codex while synchronizing spec, plan, tasks, and any conditional ADR."
---

# Spec Revise (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/spec-revise.md`](../../../../docs/actions/spec-revise.md) completely before acting; it owns the revision workflow and contract.

- Require an accepted spec in the full lane and read applicable root/nested `AGENTS.md`, recomputing applicability when module scope changes.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; when `ADR_REQUIRED`, instantiate its bundled `template/docs/adr/0000-template.md`.
- Ask only about unresolved revision/ADR ambiguity, then use one consolidated apply approval. Draft the proposed diff without changing the worktree.
- Use an inline trace for simple single-source correction. At the canonical boundary, run [`../../../../docs/reviewers/decision-completeness-auditor.md`](../../../../docs/reviewers/decision-completeness-auditor.md) in a general subagent when available; main-session fallback follows the same contract.
- Apply the approved consolidated diff once. Do not restore with checkout, rewrite unrelated history, or commit.

Report the revision record, ADR decision/file, synchronized sections, audit result, current-truth follow-up, and whether to rerun spec-quality-check.
