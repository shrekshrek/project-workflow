# <NNN> <slug> — Tasks(轻车道)

> **轻车道**:bugfix / polish / additive 小改,无 frozen spec.md / plan.md。判据见 [spec-driven.md §3.2.5](https://github.com/shrekshrek/project-workflow/blob/main/docs/spec-driven.md#325-入口分流先判是否需要-project-workflow)。
> ⚠️ 实施中若触达 API / DB / security / multi-tenant / evidence invariants / 跨模块契约 / 高爆破半径 → 停,补全道 spec.md。

## 目标 / 边界

- 做:{{TODO 1-3 条做什么}}
- 不做:{{TODO 排除项}}
- (可选)触达的产品域:{{若改变 `docs/specs/<area>.md` 已声明行为,实施后在 `/feature-archive` 合并进 domain doc}}

## 验证(spec §4 等价 —— 不可省)

> 轻车道砍文档仪式,**不砍验证**。列可机械验证的验收项。

- {{TODO 可执行/可机验的验收项}}

## Tasks

- [ ] {{TODO 30min-2h 颗粒度}}

## Proof Bundle

> 由 `/project-workflow:feature-done` 填。轻车道仍跑 L1 + L2 + 验证 + 不变量反核;L3 明确跳过。端点回复原样展示此 delivery receipt。

- Verdict:
- Change:`review-scope=[exact paths reviewed by L2/light verification]; base/worktree=[Git context when available]; endpoint-outputs=[tasks.md receipt]`
- Checks / 轻车道验证 / 不变量反核:`<每项 command/assertion + result>`
- Review execution:`L2=<reviewer; mode=subagent|main-session fallback; status; fallback-reason=none|exact reason>; L3=N/A(light lane)`
- L2:`verdict; findings=[rule citation or none]; applicable-rules=[source#id]; applicable-unverified=[source#id or none]; ambiguities=[item or none]`
- L3:`N/A(light lane); verification=[item#id: PASS|FAIL]`
- Current truth:
- Open questions:(仅非空时保留)
- Drift:(仅非空时保留;不会自动写入其他 ledger)
