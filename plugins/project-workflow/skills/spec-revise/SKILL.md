---
name: spec-revise
description: Run the project-workflow mid-implementation revision SOP in Codex when a frozen feature spec, plan, or module boundary is wrong. Use for real scope, verification, API, data model, architecture, or module-boundary changes discovered during implementation. Not for typos, wording polish, or normal task progress.
---

# Spec Revise

Match the user's language in natural-language output. This is the Codex adapter for `workflow.md §3.5` and `§2.6`.

Canonical action spec: `../../docs/actions/spec-revise.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Locate the feature.
   - Accept `<slug>`, `<NNN>`, `<NNN>-<slug>`, a path, `current`, or no argument.
   - Require full-lane `spec.md`, `plan.md`, and `tasks.md`.
   - If the feature is light lane, stop. If the change now touches contracts or invariants, tell the user to upgrade to full lane first.

2. Confirm this is a real revision.
   - Ask what implementation discovery triggered the revision.
   - Real revision: scope missing/wrong, verification not mechanical, API/data-model conflict, constraint wrong, module boundary change.
   - Not revision: typo, task note, implementation difficulty without contract change.
   - If no frozen contract changes, record a `plan.md` prior decision or `tasks.md` implementation note instead of creating ADR ceremony.

3. Create or update the ADR.
   - Find the next `docs/adr/NNNN-*.md` number.
   - Use `docs/adr/0000-template.md` when available.
   - Capture context, decision, and consequences.
   - Keep the ADR about one decision topic.
   - Reverse-supersede check: scan existing `Accepted`/`Proposed` ADRs for decisions this one overturns or contradicts (grep titles and Decision sections by topic keywords); per user approval, flip the old ADR's status line to `Superseded by NNNN` (the only edit allowed on an old ADR) and note the takeover in the new ADR's context. Orthogonal decisions coexist; undecided cases are listed in the report, not edited.

4. Update the feature artifacts.
   - `spec.md`: update only the affected frozen sections and append a revision-record entry with date and ADR reference.
   - `plan.md`: update module impact, architecture decisions, prior decisions, and risks/open issues as needed.
   - `tasks.md`: add, remove, or rebalance tasks affected by the revision; preserve completed task history.

5. Handle module-boundary changes.
   - Revisit Sibling Alignment.
   - If a module is genuinely exceptional, add or update module `AGENTS.md`.
   - If a repeated pattern should become a tier or path rule, update the scoped convention file instead of burying it in the feature spec.

5.5. Handle current-truth and superseded-spec follow-ups.
   - If the revision changes durable behavior recorded in `docs/current/<area>.md`, update that document or record why not.
   - If the revision supersedes an earlier spec's direction, note that lifecycle markers should be applied after delivery via `$feature-archive` or `$spec-reconcile`; do not edit old specs here.

6. Review the diff before finishing.
   - Show touched files and the reason for each.
   - Check that every new specific decision traces to the trigger, ADR, existing conventions, or user confirmation.
   - Prefer a separate Codex subagent running `../../docs/reviewers/decision-completeness-auditor.md`; otherwise run the audit in the main session. Frequency reduction: if the last 3+ features all had zero must-fix findings and this revision only touches `tasks.md` with no new ADR, the audit may be skipped (report it); any new must-fix restores it unconditionally.
   - Ask for approval before treating the revised spec as the new baseline.

## Output

Return the ADR path, changed files, revision summary, and next action. The next action is to continue implementation against the revised spec, then run `$feature-done`.

## Guardrails

- Do not use this skill to avoid failed pre-implementation quality checks; fix the draft spec before freezing.
- Do not silently change `spec.md` without ADR and revision record once implementation has started.
- Do not create multiple unrelated ADRs in one run unless the user explicitly asks.
