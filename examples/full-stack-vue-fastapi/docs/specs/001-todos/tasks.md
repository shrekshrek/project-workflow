# 001 todos — Tasks (STEPS)

> 创建于 2026-05-12 · 基于 [`spec.md`](spec.md) + [`plan.md`](plan.md)
> 状态:**全部完成,随 scaffold-v2 第一版交付**

## 任务清单

### 后端

- [x] 创建 `backend/src/todos/{models,schemas,service,router}.py`(1h)
- [x] Alembic migration `2026_05_12_0001_initial.py`(含 users + todos)(0.5h)
- [x] 在 `src/main.py` 注册 `todos_router`(0.1h)
- [x] 单元测试 `tests/todos/test_router.py`(10 用例)(1h)

### 前端

- [x] 创建 `frontend/src/modules/todos/{types,api,TodoItem,TodosView}.{ts,vue}`(1.5h)
- [x] 在 `src/router/index.ts` 注册 `/todos` 路由(0.2h)
- [x] 在 `DefaultLayout.vue` 显示当前用户 + 退出按钮(0.3h)

### 验收

- [x] 后端 `pytest` 全绿
- [x] 前端 `vue-tsc --noEmit` 通过
- [x] 手动跑通 register → login → todos CRUD(浏览器)

**实际总时间**:~4h

---

## 实施记录

- 2026-05-12: 首版随 scaffold-v2 一起交付。auth + todos 一并完成。
- 2026-05-12: `service._get_owned_todo` 跨用户查询返回 404 而非 403,避免 enumeration(spec §5 错误码也同步)

---

## Proof Bundle

- **Diff 摘要**:新建 `backend/src/todos/`(4 文件)+ `backend/tests/todos/test_router.py`(10 用例)+ `frontend/src/modules/todos/`(4 文件)+ 路由注册
- **Tests**:10/10 passed(后端),前端无单测(见 plan.md 决定),fe:typecheck 通过
- **L2 合规**:遵循 `backend/AGENTS.md` 模块五件套约定,Pydantic 端点规范
- **L3 合规**:遵循 spec.md API 契约;跨用户隔离测试覆盖
- **AGENTS.md drift 建议**:无
- **开放问题**:无
