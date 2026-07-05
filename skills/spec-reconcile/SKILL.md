---
name: spec-reconcile
model: sonnet
description: Repair tool for product areas where accumulated specs conflict. Builds a conflict matrix (spec vs spec vs current truth vs ADR vs code), selects source of truth per contradiction with user approval, marks losing specs 已取代/已废弃 and moves them to docs/specs/archive/, and reports current-truth gaps. Primarily for retrofit — adopting lifecycle management in an existing project or cleaning up an area that piled up direction changes; rarely needed once archive sweeps run routinely. NOT for revising one active spec mid-implementation — use spec-revise.
---

> **Response language**: Match the user's prompt language in all natural-language output. Citations preserve source language. Code, commands, file paths stay as-is.

# Spec Reconcile

Canonical action spec: `docs/actions/spec-reconcile.md`. Follow that file for methodology rules; this skill adds Claude Code execution details.

存量修复工具:当一个产品域积累了多份互相矛盾的 spec 时,先诊断、定 source of truth、修生命周期状态并归档失效 spec([spec-driven.md §5.1](../../docs/spec-driven.md#51-生命周期状态全集--物理归档)),再动工。主要用于 **retrofit**(老项目引入生命周期管理 / 某域方向变化堆积);archive 清扫常态化后稳态下很少需要。

**Use when**: 存量项目一次性清理 / `feature-init` 提示活动区存在相关历史 spec / 用户怀疑实施方向被旧 spec 污染。
**Not for**: 单个 active spec 实施中发现错(use `/spec-revise`)/ 交付后的常规收尾(use `/feature-archive`)/ A 类约定 drift(use `/agents-md-revise`)。

User input: `$ARGUMENTS` — 产品域名 / 模块路径 / 逗号分隔的 `<NNN>` 列表;空则问用户。

## Step 1 — 圈定范围

1. 解析 `$ARGUMENTS`:域名(如 `dashboard`)→ 按 spec 标题 / Outcomes 关键词扫 `docs/specs/*/spec.md`;模块路径 → 按 plan.md §1 模块影响扫;`<NNN>` 列表 → 直接用。
2. 列出候选 spec(编号 + 标题 + 当前状态标记)让用户确认圈定范围;≥ 2 份才有意义,只有 1 份 → 报 "无需 reconcile" 退出。
3. 一并收集:`docs/current/<area>.md`(若有)、相关 ADR(grep 引用)、(可选)用户指定的实现文件。

## Step 2 — 提取断言 + 构建冲突矩阵

对每份文档提取**具体断言**(IA 结构 / 行为 / 契约 / 默认值,带文件 + 节引用)。逐对比较,只报**客观矛盾**(A 说 X,B 说非 X),不报"可能过时"这种弱关联。

每条冲突:

```
[Conflict #N] <主题>
  - <NNN>-<slug>/spec.md §2:"<引文>"
  - <MMM>-<slug>/spec.md §1:"<矛盾引文>"
  - (若有)docs/current/<area>.md:"<现状引文>"
  - (若给了代码)实现现状:<代码实际走哪边,file:line>
  - 证据倾向:<哪份是后来者 / ADR 是否已裁决 / 代码站哪边>
```

## Step 3 — 逐条定 source of truth(用户裁决)

按矩阵逐条问用户(≤ 5 条/轮):winner 是哪个(后期 spec / ADR / current truth / 代码现状)?loser spec 标 `已取代`(链接后继)还是 `已废弃`?loser 里仍有效的数据模型 / API / 基础设施事实 → 记入 Step 4 的 current-truth gaps(没有"历史基础"状态,存活事实进 current truth,spec 归档)。

**用户不裁决的冲突不得应用任何标记**;全部搁置则 verdict = BLOCKED。

## Step 4 — 应用(标记 + 归档)+ 报告 current-truth gaps

1. 对每份 loser spec 应用标记(状态行挪标记 + 状态行下加替代链接行;不动正文),然后 `git mv docs/specs/<NNN>-<slug> docs/specs/archive/<NNN>-<slug>`(`mkdir -p docs/specs/archive` 如需)。
2. `docs/specs/index.md` 存在则同步(编号 → 标题 / 状态 / 位置)。
3. **Current-truth gaps**:散落在 winner spec 里、或来自 loser spec 仍有效基础(数据模型 / API / 基础设施)、但 `docs/current/<area>.md` 缺失或未覆盖的持久事实 → 列清单;缺口大时当场补 current truth(经用户确认),或建议跑 `/feature-archive` 清扫(已交付 winner 一并归档)。
4. **ADR 一致性**:loser 的方向背后有 `Accepted` ADR → 标记为需 superseding ADR 或状态更新,列入 follow-up。

## Step 5 — Verdict

```markdown
## /project-workflow:spec-reconcile — <area>

- 圈定:<N> specs + <current truth / ADRs>
- 冲突:<M> 条(矩阵见上)
- 已应用:<K> 份 spec 标记 + 归档 → docs/specs/archive/
- Current-truth gaps:<已补 / list / 无>
- ADR follow-up:<需 superseding ADR 的项 / 无>

### Verdict: <CLEAN / NEEDS LIFECYCLE UPDATE / BLOCKED>
```

- `CLEAN`:无冲突,specs 与 current truth 对齐
- `NEEDS LIFECYCLE UPDATE`:有冲突且已 / 待应用状态修正 + 归档,补完再实施
- `BLOCKED`:存在用户未裁决的活跃矛盾 —— **该域新实施不安全,先裁决**

## Invariants(强制)

- **只读代码,不改代码**;不删历史,supersede = 标记 + 归档,不是删除
- 每条冲突必须引用到具体文件 + 节;引不出原文的"感觉过时"不报
- 状态变更与归档移动全部经用户逐条裁决

## Failure modes

| 错误 | 应对 |
|---|---|
| 范围内 spec 相互独立无冲突 | 报 CLEAN;已交付的建议 `/feature-archive` 清扫归档 |
| 用户对某冲突说"两边都要" | 那不是冲突是合并需求 → 建议起新 feature 显式合并,两份老 spec 均标 `已取代` by 新 feature |
| 冲突源于某 spec 实施了一半被放弃 | 标 `已废弃` + 归档,并在 gaps 里记录代码残留(供用户开清理 feature) |
