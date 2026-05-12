# AGENTS.md

Project-level instructions for any AI coding agent (Claude Code, Codex, OpenCode, Cursor).
Claude Code reads `CLAUDE.md` which is `@AGENTS.md`(thin pointer)。

## 仓库性质

**Vue 3 + Element Plus + FastAPI 全栈脚手架**,作为 project-workflow v2 的参考实现。

- 后端跑在 Docker,前端跑在 host(享 vite HMR)
- DB:Postgres 16(docker),迁移用 Alembic,容器启动自动 `upgrade head`
- 包管理:后端 `uv`(`pyproject.toml`),前端 `pnpm`
- 反向代理:vite proxy 处理 `/api/v1/*`(本地);生产用 nginx.conf
- 这是个多 tier 项目(`backend/` + `frontend/`),根目录约定看本文件,tier 内约定看 `backend/CLAUDE.md` / `frontend/CLAUDE.md`

## 文档索引

```
README.md                  快速上手 + 命令速查
AGENTS.md                  本文件,项目级 AI 协作约定
CLAUDE.md                  thin pointer: @AGENTS.md
docker-compose.yml         postgres + backend(前端不在内)
nginx.conf                 反向代理(本地可选,生产用)
package.json               根级 pnpm scripts(orchestration)
.env.example               环境变量样板
└── backend/
    ├── AGENTS.md          后端 tier 约定(模块结构 / Pydantic / 端点规范)
    ├── CLAUDE.md          @AGENTS.md
    ├── src/{core,auth,todos,...}
    ├── alembic/           DB 迁移
    └── tests/
└── frontend/
    ├── AGENTS.md          前端 tier 约定(Composition API / Element Plus / Pinia)
    ├── CLAUDE.md          @AGENTS.md
    └── src/{router,stores,composables,modules/{auth,todos},components,layouts}
└── docs/
    ├── specs/_template/   功能 spec 三文件模板(spec / plan / tasks)
    ├── specs/<NNN>-<slug>/ 实际功能 spec
    ├── adr/               架构决策记录
    └── proposals/         待评估的 feature 提案
└── .claude/
    ├── settings.json      hook 挂载点
    ├── hooks/             PostToolUse lint-on-edit
    └── rules/             共享规则(路径级触发)
└── .github/
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

**关键依赖**(改 A 常常要同步改 B):
- `README.md` 命令清单 ↔ 根 `package.json` scripts
- `AGENTS.md` Boundaries ↔ `.claude/rules/security.md`
- 新增后端 module ↔ `src/main.py` 注册 router + alembic autogenerate
- 新增前端 module ↔ `src/router/index.ts` 注册路由 + 可能 Pinia store

## 命令速查

完整列表见 [README.md](README.md);AI 常用:

```bash
# 首次安装(注意:不是 `pnpm setup` 那是 pnpm 内置,会冲突)
cp .env.example .env
pnpm bootstrap

# 日常开发(自动 check:env + dev:down + 并行起后端 / 前端)
pnpm dev

# 卡住 / 端口冲突 / 数据脏了
pnpm cleanup        # 交互式选 down / down -v / prune

# 后端容器内操作
pnpm dev:shell      # bash
pnpm dev:psql       # 进数据库
pnpm dev:logs       # 跟日志
pnpm be:lint
pnpm be:test
pnpm be:migrate:make "<msg>"
pnpm be:migrate:up

# 前端
pnpm fe:dev / fe:typecheck / fe:lint

# 提交前
pnpm check          # 一把过
```

**命令分组约定**:
- `bootstrap` / `check:env` / `cleanup`:**生命周期**(影响整个环境)
- `dev:*`:**开发态控制**(起停、日志、shell)
- `be:*` / `fe:*`:**tier 内具体操作**
- 不要把"生命周期"操作放进 `be:*`(语义错位,见 nuxt 脚手架的`be:test` 反例 —— 那里塞了 docker compose up,违反单一职责)

## 测试

- 后端:`pytest` + `pytest-asyncio` + `httpx.AsyncClient`,覆盖率门槛 ≥ 80%
- 前端:`vitest`(单测)+ E2E 暂不在 scaffold 内(看 backlog)
- 测试不 mock 数据库:用专用 test DB(`POSTGRES_DB=app_test` 走 fixture),实测过的 schema 才进 main

## 代码修改原则(KISS + 最小变更)

- 优先编辑现有文件,不主动建新文件;新文件需有清晰理由
- 不主动写文档(`.md` / README / NOTES),除非用户明确要求
- 保持最小 diff:bug fix 不顺便重构,新 feature 不顺便清旧代码
- 不为不存在的场景加防御:框架已保证的不重校验,只在边界(用户输入 / 外部 API)做校验
- 删除即删除:不留 `// removed` 注释、不留 `_unused` 重命名

## Git Workflow

- 分支命名:`feat/<scope>` / `fix/<scope>` / `refactor/<scope>` / `docs/<scope>`
- Commit:conventional commits(`feat: ...` / `fix: ...` / `chore: ...`)
- PR 描述用 `.github/PULL_REQUEST_TEMPLATE.md`(含 proof bundle 检查项)

## Boundaries

- ✅ **Always**(允许且无需确认):
  - 加测试 / 改测试
  - 改模块内部实现(不动 schema / 不动 API 契约)
  - 写新 module(`backend/src/<name>/`,跟着 `todos/` 模板照搬即可)

- ⚠️ **Ask first**(高影响,需确认):
  - 改 API 契约(URL / 方法 / 请求体 / 响应体)
  - 加依赖(后端 `pyproject.toml` / 前端 `package.json`)
  - 加 / 改 DB 迁移
  - 改 auth / 权限逻辑
  - 改 `docker-compose.yml` / `nginx.conf` / `.env.example` 的"键名"

- 🚫 **Never**:
  - 提交 `.env*` / JWT_SECRET 真实值
  - 用 raw SQL 绕开 SQLAlchemy
  - 跳过测试(`@pytest.mark.skip` 不能 commit 进 main)
  - 在前端硬编码 backend URL(用 `VITE_API_BASE_URL`)

## 工程坑(本脚手架已避开)

scaffold-v2 在搭建过程中踩了 10 个坑,**结果就是当前这套配置**。详细见 [`../docs/gotchas.md`](../docs/gotchas.md)。**这些坑在改本脚手架时容易再次掉进去**,改之前先扫一眼:

| 文件 / 决策 | 不要改回 |
|---|---|
| 根 `package.json` 用 `bootstrap` 不用 `setup` | `pnpm setup` 是 pnpm 内置(#1) |
| `Dockerfile` 不装 apt 包 + `UV_LINK_MODE=copy` | 别照 psycopg2 习惯加 `libpq-dev`(#2) |
| `docker-compose.yml` 不设 `container_name`,顶层只有 `services:` | 自动命名才能 `--scale`(#4) |
| `pyproject.toml` 用 `pydantic[email]` | `EmailStr` 需要 extras(#6) |
| `backend/tests/conftest.py` 用 `make_url + .set()` + asyncpg 自动建 DB | URL `replace` 必崩(#7-8) |
| 测试 fixture 每请求独立 session + `TRUNCATE` autouse | 共享 session 必崩 asyncpg(#9) |
| 测试 engine `poolclass=NullPool` | 跨 event loop 必崩(#10) |
| scripts 分层(`bootstrap` / `dev:*` / `be:*`)| `be:test` 别塞起容器逻辑(#5) |

## Tier 范围速记

- **backend/**:FastAPI app,所有业务模块,数据库迁移。详见 `backend/AGENTS.md`
- **frontend/**:Vue 3 SPA,所有 UI / 路由 / 状态。详见 `frontend/AGENTS.md`
- 跨 tier feature:先 spec(`docs/specs/<NNN>-<slug>/spec.md`)→ 后端先行实现 → 前端对接(见 workflow §8.6)
