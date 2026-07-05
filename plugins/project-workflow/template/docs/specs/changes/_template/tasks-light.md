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

> 由 `/project-workflow:feature-done` 填。轻车道:跑 L1 + L2 + 验证 + 不变量反核;L3 因无 frozen spec 跳过。

- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:`<X>/<Y>` passed, coverage `<Z>%`
- [ ] L1 合规
- [ ] L2 合规(若触动 A 类约定)
- [ ] 验证项全过
- [ ] 不变量反核:实际 diff 未触达项目声明的灾难性不变量路径(否则误分类,应改全道)
- [ ] 开放问题(如有)
