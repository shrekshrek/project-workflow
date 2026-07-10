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

**Not for**: spec creation (use `/feature-init`) / mid-implementation revision (use `/spec-revise`) / code-vs-spec compliance review (that's `/feature-done` 的 L3 层).

User input: `$ARGUMENTS` — `<feature-slug>` or empty (use most recent feature).

## Step 1 — 定位 feature

目标解析:

| 输入 | 处理 |
|---|---|
| `<slug>` | 找 `docs/specs/changes/<NNN>-<slug>/` |
| 空 | 用 `docs/specs/changes/` 活动区内 `spec.md` mtime 最新的 feature,排除 `archive/` |

读 `spec.md` + `plan.md` + `tasks.md`。

**change spec 形态判定**(读 `spec.md` 节标题):
- 含 `## Delta` 或 `## Motivation` → **brownfield**
- 含 `## 1. Outcomes` → **greenfield**
- 无法判定 → 看 `## Domain References`;有则 brownfield,无则 greenfield

**车道判定**:`spec.md` 缺失 = **轻车道** → 报 "N/A(轻车道…)" 并退出。

## Step 2 — Mechanical checks (分形 M 表)

逐条机械验证,产出 ✅ / ❌ + 失败原因。**brownfield 不跑 M1/M2 的 Outcomes/Scope 项**,改跑 M1b/M2b。

### Greenfield M 表

| # | 检查 | 实现 |
|---|---|---|
| **M1** | 六要素齐(§1–§4 + plan Prior decisions + plan §1 模块影响) | grep `^## ` |
| **M2** | §2 Scope 有 `**做**` + `**不做**` 各 ≥1 条非 TODO | 节内 grep |
| **M3** | §4 Verification ≥3 条可测项 | 数 bullet |
| **M4** | plan §1.1 Sibling Alignment(多模块) | 同旧 |
| **M5** | tasks ≥3 项 | 同旧 |
| **M6** | N/A(greenfield 首次归档时由 `/feature-archive` 创建/更新 domain doc) | — |
| **M7** | N/A | — |

### Brownfield M 表

| # | 检查 | 实现 |
|---|---|---|
| **M1b** | Motivation + Domain References + Delta + Constraints + Verification + plan 两要素 | grep 节标题 |
| **M2b** | Delta 含 Added/Modified/Removed 三子节,至少一处非 TODO | grep |
| **M3b** | Verification ≥2 条( brownfield 默认) | 数 bullet |
| **M4** | 同 greenfield | 同旧 |
| **M5** | 同 greenfield | 同旧 |
| **M6** | spec 引用 `docs/specs/<area>.md` 且不矛盾,或显式 deviation | 路径 + 对照 |
| **M7** | 同 M2b(Delta 非空) | 与 M2b 可合并判 |

**M 表共用**:M4/M5 两形态都跑;失败形态专属项则只跑对应表。

## Step 3 — Subjective checks (dispatch spec-quality-reviewer sub-agent)

剩 4 个问题需要主观判断,**dispatch [`spec-quality-reviewer`](../../agents/spec-quality-reviewer.md) sub-agent**:

```
Task tool:
  subagent_type: spec-quality-reviewer
  prompt: """
    Spec to assess: docs/specs/changes/<NNN>-<slug>/spec.md + plan.md + tasks.md

    Subjective checks (per spec-driven.md §3.7; **shape-aware**):
      - brownfield: Q3 on Verification; Q4 on Motivation/Delta specificity (NOT domain doc duplication); Q5 Constraints; Q7 tasks
      - greenfield: Q3–Q5 on §4/§1/§3; Q7 tasks

    Per agent's mandatory 4-phase methodology, return structured report
    with verdict per question + cited evidence.
  """
```

Sub-agent 返回结构化报告(Q3/Q4/Q5/Q7 各项 ✅/⚠️边缘/❌ + spec.md 原文引用 + 修法建议)。

## Step 4 — Aggregate verdict

合并 Step 2(M1-M7)+ Step 3(Q3/Q4/Q5/Q7)→ 7 问 verdict + M6/M7 机械项(Q3 由 Step 3 主观判定为主,M3 计数为辅):

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
  - 0 failed + ≥1 borderline → ⚠️ Borderline;记录风险、接受理由和后续修法后才可实施
  - ≥1 failed → ❌ Blocked;修完并重跑后才可实施
```

## Step 5 — 建议下一步

> 本 gate 不直接代修 artifact,但 **Failed 阻断实施**;Borderline 只有在 plan.md 风险节或 tasks.md 实施记录中显式记录风险、接受理由和后续修法后才可继续。
> 本 gate **不自动翻 `spec.md` 状态为 `已确认`**:`已确认` 是用户接受 spec 并准备开始实施的冻结标记。Ready / Caution 后,提示用户开始实施前标记 `已确认`;只有用户明确要求时才替用户改这一行。

```markdown
📋 下一步:
- ✅ Ready / ⚠️ Borderline 已记录 → 进入实施(完整 post-gate roadmap 见 [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角))
- ❌ Failed → 修完后**重跑** `/project-workflow:spec-quality-check` verify
```

## Failure modes

| 错误 | 应对 |
|---|---|
| 找不到 feature 目录 | 提示用户列 `ls docs/specs/changes/` 自选 |
| spec.md 缺六要素中的一个 | M1 ❌,sub-agent 不跑(没意义)|
| spec.md 是空骨架(全是 `{{TODO}}`)| 提示用户 "spec 还没填,先跟 AI 在对话里填 §1/§3/§4,再跑 quality-check" |
| Sub-agent 返回 "Outcomes 模糊但可接受" | 标 ⚠️ borderline;不强制改正文,但实施前必须记录接受风险 |

## Notes

- 互补:`/feature-init` 创建 spec/plan/tasks 骨架;本 skill 验收已填内容质量;`/spec-revise` = 贵阶段 fix(implementation 中);`/feature-done` L3 层 = code vs spec(本 skill = spec 内部)
