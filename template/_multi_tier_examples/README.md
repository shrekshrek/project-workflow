# Multi-tier examples

> Tier 级 `AGENTS.md` + `CLAUDE.md` 的**结构参考模板**,**仅多 tier 项目用**。
>
> ⚠️ **这些不是给用户直接编辑的模板**——它们是 [`/project-init` skill](../skills/project-init/SKILL.md)
> (或人 + AI 手动 P0)用的**结构参考**。AI 据此理解 tier 级 AGENTS.md 应该有哪些章节、
> 用什么 placeholder,然后基于 tier 实际栈生成最终文件。

## 何时用本目录

[`workflow.md §0.3 Tier 概念`](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#03-概念区分钉死再读后续) + [`§1.4 嵌套层次`](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#14-claudemd-嵌套层次子级覆盖父级):

| 类型 | tier 结构 | 用本目录? |
|---|---|---|
| **多 tier**(全栈 / 客户端+服务端 / web+api+worker 等) | 项目根 + `<tier>/AGENTS.md` | ✅ |
| **单 tier**(CLI / library / 纯前端 / 纯后端) | 仅项目根 AGENTS.md | ❌ 跳过 |

## 文件命名约定(中庸方案,与项目根对齐)

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

## AI-driven 生成流程(典型)

```
用户描述项目: "Nuxt 前端 + FastAPI 后端 + Celery worker"
        ↓
AI 分析: 3 个 tier
  - frontend(UI-style)
  - backend(service-style)
  - worker(service-style)
        ↓
AI 选模板:
  - frontend ← ui-tier.example
  - backend ← service-tier.example
  - worker ← service-tier.example(同类别,内容不同)
        ↓
AI 据 tier 实际栈填 placeholder + 适配 tier 特殊性:
  - frontend/AGENTS.md   填 Vue 3 + Nuxt 4 + Pinia + Nuxt UI 等
  - backend/AGENTS.md    填 FastAPI + SQLAlchemy 2.0 + Pydantic v2 等
  - worker/AGENTS.md     填 Celery 任务 + 幂等性 + retry 策略 等
        ↓
用户看到 3 个填好的 tier-level AGENTS.md(+ 对应 CLAUDE.md)
```

## 差量原则

> Tier 级 AGENTS.md **只写本 tier 跟项目根 AGENTS.md 默认不同的事**,绝不重复父级已说过的(参见 [`workflow.md §2.3`](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#23-反常判定何时该写模块-claudemd) 差量原则)。

例:
- 项目根 AGENTS.md 已写"覆盖率门槛 ≥ 80%" → tier AGENTS.md **不重复**
- 项目根 AGENTS.md 没写"Pydantic v2 strict mode" → backend tier 写
- 项目根 AGENTS.md 没写"Celery 任务幂等" → worker tier 写

## 模板里能改吗?

可以。这两个 `.example` 文件是**仓库维护者**调整的——加常用约定、删过时建议、改 placeholder 等。**不期望用户复制时再改**(用户拿到的是 AI 已经生成好的最终文件)。
