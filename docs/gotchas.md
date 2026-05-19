# 工程陷阱清单

> 跨工具、跨语言的"AI / 工程师容易踩"的工程坑。每条都来自一个真实 fullstack 项目搭建过程中的故障(2026-05-12 集中梳理),反例 → 正例 → 为什么。
>
> **怎么用**:新项目 P0 阶段扫一遍;AGENTS.md 可以 `@imports` 引用本文件让 AI 读到。

## 📋 内容范围(stack 覆盖度)

每条坑标 **🌐 通用** / **🐍 Python+FastAPI** / **📦 Node/TS** 等标签。**只看跟自己栈相关的**。当前内容偏 Python+FastAPI(plugin 早期主要在该栈实证落地),其他栈陆续补:

| 章节 | 适用 stack |
|---|---|
| #1 `pnpm setup` 覆盖 script | 📦 Node/TS pkg-mgr |
| #2 `asyncpg` libpq-dev | 🐍 Python + PostgreSQL |
| #3 `PROJECT_NAME` 端口冲突 | 🌐 Docker |
| #4 `container_name` vs `name:` | 🌐 Docker |
| #5 scripts 命名分层 | 🌐 Monorepo / `package.json` scripts |
| #6 Pydantic v2 extras | 🐍 Python |
| #7 URL replace | 🐍 Python + asyncpg |
| #8 测试 DB"不存在就建" | 🌐 通用思路 / 例子用 Python |
| #9 FastAPI + asyncpg 测试 session | 🐍 Python + FastAPI |
| #10 测试 engine NullPool | 🐍 SQLAlchemy + asyncio |
| #11 Go 专属坑(待补) | 🐹 Go |
| #12 React/Next 专属坑(待补) | ⚛️ React |

> **Go / Rust / Java / TypeScript-React 项目用户**:本文件目前只能给 #1 / #3 / #4 / #5(部分) / #8 4 条提供价值。**stack-specific 坑欢迎 PR 到 plugin 仓库** —— 真实搭建过程中踩到的坑,反例 → 正例 → 为什么,各 5-10 条即可。

---

## 1. `pnpm setup` 是 pnpm 内置命令,会覆盖你的 npm script

> 适用 stack:**📦 Node/TS**(用 pnpm 作 package manager 的项目)

**反例**(项目第一版踩了):
```json
{ "scripts": { "setup": "pnpm install && docker compose build" } }
```
用户跑 `pnpm setup` → pnpm 跑内置 setup(配置 pnpm 本身的 PATH),**根本不调你的 script**,返回 `Already up to date`,用户以为装完了。

**正例**:
```json
{ "scripts": { "bootstrap": "pnpm install && docker compose build" } }
```

**为什么**:pnpm 部分命令(`setup` / `start` / `test` / `publish` / `init` / `link` 等)是内置的,优先级高于 user script。即使 `pnpm run setup` 能强制走 script,**起名时避开内置词**更稳。

**通用规则**:orchestration 脚本用非歧义命名(`bootstrap` / `cleanup` / `dev:*` / `tools:*`)。

---

## 2. `asyncpg` 不需要 `libpq-dev` —— 别照 `psycopg2` 习惯装 apt 包

> 适用 stack:**🐍 Python + PostgreSQL**

**反例**:
```dockerfile
FROM python:3.12-slim
RUN apt-get update && apt-get install -y build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*
RUN uv sync
```
浪费 5-10 分钟构建时间 + 镜像膨胀 200MB+,还容易踩 mirror 抖动(`unexpected EOF`)。

**正例**:
```dockerfile
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_LINK_MODE=copy
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev
```

**为什么**:
- `asyncpg` 自带 PG 客户端实现(纯 Python + Cython),**不链接系统 libpq**(跟 `psycopg2` 不同)
- `pydantic-core` / `bcrypt` / `cryptography` 全有 manylinux + macOS arm64 wheel
- **先不装,缺什么 uv sync 报错再补**

**Dockerfile 额外优化**(在 FastAPI + Nuxt 4 项目里验证过):
- `UV_LINK_MODE=copy` —— 消除 `hardlink failed, falling back to copy` 警告(host fs 跟容器 fs 不同时 hardlink 失败)
- `--mount=type=cache,target=/root/.cache/uv` —— 重 build 用缓存,需要 `# syntax=docker/dockerfile:1.7` 启 BuildKit
- `PYTHONDONTWRITEBYTECODE=1` —— 容器里 `.pyc` 没用,挂载性能更好
- `PYTHONUNBUFFERED=1` —— log 实时不缓冲

---

## 3. `PROJECT_NAME` 隔离不解决 host 端口冲突

> 适用 stack:**🌐 Docker / docker-compose**(任何栈)

**反例**:依赖 `COMPOSE_PROJECT_NAME` 隔离多项目,然后默认 5432/8000 标准端口。两个项目同时跑 → host 端口 `0.0.0.0:5432 already allocated`。

**为什么不解决**:Docker Compose 的 project name 只隔离**容器名 / 卷名 / 网络名**,host 端口绑定是全局资源,任何项目占了端口其他人都进不来。

**两种应对**:
- **A. 用户自治**:文档明确"默认占 5432/8000,多项目并行时改 `.env`",简单
- **B. 默认非标**:`POSTGRES_PORT=5433`、`BACKEND_PORT=8001`,出问题概率低但跟习惯不符

**容器内连接走 docker 内网**:`DATABASE_URL` 用服务名 `postgres:5432`(容器内永远 5432),只有 host 端映射可变。改 host 端口**不影响后端连不连得上 DB**。

**集中配置**:`vite.config.ts` 的 proxy / 前端 base URL 都该从 `.env`(`VITE_API_BASE_URL`)读,**避免散落**(端口改一处别处忘改)。

---

## 4. 别手设 `container_name`,用顶层 `name:`

> 适用 stack:**🌐 Docker / docker-compose**(任何栈)

**反例**:
```yaml
services:
  postgres:
    container_name: ${PROJECT_NAME}_postgres
  backend:
    container_name: ${PROJECT_NAME}_backend
```
结果 Docker Desktop 里显示 `myapp > myapp_postgres-1`,**项目名前缀被重复了两次**,而且锁死了 `--scale` 能力。

**正例**:
```yaml
name: "${COMPOSE_PROJECT_NAME:-myapp}"   # 顶层项目名(compose v2.x 新语法)

services:
  postgres:                              # 服务名干净,别加 _db 后缀
    image: postgres:16-alpine
    # 无 container_name,docker-compose 自动命名为 myapp-postgres-1
  backend:
    # 无 container_name
```

**为什么**:
- docker-compose 自动用 `<project>-<service>-<index>` 命名,UI 自动按 project 分组
- 自动命名支持 `docker compose up --scale backend=3`,手设的 `container_name` 不行(名字得唯一)
- 服务名是逻辑命名(`postgres` 比 `postgres_db` 更直接,`_db` 后缀冗余)

---

## 5. scripts 命名要分层,生命周期和 tier 内操作不要混

> 适用 stack:**🌐 Monorepo / `package.json` scripts**(例子用 Node,思路通用 Makefile / justfile / Taskfile)

**反例**(一个 FastAPI + Nuxt 4 项目里的真实代码):
```json
{
  "be:test": "docker-compose up -d postgres_db redis && sleep 2 && pnpm be:test:setup && cd backend && uv run pytest"
}
```
`pnpm be:test` 暗中起容器 + sleep 2 + setup + 切目录 + 跑测试。用户跑完离开,**容器还在后台跑**,他不知道。违反单一职责。

**正例**:
```json
{
  "//--- Lifecycle ---": "",
  "bootstrap": "pnpm install && pnpm check:env && docker compose build",
  "cleanup": "tsx scripts/cleanup-docker.ts",

  "//--- Dev ---": "",
  "dev": "pnpm check:env && pnpm dev:down && concurrently ...",
  "dev:down": "docker compose down --remove-orphans",
  "dev:logs": "docker compose logs -f backend",
  "dev:shell": "docker compose exec backend bash",
  "dev:psql": "docker compose exec postgres psql ...",

  "//--- Backend (假设容器已起) ---": "",
  "be:test": "docker compose exec backend uv run pytest",
  "be:lint": "docker compose exec backend uv run ruff check --fix"
}
```

**约定**:
- `bootstrap` / `check:env` / `cleanup` = **整个环境的生命周期**(影响所有服务)
- `dev:*` = **开发态控制**(起停、日志、shell)
- `be:*` / `fe:*` = **tier 内具体操作**,假设容器已起,**不主动启**

**Hack 技巧**:用 `"//--- Group ---": ""` 注释 key 在 `package.json` 视觉分组(pnpm/npm 会忽略 key 开头是 `//` 的 script)。

---

## 6. Pydantic v2 特殊类型有隐式 extras 依赖

> 适用 stack:**🐍 Python + Pydantic v2**

**反例**:
```toml
dependencies = ["pydantic>=2.10.0"]
```
```python
from pydantic import EmailStr
class RegisterRequest(BaseModel):
    email: EmailStr  # ← 运行时报 ImportError: email-validator is not installed
```
错误只在导入模型时才暴露,uv sync 不会警告,本地 dev 第一次跑容器才挂。

**正例**:
```toml
dependencies = ["pydantic[email]>=2.10.0"]
```

**Pydantic v2 常见 extras 对照**:

| 类型 | 需要 extras | 缺了的症状 |
|---|---|---|
| `EmailStr` | `pydantic[email]` → 拉 `email-validator` | `ImportError: email-validator is not installed` |
| `HttpUrl` / `AnyUrl` | (内置,无 extras) | — |
| `SecretStr` / `SecretBytes` | (内置) | — |
| `Color`(已弃用) | `pydantic-extra-types` + `pydantic-extra-types[color]` | — |
| `PaymentCardNumber` | `pydantic-extra-types[payment]` | — |

**AGENTS.md 应该写**:"用了 Pydantic 特殊类型,检查 pyproject.toml 是否带对应 `[extras]`"。

---

## 7. 别用字符串 `replace` 改 URL

> 适用 stack:**🐍 Python + asyncpg**(思路通用:driver-specific URL scheme 处理)

**反例**(测试 conftest 第一版):
```python
test_url = settings.DATABASE_URL.replace("/app", "/app_test")
```
原 URL:`postgresql+asyncpg://app:pass@postgres:5432/app`
`/app` 出现两次:一是 `://app:` 里的 `/`+`app`(用户名前缀),二是 `:5432/app`(数据库名)。
`.replace` 全替换 → `postgresql+asyncpg:/app_test:pass@postgres:5432/app_test`,**用户名也被换了**,后端报 `password authentication failed for user "app_test"`。

**正例**:用框架的 URL parser
```python
from sqlalchemy.engine.url import make_url

base_url = make_url(settings.DATABASE_URL)
test_url = base_url.set(database=f"{base_url.database}_test")
```

JS 等价:`const url = new URL(baseUrl); url.pathname = '/app_test'`

**通用规则**:**任何结构化字符串(URL / 路径 / SQL identifier / regex)都不能用 `str.replace`** —— 用 parser。

---

## 8. 测试数据库要"不存在就建",别假设它已存在

> 适用 stack:**🌐 通用思路 / 例子用 Python**(任何用 DB 的测试基建都适用)

**反例**:conftest 直接连 `<db>_test`,数据库没建就报 `database "app_test" does not exist`。

**正例**(asyncpg 直连 default `postgres` 库自动建):
```python
async def _ensure_test_database(url, test_db_name):
    admin = await asyncpg.connect(
        user=url.username, password=url.password,
        host=url.host, port=url.port,
        database="postgres",  # 连默认管理库
    )
    try:
        exists = await admin.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", test_db_name)
        if not exists:
            # CREATE DATABASE 不允许参数化,用双引号 quote
            await admin.execute(f'CREATE DATABASE "{test_db_name}"')
    finally:
        await admin.close()
```

**前提**:docker postgres 镜像把 `POSTGRES_USER` 设为 superuser,所以应用 user 有 CREATEDB 权限。生产环境分离的应用 user / 管理 user 时,test 走管理 user。

---

## 9. FastAPI + asyncpg 测试模式 —— 共享 session 是病灶

> 适用 stack:**🐍 Python + FastAPI + asyncpg + SQLAlchemy**

**反例**:fixture 创建单个 `db_session`,覆盖 `get_db` 让所有请求共用它,期望"测试结束 rollback 整个 connection"。
```python
@pytest_asyncio.fixture
async def client(db_session):
    async def _override_get_db():
        yield db_session    # 所有请求共享同一 session
    app.dependency_overrides[get_db] = _override_get_db
```
症状:`InterfaceError: cannot perform operation: another operation is in progress`。
原因:asyncpg connection 一时刻只能处理一个 op,`session.commit()` 异步收尾未完,下个请求又上了。

**正例**(每请求独立 session + TRUNCATE 清表):
```python
@pytest_asyncio.fixture(scope="session")
async def session_factory(test_engine):
    return async_sessionmaker(bind=test_engine, expire_on_commit=False)

@pytest_asyncio.fixture(autouse=True)
async def _truncate_tables(session_factory):
    """每测试前清空所有表 —— autouse,不用 require。"""
    async with session_factory() as session:
        tables = ", ".join(f'"{t.name}"' for t in reversed(Base.metadata.sorted_tables))
        if tables:
            await session.execute(text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE"))
            await session.commit()

@pytest_asyncio.fixture
async def client(session_factory):
    """让每个请求拿独立 session(贴近生产)。"""
    async def _override_get_db():
        async with session_factory() as session:
            yield session
    app.dependency_overrides[get_db] = _override_get_db
    ...
```

**为什么**:
- 生产中每请求就是独立 session(FastAPI `Depends(get_db)` 每次新建),测试应该完全模拟
- `TRUNCATE ... RESTART IDENTITY CASCADE` 是 Postgres 原生最快清理(<1ms,重置自增 id,处理外键)
- `autouse=True` 让所有测试自动享受,不用每个测试 require fixture

---

## 10. 测试 engine 必须用 `NullPool` —— 否则跨 event loop 必崩

> 适用 stack:**🐍 Python + SQLAlchemy + asyncio**

**反例**(承接 9 修对了之后还会崩):
```python
@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(test_url, echo=False)  # 默认 QueuePool
    yield engine
```
症状:`RuntimeError: Task ... got Future ... attached to a different loop`。
原因:`pytest-asyncio` 默认每测试一个 event loop,session-scoped engine 的连接池在第一个 loop 创建连接,第二个测试在另一个 loop 复用同一连接 → asyncpg 的 Future 绑死在旧 loop,新 loop 一 await 就崩。

**正例**:
```python
from sqlalchemy.pool import NullPool

engine = create_async_engine(test_url, poolclass=NullPool)
```

**为什么 NullPool**:不缓存连接,每次 `engine.connect()` 都新开。新开的连接 + asyncpg 内部 Future **绑定到当前 event loop**,跨 loop 问题根除。

**生产别用 NullPool**:每请求新开连接的握手开销 >10ms,QPS 上去性能拉胯。**这是测试专属配置**。

**配套配置**(`pyproject.toml`):
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "session"  # session-scoped 异步 fixture 必须配
```

---

## 11. Go 专属坑(待补充)

> 适用 stack:**🐹 Go**

<!-- TODO(plugin maintainer / 社区 PR):补充 Go 真实搭建过程踩到的坑。预期主题:
- goroutine leak(`go func()` 漏 cancel)
- channel send / receive 死锁
- `defer` 在 for loop 内(资源延迟到函数返回)
- nil interface vs nil pointer 比较陷阱
- `context.Context` 传递不完整
- module path 跟 import path 不一致
- `go.mod` `replace` directive 滥用
- 并发 map 写需要 sync.Map / mutex
- HTTP client 不复用导致连接泄漏
- testing 包 -race 检测器没启用 -->

每条按 反例 → 正例 → 为什么 格式。社区 PR 欢迎。

## 12. React / Next.js 专属坑(待补充)

> 适用 stack:**⚛️ React / Next.js**

<!-- TODO(plugin maintainer / 社区 PR):补充 React+Vite / Next.js 真实搭建坑。预期主题:
- `useEffect` 漏 deps 导致 stale closure
- Strict Mode 双调用 effect 时副作用没幂等
- `key={index}` 列表渲染错位
- 状态 batching 假设错误(React 18 自动批处理)
- Next.js App Router vs Pages Router 心智混淆
- `'use client'` / `'use server'` 边界
- TanStack Query staleTime 默认 0 导致频繁 refetch
- Tailwind purge 漏 dynamic class name
- Vite HMR 不刷新某些边界(全局 store) -->

每条按 反例 → 正例 → 为什么 格式。社区 PR 欢迎。

## 跨条总结(怎么避免下次再踩)

1. **命名避开内置词**:`pnpm setup` / `npm test` / `git init` —— 起名前先问"是不是内置"
2. **结构化字符串别 `str.replace`**:URL / 路径 / SQL 用 parser
3. **不存在就建,别假设**:test DB / config 目录 / log 文件
4. **资源生命周期清晰**:scripts 谁起、谁停、谁清,**别在 "tier 内操作"里偷偷起服务**
5. **测试模拟生产**:每请求独立 session,Postgres 原生 TRUNCATE 清表
6. **跨 loop 资源用 NullPool**:asyncpg + pytest 必踩,提前预防
7. **依赖的隐式 extras 写明**:Pydantic / requests 等的 `[email]` `[security]` 别等运行时才发现
8. **Docker 优化**:`UV_LINK_MODE=copy` + `cache mount` + `PYTHONUNBUFFERED=1`,小改一倍构建速度
