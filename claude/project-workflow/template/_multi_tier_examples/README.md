# Multi-tier examples

> Tier 级 `AGENTS.md` + `CLAUDE.md` 的**结构参考模板**,**仅多 tier 项目用**。
>
> ⚠️ **这些不是 `project-init` 的默认产物**。它们是 [`project-personalize`](../../docs/actions/project-personalize.md)
> 在仓库证据表明存在多个 tier、且用户确认需要 tier-level guidance 时才读取的**结构参考**。
> AI 必须从真实目录、manifests 和配置填内容,不能把示例默认值直接复制进项目。

## 何时用本目录

[`workflow.md §0.3 Tier 概念`](../../docs/workflow.md#03-概念区分钉死再读后续) + [`§1.4 嵌套层次`](../../docs/workflow.md#14-agentsmd--claudemd-嵌套层次子级覆盖父级):

| 类型 | tier 结构 | 用本目录? |
|---|---|---|
| **多 tier**(全栈 / 客户端+服务端 / web+api+worker 等) | 项目根 + `<tier>/AGENTS.md` | ✅ |
| **单 tier**(CLI / library / 纯前端 / 纯后端) | 仅项目根 AGENTS.md | ❌ 跳过 |

## 文件命名约定(双文件方案,与项目根对齐)

每个 tier 配 2 个文件:

```
<tier>/
├── AGENTS.md       ← canonical,规则在这
└── CLAUDE.md       ← 1 行:@AGENTS.md(给 Claude Code 路径级自动加载用)
```

跟项目根的 `AGENTS.md + CLAUDE.md` 写法**完全镜像** —— 认知一致 + 跨工具兼容。

## 文件清单(2 类模板,覆盖大部分多 tier 项目)

| 模板 | tier 类型 | 适用例 |
|---|---|---|
| `service-tier.AGENTS.md.example` | **Service-style**(无 UI 的服务) | `backend` / `api` / `server` / `worker` / `microservice` / `inference-server` / `training` |
| `service-tier.CLAUDE.md.example` | 同上,1 行 `@AGENTS.md` alias | — |
| `ui-tier.AGENTS.md.example` | **UI-style**(有用户界面) | `frontend` / `web` / `app` / `admin` / `dashboard` / `mobile-web` / `mobile` |
| `ui-tier.CLAUDE.md.example` | 同上,1 行 `@AGENTS.md` alias | — |

**为什么按类别而不是具体框架?** —— 2 个类别覆盖 80%+ 多 tier 项目。具体框架(FastAPI / Express / Vue / React 等)**通过 placeholder 在生成时填**,不需要 N 个具体模板。

## Evidence-driven 个性化流程(典型)

```
仓库已有 frontend / backend / worker 三个目录与对应 manifests
        ↓
project-personalize 从仓库证据确认 3 个 tier
  - frontend(UI-style)
  - backend(service-style)
  - worker(service-style)
        ↓
AI 选模板:
  - frontend ← ui-tier.example
  - backend ← service-tier.example
  - worker ← service-tier.example(同类别,内容不同)
        ↓
AI 据真实配置填 placeholder + 只写 tier 相对根规则的差量:
  - frontend/AGENTS.md   填 Vue 3 + Nuxt 4 + Pinia + Nuxt UI 等
  - backend/AGENTS.md    填 FastAPI + SQLAlchemy 2.0 + Pydantic v2 等
  - worker/AGENTS.md     填 Celery 任务 + 幂等性 + retry 策略 等
        ↓
用户在 consolidated preview 中确认后,再一次性写入 3 组文件
```

## 差量原则

> Tier 级 AGENTS.md **只写本 tier 跟项目根 AGENTS.md 默认不同的事**,绝不重复父级已说过的(参见 [`workflow.md §2.3`](../../docs/workflow.md#23-反常判定何时该写模块-agentsmd) 差量原则)。

例:
- 项目根 AGENTS.md 已声明项目实际采用的测试门槛 → tier AGENTS.md **不重复**
- 项目根 AGENTS.md 没写"Pydantic v2 strict mode" → backend tier 写
- 项目根 AGENTS.md 没写"Celery 任务幂等" → worker tier 写

## 模板里能改吗?

可以。这两个 `.example` 文件由**仓库维护者**调整,但只能保留结构和中立 placeholder。用户项目中的最终文件必须由仓库证据和用户确认生成,不能把本目录当成可直接复制的约定包。
