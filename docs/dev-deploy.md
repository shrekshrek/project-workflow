# 本地开发与同步发布

> [README 议题 4](../README.md#4-本地开发与同步发布) 的详细文档。
>
> 适用场景:单服务器 / 小规模生产 / 单人或小团队。**不适用**:K8s 集群、多 region、企业级 CI/CD。
>
> 实证基础:[`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4)(Nuxt 4 版,生产实证)。
>
> **配套**:具体的工程踩坑清单见 [`gotchas.md`](gotchas.md) —— Docker / pnpm / Pydantic / 测试基建 共 10 条。

---

## 当前架构

```
┌────────────────────┐    GitLab CI    ┌────────────────────┐
│   本地开发机        │  ───────────>   │   生产服务器        │
│                    │                  │                    │
│  pnpm dev:         │                  │  docker-compose    │
│  ┌──────────────┐  │                  │  -f .prod.yml      │
│  │ 前端原生      │  │   prod:deploy   │  ┌──────────────┐  │
│  │ Nuxt 4 dev   │  │  ─────────────> │  │ frontend     │  │
│  │ (HMR 快)     │  │                  │  │ (build out)  │  │
│  └──────────────┘  │                  │  └──────────────┘  │
│  ┌──────────────┐  │                  │  ┌──────────────┐  │
│  │ 后端 Docker  │  │                  │  │ backend      │  │
│  │ FastAPI +    │  │                  │  │ Celery+Redis │  │
│  │ Postgres +   │  │                  │  │ Postgres     │  │
│  │ Redis        │  │                  │  └──────────────┘  │
│  └──────────────┘  │                  │  ┌──────────────┐  │
│                    │                  │  │ nginx        │  │
└────────────────────┘                  │  │ (TLS+反代)   │  │
                                        │  └──────────────┘  │
                                        └────────────────────┘
```

---

## 三阶段工作流

### 阶段 1:本地开发(`pnpm dev`)

```bash
pnpm dev       # 起后端 docker-compose + 前端 dev server
pnpm stop      # 停所有服务
```

后端服务包括:`postgres`, `redis`, `backend` (FastAPI), `worker` (Celery)。
前端走原生 dev server,HMR 不经 Docker。

数据库迁移(用 Alembic):

```bash
pnpm be:migrate:make "add user invitations"  # 生成迁移脚本
pnpm be:migrate:up                            # 应用迁移
```

### 阶段 2:本地验证生产镜像(`pnpm prod:local`)

deploy 前必跑这一步。用 `.env.production.local` 本地起生产配置:

```bash
pnpm prod:local           # 本地起生产镜像
pnpm prod:logs            # 看 backend 日志
pnpm prod:down            # 停
```

**为什么需要这一步**:开发镜像跟生产镜像有差异(env 变量、是否带 hot-reload、build 是否 minify)。直接推到服务器一旦挂掉再排查很贵。

### 阶段 3:服务器部署(`pnpm prod:deploy`)

由 GitLab CI 触发,或 SSH 到服务器手动跑。脚本(`scripts/deploy-production.ts`)做的事:

```bash
docker-compose --env-file .env.production -f docker-compose.prod.yml down
docker-compose --env-file .env.production -f docker-compose.prod.yml build
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d
docker-compose --env-file .env.production -f docker-compose.prod.yml ps
```

部署前脚本会校验:
- `.env.production` 存在
- 没有 `CHANGE_THIS` 占位符
- `POSTGRES_PASSWORD` 跟 `DATABASE_URL` 里嵌的密码一致

CI 变量配置见脚手架的 [`docs/GITLAB_CI_VARIABLES.md`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4/blob/main/docs/GITLAB_CI_VARIABLES.md)。

---

## 三档环境文件

| 文件 | 用途 | 进 git? |
|---|---|---|
| `.env.example` | 开发模板 | ✅ |
| `.env.production.example` | 生产模板 | ✅ |
| `.env` | 本地开发实际配置 | ❌ |
| `.env.production.local` | 本地验证生产配置 | ❌ |
| `.env.production` | 服务器生产配置 | ❌(走 GitLab CI 变量注入) |

**关键约定**:`PROJECT_NAME` 不同,Docker 容器和卷的命名空间隔离,本地和生产可以共存。

---

## 密钥生成(不要复用)

```bash
SECRET_KEY:            openssl rand -hex 32
NUXT_SESSION_PASSWORD: openssl rand -base64 32
POSTGRES_PASSWORD:     openssl rand -base64 24
```

注意:`DATABASE_URL` 里嵌的密码必须和 `POSTGRES_PASSWORD` 完全一致,否则 deploy-production.ts 会拒绝部署。

生产环境密钥**不要存在 .env.production 文件里推到 git**,通过 GitLab CI 变量注入或服务器本地 `.env.production`(机器读 + chmod 600)。

---

## 已知缺口与改进建议

脚手架当前实现暴露的问题(2026 年视角):

### ❌ 无回滚机制

`pnpm prod:deploy` 失败后,容器已经 `down + build + up`,旧镜像被覆盖。回退需要:

```bash
# 当前唯一办法
git revert <commit>
pnpm prod:deploy
```

**改进方向**:deploy 脚本里加 `tag previous-image` 步骤,失败时 `docker tag <previous> <current>` 快速回退。

### ❌ 无数据库迁移自动备份

改 schema 时如果迁移挂了,数据可能损坏。当前需要手动:

```bash
docker exec <pg-container> pg_dump -U postgres > backup-$(date +%F).sql
```

**改进方向**:在 `pnpm be:migrate:up` 前自动跑 `pg_dump` 到时间戳文件。

### ❌ 部署日志只看最后 20 行 backend

`deploy-production.ts` 只 `--tail=20 backend`,前端 / nginx / worker 出错看不到。

**改进方向**:把日志推到结构化日志服务(Loki/Datadog),或至少多服务并行 `logs --tail`。

### ⚠️ 无健康检查 gate

deploy 完了之后没有自动 curl `/health` 验证服务起来了。

**改进方向**:`pnpm prod:deploy` 末尾加 `curl --retry 5 http://localhost:8000/health`,失败则非零退出。

---

## 反模式

- **本地用 venv,生产用 Docker** → 环境漂移,迟早翻车。本地也用 Docker 跑后端
- **生产 docker-compose.yml 跟开发同一份** → 必须分 `.yml` 和 `.prod.yml`,启用不同的 env / volume / replicas / 不暴露 dev 端口
- **同步前跳过 `pnpm prod:local`** → 开发镜像跟生产镜像有差异,直接推服务器风险高
- **改 schema 不 dump** → 迁移失败回不去
- **secret 推到 git** → 即使私有仓库,密钥也应该走 CI 变量

---

## 关联

- 后端容器化与镜像选择:`~/.claude/skills/docker-expert`(已装)
- AI 协作下的部署 commit:[workflow.md §3.3 proof bundle](workflow.md#33-交付阶段proof-bundle)
- 后端先行原则:[workflow.md §8.6](workflow.md#86-全栈项目的后端先行backend-first-tactic)(deploy 自然落在 backend 完成之后)

---

## 参考文档

- [脚手架 DEPLOYMENT.md](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4/blob/main/DEPLOYMENT.md) — 三阶段部署原版
- [脚手架 CONFIGURATION.md](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4/blob/main/docs/CONFIGURATION.md) — env 配置详解
- [脚手架 GITLAB_CI_VARIABLES.md](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4/blob/main/docs/GITLAB_CI_VARIABLES.md) — CI 变量映射
