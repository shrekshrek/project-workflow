---
name: spec-revise
description: "Revise a frozen full-lane feature contract in Codex when implementation reveals a material accepted-spec, verification, scope, plan, or module-boundary error. Synchronizes the revision record and plan/tasks, with a conditional ADR for architecture or durable cross-feature decisions. Not for draft edits or minor wording fixes."
---

# Spec Revise (Codex)

Match the user's language and preserve source-file language. Read [`../../docs/actions/spec-revise.md`](../../docs/actions/spec-revise.md) completely before acting.

## Codex execution contract

- Use this only after implementation has started and the accepted contract is materially wrong.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; conditional ADRs instantiate the bundled template from that root.
- Show the proposed decision and affected files before final application.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before resolving convention input for affected modules.
- Use an inline trace check for simple single-source corrections. Run [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) only for an ADR, new ownership/ports/packages/infrastructure, weak evidence, or generated decisions spanning multiple files.
- Never silently rewrite frozen history or automatically commit.

## Workflow

1. Resolve the active feature and read `spec.md`, `plan.md`, and `tasks.md`. Light-lane work has no frozen spec; stop and recommend upgrading the artifact when the discovered risk requires one.
2. Establish the triggering discovery and decide whether it is a true contract/module error. Minor clarification belongs in plan prior decisions or task implementation notes. Resolve the proposed affected module/file population through the Codex bridge and fresh-read global, matching, and ambiguous compatibility rules before drafting the revision.
3. Classify `ADR_REQUIRED`: yes for architecture/module-boundary changes, durable cross-feature technical decisions, or superseding an ADR; no for ordinary product-scope/verification corrections. When yes, scan existing Accepted/Proposed ADRs before the first approval. Show the decision, affected files, and supersede decisions for approval.
4. Draft all final contents without changing the worktree. When ADR_REQUIRED, instantiate the ADR from the plugin's bundled `template/docs/adr/0000-template.md` and draft approved supersede status updates.
5. In the draft, update affected spec sections and append/create a dated revision record with the reason and decision source; reference the ADR only when one exists.
6. In the draft, synchronize plan prior decisions, architecture/module impact, risks, and current-truth update-pending notes.
7. In the draft, rebalance tasks and validation when scope or ordering changed.
8. For module-boundary changes, update sibling alignment and only add nested `AGENTS.md` guidance when the module is genuinely exceptional relative to its parent. Recompute bridge resolution after any affected module/file population or boundary change, then fresh-read newly global, matching, or ambiguous rules before the audit.
9. Run the complexity-triggered auditor or inline trace check against proposed final contents. Must-fix findings block application while leaving the worktree unchanged.
10. Show one consolidated proposed diff and obtain the second/final approval; only then apply it once. Rejection discards the draft and never uses checkout to restore user files.

Report the revision record, conditional ADR decision/file, changed contract sections, synchronized files, audit/trace result, compact bridge counts plus applicable/ambiguous paths, current-truth follow-up, and whether `$spec-quality-check` should run again.
