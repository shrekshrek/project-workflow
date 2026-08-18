# <NNN> <slug> — Tasks

> 基于 plan.md。只在工作可独立实施、验证或 review 时拆分,实施时勾选 + 加注；不要按预计时长或测试 case 机械拆分。
> 实施中出现 plan Delivery Shape Baseline 未声明的 outcome/持久状态/API/角色/工作流/管理面/队列/runtime/Provider/迁移/授权/发布边界时,在继续写生产代码、测试、migration 或兼容层前立即停下。先按 scope delta 分类,报告 delta、当前必要性和推荐的删除/收窄/child/spec-revise 方向;只有方向确需用户决定时一次问一个问题。不得因代码已经写出而自动收编。
> 多边界 FULL feature 的标题与 plan §5 slice ID 一一对应。一次只做当前切片：实现 → focused L1 → 勾选
> 本片任务 → 简洁报告已关闭边界/证据/下一片 → Implementation Continuation Check。一致继续且不要求用户
> 重复确认；切片内不运行 L2/L3、不写 Proof Bundle。单边界 FULL 不为形式硬拆。

## 1. 任务清单

### `S1` {{TODO 与 plan §5 相同的合同切片 ID 与名称；单边界 FULL 写唯一责任}}

- [ ] {{TODO 本片实现工作；Setup / migration / composition 放入实际拥有它的切片}}
- [ ] Focused L1: {{TODO 本片关闭边界所需的最小 command / assertion → 映射 spec §4 obligation}}

### `S2` {{TODO 仅多边界时保留并按依赖增加；必须与 plan §5 对应}}

- [ ] {{TODO 本片实现工作}}
- [ ] Focused L1: {{TODO 本片关闭边界所需的最小 command / assertion → 映射 spec §4 obligation}}

### Verification

> 只列尚未由 slice focused L1 映射覆盖的跨切片/最终证据；若全部已覆盖，写
> `N/A(all spec §4 obligations mapped in slices)`，不要重复 checklist。输入未变化的 slice evidence
> 由 feature-done 按规则复用，不重复执行。一个 command / assertion 可映射多个相关风险且只运行一次。每个新增测试层、矩阵、fixture 或 case
> 必须覆盖现有更便宜证据未覆盖的实质风险,或满足项目/发布约定。优先扩展最近且清晰的已有测试,
> 合并重叠验证,删除只保护已取代行为的测试。测试数量和层级对称不构成质量。

- [ ] {{TODO 仅剩余跨切片/最终证据义务 → 最小 command / assertion；或改为 N/A(...)}}

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
- Review execution:`L2=<state=completed|not-run(completion preflight)|not-run(L1 prerequisite)|not-run(review-package incomplete)|invalidated(review-input drift); reviewer/mode/completion/fallback-reason when dispatched>; L3=<same shape>`
- L2:`verdict; baseline=[convention sources]; add findings/unverified/ambiguities only when non-empty` 或 `not-run(completion preflight)` 或 `not-run(L1 prerequisite)` 或 `not-run(review-package incomplete)` 或 `invalidated(review-input drift)`
- L3:`verdict; baseline=[spec path + applicable sections]; add findings/unverified/ambiguities only when non-empty` 或 `not-run(completion preflight)` 或 `not-run(L1 prerequisite)` 或 `not-run(review-package incomplete)` 或 `invalidated(review-input drift)`
- Current truth:
- Open questions:(仅非空时保留)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
