---
name: spec-revise
description: "Revise a frozen full-lane feature contract in Codex with an ADR, spec revision record, plan/tasks synchronization, and optional module-boundary updates. Not for draft edits or minor wording fixes."
---

# Spec Revise (Codex)

Match the user's language and preserve source-file language. Read [`../../docs/actions/spec-revise.md`](../../docs/actions/spec-revise.md) completely before acting.

## Codex execution contract

- Use this only after implementation has started and the accepted contract is materially wrong.
- Show the proposed decision and affected files before final application.
- Run [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) in a general subagent when available, or in the main session otherwise.
- Never silently rewrite frozen history or automatically commit.

## Workflow

1. Resolve the active feature and read `spec.md`, `plan.md`, and `tasks.md`. Light-lane work has no frozen spec; stop and recommend upgrading the artifact when the discovered risk requires one.
2. Establish the triggering discovery and decide whether it is a true contract/module error. Minor clarification belongs in plan prior decisions or task implementation notes.
3. Allocate the next four-digit ADR number from `docs/adr/`, excluding `0000-template.md`.
4. Draft a new ADR with context, decision, alternatives, and consequences. Search existing Proposed/Accepted ADRs for contradictions; with user approval, mark an overturned ADR `Superseded by NNNN`.
5. Update the affected spec sections and append a dated revision-record entry referencing the ADR.
6. Synchronize plan prior decisions, architecture/module impact, risks, and current-truth update-pending notes.
7. Rebalance tasks and validation when scope or ordering changed.
8. For module-boundary changes, update sibling alignment and only add nested `AGENTS.md` guidance when the module is genuinely exceptional relative to its parent.
9. Audit newly introduced decisions against the pre-change baseline and confirmed evidence. Must-fix findings block application.
10. Show the complete diff and obtain approval before finalizing the revision.

Report the ADR, changed contract sections, synchronized files, superseded decisions, audit findings, current-truth follow-up, and whether `$spec-quality-check` should run again.
