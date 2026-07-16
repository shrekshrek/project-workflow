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

> 由 `/project-workflow:feature-done` 填。本节保留历史兼容标题,内容是会在端点回复中原样展示并由 archive/PR 消费的 delivery receipt。

- Verdict:
- Change:`review-scope=[exact paths reviewed by L2/L3]; base/worktree=[Git context when available]; endpoint-outputs=[tasks.md receipt, READY spec status when written]`
- Checks:`<command/assertion; exit/result; test totals>`
- Review execution:`L2=<reviewer; mode=subagent|main-session fallback; status; fallback-reason=none|exact reason>; L3=<same shape>`
- L2:`verdict; findings=[rule citation or none]; applicable-rules=[source#id]; applicable-unverified=[source#id or none]; ambiguities=[item or none]`
- L3:`verdict; findings=[spec citation or none]; applicable-items=[section#item]; applicable-unverified=[section#item or none]; ambiguities=[item or none]`
- Current truth:
- Open questions:(仅非空时保留)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
