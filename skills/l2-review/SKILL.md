---
name: l2-review
description: Run the project's L2 review — verify code changes follow the AGENTS.md conventions for this project (module structure, naming, Pydantic/SQLAlchemy/etc style rules, API endpoint conventions, test discipline). Delegates the actual review to the `agents-md-reviewer` sub-agent, which can ONLY cite rules explicitly in AGENTS.md.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions. Pass-through agent reports preserve the agent's own language choice (which also follows this rule). Code, commands, file paths stay as-is.

# L2 Review

L2 in the project-workflow methodology = **project-level conventions** (the things in AGENTS.md). This skill triggers a sub-agent to mechanically check changed code against those conventions. Designed to find: "you wrote `db.query(...)` but `backend/AGENTS.md` says 'never use 1.x query style'".

User input: `$ARGUMENTS` (optional — feature slug or "current" to scope to most-recent feature)

## Step 1 — Determine scope

Three modes:

| User input | Scope |
|---|---|
| `<feature-slug>` (e.g., `email-verification`) | Files changed in `docs/specs/<NNN>-<slug>/tasks.md` implementation |
| `current` or empty | All uncommitted changes (`git diff --name-only` + `git status --porcelain` for untracked) |
| `since:HEAD~3` (or any git ref) | `git diff --name-only HEAD~3` |

For empty input, **first try** `git diff --name-only` — if empty, fall back to `git log --name-only -1 --pretty=` (last commit).

If still nothing, ask the user "what scope to review?".

## Step 2 — Find AGENTS.md files

Project may have:
- Root `AGENTS.md`
- Tier-level: `backend/AGENTS.md`, `frontend/AGENTS.md`, etc.
- `.claude/rules/*.md` referenced via `@imports`

Filter to relevant tiers based on which files changed (don't pass frontend AGENTS.md if only backend files changed).

Also include `docs/gotchas.md` if it exists (engineering pitfalls also count as L2-level for projects that maintain it).

## Step 3 — Spawn the reviewer agent

Use the Task tool with `subagent_type: agents-md-reviewer` (the agent at `agents/agents-md-reviewer.md` in this plugin).

Pass it:
- Scope (list of changed files)
- AGENTS.md path(s) it should check against
- (Optional) spec.md path for context — but agent must NOT do spec compliance, only AGENTS.md

Example task prompt:

> Review AGENTS.md compliance for these files changed in the `email-verification` feature:
>
> - `backend/src/email/service.py`
> - `backend/src/auth/router.py` (modified)
> - `backend/alembic/versions/2026_05_13_add_verification_tokens.py`
> - `frontend/src/modules/auth/VerifyEmailView.vue`
>
> Rules sources:
> - `AGENTS.md` (project)
> - `backend/AGENTS.md` (tier rules: 模块五件套 / Pydantic / SQLAlchemy 2.0 style / API 端点规范 / 测试规约)
> - `frontend/AGENTS.md` (tier rules: Composition API / Element Plus / useApi.ts)
> - `docs/gotchas.md` (10 工程陷阱)
>
> Spec context (don't review against, just for understanding): `docs/specs/002-email-verification/spec.md`
>
> Return structured findings per your output format.

## Step 4 — Forward the agent's report

The sub-agent returns a structured markdown report. **Pass it through** to the user verbatim (don't re-summarize — agent's report IS the deliverable).

Add a one-line header above the agent's report:

```
## /project-workflow:l2-review — <feature-slug> (<N files>)

<agent's verbatim report>
```

And a one-line footer:

```
---
Next: `/project-workflow:l3-review <slug>` to verify spec compliance.
```

## Step 5 — Failure modes

- **No AGENTS.md found**: tell user "L2 review requires AGENTS.md; this project has none. Run `/project-workflow:spec-init` setup first or create AGENTS.md per template."
- **Agent returns empty findings**: that's fine, report "✅ L2: no violations found across N files."
- **Agent finds something subjective**: trust it — the agent has strict scoping in its system prompt to only cite explicit rules.

## Notes

- **L2 is fast** (~1-2 min per agent call) when AGENTS.md is well-written and scope is small.
- **L2 finds template drift** more reliably than humans — e.g., "you set `container_name` even though AGENTS.md says don't" — easy for humans to miss.
- L2 ≠ L3. If user asks "is this implementation correct?" → that's L3 (`spec-reviewer`), not L2.
- This skill is a **router**. The intelligence is in the `agents-md-reviewer` sub-agent.
