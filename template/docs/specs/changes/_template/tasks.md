# <NNN> <slug> — Tasks

> 基于 plan.md。只在工作可独立实施、验证或 review 时拆分,实施时勾选 + 加注。
> 实施中出现 plan Delivery Shape Baseline 未声明的 outcome/持久状态/API/角色/工作流/管理面/队列/runtime/Provider/迁移/授权/发布边界时,在继续写生产代码、测试、migration 或兼容层前立即停下。先按 scope delta 分类,报告 delta、当前必要性和推荐的删除/收窄/child/spec-revise 方向;只有方向确需用户决定时一次问一个问题。不得因代码已经写出而自动收编。
> Large/extra-large feature 按 plan §5 执行 Implementation Continuation Check，不要求用户重复确认。

## 1. 任务清单

### Setup(仅当 plan 标注新增 component/module)
- [ ] 建 `<component-or-tier>/<module-path>/` 及该栈所需的最小入口文件
- [ ] 接入父级 composition/registration point
- [ ] 若 plan 明确包含持久化结构变化,添加并验证对应 migration

### `<component-or-tier>`
- [ ] {{TODO 按实际受影响 component 分组;避免大而含糊的 bucket,也不要按预计时长或测试 case 机械拆分}}

### Verification

> 兑现 spec §4 的最小证据义务。一个 command / assertion 可映射多个相关风险且只运行一次;每个新增测试层、矩阵、fixture 或 case 必须覆盖现有更便宜证据未覆盖的实质风险,或满足项目/发布约定。优先扩展最近且清晰的已有测试,合并重叠验证,删除只保护已取代行为的测试。测试数量和层级对称不构成质量。

- [ ] {{TODO 一个或多个证据义务 → 最小 command / assertion;具体测试文件和 case 可在实施时决定}}

## 2. 实施记录

> 只记录仍影响交付或后续维护的偏差 / 补充决策 / 临时方案。**不改 spec.md**;plan.md 有补充则在
> plan 加注。不记录逐轮命令输出、调试时间线或已被后续结果取代的过程;最终 checks 只进
> Proof Bundle。没有持久记录时写"无"。

- {{YYYY-MM-DD: 持久偏差 / 决策 / 临时方案,或"无"}}

## Proof Bundle

> 由 `/project-workflow:feature-done` 填。完整证据由 archive/PR 消费；端点回复仅显示人类可读摘要和本节链接。

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` 或 `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` (非 Git:`inputs=[explicit reviewed paths]`); `endpoint-outputs=[tasks.md receipt, READY spec status when written]`
- Checks:`<command/assertion; mode=run|same-task reuse; exit/result; test totals; reused evidence reference when applicable>`
- Review execution:`L2=<reviewer; mode=fresh-subagent|result-reuse|main-session fallback; status; fallback-reason=none|exact reason>|not-run(completion preflight)|not-run(L1 prerequisite); L3=<same shape>`
- L2:`verdict; baseline=[convention sources]; add findings/unverified/ambiguities only when non-empty` 或 `not-run(completion preflight)` 或 `not-run(L1 prerequisite)`
- L3:`verdict; baseline=[spec path + applicable sections]; add findings/unverified/ambiguities only when non-empty` 或 `not-run(completion preflight)` 或 `not-run(L1 prerequisite)`
- Current truth:
- Open questions:(仅非空时保留)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
