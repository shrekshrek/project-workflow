---
name: spec-quality-check
model: sonnet
description: Pre-implementation gate that verifies a feature's spec/plan/tasks quality per spec-driven.md §3.7 7-questions checklist. Mechanical checks (six-elements, "不做" presence, format) + dispatches spec-quality-reviewer sub-agent for subjective items (Outcomes specificity, Constraints真假, verifiable steps). Use AFTER /feature-init + you've filled TODOs, BEFORE starting implementation.
---

**Response language**: Match the user's prompt language. File citations stay as-is.

# Spec Quality Check

Canonical action spec: `docs/actions/spec-quality-check.md`. Follow that file for methodology rules; this skill adds Claude Code execution details.

Run the 7-question quality checklist from [`spec-driven.md §3.7`](../../docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist) as a **pre-implementation gate**。

**Use when**: `/feature-init` already ran + you filled in spec.md / plan.md / tasks.md TODOs in the main conversational session — **right before starting implementation**.

**Not for**: spec creation (use `/feature-init`) / mid-implementation revision (use `/spec-revise`) / code-vs-spec compliance review (use `/l3-review`).

User input: `$ARGUMENTS` — `<feature-slug>` or empty (use most recent feature).

## Step 1 — 定位 feature

目标解析:

| 输入 | 处理 |
|---|---|
| `<slug>` | 找 `docs/specs/<NNN>-<slug>/` |
| 空 | 用 `spec.md` mtime 最新的 feature |

读 `spec.md` + `plan.md` + `tasks.md`。

**车道判定**:`spec.md` 缺失 = **轻车道**(只 tasks.md,见 [spec-driven §3.2.5](../../docs/spec-driven.md#325-轻车道小改免-frozen-spec--plan))。本质量门验的是 frozen spec 的 §3.7 七问,**只适用全道** → 报 "N/A(轻车道无 frozen spec;验证靠 tasks.md `## 验证` + `/proof-bundle`)" 并退出,不跑 M1-M5 / sub-agent。

## Step 2 — Mechanical checks (skill 自己跑,不 dispatch)

逐条机械验证,产出 ✅ / ❌ + 失败原因:

| # | 检查 | 实现 |
|---|---|---|
| **M1** | spec.md 六要素是否齐(§1 Outcomes / §2 Scope / §3 Constraints / §4 Verification + plan.md `Prior decisions` + plan.md `§1 模块影响范围`)| grep `^## ` 节标题,核对清单 |
| **M2** | spec.md `## 2. Scope` 是否有 `**做**`(或 `**Include**`) + `**不做**`(或 `**Exclude**`) 两个清单 | 在 `## 2.` 节内分别检查 include/do 与 exclude/not-do 小节,且各自至少 1 条非 `{{TODO}}` bullet |
| **M3** | spec.md `## 4. Verification` 至少含 3 条具体可测项(plugin default,项目可调)| 数 `- [ ]` 或 `-` bullet |
| **M4** | plan.md `§1.1 Sibling Alignment`(若多模块时)是否填(非 placeholder) | 只统计表格数据行;必须出现非 `<sibling-module>` 的模块名 + `Align` / `Deviate` / `Codify` 三选一 + 非 `{{TODO}}` 备注。模板占位行不算通过 |
| **M5** | tasks.md 任务数 ≥ 3(plugin default,项目可调)且不全是 `## TODO`(用户填了具体内容) | grep `- [ ]` 数量 + 检 `{{TODO}}` 残留 |

任一失败 → 报告给用户 + 提供修法建议(指向具体节)。

## Step 3 — Subjective checks (dispatch spec-quality-reviewer sub-agent)

剩 4 个问题需要主观判断,**dispatch [`spec-quality-reviewer`](../../agents/spec-quality-reviewer.md) sub-agent**:

```
Task tool:
  subagent_type: spec-quality-reviewer
  prompt: """
    Spec to assess: docs/specs/<NNN>-<slug>/spec.md + plan.md + tasks.md

    Subjective checks (per spec-driven.md §3.7 questions 3/4/5/7):
      Q3: Verification §4 每条是否真能机械化(test 覆盖 / API curl / 数据断言),
          还是留 "靠人眼判断" 这种不可测描述?
          (M3 已数过项数 ≥ 3,本问题验"每条是否真可测",不是计数)
      Q4: Outcomes 是否具体场景而非模糊愿望?
      Q5: Constraints 是否真约束而非 wish list?
      Q7: tasks.md 是否拆到 verifiable step?

    Per agent's mandatory 4-phase methodology, return structured report
    with verdict per question + cited evidence.
  """
```

Sub-agent 返回结构化报告(Q3/Q4/Q5/Q7 各项 ✅/⚠️边缘/❌ + spec.md 原文引用 + 修法建议)。

## Step 4 — Aggregate verdict

合并 Step 2(M1-M5)+ Step 3(Q3/Q4/Q5/Q7)→ 7 个 verdict(Q3 由 Step 3 主观判定为主,M3 计数为辅):

```markdown
# Spec Quality Check Report — <NNN>-<slug>

## ✅ Passed (N)
- Q1 六要素齐
- ...

## ⚠️ Borderline (M)
- Q4 Outcomes "提升用户体验" 偏模糊。建议改成具体:"<example>"
- ...

## ❌ Failed (K)
- Q2 Scope 没写"不做"清单
  → 修:在 §2 加 "**不做**:" 子节,显式列出 deferred items
- Q3 Verification 全是 "覆盖率 80%" 这种空话
  → 修:每条改成可执行断言("POST /todos returns 201 with todo body")
- ...

## Verdict
- {{N/7}} passed, {{M/7}} borderline, {{K/7}} failed
- **Ready for implementation?**
  - 0 failed + 0 borderline → ✅ Ready
  - 0 failed + ≤2 borderline → ⚠️ Proceed with caution(borderline 项有空再修)
  - ≥1 failed → ❌ Do not implement yet — fix failures first
```

## Step 5 — 建议下一步

> 本 gate **不强制修**:Step 4 verdict 已含每条失败的修法指引(指向具体节);用户自行判断是否 ship / 修,skill 不替用户决定、不再逐条追问。

```markdown
📋 下一步:
- ✅ Ready / ⚠️ Caution → 进入实施(完整 post-gate roadmap 见 [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角))
- ❌ Failed → 修完后**重跑** `/project-workflow:spec-quality-check` verify
```

## Failure modes

| 错误 | 应对 |
|---|---|
| 找不到 feature 目录 | 提示用户列 `ls docs/specs/` 自选 |
| spec.md 缺六要素中的一个 | M1 ❌,sub-agent 不跑(没意义)|
| spec.md 是空骨架(全是 `{{TODO}}`)| 提示用户 "spec 还没填,先跟 AI 在对话里填 §1/§3/§4,再跑 quality-check" |
| Sub-agent 返回 "Outcomes 模糊但可接受" | 标 ⚠️ borderline,不强制改 |

## Notes

- 互补:`/feature-init` 创建 spec/plan/tasks 骨架;本 skill 验收已填内容质量;`/spec-revise` = 贵阶段 fix(implementation 中);`/l3-review` = code vs spec(本 skill = spec 内部)
