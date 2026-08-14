# <NNN> <slug> — Tasks(轻车道)

> **轻车道**:bugfix / polish / additive 小改,无 frozen spec.md / plan.md。判据见 [spec-driven.md §3.2.5](https://github.com/shrekshrek/project-workflow/blob/main/docs/spec-driven.md#325-入口分流先判是否需要-project-workflow)。
> ⚠️ 实施中若触达 API / DB / security / multi-tenant / evidence invariants / 跨模块契约 / 高爆破半径,或出现边界外 outcome/能力 → 在继续写代码、测试、migration 或兼容层前停。报告 delta、当前必要性和推荐方向;只有方向确需用户决定时一次问一个问题。需要时升级 full lane,不得因已写代码自动收编。

## 目标 / 边界

- 做:{{TODO 1-3 条做什么}}
- 不做:{{TODO 排除项}}
- 预期影响 / 熔断:{{TODO 责任区域及任何 API/DB/security/multi-tenant/evidence/跨模块/高爆破半径触发;触发后停止并升级}}
- (可选)触达的产品域:{{若改变 `docs/specs/<area>.md` 已声明行为,实施后在 `/feature-archive` 合并进 domain doc}}

## 验证(spec §4 等价 —— 不可省)

> 轻车道只保留可追溯到目标/边界/项目约定的最小交付证据,不从通用习惯派生未声明输入、边界或错误 case。每个新增测试层/矩阵/fixture/case 必须覆盖更便宜证据尚未覆盖的实质风险或满足项目/发布约定;优先扩展最近的已有测试并合并重叠验证。用户可见 outcome 在已有义务中恰好标一个 `Primary flow`,只决定 preflight 顺序;测试数量和层级对称不构成质量。

- {{TODO 可执行/可机验的验收项}}

## Tasks

- [ ] {{TODO 仅在工作可独立实施、验证或 review 时拆分;不要按预计时长或测试 case 机械拆分}}

## Proof Bundle

> 由 `/project-workflow:feature-done` 填。轻车道跑 L1 + 验证 + 不变量反核;L2 按风险触发,L3 明确跳过。完整证据留在本节，端点回复只显示摘要和链接。

- Verdict:
- Change:`git=[base=<commit SHA>; reviewed=<commit SHA>; dirty=no]` 或 `git=[base=<commit SHA>; reviewed=worktree; dirty=yes]` (非 Git:`inputs=[explicit reviewed paths]`); `endpoint-outputs=[tasks.md receipt]`
- Checks / 轻车道验证 / 不变量反核:`<去重后的 command/assertion + 覆盖的验证项 + mode=run|same-task reuse + result + reused evidence reference when applicable>`
- Review execution:`L2=<reviewer; mode=fresh-subagent|result-reuse|main-session fallback; status; fallback-reason=none|exact reason>|N/A(low-risk light lane; no L2 trigger after convention-scope triage)|not-run(completion preflight)|not-run(L1 prerequisite when otherwise applicable); L3=N/A(light lane)|not-run(completion preflight)`
- L2:`verdict + baseline; add findings/unverified/ambiguities only when non-empty` 或 `N/A(low-risk light lane; no L2 trigger after convention-scope triage)` 或 `not-run(completion preflight)` 或 `not-run(L1 prerequisite)`
- L3:`N/A(light lane); verification=[item#id: PASS|FAIL]` 或 `not-run(completion preflight)`
- Current truth:
- Open questions:(仅非空时保留)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
