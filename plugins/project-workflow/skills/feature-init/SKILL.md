---
name: feature-init
description: Create a project-workflow feature artifact in Codex only when the task needs new durable tracking. Full lane creates spec, plan, and tasks files; light lane creates tasks only. Tiny bugfixes, wording/style tweaks, local test fixes, low-risk docs, and work already covered by an accepted spec should skip this skill.
---

# Feature Init

Match the user's language in natural-language output. This is the Codex adapter for the project-workflow P2 entry action; keep the method aligned with bundled `../../docs/workflow.md`, `../../docs/spec-driven.md`, and `../../docs/cross-tool-methodology.md`.

Canonical action spec: `../../docs/actions/feature-init.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Resolve the feature slug from the prompt.
   - Accept `<slug>`, `<NNN>-<slug>`, or `<slug>: <description>`.
   - Strip an optional `NNN-` prefix before validating the slug.
   - Require kebab-case: `a-z0-9-`, 2-40 chars, no leading/trailing dash.
   - If missing or invalid, ask for a corrected slug before writing files.

2. Read project context before creating files.
   - Required: `AGENTS.md`. If absent, stop and tell the user to initialize the project baseline first.
   - Optional: nested `AGENTS.md`, explicit rule sections in those files, `.claude/rules/` compatibility files if present, and the current conversation for explicit user-provided feature facts.
   - Do not invent endpoints, entities, field names, errors, module paths, or technology choices that are not in project context or the user prompt.

3. Classify the entry.
   - First decide whether the task needs a new project-workflow artifact at all. If it is a tiny bugfix, wording/style tweak, local test expectation fix, low-risk documentation edit, or work already covered by an accepted spec, stop and report: "No new project-workflow artifact needed; continue directly and close with checks."
   - If an artifact is useful, use full lane for API/schema, DB/data migration, security, auth/permissions, multi-tenant behavior, cross-module contract, architecture, user-visible product contract, new module work, or high-blast-radius paths.
   - Use light lane only when all are true: small/reversible change within one cohesive module or responsibility area, no new module, no API/schema/data migration/architecture contract change, and no disaster-invariant/high-blast-radius path from `AGENTS.md`. File count alone is not decisive.
   - Uncertainty rule: uncertain about high-risk impact means full; uncertain about UI wording/styling/component split/local refactor/test shape does not force full; uncertain business outcome means ask before creating artifacts.
   - Bundle related small changes into one tracked feature instead of creating fragmentary specs.
   - Implementation without a new artifact still follows `AGENTS.md`, path rules, and relevant lint/type/test/hooks. If that work or light-lane work later touches API/schema, DB/data migration, security, multi-tenant behavior, evidence/data invariants, cross-module contracts, or high-blast-radius paths, stop and upgrade to the appropriate artifact flow.

4. Determine the feature number only if creating light or full lane artifacts.
   - Inspect `docs/specs/` for directories matching `^[0-9]{3}-`.
   - Use the max number + 1; start at `001` if none exist.
   - If the user supplied an `NNN` prefix that collides with an existing directory, stop and ask whether to use the next available number.

5. Create the spec directory from templates.
   - Template source: bundled `../../template/docs/specs/_template/`.
   - Do not require or create target-project `docs/specs/_template/`; project-local default templates are intentionally not part of the generated baseline.
   - Full lane: copy `spec.md`, `plan.md`, and `tasks.md`.
   - Light lane: copy `tasks-light.md` to `tasks.md`; do not create `spec.md` or `plan.md`.
   - Replace `<NNN>`, `<slug>`, and `<TODAY>` where present.
   - Preserve unresolved `{{TODO ...}}` markers.
   - If pre-filling from explicit conversation facts, add a short HTML comment such as `<!-- pre-filled from chat: ... -->`.

6. Report the result.
   - List created files.
   - State lane classification and module decision, including uncertainty.
   - If pre-filling from conversation facts, prefer a separate Codex subagent running `../../docs/reviewers/decision-completeness-auditor.md` before treating the scaffold as complete; otherwise run the audit in the main session.
   - Remind the user that full-lane work must pass `$spec-quality-check` before implementation.
   - For light lane, remind that `tasks.md` must include goal/boundary, verification, tasks, and proof bundle.

## Guardrails

- Do not write implementation code.
- Do not plant "reasonable defaults" for business/API details.
- Ask before creating a new module if module ownership is unclear.
- Keep Claude-specific paths as optional inputs only; Codex's canonical shared source is `AGENTS.md` plus `docs/`.
