---
name: spec-init
description: Start a new feature spec — create docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md from project template. Auto-detect if a new module is needed and add module setup to plan/tasks (per workflow §2 Module Setup sub-flow).
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Spec Init

User wants to start a new feature. Their input: `$ARGUMENTS`

## Step 1 — Parse input

`$ARGUMENTS` may be one of:
- `<slug>` only — e.g., `email-verification`
- `<slug>: <description>` — e.g., `email-verification: send verify link on register`
- Empty — ask user "feature slug? (kebab-case)" then proceed

Slug requirements:
- kebab-case only (`a-z0-9-`)
- 2-40 chars
- No leading/trailing hyphen

If invalid, ask user to correct before proceeding.

## Step 2 — Determine the NNN number

```bash
ls docs/specs/ | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

Take the highest leading number, increment by 1, zero-pad to 3 digits. If `docs/specs/` doesn't exist or is empty, start with `001`.

## Step 3 — Read project context

Read these files for context (skip silently if missing):
- `AGENTS.md` (project conventions)
- `docs/specs/_template/{spec,plan,tasks}.md` (templates)
- `docs/workflow.md` §3 P2 Feature Development (process)

Scan project structure to map existing modules:
- Backend: `backend/src/*/` (or `src/*/` for single-tier)
- Frontend: `frontend/src/modules/*/`

## Step 4 — Detect Module Setup needs (workflow §2 sub-flow)

Based on slug + description + existing modules, decide:

| Situation | Module action |
|---|---|
| Feature clearly extends one existing module | No new module; note "extends `<X>`" in plan |
| Feature crosses 2+ existing modules with no clear home | Ask user: which module owns it / split how |
| Feature is a wholly new domain (e.g., `notifications` when none exists) | **New module needed** — add module skeleton to plan/tasks |
| Cross-tier feature (e.g., auth) | Likely needs module in **both** tiers; check each tier separately |

**If unsure, ASK the user before generating files.** Don't fabricate module decisions.

## Step 5 — Generate the three files

Create directory `docs/specs/<NNN>-<slug>/` and write:

### `spec.md` (WHAT — frozen once approved)

```markdown
# <NNN> <slug> — Spec

> Created YYYY-MM-DD · Status: draft

## 1. Goal
<one-paragraph "why" derived from description, or {{TODO}}>

## 2. Scope
**Include**:
- {{prefilled from description, else TODO}}

**Exclude** (out of scope this iteration):
- {{TODO}}

## 3. User Scenarios
- {{TODO — list real user actions, not "as a user I want"}}

## 4. Data Model
{{If new module → describe its main entities; else: "extends existing <module>"}}

## 5. API Contract
| Method | Path | Body | Response | Status |
|---|---|---|---|---|
| {{TODO}} | | | | |

Errors:
- {{TODO — list 401/404/422 cases}}

## 6. Verification
- [ ] Backend unit tests cover happy + 1 边界 + 1 错误路径 per endpoint
- [ ] {{TODO custom}}
- [ ] L1: `pnpm check` (or equivalent) passes
- [ ] L2: `/project-workflow:l2-review` clean
- [ ] L3: `/project-workflow:l3-review` clean (this file is the L3 baseline)
- [ ] Manual smoke test in browser/CLI
```

### `plan.md` (HOW — can amend during implementation)

```markdown
# <NNN> <slug> — Plan

> Based on spec.md. HOW we'll build it.

## Implementation Order
{{If multi-tier: Backend-first (workflow §8.6); else: by phase}}

1. {{TODO list ordered steps}}

## Module Boundaries
{{One of the following:}}

**(a) Extends existing module**: this feature lives in `<path>`. No new module.

**(b) New module needed**: add `<tier>/<module-path>/`
- Responsibility: {{single-line}}
- Public API surface: {{list of functions/endpoints exposed}}
- Decoupling: {{which existing modules it depends on, which depend on it}}
- File layout: standard five-file (models / schemas / service / router / deps)

## Risks / Open Questions
- {{TODO}}

## What We're NOT Doing
- {{TODO — be explicit about deferred decisions}}

## References
- Project spec: `../../spec.md`
- Engineering gotchas to check during impl: `../../gotchas.md` (if exists in project, scan for relevant items based on the stack used)
```

### `tasks.md` (STEPS — keep updated during implementation)

```markdown
# <NNN> <slug> — Tasks

> Based on plan.md. Granular steps, check off as you go.

## Setup (if new module per plan)
- [ ] Create `<tier>/<module-path>/` directory
- [ ] Add `{__init__,models,schemas,service,router}.py` (or tier equivalent)
- [ ] Register router in `main.py` / wire into app
- [ ] Add alembic migration (if DB schema changes)

## Backend
- [ ] {{TODO}}

## Frontend (if applicable)
- [ ] {{TODO}}

## Tests
- [ ] {{TODO unit tests}}
- [ ] {{TODO integration / e2e}}

## Acceptance
- [ ] All spec §6 verification items pass
- [ ] Proof bundle ready (run `/project-workflow:proof-bundle`)
```

## Step 6 — Report back

After creating, output:

```
✅ Spec created: docs/specs/<NNN>-<slug>/
   ├── spec.md  — Fill in §3-5 (user scenarios, data model, API)
   ├── plan.md  — Review module boundaries section
   └── tasks.md — Adjust estimates per task

📌 Module decision: {{one of:}}
   - Extends existing `<module>` (no new module)
   - New module recommended: `<path>` (plan/tasks include skeleton setup)
   - Needs user clarification: <which option>

Next steps:
1. Open spec.md → flesh out §3-5
2. Implement following tasks.md
3. When done: `/project-workflow:feature-done` (runs L1+L2+L3+proof-bundle) — *coming soon*
```

## Notes

- **Do not** generate code yet — this is the planning artifact only
- **Do not** overwrite existing `docs/specs/<NNN>-<slug>/` (collision detection: error out)
- **Match the project's existing template** if `docs/specs/_template/` exists; the above is fallback
