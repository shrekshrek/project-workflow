---
name: spec-quality-check
description: Pre-implementation gate that verifies a feature's spec/plan/tasks quality per spec-driven.md §3.7 7-questions checklist. Mechanical checks (six-elements, "不做" presence, format) + dispatches spec-quality-reviewer sub-agent for subjective items (Outcomes specificity, Constraints真假, verifiable steps). Use AFTER /feature-init + you've filled TODOs, BEFORE starting implementation.
---

**Response language**: Match the user's prompt language. File citations stay as-is.

# Spec Quality Check

Run the 7-question quality checklist from [`spec-driven.md §3.7`](../../docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist) as a **pre-implementation gate**. Catches "spec not ready" issues at the cheap stage (vs `/spec-revise` mid-implementation revision = 5-10x more expensive).

**Use when**: `/feature-init` already ran + you filled in spec.md §3-5 / plan.md / tasks.md TODOs (via feature-init's Step 7 Q&A or main session) — **right before starting implementation**.

**Not for**: spec creation (use `/feature-init`) / mid-implementation revision (use `/spec-revise`) / code-vs-spec compliance review (use `/l3-review`).

User input: `$ARGUMENTS` — `<feature-slug>` or empty (use most recent feature).

## Step 1 — 定位 feature

目标解析:

| 输入 | 处理 |
|---|---|
| `<slug>` | 找 `docs/specs/<NNN>-<slug>/` |
| 空 | 用 `spec.md` mtime 最新的 feature |

读 `spec.md` + `plan.md` + `tasks.md`。

## Step 2 — Mechanical checks (skill 自己跑,不 dispatch)

逐条机械验证,产出 ✅ / ❌ + 失败原因:

| # | 检查 | 实现 |
|---|---|---|
| **M1** | spec.md 六要素是否齐(§1 Outcomes / §2 Scope / §3 Constraints / §4 Verification + plan.md `Prior decisions` + plan.md `§1 模块影响范围`)| grep `^## ` 节标题,核对清单 |
| **M2** | spec.md `## 2. Scope` 是否有 `**Include**` + `**Exclude/不做**` 两个清单 | grep markdown bullet 在 `## 2.` 节内 |
| **M3** | spec.md `## 4. Verification` 至少含 N(default 3)条具体可测项 | 数 `- [ ]` 或 `-` bullet |
| **M4** | plan.md `§1.1 Sibling Alignment`(若多模块时)是否填(非 placeholder) | grep `Align` / `Deviate` / `Codify` 三选一关键词 |
| **M5** | tasks.md 任务数 ≥ 3 且不全是 `## TODO`(用户填了具体内容) | grep `- [ ]` 数量 + 检 `{{TODO}}` 残留 |

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

## Step 5 — 询问是否修复

对每个 ❌ failed / ⚠️ borderline,问用户:
- "Q2 Scope 没'不做',我帮你打开 spec.md §2 加 '**不做**:' 子节,你列具体项?(yes/no)"
- 用户 yes → 用 Edit 工具加结构占位 + 让用户填具体
- 用户 no → 跳过(用户后续手工)

**不强制修**——quality check 是 gate,**用户判断要不要 ship**;skill 不替用户决定。

## Step 6 — 建议下一步

```markdown
📋 下一步:
- ✅ Ready / ⚠️ Caution → 进入实施(完整 post-gate roadmap 见 [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角))
- ❌ Failed → 修完后**重跑** `/project-workflow:spec-quality-check` verify
```

`workflow.md §3.0` 是 P2 全流程 single source of truth(规划期 → 实施期 → 端点 gate 的完整 skill 链)。本 skill 只管 gate verdict + 修复 loop,不重复 inline roadmap(避免 drift)。

## Failure modes

| 错误 | 应对 |
|---|---|
| 找不到 feature 目录 | 提示用户列 `ls docs/specs/` 自选 |
| spec.md 缺六要素中的一个 | M1 ❌,sub-agent 不跑(没意义)|
| spec.md 是空骨架(全是 `{{TODO}}`)| 提示用户 "spec 还没填,先跟 AI 在对话里填 §3-5,再跑 quality-check" |
| Sub-agent 返回 "Outcomes 模糊但可接受" | 标 ⚠️ borderline,不强制改 |

## Notes

- **跟 `/feature-init` 关系**:feature-init 负责**创建** spec/plan/tasks 骨架 + 可选 Q&A 填 TODOs;spec-quality-check 负责**验收**已填写内容是否合格。两者职责互补,不交叠。
- **跟 `/spec-revise` 关系**:quality-check 是**便宜阶段 gate**(implementation 前);spec-revise 是**贵阶段 fix**(implementation 中)。
- **跟 `/l3-review` 关系**:quality-check 验 spec 自身质量(spec 内部);l3-review 验 code 是否符合 spec(spec vs code)。**两个不同问题**。
- **Goal-driven**:服务 [§0.1 命题 1 Verification](../../docs/workflow.md#01-这本手册解决什么) —— 输入清晰度的最后一道 gate。
