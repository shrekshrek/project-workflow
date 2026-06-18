---
name: l3-review
model: sonnet
description: Run the project's L3 review — verify implementation matches the feature's spec.md (Outcomes, Scope, Constraints, Verification). Delegates to the `spec-reviewer` sub-agent. Use after L1 (mechanical) and L2 (AGENTS.md) are green.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions. Pass-through agent reports preserve the agent's own language choice (which also follows this rule). Code, commands, file paths stay as-is.

# L3 Review

L3 = **feature-spec compliance**: 验 implementation vs `feature-init` 创建的 spec.md。

**Use when**: P2 endpoint, after L1 + L2 are green. Typically invoked by `/feature-done` (Step 5) but standalone-runnable.
**Not for**: spec-self quality check (use `/spec-quality-check` — that's pre-implementation) / convention compliance (use `/l2-review`) / mechanical checks (use `/l1-review`).

User input: `$ARGUMENTS` — feature slug or path to spec.md

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角).

## Step 1 — 定位 spec

把 `$ARGUMENTS` 解析为 spec.md 路径:

| 输入 | 处理 |
|---|---|
| `email-verification` | `docs/specs/<NNN>-email-verification/spec.md`(取最新匹配 NNN)|
| `002` 或 `002-email-verification` | `docs/specs/002-*/spec.md` |
| `docs/specs/.../spec.md`(完整路径)| 直接用 |
| 空 | 找最近的 `docs/specs/<NNN>-*/spec.md`(按 `ls -t` 或 NNN 排序)|

spec.md 缺失:同目录有 `tasks.md` = **轻车道**(L3 不适用,见 [spec-driven §3.2.5](../../docs/spec-driven.md#325-轻车道小改免-frozen-spec--plan))→ 报 "Light-lane feature — L3 N/A;交付验证走 `/project-workflow:proof-bundle`" 退出;整个目录都没有 → 报 "Spec not found. Run `/project-workflow:feature-init <slug>` first." 退出。

找到了 → 一并定位 sibling 的 `plan.md` 和 `tasks.md`(作 context 传给 agent)。

## Step 2 — 判定实施 scope

判定本 feature 实施时改了哪些文件:

1. **优先**:解析 `tasks.md`,提取任务项里显式提到的文件路径
2. **后备**:git history —— 找引用 feature slug 的 commits:
   ```bash
   git log --oneline --all --grep="<slug>"
   git log --name-only -p -- $(git diff --name-only HEAD~N HEAD)
   ```
3. **最后手段**:若用户说"since last commit",用 `git diff --name-only HEAD~1`
4. **仍不明** → 问用户:"which commit range or file list scopes this feature?"

## Step 3 — Dispatch spec-reviewer sub-agent

用 Task 工具,`subagent_type: spec-reviewer`。

传:
- spec.md 路径
- plan.md 路径(仅 context)
- tasks.md 路径(进度 context)
- 改动文件列表(scope)

任务 prompt 示例:

> Review L3 spec compliance for feature `email-verification`.
>
> - Spec: `docs/specs/002-email-verification/spec.md` (THIS is the baseline)
> - Plan (context only, not the source of truth): `docs/specs/002-email-verification/plan.md`
> - Tasks (status): `docs/specs/002-email-verification/tasks.md`
>
> Implementation scope (changed files):
> - backend/src/email/{__init__.py, service.py, templates/*.j2}
> - backend/src/auth/{models.py, schemas.py, service.py, router.py}
> - backend/alembic/versions/<two-new>.py
> - frontend/src/modules/auth/{RegisterSentView.vue, VerifyEmailView.vue, api.ts, RegisterView.vue, LoginView.vue}
> - frontend/src/router/index.ts
> - docker-compose.yml, .env.example
>
> Return structured findings per your output format. Focus on:
> 1. Spec §1 Outcomes — actually happens?
> 2. Spec §2 Scope — anything excluded that snuck in? Anything included that's missing?
> 3. Spec §3 Constraints — hard numbers respected (32-byte token, 24h expiry, etc)?
> 4. Spec §4 Verification — listed tests present?

## Step 4 — 转发 agent 报告

sub-agent 返回一份 markdown 报告(含 Missing / Deviations / Scope creep / Verified / Summary 等节)。**原样转发**,加 header / footer:

```
## /project-workflow:l3-review — <feature-slug>

<agent's verbatim report>

---
下一步:L3 clean → 跑 `/project-workflow:proof-bundle <slug>` 验交付清单。
若仍有 deviation → 修复 或 改 spec.md(偏离原设计需显式 spec edit)。
```

## Failure modes

- **spec 描述了还没建的功能**:OK —— L3 区分 "missing" 和 "deviation"。多数项 missing 说明 feature 还在进行中,告诉用户 "Feature looks incomplete — N of M spec items unimplemented. Continue per tasks.md."
- **tasks.md / 文件不一致**:信 spec,不信 tasks.md。tasks.md 是 "计划的步骤",spec 是 "承诺的成果"
- **agent 发现 scope creep**:不自动 fix。用户决定:裁实施 或 改 spec §2

## Notes

- L3 较慢(~2-3 min agent 调用)
- **L1 + L2 绿后再跑**。tests 都坏了去验 spec 合规没意义
- **Spec ambiguities surface here**: agent's report may include a `📝 Spec ambiguities` section. Those are real signals — improve spec.md if they're recurring.
