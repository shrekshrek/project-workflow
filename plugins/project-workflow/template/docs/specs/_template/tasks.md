# <NNN> <slug> — Tasks

> 基于 plan.md。颗粒度 30 分钟 - 2 小时,实施时勾选 + 加注。

## 1. 任务清单

### Setup(若 plan 标注新增模块)
- [ ] 建 `<tier>/<module-path>/` 目录
- [ ] 五件套文件(`{__init__,models,schemas,service,router}.py` 或 tier 等价)
- [ ] 注册 router 到 `main.py` / wire into app
- [ ] Alembic migration(若改 DB schema)

### Backend
- [ ] {{TODO 拆 30min-2h 颗粒度}}

### Frontend(若适用)
- [ ] {{TODO}}

### Tests
- [ ] {{TODO 单测}}
- [ ] {{TODO 集成 / e2e}}

### Acceptance
- [ ] spec §4 Verification 全部 pass
- [ ] Proof bundle 就绪(`/project-workflow:proof-bundle`)

## 2. 实施记录

> 实施中的偏差 / 补充决策 / 临时方案。**不改 spec.md**;plan.md 有补充则在 plan 加注。

- {{YYYY-MM-DD: 偏差描述}}

## Proof Bundle

> 由 `/project-workflow:proof-bundle` 填。本节实施前留占位,完成后由 skill 写入。

- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:`<X>/<Y>` passed, coverage `<Z>%`
- [ ] L1 合规
- [ ] L2 合规(reviewer 提供 AGENTS.md 作 context 跑过)
- [ ] L3 合规(reviewer 提供 spec.md 作 context 跑过)
- [ ] AGENTS.md 实际改动审计(item 5a)
- [ ] AGENTS.md drift 建议(item 5b)
- [ ] 开放问题(如有)
