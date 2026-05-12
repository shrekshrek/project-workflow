# scaffold-v2

Vue 3 + Element Plus + FastAPI 全栈脚手架。
作为 [project-workflow v2](../docs/workflow.md) 的参考实现 —— 把方法论搬到真实工程里跑一遍。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Vue 3 + Vite + TypeScript + Vue Router + Pinia + Element Plus |
| 后端 | FastAPI + SQLAlchemy 2.0 (async) + asyncpg + Alembic + Pydantic v2 |
| 数据库 | Postgres 16(docker) |
| 包管理 | 后端 `uv`,前端 `pnpm` |
| 容器 | Docker Compose(后端 + db 在 docker,前端 host) |
| 反向代理 | Nginx(可选 / 生产);本地走 vite proxy |
| 认证 | JWT (HS256) + bcrypt;**邮箱验证 / 密码重置在 Tier 2,见 [backlog](../docs/backlog.md)** |

## 快速上手

```bash
# 1. 配环境变量
cp .env.example .env
# 至少改 JWT_SECRET。COMPOSE_PROJECT_NAME 多项目并行时改成独有的名

# 2. 一次性安装(命名为 bootstrap 是为避开 pnpm 内置 `pnpm setup` 命令)
pnpm bootstrap

# 3. 起开发环境(自动 check:env → dev:down → 并行起后端容器 + 前端)
pnpm dev

# 4. 验证
# - 后端 API 文档:  http://localhost:8000/docs
# - 前端开发服务器: http://localhost:5173
```

## 命令速查

### 生命周期 / 开发
| 命令 | 作用 |
|---|---|
| `pnpm bootstrap` | 首次安装(根 deps + 前端 deps + docker build) |
| `pnpm dev` | 启动(自动校验 .env + 清掉残余 + 并行起后端 + 前端) |
| `pnpm dev:build` | 同上但 `--build`(改了 Dockerfile / pyproject 用) |
| `pnpm dev:down` | 停掉后端容器(保留数据卷) |
| `pnpm dev:logs` | 跟随后端日志 |
| `pnpm dev:shell` | 进后端容器 bash |
| `pnpm dev:psql` | 进 postgres 容器的 psql |
| `pnpm cleanup` | **交互式** Docker 清理(列出 / down / down -v / prune) |
| `pnpm check:env` | 只跑 .env 校验(被 dev / bootstrap 自动调) |

### 后端
| 命令 | 作用 |
|---|---|
| `pnpm be:lint` / `be:format` | ruff |
| `pnpm be:test` / `be:test:cov` | pytest |
| `pnpm be:migrate:make "<msg>"` | autogen migration |
| `pnpm be:migrate:up` / `migrate:down` | 升 / 退一级 |
| `pnpm be:add <pkg>` | 容器内 uv add |

### 前端
| 命令 | 作用 |
|---|---|
| `pnpm fe:dev` / `fe:build` / `fe:preview` | Vite |
| `pnpm fe:typecheck` | vue-tsc |
| `pnpm fe:lint` | eslint |
| `pnpm fe:add <pkg>` | 前端目录加包 |

### 组合
| `pnpm check` | 提交前一把过(be:lint + be:test + fe:typecheck + fe:lint) |

## 目录结构

详细看 [AGENTS.md](AGENTS.md) 的「文档索引」段。

## 第一个 feature

`docs/specs/001-todos/`(POST/GET/DELETE),走完整 spec-driven 流程。看 spec.md 了解需求,看 plan.md 了解实现思路,看 tasks.md 了解执行步骤。

## 已知限制(第一版)

- ❌ 邮箱验证:Tier 2 feature,见 [docs/proposals/email-verification.md](docs/proposals/email-verification.md)
- ❌ 密码重置:同上
- ❌ Social login(GitHub / Google OAuth):不在 scaffold 范围
- ❌ Redis / Celery 任务队列:第一版不上,业务用上再加
- ❌ E2E 测试基建:见 backlog
