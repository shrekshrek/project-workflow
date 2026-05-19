---
name: l2-review
description: Run the project's L2 review — verify code changes follow the AGENTS.md conventions for this project (module structure, naming, Pydantic/SQLAlchemy/etc style rules, API endpoint conventions, test discipline). Delegates the actual review to the `agents-md-reviewer` sub-agent, which can ONLY cite rules explicitly in AGENTS.md.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions. Pass-through agent reports preserve the agent's own language choice (which also follows this rule). Code, commands, file paths stay as-is.

# L2 Review

L2 = **project-level A 类约定** (AGENTS.md 多层 + `.claude/rules/*.md`) compliance check via sub-agent。

**Use when**: P2 endpoint review of project-convention compliance — typically dispatched by `/feature-done`,but standalone-runnable for ad-hoc check during implementation.
**Not for**: mechanical checks(use `/l1-review`)/ spec compliance(use `/l3-review`)/ proof bundle 装配(use `/proof-bundle`)/ A 类约定主动 refresh(use `/agents-md-revise`)。

User input: `$ARGUMENTS` (optional — feature slug or "current" to scope to most-recent feature)

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角).

## Step 1 — 判定 scope

三种模式:

| 用户输入 | Scope |
|---|---|
| `<feature-slug>`(如 `email-verification`)| 该 feature `docs/specs/<NNN>-<slug>/tasks.md` 实施期改的文件 |
| `current` 或空 | 所有未 commit 改动(`git diff --name-only` + `git status --porcelain` 含 untracked) |
| `since:HEAD~3`(或任何 git ref)| `git diff --name-only HEAD~3` |

输入为空时,**先试** `git diff --name-only`;若为空,退到 `git log --name-only -1 --pretty=`(上次 commit)。

仍无 → 问用户 "what scope to review?"。

## Step 2 — 收集 A 类约定文件(L2 规则源全集)

Project may have:
- Root `AGENTS.md`
- Tier-level: `backend/AGENTS.md`, `frontend/AGENTS.md`, etc.
- Module-level: `<module>/AGENTS.md`(仅模块"反常"时存在,见 workflow.md §2.3)
- **All `.claude/rules/*.md` files** —— 全量传给 reviewer;reviewer 自己按 frontmatter `globs:` 判每条规则的作用域。无 `globs:` 当全局规则。

按 changed file 命中的 tier 过滤 `<tier>/AGENTS.md`(只改 backend 时不传 frontend AGENTS.md)。`.claude/rules/*.md` **不在 skill 层做 globs 过滤**。

若项目有 `docs/gotchas.md`,也一并传(工程陷阱清单对维护它的项目也算 L2 级)。

## Step 3 — Dispatch reviewer agent

用 Task 工具,`subagent_type: agents-md-reviewer`(agent 文件:`agents/agents-md-reviewer.md`)。

传:
- Scope(changed files 列表)
- A 类约定路径全集(AGENTS.md 多层 + `.claude/rules/*.md` 全量)
- (可选)spec.md 路径作 context —— 但 agent **不能**做 spec 合规,只做 A 类约定

任务 prompt 示例:

> Review A 类约定合规 for these files changed in the `email-verification` feature:
>
> - `backend/src/email/service.py`
> - `backend/src/auth/router.py` (modified)
> - `backend/alembic/versions/2026_05_13_add_verification_tokens.py`
> - `frontend/src/modules/auth/VerifyEmailView.vue`
>
> Rules sources(A 类全集):
> - `AGENTS.md` (project)
> - `backend/AGENTS.md` (tier rules: 模块五件套 / Pydantic / SQLAlchemy 2.0 style / API 端点规范 / 测试规约)
> - `frontend/AGENTS.md` (tier rules: Composition API / Element Plus / useApi.ts)
> - `.claude/rules/code-style.md` / `testing.md` / `security.md` / `fastapi.md`(若存在) —— path-scoped via `globs:`,你自己判断每条规则的 globs 是否命中本 scope
> - `docs/gotchas.md` (10 工程陷阱)
>
> Spec context (don't review against, just for understanding): `docs/specs/002-email-verification/spec.md`
>
> Return structured findings per your output format.

## Step 4 — 转发 agent 报告

sub-agent 返回结构化 markdown 报告。**原样转发**给用户(不再 summarize —— agent 的报告就是交付物)。

报告前加 1 行 header:

```
## /project-workflow:l2-review — <feature-slug> (<N files>)

<agent 原样报告>
```

末尾 1 行 footer:

```
---
下一步:跑 `/project-workflow:l3-review <slug>` 验 spec 合规。
```

## Step 5 — Failure modes

- **找不到 AGENTS.md**:报 "L2 review requires AGENTS.md; this project has none. Run `/project-workflow:project-init` 或 `/project-personalize` 起 baseline。"
- **Agent 返回空 findings**:OK,报 "✅ L2: no violations found across N files."
- **Agent 找到看似主观的东西**:信它 —— agent system prompt 有 strict scoping(cite-or-skip)只允许引明确规则

## Notes

- L2 快(~1-2 min agent 调用),前提 AGENTS.md 写得好 + scope 小
