---
name: spec-quality-check
description: Run the project-workflow pre-implementation quality gate for a full-lane feature spec. Use after feature-init and after filling a numbered feature spec folder, before implementation starts. Reports pass, borderline, and failed items from the seven-question checklist; failed items block implementation.
---

# Spec Quality Check

Match the user's language in natural-language output. This is the Codex adapter for bundled `../../docs/spec-driven.md §3.7`.

Canonical action spec: `../../docs/actions/spec-quality-check.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Locate the feature.
   - Accept `<slug>`, `<NNN>`, `<NNN>-<slug>`, a full path, or no argument.
   - With no argument, use the latest `docs/specs/<NNN>-*/` directory by number or mtime.
   - Require `tasks.md`.
   - If `spec.md` is missing, classify as light lane and return `N/A`: light lane has no frozen spec; validation happens through `tasks.md` verification and the proof bundle.

2. Read inputs.
   - `spec.md`
   - `plan.md`
   - `tasks.md`
   - Bundled `../../docs/spec-driven.md` if checklist wording is unclear.

3. Run the seven checks.
   - Q1: Six core sections exist: spec outcomes/scope/constraints/verification, plan module impact, plan prior decisions.
   - Q2: Scope has both "做/Include" and "不做/Exclude" with non-placeholder bullets.
   - Q3: Verification items are concrete and mechanically checkable, not vague wishes.
   - Q4: Outcomes describe concrete scenarios or API behavior, not generic goals.
   - Q5: Constraints are real constraints with meaningful limits or tradeoffs, not a wish list.
   - Q6: If multiple modules are involved, Sibling Alignment is filled with Align/Deviate/Codify and a reason.
   - Q7: Tasks are verifiable steps, not broad buckets; each task should have an observable output or check.
   - Prefer a separate Codex subagent running `../../docs/reviewers/spec-quality-reviewer.md` for Q3/Q4/Q5/Q7; otherwise run those subjective checks in the main session.

4. Aggregate the verdict.
   - `Failed > 0`: `BLOCKED`; do not start implementation.
   - `Failed = 0` and `Borderline > 0`: implementation may proceed only if risks/acceptance/follow-up are recorded in `plan.md ## 4. 风险与未决` or `tasks.md ## 2. 实施记录`.
   - All pass: ready for implementation.
   - Do not automatically mark `spec.md` as `已确认`; that status is the user's acceptance/freeze marker. If the user accepts the verdict and starts implementation, tell them to mark `已确认`, or update it only when explicitly asked.

5. Output a compact report.
   - Passed / Borderline / Failed grouped lists.
   - Cite exact files and sections when possible.
   - Provide concrete fix suggestions for failed and borderline items.
   - End with the next action: fix and rerun, record accepted borderline risk, or begin implementation.

## Guardrails

- Do not fix the spec unless the user explicitly asks.
- Do not soften failed items into borderline when the checklist requirement is missing.
- Do not run implementation or edit code as part of this gate.
