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

> 以 spec §4 的主要风险为边界,选择能证明它们的最小可执行验证。测试层级按需;除非覆盖不同风险,不在单测 / 集成 / e2e 中重复证明同一行为。

- [ ] {{TODO 主要风险 → 最小 command / assertion;文档、配置或迁移可用相应静态检查、CLI 或数据断言}}

### Acceptance
- [ ] spec §4 Verification 全部 pass

## 2. 实施记录

> 只记录仍影响交付或后续维护的偏差 / 补充决策 / 临时方案。**不改 spec.md**;plan.md 有补充则在
> plan 加注。不记录逐轮命令输出、调试时间线或已被后续结果取代的过程;最终 checks 只进
> Proof Bundle。没有持久记录时写"无"。

- {{YYYY-MM-DD: 持久偏差 / 决策 / 临时方案,或"无"}}

## Proof Bundle

> 由 `/project-workflow:feature-done` 填。本节保留历史兼容标题,内容是会在端点回复中原样展示并由 archive/PR 消费的 delivery receipt。

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` 或 `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` (非 Git:`inputs=[explicit reviewed paths]`); `endpoint-outputs=[tasks.md receipt, READY spec status when written]`
- Checks:`<command/assertion; mode=run|same-task reuse; exit/result; test totals; reused evidence reference when applicable>`
- Review execution:`L2=<reviewer; mode=fresh-subagent|result-reuse|main-session fallback; status; fallback-reason=none|exact reason>|not-run(L1 prerequisite); L3=<same shape>`
- L2:`verdict; baseline=[convention sources]; add findings/unverified/ambiguities only when non-empty` 或 `not-run(L1 prerequisite)`
- L3:`verdict; baseline=[spec path + applicable sections]; add findings/unverified/ambiguities only when non-empty` 或 `not-run(L1 prerequisite)`
- Current truth:
- Open questions:(仅非空时保留)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
