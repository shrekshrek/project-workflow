# AI 辅助开发工作流手册:5 阶段通用蓝图

> 本手册是 [project-workflow v2](https://github.com/shrekshrek/project-workflow) 的核心文档。
>
> 描述任何**新项目从启动到持续维护**的 5 阶段流程。**工具无关、栈无关**(具体栈映射见 §8)。
>
> 风格:opinionated 但可 hack —— 任何一条都可以为具体场景偏离,只要清楚为什么。

---

## 0. 起点

### 0.1 这本手册解决什么

AI 协作开发有**三个 Tier 1 工程痛点**,本手册的 5 阶段、4 支柱、所有具体机制都为这三件事服务。

#### 命题 1:Verification —— AI 生成快过人类验证

**问题**:AI 代码产出速度远超团队 validate 能力,没看过的代码进仓库,bug / hallucination / 偏离 spec 都被漏过。

**社群证据**:Boris Cherny(Anthropic / Claude Code lead):*"The most important thing is to give Claude a way to verify."*(更多见 [§参考与延伸](#参考与延伸))

**v2 主力支撑**:
- **输入侧**:[§6.1 Spec-driven](#61-规约先于代码spec-driven) —— 用 spec.md 把"做什么"冻结成契约
- **输出侧**:[§6.4 三层 review](#64-按规则源分层验证three-layer-review-separation)(L1 机械 / L2 项目约定 / L3 spec 合规)+ [§3.3 proof bundle](#33-交付阶段proof-bundle)

#### 命题 2:Context-as-RAM —— 上下文是有限预算,不是无底磁盘

**问题**:AI 的 context window 行为像 RAM 不像 storage —— 装得越多 attention 越散,长会话依从度下降,token 成本爆炸。

**社群证据**:[Mem0 — Context Window Behaves Like RAM, Not Storage](https://mem0.ai/blog/state-of-ai-agent-memory-2026)(更多见 [§参考与延伸](#参考与延伸))

**v2 主力支撑**:[§6.2 Context budget](#62-上下文是有限预算context-budget) —— AGENTS.md 行数纪律 + `@imports` + `/clear` / `/compact` + 小 composable skills

#### 命题 3:Drift —— 规范在时间/空间/演进三向漂移

**问题**:AI 没有跨会话长期记忆,规范会朝三个方向漂——**时间**(同代码不同 session 评判不同)、**空间**(模块 A 跟模块 B 风格不一致)、**演进**(项目第 1 月跟第 6 月代码风格差)。

**社群证据**:[Martin Fowler — Encoding Team Standards](https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html)(更多见 [§参考与延伸](#参考与延伸))

**v2 主力支撑**:[§6.3 Env-enforced rules](#63-规则由环境强制environment-enforced-rules)(hooks 机械强制)+ [§1 P0 AGENTS.md](#1-p0project-setup项目第一天) 单一 source of truth + [§5 P4 Drift Refresh](#5-p4drift-refresh主动修正)

#### 跨层不一致(全栈 tactic,不是独立命题)

全栈项目的前/后/DB 跨 tier 契约漂移**是真实问题但社群证据较弱**(被视为通用架构问题,不是 AI 特有)。v2 不把它升级为独立命题,而是作为全栈项目的具体战术处理 —— 见 [§8.6 Backend-first](#86-全栈项目的后端先行backend-first-tactic)。

---

**本手册不是什么**(boundary,避免误解):

- **不是 process-owning 框架**:不强制按某固定顺序敲某些命令(反例见 [§7.2](#72-不要叠加两个-process-owning-框架))
- **不承诺"AI 一次写对"**:目标是消除"对齐劳动"([§0.5](#05-实现策略的核心信念)),不消除迭代

### 0.2 5 阶段全景

> **关于编号**:下图没有 P1 是**有意**——早期版本把"P1 Module Setup"列为独立阶段,实践证明**模块几乎不独立发生,几乎总是 P2 feature 的子产物**,所以降级为 P2 sub-flow。空着 P1 保留这段设计 narrative;详细机制见 [§2 Module Setup](#2-module-setupp2-内的-sub-flow非独立-phase)。

```
┌─────────────────────────────────────────────────────────────┐
│ P0: Project Setup(项目第一天)                                   │
│ ─ Q&A → starter kit(AGENTS.md/CLAUDE.md/rules/hooks/specs) │
│ ─ 工具:/project-init skill(Claude Code + OpenCode 通用)      │
├─────────────────────────────────────────────────────────────┤
│ P2: Feature Development(每个功能)                           │
│ ─ 复制 specs/_template/ → spec.md + plan.md + tasks.md      │
│ ─ 后端先行(全栈适用)→ 实施 → proof bundle 端点交付         │
│                                                             │
│   ↳ Module Setup sub-flow(P2 内嵌触发,非独立 phase)        │
│      ─ spec 阶段识别"需新模块" → plan 加边界 → tasks 加骨架  │
│      ─ 仅"反常"时加 <module>/CLAUDE.md(见 §2.3)             │
├─────────────────────────────────────────────────────────────┤
│ P3: Continuous Maintenance(开发期间常驻)                    │
│ ─ hooks 自动校验(L1 通用 + L2 项目约定)                    │
│ ─ 端点 review:L3 spec 合规 + AGENTS.md drift 建议           │
│ ─ backlog / discussions 走平台原生(Issues / Discussions)   │
├─────────────────────────────────────────────────────────────┤
│ P4: Drift Refresh(主动/周期性)                              │
│ ─ /refresh-agents-md 手动 + hook 信号被动检测                │
│ ─ Q&A → 建议 diff → 用户审批 → 应用                          │
└─────────────────────────────────────────────────────────────┘
```

每阶段的详细 **触发** / **产出** / **谁做** / **校验** 见各 phase 章节([§1](#1-p0project-setup项目第一天) / [§3](#3-p2feature-development每个功能) / [§4](#4-p3continuous-maintenance开发期间持续) / [§5](#5-p4drift-refresh主动修正))。

#### 阶段 × 命题 × 支柱 映射

每个阶段不是平均服务所有命题,而是各有侧重。这张表让你一眼看出"做这个阶段是为了谁":

| 阶段 | 主要服务的 Tier 1 命题 | 关键支柱 |
|---|---|---|
| **P0** Project Setup | Drift(锚定基线)+ Verification(契约模板) | §6.1 spec-driven / §6.3 env-enforced |
| **P2** Feature Dev | Verification(每个功能交付前验证) | §6.1 spec-driven / §6.4 three-layer review |
| Module Setup(P2 sub-flow) | Drift(模块边界、空间一致) | §6.1 spec-driven |
| **P3** Continuous Maintenance | Verification(实时)+ Drift(实时拦截)+ Context(预算管理) | §6.2 context / §6.3 env-enforced / §6.4 review |
| **P4** Drift Refresh | Drift(周期主动修正、演进维度) | §6.3 env-enforced(规则更新) |

### 0.3 概念区分(钉死再读后续)

#### 主线 3 层

| 层次 | 是什么 | 寿命 | 例 |
|---|---|---|---|
| **项目**(project) | 整个 codebase | 项目同寿 | 用户管理后台 |
| **模块**(module) | 代码组织单位(目录) | 长期存在 | `backend/src/invitations/` |
| **功能**(feature) | 一次开发任务的用户能力 | **有起止**,完成归档 | "用户邀请流" |

#### 可选 1 层:Tier(分层架构)

部分项目天然有"分层"(tier),最常见的是**全栈项目的前后端分**。其他例:

| 分层模式 | 例 |
|---|---|
| 前后端分(Web 全栈) | `frontend/` + `backend/` |
| 客户端 + 服务端 | `mobile/` + `server/` |
| 三层 / 多层 | `web/` + `api/` + `worker/` |
| **无 tier** | CLI 工具、库、单服务、纯前端项目、纯后端项目 |

**有无 tier 影响 CLAUDE.md 嵌套**:
- 有 tier:`<root>/` → `<tier>/` → `<tier>/<module>/`(4 层结构,见 §1.4)
- 无 tier:`<root>/` → `<module>/`(3 层结构,跳过 tier 那一档)

#### 关键关系

一个功能可横跨多个模块、可横跨 tier(全栈功能跨 frontend + backend);一个模块被多个功能修改。

| 文档级别 | 文件 | 何时存在 |
|---|---|---|
| 项目级 | `AGENTS.md` + `CLAUDE.md` | 必然 |
| Tier 级(可选) | `backend/CLAUDE.md` / `frontend/CLAUDE.md` | 仅多 tier 项目 |
| 模块级(可选) | `<module>/CLAUDE.md` | 仅模块跟 tier 默认约定不一致时(§2.3) |
| 功能级 | `docs/specs/<NNN>-<feature>/{spec,plan,tasks}.md` | 每开发任务一份 |

### 0.4 项目核心目标

> **项目可控、规范自维持** —— 多模块/多功能可独立并行推进,每个增量跟项目整体保持一致,**不依赖反复人工提醒**。

三个子目标(后续 5 阶段流程都是为这三件事服务):

| 子目标 | 含义 | 主要支撑机制 |
|---|---|---|
| **解耦开发** | 模块/功能可独立推进,边界清晰 | 功能 spec + 模块化 + 契约先于实现(§8.6) |
| **规范一致** | 跨模块/跨功能的代码风格/架构/约定不漂移 | AGENTS.md + hooks 自动强制(§6.3) |
| **方向稳定** | 每个增量不会跑偏,AI 输出始终在 spec 边界内 | 三层 review(§6.4)+ proof bundle 端点验证(§3.3) |

**关于"自维持"的真实含义**:这不是"100% 自动化",而是 **L2 blueprint 提供的工具/约定 + L3 用户纪律协同**。详细的 L2/L3 分工见 [§6.0](#60-每条原则的两层组成读-6164-前必读)。

### 0.5 实现策略的核心信念

要达成 §0.4 的目标,必须接受两个事实(不是手段,是前提):

1. **目标是消除"对齐劳动",不是消除迭代**。

   真正该消除的:开发期间人反复提醒 AI **"注意命名"、"注意结构"、"注意规范"** 这一类**对齐对话** —— 这是真正的内耗,不是 AI 错,是规范没在系统层固化。
   
   不该追求的:让 AI"一次写对"或"零迭代"。合理迭代本身不是问题。
   
   **解法**:规范靠环境 + 文档自维持(hooks / lint / types / tests / AGENTS.md / spec.md),让对齐对话发生在**系统跟 AI 之间**,不再发生在**人跟 AI 之间**(见 §6.3)。

2. **协作约定工具无关**。

   AGENTS.md / spec.md / hooks 配置不绑定单一 AI 工具,切换 Claude Code / Codex / OpenCode / Cursor 时上层资产不变。底层工具是 weeks-级别迁移成本,**上层规范是 months-级别投入**,后者必须 portable(见 §7.6 反模式)。

**做对了之后的副产物**(不追求,但顺带得到):
- 迭代成本自然下降 —— 系统接管机械合规后,你不必盯每一步
- AI 输出更稳定 —— 规范常驻 → 输入更清晰 → 输出收敛
- 项目跨工具/跨人传递成本低 —— 资产 portable

### 0.6 本手册自身的演化哲学

**文档先于工具**(给设计 blueprint 的人看的元原则,跟用户使用本手册无关)。

SOP / blueprint 先用文档写清楚(让人按图操作),再考虑用工具自动化。工具是 SOP 的固化形式。SOP 不清晰时做工具就是把混乱固化。

任何新工具想法,先问:"这是 SOP 的哪一步自动化?SOP 写过没?"

---

## 1. P0:Project Setup(项目第一天)

### 1.0 P0 前置:pre-init brainstorm(可选)

**触发**:还没想清楚"项目要做什么"——只有模糊想法,先 brainstorm 再起 P0。

| 你的状态 | 该做什么 |
|---|---|
| **完全模糊**("想做个 X,具体形态没想清")| 主会话跟 AI 自由 brainstorm(核心用户 / 最痛问题 / MVP 边界 / 2-3 个 reference 项目)→ 1-2 小时通常够 → 完了再跑 `/project-init` |
| **已有 idea + 不确定栈** | 跳过 brainstorm,**直接 `/project-init`** —— Q&A "不确定"时自动 dispatch [`tech-researcher`](../agents/tech-researcher.md) 调研 |
| **Retrofit 既有项目** | 跳过 —— 跑 [`/project-personalize`](../skills/project-personalize/SKILL.md)(已有 codebase 已经是 brainstorm 产物)|

**v2 不工具化这个阶段**——brainstorm 本质发散,SOP / mandatory skill(Superpowers 风格)反而磕碰。**主会话自由对话最合适**;产物**不必落盘**,直接喂 `/project-init` Q&A 即可。若要存档,走 GitHub Discussions / Issues(per [§4.4](#44-backlog-与讨论走平台不进-repo-文件) "AI 读 → 文件,人类协作 → 平台")。

**外部工具**(可选):Anthropic 内置 / ECC / Superpowers 各有 brainstorming skill,选你顺手的或直接用 Claude 主会话 —— v2 不强制。

### 1.1 触发与目标

**触发**:
- 新项目第一天
- 老项目首次引入 AI 协作

**目标**:60 分钟内,**一次 Q&A 仪式**生成完整 starter kit,让后续所有开发都站在一致基线上。

### 1.2 产出物(完整 starter kit)

P0 产出物分**两层**(职责严格不重叠):

**A. 方法论层**(必备,语言中立,模板见 [`template/`](../template/))

```
项目根/
├── AGENTS.md                       # 项目级 spec,跨工具事实标准
├── CLAUDE.md                       # 1 行:@AGENTS.md(或 symlink)
├── .claude/
│   ├── rules/                      # 路径级规则
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── security.md
│   ├── hooks/
│   │   └── lint-on-edit.js         # 骨架(具体 lint 命令栈相关,见 B 层)
│   └── settings.json
├── docs/
│   ├── specs/
│   │   └── _template/              # 三文件模板
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── tasks.md
│   ├── adr/                        # 架构决策记录
│   │   ├── README.md
│   │   └── 0000-template.md
│   └── gotchas.md                  # 工程陷阱清单(从 blueprint 仓库复制进项目)
├── .github/                        # 或 .gitlab/(平台二选一)
│   ├── ISSUE_TEMPLATE/
│   │   ├── proposal.md
│   │   ├── feature_request.md
│   │   └── bug_report.md
│   └── PULL_REQUEST_TEMPLATE.md
└── .gitignore                      # 预防性含 CLAUDE.local.md、.env*
```

**B. 工程化层**(栈相关,由各项目自行实现)

```
项目根/
├── package.json                    # 根 orchestration(bootstrap / dev / cleanup / ...)
├── pnpm-workspace.yaml             # 如 monorepo
├── docker-compose.yml              # 后端 + DB 容器化
├── nginx.conf                      # 反向代理(本地/生产)
├── .env.example                    # 环境变量模板
├── scripts/                        # check-env.ts / cleanup-docker.ts 等 TS 工具
├── backend/                        # FastAPI(或你的栈):Dockerfile + 模块 + alembic + 测试
└── frontend/                       # Vue 3(或你的栈):vite + 路由 + store + modules
```

**规则**:A 层是"方法论",换什么栈都不变;B 层是"工程化",换栈重写。**永远不在 A 层放栈特定代码**(那是 B 层的事),否则 template 会污染。

**关于 `CLAUDE.local.md`**:**不在 P0 自动创建**。它是 gitignored 的个人项目私有覆盖(沙箱 URL / 临时 WIP / 个人测试账号等),**需要时再手动 `touch`**。`.gitignore` 提前列好,这样用户哪天创建它不需要再改 .gitignore。
官方推荐用法详见 [Anthropic — CLAUDE.md docs](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)。

### 1.3 AGENTS.md 的内容标准

**Anthropic 官方没有固定模板**,但有可量化指标:

| 标准 | 数值/做法 |
|---|---|
| 大小上限 | < 200 lines(超过则依从度下降) |
| 理想大小 | ~100 lines / ~2500 tokens(Anthropic Boris Cherny 的标杆) |
| 指令上限 | < 150 instructions |
| 结构 | markdown headers + bullets,自由组织 |
| 具体性 | "Use 2-space indentation" > "Format code properly" |

**该收 / 不该收**(官方 [best-practices](https://code.claude.com/docs/en/best-practices)):

| ✅ 该收 | ❌ 不该收 |
|---|---|
| Claude 猜不到的 bash 命令 | Claude 能从代码读出来的 |
| 跟语言默认不同的 code style | 标准通用约定 |
| 测试运行方式与覆盖率门槛 | 详细 API 文档(链外部) |
| 仓库礼节(分支命名/PR 规范) | 经常变的信息 |
| 项目特异架构决策 | 长教程/解释 |
| 开发环境怪癖(必需 env vars) | 自明事项("写干净代码") |
| 常见 gotcha 或反直觉行为 | 文件级描述 |

> **⚠️ 反模式:AGENTS.md + CLAUDE.md 双文件独立维护**
>
> 见过的真实情形:一个全栈项目同时维护 `AGENTS.md`(3.1KB)和 `CLAUDE.md`(5.7KB),两份内容大量重叠但措辞、版本、覆盖范围**已经悄悄漂移**——半年后没人知道哪份是 source of truth,AI 读哪份取决于工具偶然选择。
>
> **正确做法**:`AGENTS.md` 是唯一 source of truth,`CLAUDE.md` 永远只有一行 `@AGENTS.md`(详见 §1.4 / §1.5)。其他工具(Cursor / Codex / OpenCode)用各自约定时也指向 `AGENTS.md` 而不是复制。
>
> 检查:`AGENTS.md` 和 `CLAUDE.md` 大小差 > 100 bytes 就要警惕——后者应该几乎是空的。

### 1.4 CLAUDE.md 嵌套层次(子级覆盖父级)

```
1. 系统级           /etc/claude-code/CLAUDE.md         (IT/DevOps,极少用)
2. 用户级           ~/.claude/CLAUDE.md               (跨所有项目)
3. 项目级 root      ./AGENTS.md + ./CLAUDE.md         (团队共享,本手册重点)
4. 子目录(按需加载,2 种用法):
   ├─ Tier 级      ./backend/CLAUDE.md
                  ./frontend/CLAUDE.md              (仅多 tier 项目)
   └─ 模块级       ./<module>/CLAUDE.md              (仅模块反常时,见 §2.3)
5. 私有覆盖        ./CLAUDE.local.md                 (gitignored,可选)
```

**Tier vs 模块的区别**:
- **Tier**:架构性分层(全栈的前后端、客户端/服务端、web/api/worker 等)。**是否存在**取决于项目结构,**单 tier 项目不存在这层**。
- **模块**:tier 内(或单 tier 项目里直接在项目根下)的代码组织单位。

→ 项目类型对照表见 §0.3。

**加载机制**:
- 1/2/3/5 层在 session 启动时全文加载
- 4 层(子目录)**按需加载**(Claude 读该目录内文件时加载)
- 跟 `@imports` 语法配合,可以把长尾内容拆出去节省 context budget(见 §1.5)

**子级覆盖父级**:同名约束以更深层为准(模块级 boundaries > tier 级 boundaries > 项目级 boundaries)。

### 1.5 `@imports` 语法(官方支持)

AGENTS.md / CLAUDE.md 可以用 `@path/to/file` 拉别的文件入 context,**递归最深 5 层**:

```markdown
# AGENTS.md

@docs/architecture.md
@.claude/rules/security.md

## 本文件主体(短小核心)
- ...
```

**为什么用**:把"长尾内容"(完整架构文档、所有规则)拆出去,主文件保持 < 100 行;AI 读时仍加载全部。

### 1.6 路径级规则:`.claude/rules/`(官方支持)

模块化 instructions,可加 `paths:` frontmatter 让规则**只在匹配文件被读时触发**:

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 开发规则

- 所有 endpoint 必须 input validation
- 用标准 error response 格式
```

**为什么用**:复杂项目把"全部加载"的 instructions 拆成"按需加载",节省 context budget。

> **plugin 定位:Claude Code only**
>
> project-workflow v2.3+ 已把 floor 收紧到 Claude Code only(见 [docs/tooling.md §5](tooling.md))。**默认**:rules 放 `.claude/rules/<topic>.md` + `paths:` frontmatter,享 path-scoped 加载;`/project-init` 模板自动按此结构生成。
>
> **注意 `.claude/rules/` 是 Claude-private 目录**:Cursor 的 `.cursor/rules/`、OpenCode 的相应目录互不读取。一份规则放 `.cursor/rules/api.mdc`,Codex / Claude / OpenCode 不会跨读。本 plugin 不再针对跨工具优化。
>
> **若你仍要跨工具(逃生口)**:
> - 把 rules 内容搬到 `docs/rules/<topic>.md`(中性目录,纯 markdown,**无** `paths:` frontmatter)
> - `AGENTS.md` 末尾用 `@docs/rules/<topic>.md` 拉入 → 所有读 AGENTS.md 的工具都拿到
> - 代价:失去 path-scoping,context 全量加载;plugin SKILL 不询问 / 不自动 emit 这条路径(需手工迁移)
>
> 反模式:把所有约定写进 `.cursor/rules/`,然后宣称"项目支持多 AI 工具"——其他工具一脸懵。

### 1.7 Hooks 初始配置

P0 时配最小可用的 hook,**文件保存后自动 lint/format/类型检查**。详细的 hook 设计哲学见 §4.2。

> **📌 起 P0 前先扫一遍** [docs/gotchas.md](gotchas.md) —— 一个真实 fullstack 项目搭建过程中沉淀的 10 条"工程坑"清单(Dockerfile / pnpm script 命名 / docker-compose / Pydantic extras / 测试基建等)。**全是 AI 第一次搭项目会踩的**,提前看能省 2-3 小时调试。

settings.json 挂载:

```json
"hooks": {
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/lint-on-edit.js"
        }
      ]
    }
  ]
}
```

脚本骨架(具体 lint 命令由栈决定,见 §8):

```javascript
#!/usr/bin/env node
const { execFileSync } = require('node:child_process');

let data = '';
process.stdin.on('data', c => (data += c));
process.stdin.on('end', () => {
  const file = JSON.parse(data || '{}').tool_input?.file_path;
  if (!file) process.exit(0);
  // 智能跳过(大文件、WIP 分支、env var)见 §4.2
  // 按文件类型 lint(具体命令见 §8 栈适配)
  process.exit(0);
});
```

**跨工具说明**:Claude Code 用 `~/.claude/settings.json`,OpenCode 用 TS plugin,Codex 用自己 hook 系统。核心脚本一份,各工具薄薄挂钩。

### 1.8 ADR 目录初始化

架构决策记录(Architecture Decision Records,Michael Nygard 模板)。每个重要架构选择**写一份独立 ADR 文件**,不要塞 plan.md 的 prior decisions 里(plan.md 只引用 ADR 编号)。

```
docs/adr/
├── README.md                       # 说明 ADR 是什么、何时写
├── 0000-template.md                # 标准模板
└── 0001-<title>.md                 # 第一个 ADR
```

**模板**(基于 Michael Nygard 简化):

```markdown
# NNNN. 标题

- 状态:Proposed / Accepted / Deprecated / Superseded by NNNN
- 日期:YYYY-MM-DD

## Context
我们为什么需要做这个决策?有什么约束?

## Decision
我们决定做什么?

## Consequences
这个决策带来什么好处与代价?
```

**ADR vs spec vs plan 的区别**:

| 文档 | 回答 | 范围 | 寿命 |
|---|---|---|---|
| ADR | 为什么这么选(技术取舍) | 跨多个功能的架构决策 | 项目同寿,只追加不修改 |
| spec.md | 这个功能做什么 | 单功能 | 功能开发期 |
| plan.md | 这个功能怎么做 | 单功能 | 功能开发期 |

### 1.9 平台流程模板

P0 同时设置 GitHub/GitLab 原生协作流程,**backlog / 讨论 / bug 不进 repo 文件**,走平台原生。

**Issue templates** (`.github/ISSUE_TEMPLATE/`):

- `proposal.md` — 提案(待评估的想法,label: `proposal`)
- `feature_request.md` — 用户/团队需求
- `bug_report.md` — 缺陷报告

**PR template** (`.github/PULL_REQUEST_TEMPLATE.md`) 内嵌 §3.3 proof bundle 检查项:

```markdown
## Summary

## Spec
- Spec: docs/specs/<NNN>-<slug>/spec.md
- Plan: docs/specs/<NNN>-<slug>/plan.md

## Proof Bundle
- [ ] Tests pass(单测/集成测)
- [ ] Reviewer 提供 AGENTS.md context 跑过
- [ ] Reviewer 提供 spec.md context 跑过
- [ ] AGENTS.md drift 建议(如有):...
- [ ] 开放问题(如有):...
```

GitLab 等价:`.gitlab/issue_templates/` + `.gitlab/merge_request_templates/`。

### 1.10 Q&A 设计(Project Setup skill 问什么)

> **形态说明**:Project Setup 是 **skill,不是独立 CLI**。前提是用户已经:(1) 创建项目目录、(2) 打开 AI 工具(Claude Code / Codex / OpenCode)。在 AI session 内调用 `/setup`(或同类),skill 用 `AskUserQuestion` 类工具问 5-8 个问题,基于答案渲染 starter kit。CLI 形态仅作可选边缘场景(CI 自动建项目)。

Project Setup skill 问 5-8 个关键问题(每个 1 句答),涵盖:

1. **项目名 + 主栈** ← 影响所有后续文件
2. **起服务/测试/lint 的命令** ← 进 AGENTS.md Commands
3. **目录组织模式** ← 进 AGENTS.md Project Structure
4. **代码风格** ← 给一段现有代码或问偏好
5. **测试覆盖率门槛** ← 进 .claude/rules/testing.md
6. **Boundaries 三档**(✅ Always / ⚠️ Ask first / 🚫 Never)
7. **Git workflow**(分支命名、commit 规范、平台:GitHub / GitLab)
8. **特殊约束**(性能/安全/合规)

**关键纪律**:
- 每题必须 1 句话能答(否则就是问题设计太大)
- 二选一/填空 > 开放式
- 答案直接渲染到模板,**用户审完 diff 才写入**

### 1.11 校验

- `/memory`(Claude Code)或对应工具命令:确认 AGENTS.md / CLAUDE.md 加载
- 跑一次 `pnpm` / `npm` / `cargo` / 等标准命令,确认 AGENTS.md 写的命令正确
- 改一个文件,看 hook 自动跑(lint/format 生效)
- 把 AGENTS.md 给 AI 读一遍,问它"基于本文件总结这个项目",看理解是否准确

---

## 2. Module Setup(P2 内的 sub-flow,非独立 phase)

### 2.1 何时启动 sub-flow

在 P2 spec 阶段沟通"做什么功能"时,**识别**它是否需要新模块:

| 触发场景 | 具体形态 |
|---|---|
| **用户提及** | 你跟 AI 讨论需求时,意识到"这功能需要个新的 X 模块" |
| **AI 推荐** | AI 分析功能边界后建议"建议新建 X 模块,跟现有 Y/Z 解耦";你确认后采纳 |
| **重构溢出** | 写 P2 plan.md 时发现现有代码某部分该独立成模块 |
| **第三方集成** | 引入新依赖需要独立 namespace(罕见) |

**不触发(留在 P2 主流程,不展开 sub-flow)**:
- 仅在现有模块加文件、改函数
- 调整已有模块内部结构
- 重命名 / 移动现有代码

### 2.2 产出物(写进 P2 spec 三件套,不另起文档)

| 在哪体现 | 写什么 |
|---|---|
| `spec.md` §范围 | "Include: 建立 X 模块"作为 feature 范围一项 |
| `plan.md` 加段 | 模块边界 / API 契约 / 跟现有模块的解耦点 |
| `tasks.md` 加项 | "建 `<module>/{五件套占位}`"作为一项任务 |
| `<module>/CLAUDE.md` | **仅当模块"反常"时**(见 §2.3),99% 情况下不写 |

### 2.3 "反常"判定:何时该写模块 CLAUDE.md

只在以下情形写,否则**不写**(避免文档增殖):

| 反常情形 | 例 |
|---|---|
| 用了跟父级默认不同的存储模型 | 一个模块用 Redis,其他用 PostgreSQL |
| 有特殊并发/性能约束 | 一个模块必须 lock-free |
| 对外提供稳定 API 契约,不允许随意改 | 一个模块是公共 SDK 边界 |
| 用了不同的第三方库范式 | 一个模块用 React,其他用 Vue(罕见) |

**差量原则**:模块 CLAUDE.md 只写**跟父级(tier 级或项目级)默认的差异**,绝不重复父级已经说过的事。

**父级是什么**(取决于项目结构):
- 多 tier 项目:模块的父级是 tier(如 `backend/CLAUDE.md`)
- 单 tier / 无 tier 项目:模块的父级是项目根(`AGENTS.md`)

### 2.4 谁做 & 校验

**谁做**:由 P2 spec 阶段(plan.md 的"模块影响范围"节)驱动决定。**不是独立动作**。

**校验**:模块 CLAUDE.md 写完后,问 AI:"读这个模块的 CLAUDE.md,有哪些信息是项目级 CLAUDE.md 已经说过的?"如果有重复,删。

### 2.5 模块组织建议:领域优先,不要技术分层

v2 对模块**长什么样**有 opinionated 偏好(不强制):

| 推荐(DDD-aligned) | 不推(按技术分层) |
|---|---|
| `backend/src/<bounded-context>/`<br>例:`invitations/`、`payments/`、`users/` | `backend/src/{controllers,services,repositories}/`<br>把一个 feature 散布到 3 个文件夹 |

**为什么按领域切**(对照 [§0.1 三命题](#01-这本手册解决什么)):

- **降空间漂移**(命题 3 / Drift):每个 bounded context 边界清晰,A 模块不太可能"顺手"调 B 模块私有逻辑;模块间风格漂移自然收窄
- **L3 review 可机械化**(命题 1 / Verification):spec.md 用的领域词 = 代码里的类名/目录名(ubiquitous language)→ spec 合规检查能 grep,不靠 AI 模糊匹配
- **跨 tier 命名对齐**(全栈 tactic):后端 `backend/src/invitations/` + 前端 `frontend/modules/invitations/`,一个 feature 跨层找代码一次就齐

**何时偏离**:

- **单 feature 玩具 / CLI 工具 / 纯 CRUD app**(domain logic 接近零)→ 平实结构,不强行切 bounded context
- **团队无 DDD 经验** → 先平实结构,出现 anti-pattern 再重构;学习成本拖慢 P0 得不偿失
- **超大型项目** → 考虑更重的 Hexagonal / Onion / Clean Architecture;v2 只给基础 DDD-aligned,不覆盖这类决策

**v2 不强制 DDD**,只是给 opinionated default。**重型 DDD ceremony**(entity / value object / aggregate / repository 四层、Domain Event、Anti-Corruption Layer 等)是另一个 layer 的决策,**不在 v2 强制范围**——你按需取。

### 2.6 Module 中途变更(feature 实施中发现边界要调整)

**触发**:plan.md §1.1 Sibling Alignment 当时没料到的情况——实施中发现:

- 一个 module 该拆成两个(职责混杂,namespace 难命名)
- 两个 module 该合并(过度切分,共享逻辑重复)
- 现有 module 边界错(代码自然属于 A 但放在 B,反复跨调)
- spec 没涵盖的新 module 突然必要(实际写代码才发现)

**SOP**:

1. **停**正在写的代码 —— 不要边迁移代码边重新认知边界
2. **起 ADR**(`docs/adr/NNNN-<topic>.md`)记 module 边界调整决策 + 原因
3. **重审 plan.md §1.1 Sibling Alignment** —— 这次往往"Codify"选项触发(把新发现的边界规则提升到 AGENTS.md / tier-level AGENTS.md)
4. **若反常**(参见 [§2.3](#23-反常判定何时该写模块-claudemd) 判定)→ 写 / 改对应 `<module>/CLAUDE.md`
5. **改 spec.md "模块影响范围" 节** + 末尾"修订记录"加一行(走 [§3.5 修订 SOP](#35-开发中发现-specplan-错怎么办))
6. **改 plan.md §1 模块影响范围**:列实际边界变更
7. **回到实施**

**反模式**:
- 边写代码边偷偷拆 module 不记录 → 半年后没人记得为什么 `backend/foo` 在那里
- 大量代码迁移但不起 ADR → 决策失忆
- 拖到 feature 完成才合并改动 → spec/plan 跟现实漂移

**工具**:[`/project-workflow:spec-revise`](../skills/spec-revise/SKILL.md) 自动化本 SOP——`--module` 模式覆盖本节流程(ADR 编号 + 跨文件一致性 + 修订记录格式)。

---

## 3. P2:Feature Development(每个功能)

每个 feature 走这个循环。**不是流程框架,是默认走法,可以随时偏离**。

### 3.1 规划阶段

**决策清单**:

```
改动跨 3+ 文件 OR 涉及架构?
  YES → 起新功能目录 docs/specs/<NNN>-<slug>/,写 spec.md + plan.md
  NO  → 跳过,直接做

涉及多个模块 OR 存在做同型事情的兄弟模块?
  YES → plan.md §1.1 做 Sibling Alignment(Align / Deviate / Codify)
  NO  → 跳

需要参考多个外部库?
  YES → 用 context7 MCP / WebFetch 拉文档塞进 plan.md
  NO  → 跳

实施前是否所有 Prior decisions 都已写入 plan.md?
  NO  → 补完再开始
```

**反模式**:用 plan.md 代替 spec.md。spec.md 写"做什么、为什么"(冻结),plan.md 写"怎么做、影响哪些模块"(实施中可补)。两个不能互替。

### 3.2 实现阶段:不要打断 AI 执行流

| 角色 | 工作 |
|---|---|
| **你** | 看 spec.md / 看最终 PR / 决定方向是否对 |
| **AI** | 写代码 / 跑测试 / 跑 hook / 自纠 lint 错误 / 主动列开放问题 |
| **环境(hook + LSP)** | 自动监督代码符合规范 |

**关键纪律**:不要每个文件改完都看一眼。这是迭代成本爆炸的根源 —— 你打断了 AI 的执行流,人为引入"中途反思"。

**什么时候应该打断 AI**:
- 跑偏方向(本来改 backend,跑去改 frontend)
- 陷入循环(同一个错改 3 次没好)
- 要做的事超出 spec/plan 边界

**什么时候不该打断**:
- "我看看它写的对不对" → 让它自己跑测试
- "这个变量名不太好" → hook 管,或 PR review 阶段统一改
- "这里我有个想法" → 记下来,等它跑完一段再说

**底层逻辑**:中途打断触发"AI 重新解释 → 用户重新评估 → AI 再写"的循环,这是单轮迭代成本高的元凶。环境层(§6.3)接管了机械合规,你不需要中途盯;端点 review(§3.3)管 substantive 问题。

### 3.3 交付阶段:proof bundle

借 OpenAI Symphony 概念:AI 不是"交代码",是"交带证据的代码"。功能完成时主动产出:

```
1. Diff           —— 变更摘要
2. Test results   —— 自动跑过的单测/集成测,失败列表
3. Review summary —— 调用 pr-review-toolkit / 同类 reviewer
                     必须提供两份 context:
                       · AGENTS.md 路径(L2 项目约定合规)
                       · docs/specs/<NNN>/spec.md 路径(L3 功能规约合规)
4. AGENTS.md drift —— 本次工作产生了哪些可能值得沉淀的项目级约定?
                     (列建议项,不直接改 AGENTS.md;详见 P4)
5. 开放问题       —— AI 主动列出做了什么取舍、有没有 TODO
```

你只在这一刻审一次,通过就合并,不通过就回 worktree 让它再跑。

**关键设计**:proof bundle 是**组合点** —— skill 保持小而锐(reviewer 各管各),组合在这里发生。不要造大而全的"统一检查 skill"。

**proof bundle 的载体**(看场景选):

| 场景 | 载体 | 说明 |
|---|---|---|
| 团队协作 / 走 PR | `.github/PULL_REQUEST_TEMPLATE.md`(P0 已铺) | PR 描述内嵌 5 项 checklist,reviewer 看 PR 时一并审 |
| 单人项目 / demo / 实验 | `docs/specs/<NNN>-<slug>/tasks.md` 末尾 | 模板已预留 `## Proof Bundle` 节,完成时填即可,不必走 PR 流程 |

两种格式一致,内容同样的 5 项。**轻量项目走第二种,避免 PR 流程开销 > 收益**。

### 3.4 与平台流程的协作

| 节点 | 平台动作 |
|---|---|
| spec 起草 | 可选:开 GitHub Issue,标 label `feature`,描述放 outcomes 摘要 |
| 实施开始 | git branch `feat/<NNN>-<slug>` |
| 交付 | PR 描述用 `.github/PULL_REQUEST_TEMPLATE.md`,proof bundle 项是 checklist |
| review | PR 评论;reviewer agent 结果可贴到 PR |
| 合并 | spec/plan/tasks 目录归档(不删),Issue 关闭引用 PR |

### 3.5 开发中发现 spec/plan 错怎么办

**前提**(再次强调 [§6.1](#61-规约先于代码spec-driven)):`spec.md` 默认**冻结**,中途修订是**例外**,要走流程不是随便改。

**触发**:implementation 阶段意识到 spec 假设错 / verification 不可测 / Scope 漏写 / Outcomes 跟实际需求不符。

**判断要不要修订**(每条独立评估):

| 发现 | 是不是真错 | 怎么处理 |
|---|---|---|
| Scope 漏写"不做" → AI 多做了 | ✅ 真错 | 必修 spec.md §2 |
| Outcomes 措辞模糊 | ⚠️ 看影响 | 已写错方向 → 必修;只是措辞模糊但实施方向对 → plan.md prior decisions 加澄清,spec 不动 |
| Verification 不可机械化("人眼判断") | ✅ 真错 | 必修 spec.md §4 改成可测断言 |
| 数据模型 / API 契约跟实际写时冲突 | ⚠️ 检查 | 模型错改 spec.md;代码错改代码;契约升级起 ADR |
| 发现需要拆 / 合 / 改 module | ✅ 真错 | 走 [§2.6 Module 中途变更 SOP](#26-module-中途变更feature-实施中发现边界要调整) |
| Constraints 太死(实施才发现不必要)| ⚠️ 看 | 真不必要 → 改 spec.md §3 + ADR 记原因;只是难做 → 别动 spec |

**修订 SOP**(任何"必修"决策都走这个流程):

1. **停**实施 —— 不要边改 spec 边写代码,会再漂
2. **起 ADR**(`docs/adr/NNNN-<topic>.md`)记决策 + 原因 + 影响范围(`NNNN` = 现有 ADR 最大编号 +1)
3. **改 spec.md** + 在文件末尾加 `## 修订记录` 节,每条:
   ```
   YYYY-MM-DD: 改了 §<N> <节名>;原因见 ADR-NNNN
   ```
4. **改 plan.md**:`Prior decisions` 加一条引用 ADR;`§1 模块影响范围` / `§2 架构决策` 按需更新
5. **改 tasks.md**:若任务列表 / 验收点变化,重排
6. **回到实施**

**反模式**:
- 偷偷改 spec.md 不留修订记录 → spec 漂移 source
- 改 spec 不起 ADR → 决策失忆(三个月后看 spec 不知道为啥这么写)
- 拖到 feature 完成时一次性"合并所有修订" → 失去回溯能力
- 既改 spec 又改代码 → 不清楚哪个先决定

**预防比修订便宜**:写完 spec 后跑 [`spec-driven.md §3.7 质量自检 7 问`](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist),实施开始前过一遍。

**工具**:[`/project-workflow:spec-revise`](../skills/spec-revise/SKILL.md) 自动化本 SOP——orchestrate ADR 起草 + spec.md `## 修订记录` 格式化追加 + plan.md prior decisions + tasks.md 重排。**不强制起 ADR**:用户判断"不必修(只是模糊)"时,引导写 plan.md prior decisions 即可。

---

## 4. P3:Continuous Maintenance(开发期间持续)

### 4.1 三层错位的检查机制

按规则源分类,各管各:

| 层 | 规则来源 | 检查什么 | 检查机制 | 时机 |
|---|---|---|---|---|
| **L1 通用规则** | `~/.claude/rules/*` | 不可变、no console.log、安全等 | hooks(机械强制) | 文件保存后立即 |
| **L2 项目约定** | `AGENTS.md` | 代码长得像这个项目吗? | linter + agent review | hook + 端点 |
| **L3 功能规约** | `docs/specs/<NNN>/spec.md` | 代码做了说要做的事吗? | 测试 + agent review + 人审 | 交付时 |

详细 rationale 见 §6.4。

### 4.2 Hooks 设计哲学

**Hook 不是布尔开关,是层叠**:

```
时间尺度    动作                  工具
─────────────────────────────────────
< 5 秒      文件保存后立即检查     Hook(eslint / ruff / 单文件 tsc)
< 1 分钟    文件级深度反馈         LSP 实时(Volar / Pyright)
< 5 分钟    模块/feature 完成后    Agent(reviewer / mypy 全量 / 单测)
< 30 分钟   交付前最后一道         Agent(security review / e2e)
PR 阶段     人 + 自动化           CI(覆盖率、lint 全量、e2e)
```

**四层错位,不要让一层做另一层的事**。

**关键判据:hook 该不该加?**

| 该加 | 不该加 |
|---|---|
| 机械可判定(lint / type / format) | 需要审美判断 |
| 失败信息能让 AI 自纠(明确指向行号) | 模糊的整体评价 |
| 跑得快(< 5 秒) | 长跑 —— 用 agent 或 async hook |

**Async hook**(长跑但不阻塞):

```json
{ "type": "command", "command": "...", "async": true, "timeout": 30 }
```

适合"我想知道但不影响流程"的场景(build 后分析),**不能阻塞或回喂错误**。

**反馈精准化**:hook stderr 输出**裁剪到本文件相关 + 截 10 行**,避免淹没 AI。

### 4.3 端点 review:每个 feature 完成时

P3.3 的 proof bundle 内含的 review 在这里跑:
- **L2 合规**:reviewer 拿 AGENTS.md 作 context
- **L3 合规**:reviewer 拿 spec.md 作 context
- **AGENTS.md drift 建议**:衔接 [§5.2 P4 模式 B 端点反思](#52-三种触发模式)

### 4.4 backlog 与讨论(走平台,不进 repo 文件)

| 信息类型 | 位置 |
|---|---|
| 未决提案(< 50 行能讲清楚) | GitHub Issue + label `proposal` 或 GitHub Discussions |
| 详细设计(> 200 行,要 review) | `docs/proposals/<slug>.md`(留 repo)+ Issue 跟踪状态 |
| Bug / Feature 请求 | Issues |
| 公开讨论 / Q&A | Discussions |
| 架构决策 | ADR `docs/adr/`(留 repo,因为是历史记录) |
| 待办进度 | Project board / Milestones |

**判定原则**:**AI 要读 → 文件**,**人类协作 → 平台**。

### 4.5 校验

P3 持续机制设对了的信号:
- AI 写出违反 lint 的代码时,**它自己看到 hook 错误后修**,不用你提醒
- feature 交付的 proof bundle 里 review 没有漏检 L2/L3
- 没有"反复对话提醒同一件事"(出现就是 P4 触发条件)

---

## 5. P4:Drift Refresh(主动修正)

### 5.1 何时触发

- **周期性**:每 2 周或 month 跑一次主动 refresh
- **感知到 drift**:用户感觉"反复提醒同一件事"
- **信号触发**(可选):hook 检测对话中 "记得 X" / "remember X" 重复出现

### 5.2 三种触发模式

| 模式 | 触发 | 问什么 |
|---|---|---|
| **A. 主动 refresh** | `/refresh-agents-md` 命令 | 对比 AGENTS.md vs 实际状态,问"这些 drift 要写进去吗?" |
| **B. 端点反思** | 模块/功能完成时(P3 端点) | "刚做的工作有 N 处可能值得沉淀,要写进 AGENTS.md?" |
| **C. 信号触发** | hook 检测"记得 X" 出现 >= 2 次 | "你最近多次提醒 X,这是项目级约定要常驻吗?" |

### 5.3 Q&A 流程

不全自动写,**全自动辅助** —— AI 出问题,你出主张:

```
1. AI 扫描 AGENTS.md + 实际代码状态 + 最近 git log
2. 检测 drift 类型(命令变了?依赖变了?反复提醒?)
3. 生成 targeted 问题(5-8 个,1 句能答)
4. 收齐答案 → 综合成 AGENTS.md diff 提议
5. 用户审 diff → 接受/修改/拒绝
```

详细设计见 [`proposals/agents-md-maintenance-skill.md`](proposals/agents-md-maintenance-skill.md)。

### 5.4 工具:跨工具 skill

`SKILL.md`(跨工具)+ `refresh.js`(Node 真逻辑):

```
~/.agents/skills/refresh-agents-md/
├── SKILL.md
└── refresh.js
```

各工具调用方式:
- Claude Code:`/refresh-agents-md` slash 命令
- OpenCode:同 SKILL.md 加载
- Codex:同样可加载

### 5.5 与平台流程的协作

- **信号沉淀到 Issue**:hook 检测到 drift signal 时,可自动开 Issue with label `drift`,而不是只在对话提示
- **refresh 结果走 PR**:`/refresh-agents-md` 产出的 AGENTS.md diff,以 PR 形式提交(`chore: refresh AGENTS.md`),便于 review

### 5.6 演进 drift 的应对策略

> **v2 stance**:演进维度 drift([§0.1 命题 3](#01-这本手册解决什么))**不做主动工具化**,用 git history + grandfather 应对。

**非正式 changelog 走 git**:`git log AGENTS.md` 给规则变更历史,`git blame AGENTS.md` 给"这条规则什么时候来的"。**不必另写一份 markdown changelog**——重复 git 已有的事。

**Grandfather 默认**:老代码大量违反新规则时,**默认接受**(参见 [§6.4 失效情形](#64-按规则源分层验证three-layer-review-separation) "legacy 代码" 条),只对新改动 enforce。不主动扫描回填。

**何时偏离 grandfather**:

| 场景 | 应对 |
|---|---|
| 规则变更涉及**安全 / 合规**(SQL 注入、密钥处理等)| 必须回填,不能 grandfather |
| **首次引入** AGENTS.md(项目本来没有,这次加上)| 一次性扫描 + 回填合理 |
| **小项目**(< 30 文件)| 回填成本低,顺手做 |
| 其他 | 用 [§5.2 模式 A 主动 refresh](#52-三种触发模式) 更新 AGENTS.md,老代码自然演化(下次改它时按新规则)|

**为什么 v2 不做完整 changelog 机制**:
- 社群证据:演进 drift 是 Tier 2(verification > 空间 drift > 演进 drift)
- 现成替代:git history 覆盖 80% 需求
- [`proposals/agents-md-maintenance-skill.md`](proposals/agents-md-maintenance-skill.md) 已显式 defer 实施
- 跟 §6.4 grandfather 默认对齐(避免方法论自冲突)

---

## 6. 方法论支柱(4 条)

只有 4 条核心原则,**每条独立、各管一件事、删了崩**。其他"原则"是这 4 条的推论或具体场景的 tactic,不在本章重复。

### 6.0 每条原则的两层组成(读 §6.1-6.4 前必读)

每条原则都由两层共同支撑,**缺一不可**:

- **L2 blueprint 层**(本项目 v2 提供):skill / template / hook 配置 / proof bundle workflow 等
- **L3 用户纪律层**:你跟 AI 协作时的实际行为(`/clear` / 真去写 spec / 端点 review 不偷懒等)

**4 条原则的 L2/L3 平衡很不一样**,真实预期对照表:

| 原则 | L2 blueprint 提供 | L3 用户纪律 | L2/L3 占比 |
|---|---|---|---|
| **6.1** Spec-driven | `specs/_template/` 三文件 + Project Setup skill(P0)+ Refresh skill(P4) | 真去写、维护 spec | ~50 / 50 |
| **6.2** Context budget | AGENTS.md 默认 < 200 行 + hook 检测警告 + refresh skill 检查行数 | `/clear` 频繁、`/compact` 节点、一会话一任务 | **~30 / 70**(L3 最重) |
| **6.3** Environment-enforced | hook scripts + settings.json template + Project Setup skill 自动配 | 几乎零 | **~95 / 5**(L2 最重) |
| **6.4** 三层验证错位 | proof bundle workflow(§3.3)+ pr-review-toolkit + reviewer context 注入 | 真的端点 review 不偷懒 | ~60 / 40 |

**读后续 4 条原则时记住**:**§6.3 几乎全自动,§6.2 主要靠你**。其他两条混合。这不是 bug,是**某些事情天然适合工具管,某些事情天然只能靠人**。

### 6.1 规约先于代码(Spec-driven)

> **Serves Tier 1 命题**:Verification(**输入侧** —— 把"做什么"冻结成契约,让验证有对照物)。参见 [§0.1 命题 1](#01-这本手册解决什么)。

#### 主张

规约(spec)是源代码,代码是 AI 生成的次级产物。任何 AI 协作的跨文件改动,**必须有 spec 兜底**。

#### 底层逻辑

AI 输出质量 ≈ AI 能力 × 输入清晰度。AI 能力是常量(模型版本固定),**输入清晰度是变量**(你能控制)。spec 是输入清晰度的载体 —— 没有 spec,你给 AI 的就是一段对话碎片;有 spec,你给的是契约。

#### 依据

| 类型 | 内容 |
|---|---|
| 量化 | 2026/02 arXiv 2602.00180 统计 AI 引入并残留在生产仓库的 issue 已 > 11 万,根因不是模型,是输入模糊 |
| 业界共识 | GitHub Spec Kit / Addy Osmani agents.md / amux SDD 三家流派都把 spec 作为一等公民 |
| 官方信号 | Anthropic best-practices 推荐 "Explore first, then plan, then code",plan 模式存在的原因之一 |

#### 怎么用

| 场景 | 动作 |
|---|---|
| 跨 3+ 文件 OR 数据模型 OR API 契约 | 必写 spec(`docs/specs/<NNN>-<slug>/spec.md`)|
| 六要素分布 | spec.md = Outcomes / Scope / Constraints / Verification;plan.md = Prior decisions / 模块影响 / 架构 / 风险 |
| Scope 必写"不做" | 不写"不做",AI 会自动加 → scope creep 最大单一来源 |
| Prior decisions 当场写回 | 每次跟 AI 讨论中作出的决策,立刻追加到 plan.md §3,带原因(关闭重复讨论) |
| 涉及多模块时做 Sibling Alignment | plan.md §1.1 对每个"同型决策" 3 选 1:Align / Deviate / Codify(spec 阶段截住空间漂移)|

#### 失效情形(Boundary Conditions)

通用跳过场景(改动 < 50 行 / bug fix / 探索性 spike / 玩具)见 [§9 何时偏离](#9-何时偏离手册)。本原则特有的:

- **spec 自身过大**(> 1 屏) → 拆功能;一个 spec 写不下说明 scope 太大

---

### 6.2 上下文是有限预算(Context Budget)

> **Serves Tier 1 命题**:Context-as-RAM(直接对应,本支柱即本命题的核心解法)。参见 [§0.1 命题 2](#01-这本手册解决什么)。

#### 主张

AI session 的 context 是**有限预算**,管理它跟管理 RAM / 磁盘 / 时间一样是一类工程问题。

#### 底层逻辑

LLM 的 attention 是 quadratic 或 sub-linear cost over context length。当 context 接近窗口上限,attention 分散,模型对早期信息的依从下降。这不是 bug,是架构特性。

**结论**:任何"装得下就行"的思维是错的。**装什么、何时装、何时清** 是工程决策。

#### 依据

| 类型 | 内容 |
|---|---|
| 业界共识 | Aurimas Griciūnas《State of Context Engineering 2026》;Manus 把 prompt cache hit rate 列为最重要生产指标 |
| 官方量化 | CLAUDE.md > 200 行依从度显著下降(Anthropic);> 150 instructions 同样下降 |
| 官方建议 | `/clear` / `/compact` / `--add-dir` / `.claude/rules/` path-scoped / `@imports` 都是 Anthropic 给的 budget 管理工具 |

#### 怎么用

| 场景 | 动作 |
|---|---|
| 长 session 跨多任务 | `/clear` 频繁,**一会话一任务** |
| CLAUDE.md / AGENTS.md | 主体 < 200 行,长尾走 `@imports` / `.claude/rules/` |
| 多模块项目 | sub-agent 隔离上下文(每个 sub-agent 独立窗口) |
| 长文档参考 | progressive disclosure —— 用 `@` 按需拉,不全塞 |
| 长任务中段 | `/compact` 在逻辑节点(不是窗口爆掉时) |

#### 失效情形

- **探索性深度对话** → 上下文累积本身是价值,不该清
- **跨多轮的链式推理** → 提前清会断思路
- **`/compact` 过度** → 关键细节被压成摘要,后续需要时丢失
- **过度拆分 sub-agent** → 调度成本 > context 节省;< 3 个调用不值得

---

### 6.3 规则由环境强制(Environment-Enforced Rules)

> **Serves Tier 1 命题**:Drift(用机械检查把规范固化在环境里,对抗时间/空间漂移)。参见 [§0.1 命题 3](#01-这本手册解决什么)。

#### 主张

凡是能机械判定的规范(lint / format / type / test),写成 hook 由环境跑;**不要靠 prompt 或 CLAUDE.md 提醒 AI 记住它**。

#### 底层逻辑

两个独立维度合起来 → 严格优于:

1. **概率 vs 确定**:prompt 提醒是概率性的(AI 可能不读、不理解、忘记);hook 是确定性的(机制必跑,exit code 决定下一步)
2. **context 成本**:prompt 提醒每次消耗 token,且 CLAUDE.md 越长依从度越下降(§6.2);hook 零 context 成本

#### 依据

| 类型 | 内容 |
|---|---|
| 官方原文 | Anthropic best-practices:*"If Claude already does something correctly without the instruction, delete it or convert it to a hook."* |
| 官方量化 | CLAUDE.md > 200 行依从度下降,> 150 instructions 显著下降 |
| 实战观察 | ECC(180k stars 框架)hook 系统覆盖 35+ 事件,是其最被采纳的部分 |

#### 怎么用

| 场景 | 动作 |
|---|---|
| 想说"记得 X" 第 2 次出现 | **停**。问:能写成 hook 吗?能 → 写 hook;不能 → 才放 CLAUDE.md |
| 配 hook 时 | 失败用 `exit 2` + 具体 stderr,AI 自动看到并修;exit 1 是非阻塞警告 |
| 写 CLAUDE.md 时 | 只放"环境层做不到的"约束(架构决策、命名直觉、业务边界);具体行为(lint/format)绝不写 |
| 多文件/跨语言检查 | 不同语言用 case 分支 + 不同工具(eslint/ruff/gofmt);共享同一脚本骨架 |

#### 失效情形

强行 hook 反而坏事的情形:

- **审美/设计判断**(代码"够不够清晰" / "命名好不好") → 需要 agent review 或人审
- **跨文件/跨模块语义** → 单文件 hook 抓不到,需要全量 type check 或测试
- **业务规则正确性**(用户邀请必须发邮件) → hook 不懂业务,需要 spec.md + 集成测试
- **长跑检查**(全量测试、e2e、安全扫) → 卡死 AI,改用 async hook 或交付阶段 agent
- **设计期/spec 期** → 还没代码可检查,hook 无用
- **跨工具实现差异** → Claude Code 用 settings.json,OpenCode 用 TS plugin,Codex 限定 Bash —— 概念通用但桥接成本不为零

---

### 6.4 按规则源分层验证(Three-Layer Review Separation)

> **Serves Tier 1 命题**:Verification(**输出侧** —— 三层错位机制把"是否验证过"变成可重复、可追溯的产物)。参见 [§0.1 命题 1](#01-这本手册解决什么)。

#### 主张

对照规则检查代码这件事,根据**规则的来源**分三层(L1 / L2 / L3),每层用不同机制 —— **不要混在一起做**。

| 层 | 规则源 | 问的问题 | 失败模式 |
|---|---|---|---|
| **L1** 通用规则 | `~/.claude/rules/*`(全局)+ language defaults | 代码规范吗? | 通用工程错误 |
| **L2** 项目约定 | `AGENTS.md` + `.claude/rules/` | 长得像这个项目吗? | 风格/结构错 |
| **L3** 功能规约 | `docs/specs/<NNN>/spec.md` | 做了说要做的事吗? | 行为/范围错 |

#### 底层逻辑

三层的失败模式**正交** —— 一层错(代码不规范)、另一层错(不像本项目代码)、第三层错(没实现需求)。混合 review 会:

1. reviewer prompt 过长 → 判断弱化
2. 一层错被另一层"通过"掩盖 → 漏检
3. 无法精准修复 → 不知道是结构问题还是行为问题

→ **正交问题用正交工具,各管各**。

#### 依据

| 类型 | 内容 |
|---|---|
| 官方结构 | Anthropic 把项目规则分为 `~/.claude/rules/`(用户级)、`./CLAUDE.md`(项目级)、`<module>/CLAUDE.md`(模块级)、docs/specs/(功能级) —— 文件级别就是分层 |
| 业界对照 | Spec Kit 用 `spec.md` + `plan.md` + `tasks.md` 三文件;mcpmarket "Drift Detection" / "Drift Analysis" / Cavekit `/ck:check` 都做 spec-vs-code drift(L3),没人专门做 L2 → 印证 L2/L3 是不同问题 |
| 综合命名 | 三层分类是我的综合命名,但底层事实(三种规则源)是官方分层的具体化 |

#### 怎么用

| 层 | 工具 | 时机 |
|---|---|---|
| L1 | hooks(eslint / ruff / gofmt + universal rules)| 文件保存后(P3 持续) |
| L2 | reviewer agent + AGENTS.md 作 context | 端点(P3 proof bundle) |
| L3 | reviewer agent + spec.md 作 context + 测试 | 端点(P3 proof bundle) |

**组合在调用处**:proof bundle 是 L2 + L3 组合点,不是 skill 层组合。skill 保持小而锐,workflow 调用时拼装。

#### L2 / L3 Reviewer 承诺

调用 [`agents-md-reviewer`](../agents/agents-md-reviewer.md) / [`spec-reviewer`](../agents/spec-reviewer.md) 时,reviewer 遵守以下契约——这些不是建议,是 reviewer 给 caller 的硬承诺:

| 承诺 | 含义 | 对应命题([§0.1](#01-这本手册解决什么)) |
|---|---|---|
| **Cite-or-skip** | 每条 finding 必须引用规则原文(`AGENTS.md §X` / `spec.md §X` + ≤ 1 行原文)。不允许新增"通用最佳实践"建议 | Verification(输出可追溯)|
| **Fresh-read mandate** | 每次调用必须重读规则文件(不依赖对话上下文),保证 reviewer 不被会话漂移影响 | Drift 时间维度(同代码两次结果可重现)|
| **4-phase methodology** | Extract checklist → Verify(distributed rule 禁止 spot-check)→ Per-element matrix(失败时)→ Calibrated confidence | Verification(机械流程减少漏检)|
| **Coverage 指标** | 输出 `coverage = fully_verified / total × 100%`;high confidence 需 ≥ 95% **且**无 skipped | Verification(覆盖率可量化)|
| **Ambiguity feedback** | 发现规则模糊或矛盾时主动 flag 给 caller(`📝 ambiguities` 段) | Drift 演进维度(规则瑕疵闭环到 P4)|

**workflow 调用方不必背契约**,但**知道这些保证**有助于判断 review 结果可信度,以及解释"为什么 reviewer 不给某条它做不到的建议"。完整契约定义见 reviewer skill 文件本身。

#### 失效情形

通用情形见 [§9 何时偏离](#9-何时偏离手册)。本原则特有的:

- **设计期** → 还没代码,L1 / L2 都用不上,只 review spec 文本
- **完全 AI 自主项目**(没人定项目约定) → 没有 AGENTS.md 时 L2 退化为 L1
- **跨语言模块** → L1 hook 要按文件类型分支,复杂
- **legacy 代码** → 老代码大量违反 L1/L2,先 lock("不报警旧代码"),只对新改动 enforce

---

## 7. 反模式(明确说"不要")

### 7.1 不要用中途反思代替前置 spec
**症状**:没写 spec → AI 写一半你发现不对 → "反思一下再写"→ 重复 N 轮
**修正**:出现第二次反思时停,回去补 spec.md 把决策固化,然后 AI 重启写

### 7.2 不要叠加两个 process-owning 框架
**症状**:同时装 superpowers + project-workflow / ECC + project-workflow 等
**修正**:挑一个,其他用 small composable skill 补

### 7.3 不要把 review 留到 PR(也不要每行做)
**修正**:hook 管机械错(每文件),agent review 管设计安全(每 feature 末尾),人审管方向(每 PR)。**三层错位**

### 7.4 不要为了用 AI 拒绝键盘改 5 行代码
**症状**:改动 < 5 行且你脑子里有答案,还非要让 AI 写
**修正**:AI 不是宗教,小改自己来更快

### 7.5 不要让 spec.md 和 plan.md 内容混淆
**修正**:WHAT 进 spec(用户视角,冻结);HOW 进 plan(技术视角,可补)

### 7.6 不要把上层投资沉到底层工具
**症状**:把项目规则只写进 `.cursorrules`(Cursor 专用)而不是 AGENTS.md
**修正**:协作约定写在工具无关位置(AGENTS.md / docs/),工具特定位置只放工具特异配置

### 7.7 不要在 P0 没做完就跳到 P2
**症状**:还没建 AGENTS.md / hooks 就开始写 feature
**后果**:基线缺失,每个 feature 都要重新讨论项目惯例
**修正**:严格按 P0 → P2 顺序;P0 没做完不开 feature(模块新增是 P2 内 sub-flow,见 §2)

### 7.8 不要把 backlog 塞进 repo 文件
**症状**:`docs/backlog.md` / `TODO.md` 跟踪未决事项
**后果**:重复维护(Issues + 文件),搜索 / 排序 / 通知都退化
**修正**:backlog 走 GitHub/GitLab Issues + labels;只有"详细设计 > 200 行"才单独成文件

---

## 8. 栈适配示范(以 Nuxt 4 + FastAPI 为例)

> **栈适配层** —— 本节是把 P0-P4 落到具体工具命令的映射。**换栈只需重写本节**,前面的方法论(§0-7、§9、§10)不变。
>
> **栈级陷阱**:[`docs/gotchas.md`](gotchas.md) —— 10 条从真实搭建过程中沉淀的具体踩坑(Docker / asyncpg / Pydantic extras / 测试基建)。

### 8.1 Vue 3 / Nuxt 4 前端

| 层 | 工具 | 用法 |
|---|---|---|
| 实时(P3) | Volar / Vue LSP | 类型错即写即知 |
| Hook(P3) | `eslint --fix` on .vue/.ts/.tsx | `.claude/hooks/lint-on-edit.js` 中 case 分支 |
| Hook | `vue-tsc --noEmit`(可选) | 抓类型错 |
| 测试 | Vitest + @vue/test-utils + Playwright(e2e) | spec.md verification 引用 |

### 8.2 FastAPI 后端

| 层 | 工具 | 用法 |
|---|---|---|
| 实时(P3) | Pyright / Pylance LSP | 实时类型检查 |
| Hook(P3) | `ruff check --fix` on .py | 同时管 lint + format |
| Hook | `mypy`(全量慢,启动跑) | 严格类型,中途靠 LSP |
| 测试 | pytest + httpx + pytest-asyncio | spec.md 引用 |
| Schema | Pydantic v2 严格模式 | "职责分离"具体落地 |

### 8.3 Go / Rust(次要语言)

| 层 | Go | Rust |
|---|---|---|
| 实时 | gopls | rust-analyzer |
| Hook | `gofmt -w` + `go vet ./...` | `cargo fmt` + `cargo clippy` |
| 测试 | 标准 `testing` + table-driven | `cargo test` |

### 8.4 跨语言通用工具

- **Agent review(P2.3 / P3)**:`pr-review-toolkit:review-pr` 等 → 交付时跑
- **安全(P2.3)**:`/security-review` 原生 → 涉及认证/输入/密钥时
- **文档拉取**:`context7` MCP → 外部库版本相关问题
- **提交**:`commit-commands` skill

### 8.5 本地开发 + 同步发布

详细见 [`dev-deploy.md`](dev-deploy.md)。骨架:

- 本地容器化后端 + 原生前端
- 三档 env(dev / 本地验证生产 / 生产)
- 三阶段:dev → 本地验证生产镜像 → 服务器
- 反模式:venv 跑本地 + Docker 跑生产 → 环境漂移

### 8.6 全栈项目的后端先行(Backend-First Tactic)

**仅适用全栈项目**(前端依赖后端 API 的项目)。这是 §6.1 spec-driven 在全栈场景的时间维度落地。

**主张**:全栈功能开发时,后端 API 先实现并稳定,**再做前端**。

**为什么**:前端依赖后端契约;先写前端会逼 AI 猜 API 形状,而 AI 容易"自洽地猜错"(产出能跑但跟最终后端不匹配)。先把后端接口和 schema 钉死,前端基于真实 swagger 实现。

**怎么用**:
- plan.md 的 task breakdown **先列后端任务,再列前端**
- 后端完成阶段:swagger 文档可访问 + 关键端点本地能 curl 通
- 前端写 composable(`useXApi`)时基于真实 swagger,不基于猜测
- 例外:纯前端改造(UI 重构、动画、纯展示页)无需后端先行

**与 AI 协作的特殊考量**:AI 在 prompt 里看到不完整的 API 定义时倾向"补全",这是幻觉源头。后端先行 + swagger 实测 = 砍掉前端 AI 幻觉的最大单一杠杆。

---

## 9. 何时偏离手册

| 场景 | 建议偏离方式 |
|---|---|
| 改动 < 50 行 | 跳过 spec,直接做;hook 仍生效 |
| 探索性 spike | worktree + vibe coding,事后写 ADR 而非 spec |
| 紧急生产 hotfix | 直接修,事后补 spec 和测试,记 tech debt |
| 架构变更 | **不要偏离**:必须写 spec + ADR,worktree 隔离试 |
| 改文档 | 跳过所有 gate,只看 diff |
| 别人代码的小修 | 遵守对方风格,不强加本手册 |
| 玩具 / 一次性脚本 | 跳过整个 P0 工程化,直接 vibe coding |

---

## 10. 局限性与边界条件

本手册不是宇宙真理。诚实列出适用边界与已知盲点。

### 10.1 适用范围

**适合**:
- 单人 / 小团队(1-10 人)的 AI 协作开发
- 中长生命周期项目(预期 > 3 月)
- 有明确产品形态(不是纯研究)
- 主要在 GitHub / GitLab 平台

**不适合**:
- 一次性脚本 / 玩具(过度工程化)
- 纯研究 / 探索项目(spec 抑制了探索)
- 团队 > 50 人(需要 SAFe / 企业级流程,本手册过轻)
- 高合规场景(医疗 / 金融 / 军工,需要更重的形式化方法)
- 完全 AI 自主项目(无 human-in-the-loop)

### 10.2 关键假设的边界

本手册基于几个假设,如果你的场景不符,需要重新评估:

| 假设 | 失效情形 |
|---|---|
| AGENTS.md 是跨工具事实标准 | 18 个月后社区可能转向别的命名;Cursor / Gemini CLI 渗透率待观察 |
| Skills(SKILL.md)跨工具兼容 | 各家实现细节有差异,**真跨工具需实测** |
| Hooks 概念在各工具有等价物 | Codex 当前仅 Bash 触发,跨工具桥接成本不为零 |
| `CLAUDE_CODE_NEW_INIT=1` 稳定 | 未在公开 changelog,Anthropic 可能改 flag 名或废 |
| Anthropic Boris Cherny 100 行标杆 | 引用自 obviousworks 文章,非一手公开发言 |

### 10.3 已知失败模式

| 失败模式 | 信号 | 应对 |
|---|---|---|
| **过度工程化** | P0 配了一堆 hook / rules / ADR 模板,实际 feature 还没开发 | 把 P0 砍到 30 分钟内能完成的最小集 |
| **spec 变 todo list** | spec.md §1-4 模糊,§5 task 详细 | 严格按 1→6 顺序,§5 在 §1-4 写完之后 |
| **CLAUDE.md 膨胀** | 项目 6 月后 CLAUDE.md > 300 行,AI 依从度肉眼下降 | P4 refresh,把可机械化的搬 hooks(§6.3) |
| **hook 不稳定** | hook 频繁失败但不影响开发(因为没读 stderr) | 失败用 `exit 2`,把信息回喂 AI |
| **三层 review 重叠** | reviewer 一个 review 把 L1/L2/L3 全跑了,prompt 1000+ tokens | 拆 reviewer 调用,各自只给对应 context |

### 10.4 演化承诺

本手册不是 v1.0 终版。明确的演化触发点:

- **半年内**(2026-11 之前):Phase 2 在真实项目跑通后,如发现失败模式 → 修订
- **AGENTS.md 渗透率变化** → §1.3-1.4 内容跟进
- **`/init` 新版稳定 / 改名 / 废弃** → §1.10 同步
- **跨工具实测发现差异** → §6.3 失效情形扩充
- **新的方法论流派出现** → §6 重新审视

---

## 附:跟现有工具的关系

- **`~/.claude/rules/`**(官方支持):本手册的全局规则集,跨项目通用,P0 时初始化
- **project-workflow v2**:本手册是它的核心文档,template/ 是 P0 starter kit,tools/ 是 P0/P4 工具
- **`pr-review-toolkit`**:P2.3 / P3 端点 review,跨工具复用
- **`context7` MCP**:P2 实施期间外部库文档拉取
- **GitHub Spec Kit `/speckit.clarify`**:P2 spec 不完整时的 Q&A 工具(可选)
- **`CLAUDE_CODE_NEW_INIT=1`**:P0 初始 Q&A 的官方实现(实验性,见 §10.2)

---

## 参考与延伸

### 官方文档(权威依据)

- [Anthropic — CLAUDE.md / memory](https://code.claude.com/docs/en/memory)
- [Anthropic — Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Anthropic — Hooks reference](https://code.claude.com/docs/en/hooks)
- [Anthropic — Skills](https://code.claude.com/docs/en/skills)

### 业界实践(借鉴)

**Verification 命题**:
- [GitHub Spec Kit](https://github.com/github/spec-kit) —— 重型 spec 工具链
- [Addy Osmani — How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) —— 轻量 spec 流派
- [Spec-Driven Development arXiv 2602.00180](https://arxiv.org/abs/2602.00180) —— 110k+ bug 数据
- [OpenAI Symphony](https://github.com/openai/symphony) —— manage work, not agents(proof bundle 概念源)
- [Testing Is the New Bottleneck for AI-Driven Development — MetalBear](https://metalbear.com/blog/testing-bottleneck-ai/) —— 验证瓶颈现象描述

**Context-as-RAM 命题**:
- [Mem0 — State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026) —— "Context Window Behaves Like RAM, Not Storage"
- [State of Context Engineering 2026](https://www.newsletter.swirlai.com/p/state-of-context-engineering-in-2026) —— Aurimas Griciūnas 综述

**Drift 命题**:
- [Martin Fowler — Encoding Team Standards](https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html) —— 团队约定机读化
- [Propel Code — AI Codebase Drift Cleanup Loops](https://www.propelcode.ai/blog/ai-codebase-drift-cleanup-loops) —— drift 检测产品视角
- [Your AI-written codebase is drifting — DEV Community](https://dev.to/skaaz/your-ai-written-codebase-is-drifting-heres-how-to-measure-it-f10) —— drift 度量方法

**工作流哲学**:
- [Addy Osmani — My LLM coding workflow 2026](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)
- [Matt Pocock — Skills for Real Engineers](https://github.com/mattpocock/skills) —— small composable 哲学
- [Jesse Vincent — Superpowers](https://github.com/obra/superpowers) —— 反向参考(process-owning 风格)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) —— ADR 模板源

### 内部交叉

- [`spec-driven.md`](spec-driven.md) — P2 spec 三文件详解
- [`dev-deploy.md`](dev-deploy.md) — P0 hooks 配 + 部署详解
- [`tooling.md`](tooling.md) — 各 AI 工具横向比较
- [`proposals/agents-md-maintenance-skill.md`](proposals/agents-md-maintenance-skill.md) — P4 refresh skill 详细设计
