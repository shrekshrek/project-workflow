# backend/AGENTS.md

Tier 级 AI 协作约定。父级:`../AGENTS.md`(项目级)。

## Tier 范围

FastAPI 应用,所有业务模块、数据库迁移、API 端点。**不涉及**前端代码。

## 模块结构(必须遵守)

每个业务 module 在 `src/<name>/` 下,固定五件套:

```
src/<name>/
├── __init__.py
├── models.py     # SQLAlchemy ORM 模型(只在此 declare)
├── schemas.py    # Pydantic v2 模型(请求 / 响应)
├── service.py    # 业务逻辑,纯函数风格,接受 db session + 参数
├── router.py     # FastAPI APIRouter,只做参数解析 + 调 service
└── deps.py       # (可选)依赖项:auth、permission check
```

**分离纪律**:
- `router.py` **不写业务**(不直接查 DB,调 service)
- `service.py` **不依赖 FastAPI**(纯 Python,可被任何调用方复用)
- `models.py` 不依赖 `schemas.py`,反之亦然
- 跨 module 调用 **只通过 service.py 暴露的函数**,不直接 import 别人的 `models`

## Pydantic 约定

- 全部用 v2 语法
- 所有请求 / 响应模型继承 `src.core.schemas.BaseSchema`(里面统一配 `model_config`)
- 字段必须有 type hint;时间用 `datetime`,不用 `str`
- 不在 schema 里放业务逻辑(校验除外);需要计算的字段放 service

## API 端点规范

每个 endpoint **必须**带:

```python
@router.post(
    "/todos",
    response_model=TodoResponse,         # ✅ 显式 response_model
    status_code=status.HTTP_201_CREATED, # ✅ 显式 status_code
    summary="创建 TODO",                  # ✅ summary(给 /docs 看)
    tags=["todos"],                      # ✅ tags(分组)
)
async def create_todo(
    payload: TodoCreate,
    user: User = Depends(get_current_user),  # ✅ 显式拿 user
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    ...
```

## 数据库 / 迁移

- 用 SQLAlchemy 2.0 async API(`AsyncSession`,`select()` 而非 `query()`)
- **从不**用 `db.query(Model)`(那是 1.x 风格)
- 迁移走 Alembic:`pnpm be:migrate:make "<msg>"` 生成,人审一遍再 commit
- 迁移文件名:`YYYY_MM_DD_HHMM_<slug>.py`(`alembic.ini` 已配)
- 容器启动自动 `upgrade head`(看 `../docker-compose.yml` 的 backend command)

## 注册路由

新增 module 后:**必须**在 `src/main.py` import 并 `app.include_router(<name>_router)`。
忘了注册端点 404,这是最常见 gotcha。

## 测试

- `tests/` 镜像 `src/` 结构
- `conftest.py` 提供 `client`(httpx AsyncClient)+ `db`(事务 fixture,自动 rollback)
- 每个端点至少:happy + 1 边界 + 1 错误路径(401 / 404 / 422)
- 跑:容器内 `pytest`(`pnpm be:test`)

## 命令(容器内)

```bash
# 在 host 上跑(常用)
pnpm be:lint        # ruff check --fix
pnpm be:test
pnpm be:migrate:make "add_xxx"
pnpm be:migrate:up

# 进容器
pnpm be:shell
> uv run pytest -k test_login
> uv run alembic history
```

## Boundaries(覆盖父级)

- ✅ 加 module(跟着 `todos/` 照搬五件套)
- ⚠️ 改 `core/db.py` / `core/config.py` / `main.py` 中间件栈
- 🚫 改 auth 算法(JWT / bcrypt rounds)不 ask 不动
