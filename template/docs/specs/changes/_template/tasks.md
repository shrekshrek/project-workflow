# <NNN> <slug> — Tasks

> 基于 plan.md。颗粒度 30 分钟 - 2 小时,实施时勾选 + 加注。

## 1. 任务清单

### Setup(仅当 plan 标注新增 component/module)
- [ ] 建 `<component-or-tier>/<module-path>/` 及该栈所需的最小入口文件
- [ ] 接入父级 composition/registration point
- [ ] 若 plan 明确包含持久化结构变化,添加并验证对应 migration

### `<component-or-tier>`
- [ ] {{TODO 按实际受影响 component 分组,拆 30min-2h 颗粒度;复制本节可增加分组}}

### Verification
- [ ] {{TODO 单测}}
- [ ] {{TODO 适用时添加集成 / e2e / CLI / 数据断言}}

### Acceptance
- [ ] spec §4 Verification 全部 pass

## 2. 实施记录

> 实施中的偏差 / 补充决策 / 临时方案。**不改 spec.md**;plan.md 有补充则在 plan 加注。

- {{YYYY-MM-DD: 偏差描述}}

## Proof Bundle

> 由 `/project-workflow:feature-done` 填。本节实施前留占位,完成后由 skill 写入。

- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:`<X>/<Y>` passed, coverage `<Z>%`
- [ ] L1 合规
- [ ] L2 合规(reviewer 提供 AGENTS.md 作 context 跑过)
- [ ] L3 合规(reviewer 提供 spec.md 作 context 跑过)
- [ ] AGENTS.md 实际改动审计(item 5a)
- [ ] AGENTS.md drift 建议(item 5b)
- [ ] Current truth:N/A / aligned / 更新 pending(→ `/project-workflow:feature-archive`)
- [ ] 开放问题(如有)
