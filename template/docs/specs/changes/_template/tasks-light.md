# <NNN> <slug> — Tasks(轻车道)

> **轻车道**:用本清单承载目标、边界、约束和验证，无独立 spec.md / plan.md。分流与范围变化按 [feature-init](https://github.com/shrekshrek/project-workflow/blob/main/docs/actions/feature-init.md)。
> 清单只写 `feature-done` 运行前可完成的实施、review 或 check 结果；READY、Proof Bundle、状态写入和归档资格由 endpoint/lifecycle 记录，不写成 checkbox。

## 目标 / 边界

- 做:{{TODO 1-3 条做什么}}
- 不做:{{TODO 排除项}}
- 预期影响 / 约束:{{TODO 受影响的责任区域、必须保持的行为，以及需重新确认的实质边界变化}}
- (可选)触达的产品域:{{若改变 `docs/specs/<area>.md` 已声明行为,实施后在 `/feature-archive` 合并进 domain doc}}

## 验证(spec §4 等价 —— 不可省)

> 用最小充分证据覆盖目标、边界、实质风险和项目约定；优先复用清晰的已有测试，合并重复证据并保留有效回归覆盖。用户可见验证按最短 actor-to-result 流程优先排序。

- {{TODO 可执行/可机验的验收项}}

## Tasks

- [ ] {{TODO 按可独立实施、验证或 review 的结果组织}}

## Proof Bundle

> 由 `/project-workflow:feature-done` 填；L2/L3 是否适用按该 action 判断。完整证据留在本节，端点回复只显示摘要和链接。

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` 或 `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` (非 Git:`inputs=[explicit reviewed paths]`); `endpoint-outputs=[tasks.md receipt]`
- Checks / 轻车道验证 / 不变量反核:`<去重后的 command/assertion + 覆盖的验证项 + mode=run|same-task reuse + result + reused evidence reference when applicable>`
- Reviews:`L2/L3=<completed + verdict/baseline/exceptions | N/A/not-run/invalidated + reason>; verification=[item: PASS|FAIL]`
- Current truth:
- Open questions:(仅非空时保留)
- Next:(仅非 READY 时保留；按 blocker 或 blocker group 写 `direct-repair | spec-revise | user-decision | separate-boundary`)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
