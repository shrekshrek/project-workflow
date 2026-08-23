# <NNN> <slug> — Tasks

> 基于 plan.md。按可独立实施、验证或 review 的结果组织，实施时勾选 + 加注。
> 实施中发现未声明的实质边界变化，或继续推进可能做错目标、让项目走向实质不同方向时，先停下会加深返工的工作，说明顾虑、当前必要性和建议，只问恢复所需的问题。契约或边界改变走 Scope Stop / spec-revise。已确认选择通常沿用；只有新证据或新发现的重要后果使当前建议发生实质变化时，才说明原因并重新沟通。普通实施细节继续，已经写出的代码不构成收编理由。
> 在真实依赖或风险检查点，完成当前阶段、运行最小相关检查并记录结果，再进入依赖工作。
> L2/L3 与 Proof Bundle 由 `feature-done` 执行；material delta 触发 Scope Stop。
> 清单只写 `feature-done` 运行前可完成的实施、review 或 check 结果；READY、Proof Bundle、状态写入和归档资格由 endpoint/lifecycle 记录，不写成 checkbox。

## 1. 任务清单

### Setup(仅当 plan 标注新增 component/module)

- [ ] 建 `<component-or-tier>/<module-path>/` 及该栈所需的最小入口文件
- [ ] 接入父级 composition/registration point
- [ ] 若 plan 明确包含持久化结构变化,添加并验证对应 migration

### `<可验证阶段或 component>`

- [ ] {{TODO 按可独立实施或验证的结果分组；每组关闭一个可检查结果}}
- [ ] Focused check: {{TODO 当本阶段存在依赖消费者时，写最小 command / assertion → 映射 spec §4 obligation；否则与最终 Verification 合并}}

### Verification

> 只列尚未由阶段检查覆盖的跨阶段/最终证据；若全部已覆盖，可删除本节或自然说明无额外最终证据，不要重复 checklist。输入未变化的阶段证据
> 由 feature-done 按规则复用，不重复执行。一个 command / assertion 可映射多个相关风险且只运行一次。每个新增测试层、矩阵、fixture 或 case
> 必须覆盖现有更便宜证据未覆盖的实质风险,或满足项目/发布约定。优先扩展最近且清晰的已有测试,
> 合并重叠验证,删除只保护已取代行为的测试。测试数量和层级对称不构成质量。

- [ ] {{TODO 仅剩余跨阶段/最终证据义务 → 最小 command / assertion}}

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
- Reviews:`L2=<completed + verdict/baseline/exceptions | N/A/not-run/invalidated + reason>; L3=<same shape>`
- Current truth:
- Open questions:(仅非空时保留)
- Next:(仅非 READY 时保留；按 blocker 或 blocker group 写 `direct-repair | spec-revise | user-decision | separate-boundary`)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
