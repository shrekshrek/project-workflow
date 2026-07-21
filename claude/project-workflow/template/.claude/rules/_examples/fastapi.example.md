---
description: FastAPI + SQLAlchemy 2.0 + Pydantic v2 detailed rules (path-scoped to backend Python)
paths:
  - "backend/**/*.py"
---

<!--
来源:此 starter 浓缩了几条社区广为采纳的 FastAPI 实践(参考 zhanymkanov/fastapi-best-practices)。
落地到具体项目时请筛 / 删 / 增,并写 docs/adr/000N-adopt-fastapi-best-practices.md 留追溯。
本文件触发条件:Claude 读取 backend/**/*.py 任一文件时自动 inject。
若 tier 命名不是 backend(如 server / api),改上方 paths 列表。
-->

# FastAPI 项目约定

> Tier-level critical rules 在 `backend/AGENTS.md § FastAPI`(< 100 行);
> 本文件是 detailed rules,path-scoped 加载,backend/*.py 编辑时才进 context。

## 路由 / 端点

- 路由分组用 `APIRouter`,顶层 `app/main.py` include;**不**在 `main.py` 直接挂端点
- 端点 verbs 用 lowercase,path 用 kebab-case(`/user-profile` 不 `/userProfile`)
- 每个 router 文件 < 200 行;超过按 sub-resource 拆分

## 输入 / 输出 schema

- 所有输入 schema 继承统一 `BaseSchema`(`model_config = ConfigDict(strict=True, extra="forbid")`)
- 用 `Field(..., min_length=N, max_length=N, pattern=...)` 显式约束,不依赖 default validation
- 输出**返回 Pydantic schema**,不直接返 ORM model(避免懒加载 + 序列化坑)

## 依赖注入

- DI 必走 `Depends()`,**禁** module-level globals(session / settings / auth)
- `Depends` 的工厂函数返回值要 typed
- 别在 `Depends` 里做重活(避免 N+1 查询);DB session 类用 `yield` 模式

## 异常处理

- 错误统一用 `HTTPException` raise + `@app.exception_handler` 集中处理
- **不** raise generic `Exception`;**不**返回 `{"error": "..."}` 字典(用 schema)
- 422 自动由 Pydantic 处理,你不要手写

## Async 纪律

- async route **仅当**真有 async I/O(asyncpg / httpx);blocking-only 端点用 sync,避免 event loop 卡
- async route 内**禁** sync I/O(`requests` / `time.sleep`);改 `httpx.AsyncClient` / `asyncio.sleep`
- 并发用 `asyncio.gather`,不串行 `await`

## ORM(SQLAlchemy 2.0)

- 用 `select()` / `scalars()` / `session.execute()`,**禁** 1.x `Query.filter`
- `AsyncSession` 透传到 service 层,**不** module-level global
- Relationship 懒加载在 async context 会炸,改 `selectinload()` / `joinedload()` 显式 eager
- Session 走 DI(`Depends(get_session)`),每请求独立

## Settings / Config

- 使用 `pydantic-settings` 的 `BaseSettings` 子类,走 `@lru_cache` 单例
- Settings 通过 DI 注入(`Depends(get_settings)`),**不** import-time read 环境变量
- 敏感字段(secret key / API key)用 `SecretStr` 类型

## Lifespan / 启停

- 启停逻辑用 `lifespan` async context manager,**禁**废弃的 `@app.on_event("startup"/"shutdown")`
- 数据库连接池 / 后台任务 / 外部客户端(若引入 cache / 消息中间件,见 ADR)都在 lifespan 起停

## 测试

- 用 `httpx.AsyncClient` 打 ASGI in-process,**不**起真服务器
- 每个 endpoint 至少 1 happy + 1 边界 + 1 错误路径(401 / 404 / 422)
- DB 测试用独立 schema 或 transactional rollback,**不**共享 prod schema
