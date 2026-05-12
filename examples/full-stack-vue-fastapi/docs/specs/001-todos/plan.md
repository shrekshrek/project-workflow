# 001 todos — Plan (HOW)

> 创建于 2026-05-12 · 基于 [`spec.md`](spec.md)

## 实施顺序

按 [workflow §8.6 后端先行](../../../../docs/workflow.md#86-全栈项目的后端先行backend-first-tactic):

1. 后端 module `backend/src/todos/` 五件套
2. Alembic 迁移
3. 后端测试(tests/todos/)
4. 前端 module `frontend/src/modules/todos/`
5. 前端路由 + layout 接入

## 后端

- 跟 `auth` module 同结构(`models.py / schemas.py / service.py / router.py`)
- `service.py` 所有函数接 `user_id` 参数,scope 到当前用户(关键安全点)
- `router.py` 端点全部依赖 `get_current_user`,不放任何无 auth 端点
- 跨用户访问别人的 todo 返回 404 而不是 403(不暴露存在性)
- 在 `main.py` `app.include_router(todos_router, ...)`(忘了注册端点 404)

## 前端

- view:`TodosView.vue`(列表 + 输入框)
- 组件:`TodoItem.vue`(单条,带 checkbox + 删除按钮)
- API:`api.ts`(`fetchTodos` / `createTodo` / `updateTodo` / `deleteTodo`)
- 类型:`types.ts` 镜像后端 schema
- 路由:`/todos`,放在 `DefaultLayout`(需登录)下,`/` 默认重定向到 `/todos`

## 不引入

- 不加 Pinia store(todo 状态只在 view 局部 ref 里,跨 view 不复用)
- 不做乐观更新(创建/删除走真实请求再更新 UI,简单)
- 不加分页(全量拉)

## 测试

- 后端:happy + 边界 + 错误路径 + 跨用户隔离(10 个用例)
- 前端:暂不加单测(view 主要是 UI 接线,业务逻辑在后端;E2E 见 backlog)

## 风险 / 注意

- **跨用户读写**:`service._get_owned_todo` 是关键防线,所有 update/delete 必须走它
- **text 空字符串**:Pydantic `Field(min_length=1)` 校验,但还要 trim 一下(前端 `text.trim()`)
- **JWT 过期**:`useApi.ts` 401 拦截器自动登出 + 跳 login,无需 view 处理
