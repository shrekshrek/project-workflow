# AI 辅助开发工作流手册:5 阶段通用蓝图

> 本手册是 [project-workflow v3](https://github.com/shrekshrek/project-workflow) 的核心文档。
>
> 描述任何**新项目从启动到持续维护**的 5 阶段流程。**方法论核心工具无关、栈无关**(具体栈映射见 §8;工具适配边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md))。
>
> 风格:opinionated 但可 hack —— 任何一条都可以为具体场景偏离,只要清楚为什么。

---

## 0. 起点

### 0.1 这本手册解决什么

AI 协作开发有**三个 Tier 1 工程痛点**,本手册的 5 阶段、4 支柱、所有具体机制都为这三件事服务。

#### 命题 1:Verification —— AI 生成快过人类验证

**问题**:AI 代码产出速度远超团队 validate 能力,没看过的代码进仓库,bug / hallucination / 偏离 spec 都被漏过。

**社群证据**:Boris Cherny(Anthropic / Claude Code lead):*"The most important thing is to give Claude a way to verify."*(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:
- **输入侧**:[§6.1 Spec-driven](#61-规约先于代码spec-driven) —— 用 spec.md 把"做什么"冻结成契约
- **输出侧**:[§6.4 三层 review](#64-按规则源分层验证three-layer-review-separation)(L1 机械 / L2 项目约定 / L3 spec 合规)+ [§3.3 proof bundle](#33-交付阶段proof-bundle)

#### 命题 2:Context-as-RAM —— 上下文是有限预算,不是无底磁盘

**问题**:AI 的 context window 行为像 RAM 不像 storage —— 装得越多 attention 越散,长会话依从度下降,token 成本爆炸。

**社群证据**:[Mem0 — Context Window Behaves Like RAM, Not Storage](https://mem0.ai/blog/state-of-ai-agent-memory-2026)(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:[§6.2 Context budget](#62-上下文是有限预算context-budget) —— AGENTS.md 行数纪律 + path-scoped rules 按需加载(Claude: `.claude/rules/`) + `@imports` 组织长尾 + `/clear` / `/compact` + 小 composable skills

#### 命题 3:Drift —— 规范在时间/空间/演进三向漂移

**问题**:AI 没有跨会话长期记忆,规范会朝三个方向漂——**时间**(同代码不同 session 评判不同)、**空间**(模块 A 跟模块 B 风格不一致)、**演进**(项目第 1 月跟第 6 月代码风格差)。

**社群证据**:[Martin Fowler — Encoding Team Standards](https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html)(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:[§6.3 Env-enforced rules](#63-规则由环境强制environment-enforced-rules)(hooks 机械强制)+ [§1 P0 AGENTS.md](#1-p0project-setup项目第一天) 单一 source of truth + [§5 P4 Drift Refresh](#5-p4drift-refresh主动修正)

#### 跨层不一致(全栈 tactic,不是独立命题)

全栈项目的前/后/DB 跨 tier 契约漂移**是真实问题但社群证据较弱**(被视为通用架构问题,不是 AI 特有)。project-workflow 不把它升级为独立命题,而是作为全栈项目的具体战术处理 —— 见 [§8.6 Backend-first](#86-全栈项目的后端先行backend-first-tactic)。

---

**本手册不是什么**(boundary,避免误解):

- **不是 process-owning 框架**:不强制按某固定顺序敲某些命令(反例见 [§7.2](#72-不要叠加两个-process-owning-框架))
- **不承诺"AI 一次写对"**:目标是消除"对齐劳动"([§0.5](#05-实现策略的核心信念)),不消除迭代
- **不是某个工具的使用手册**:Claude Code / Codex / 手工流程都是 runtime adapter;本手册定义的是 adapter 之上的工程方法。

### 0.2 5 阶段全景

> **关于编号**:下图没有 P1 是**有意**——早期版本把"P1 Module Setup"列为独立阶段,实践证明**模块几乎不独立发生,几乎总是 P2 feature 的子产物**,所以降级为 P2 sub-flow。空着 P1 保留这段设计 narrative;详细机制见 [§2 Module Setup](#2-module-setupp2-内的-sub-flow非独立-phase)。

```
┌─────────────────────────────────────────────────────────────┐
│ P0: Project Setup(项目第一天)                                   │
│ ─ Q&A → starter kit(AGENTS.md/CLAUDE.md/rules/hooks/specs) │
│ ─ 工具:project-init action(Claude / Codex / manual adapters) │
├─────────────────────────────────────────────────────────────┤
│ P2: Tracked Feature Development                             │
│ ─ /feature-init <slug> → full:spec/plan/tasks 或 light:tasks │
│ ─ 后端先行(全栈适用)→ 实施 → proof bundle 端点交付         │
│                                                             │
│   ↳ Module Setup sub-flow(P2 内嵌触发,非独立 phase)        │
│      ─ spec 阶段识别"需新模块" → plan 加边界 → tasks 加骨架  │
│      ─ 仅"反常"时加 <module>/AGENTS.md(见 §2.3)             │
├─────────────────────────────────────────────────────────────┤
│ P3: Continuous Maintenance(开发期间常驻)                    │
│ ─ hooks 自动校验(L1 通用 + L2 项目约定)                    │
│ ─ 端点 review:L3 spec 合规 + AGENTS.md drift 建议           │
│ ─ backlog / discussions 走平台原生(Issues / Discussions)   │
├─────────────────────────────────────────────────────────────┤
│ P4: Drift Refresh(主动/周期性)                              │
│ ─ /agents-md-revise 用户主动调(周期 / 感知 drift)         │
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

#### 文档物理位置(代码组织维度)

这张表回答 "**文件长哪、在树里哪里**";紧接的 5 类表回答 "**文件回答什么问题**"。两表正交,合起来形成完整心智模型。

| 代码组织级别 | 文件 | 何时存在 |
|---|---|---|
| **项目级** | `AGENTS.md` + `CLAUDE.md` | 必然 |
| **Tier 级**(可选,嵌套) | `<tier>/AGENTS.md` + `CLAUDE.md`(如 `backend/`、`frontend/`) | 仅多 tier 项目 |
| **模块级**(可选,嵌套) | `<module>/AGENTS.md` + `CLAUDE.md` | 仅模块"反常"时(见 [§2.3](#23-反常判定何时该写模块-agentsmd)) |
| **功能级** | `docs/specs/changes/<NNN>-<slug>/` 或轻车道 `tasks.md`;archive 在 `docs/specs/changes/archive/` | `/feature-init` |
| **产品域级**(扁平) | `docs/specs/index.md` + 按需 `docs/specs/<area>.md` | P0 `project-init` 建索引;正文 `/feature-archive` merge |
| **路径级约定**(扁平 + 路径匹配) | core 语义是 path-scoped rules;Claude adapter 默认 materialize 为 `.claude/rules/*.md`(如 `code-style.md` / `testing.md` / `security.md`) | P0 默认含若干 topic;Claude 用 globs 触发按需加载(见 [§1.6](#16-路径级规则claude-rules官方支持));其他 adapter 映射到自己的规则载体 |
| **跨功能决策**(扁平,不嵌套) | `docs/adr/NNNN-<title>.md` | 重大架构选择 / spec-revise([§3.5](#35-开发中发现-specplan-错怎么办))/ 模块边界变更([§2.6](#26-module-中途变更feature-实施中发现边界要调整)) 时 |
| **工具基础设施**(扁平,不嵌套) | Claude adapter 默认 `.claude/{hooks,settings.json}` + `.gitignore`(+ drift 状态:`.claude/refresh-ignore` / `.claude/drift-ledger.md`) | P0 默认创建,后续按需扩展;其他 adapter 使用自己的 hook / config 目录 |

#### 文档职责 5 类(总框架)

> 上一张表是**空间正交轴**(文件住在哪);本表是**职责正交轴**(文件回答什么问题)。

| 类别 | 文件 | 回答什么问题 | 时间维度 | 何时存在 |
|---|---|---|---|---|
| **A. 约定**(Conventions) | `AGENTS.md`(项目 / tier / 模块 3 级嵌套)+ path-scoped rules(路径 / topic 级规则;Claude materialization 为 `.claude/rules/*.md`)+ adapter alias(Claude 为 `CLAUDE.md` 1 行 alias) | "我们**现在**怎么工作?"(规则 / 风格 / 最佳实践) | 当前态;AGENTS.md 3 层频率梯度见 [§1.3](#13-agentsmd-的内容标准),path rules 的 Claude materialization 见 [§1.6](#16-路径级规则claude-rules官方支持) | 项目级必然;tier / 模块级可选 |
| **B. 变更**(Changes) | `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` 或轻车道 `tasks.md`;交付后移入 `docs/specs/changes/archive/` | "这次 tracked change **做什么 + 怎么做 + 步骤**?" | per-change 生命周期,完成后**物理归档** | `/feature-init` 或行为变更下限(轻车道) |
| **C. 决策**(ADR) | `docs/adr/NNNN-<title>.md` | "**当时为什么**这么选?+ trade-off?" | 时间戳化快照,append-only | 重大架构选择 / spec-revise / 模块边界变更时(§3.5 / §2.6)|
| **D. 工具基础设施**(Infra) | adapter hooks / settings + `.gitignore`(Claude materialization 为 `.claude/{hooks,settings.json}`) | "工具**自动跑**什么?" | 跟项目演化 | P0 默认创建,后续按需扩展 |
| **E. 产品事实**(Domain docs) | `docs/specs/index.md` + 按需 `docs/specs/<area>.md`;变更在 `docs/specs/changes/` | "这个产品/系统域**现在**怎么工作?" | 当前态;`feature-archive` merge 更新 | P0 建索引;area doc 在有当前事实可沉淀时创建 |

**两轴交叉规则**:
- 代码组织维度只影响 **A. 约定** 中 AGENTS.md 部分的嵌套层数(根 / tier / 模块);path-scoped rules 是 A 类但**扁平**,由各 adapter 映射到自己的路径匹配机制(Claude 为 `.claude/rules/` + `globs:`)
- B / C / D / E 四类与代码组织维度独立,**不按 tier / 模块嵌套**

**A vs E 分界**(都是"当前态",别混):A 回答**工程上怎么干活**(命令 / 风格 / 边界),E 回答**产品现在长什么样**(IA / 行为 / 契约现状)。工程约定永远进 A,产品域现状进 E;E 不存在时,B 类历史 spec 只是审计材料,不是实施基线(见 [spec-driven.md §5](spec-driven.md#5-spec-生命周期))。

**新读者心智地图**(读完本节就能定位任何文档):

```
"想看项目规则 / 架构约定"     → A(项目 AGENTS.md)
"想看本 tier 特殊约定"        → A(<tier>/AGENTS.md)
"想看代码风格 / 测试 / 安全"  → A(path-scoped rules;Claude: .claude/rules/<topic>.md)
"想看 feature 设计"          → B(docs/specs/changes/<NNN>-<slug>/;已交付的在 docs/specs/changes/archive/,只当历史读)
"想看为什么选 X"             → C(docs/adr/NNNN-<X>.md)
"想看 hook / 工具配置"        → D(.claude/hooks/, .claude/settings.json, .codex/hooks.json)
"想看某产品域现在的样子"      → E(docs/specs/<area>.md;没有 E 时读最新 active spec 或 archive,但警惕过时)
```

#### Methodology core vs runtime adapter

project-workflow 分两层:

| 层 | 负责什么 | 是否绑定工具 | 例 |
|---|---|---|---|
| **Methodology core** | 流程、不变量、workflow action、reviewer 方法、文档契约、review 分层 | 否 | `AGENTS.md`, `docs/actions/`, `docs/reviewers/`, `docs/specs/`, `docs/specs/changes/`, ADR, proof bundle, L1/L2/L3 |
| **Runtime adapter** | 把 core 自动化到某个工具 | 是 | Claude Code plugin skills, Codex skills/plugins/hooks, shell scripts |

Core docs 只定义"应该发生什么";adapter docs 定义"在某个工具里怎么触发"。其中 `docs/actions/` 是每个 workflow action 的唯一权威层,定义触发、输入、输出、不变量和验证;`docs/reviewers/` 是 reviewer / auditor / researcher 的唯一权威层。本文后续出现的 `/project-workflow:*` 是 Claude Code adapter 的当前成熟入口,不是方法论本体。Codex / 手工模式应执行同一 action,但入口可以不同。完整映射见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

### 0.4 项目核心目标

> **项目可控、规范自维持** —— 多模块/多功能可独立并行推进,每个增量跟项目整体保持一致,**不依赖反复人工提醒**。

三个子目标(后续 5 阶段流程都是为这三件事服务):

| 子目标 | 含义 | 主要支撑机制 |
|---|---|---|
| **解耦开发** | 模块/功能可独立推进,边界清晰 | 功能 spec + 模块化 + 契约先于实现(§8.6) |
| **规范一致** | 跨模块/跨功能的代码风格/架构/约定不漂移 | AGENTS.md + hooks 自动强制(§6.3) |
| **方向稳定** | 每个增量不会跑偏,AI 输出始终在 spec 边界内 | 三层 review(§6.4)+ proof bundle 端点验证(§3.3) |

**关于"自维持"的真实含义**:这不是"100% 自动化",而是 **蓝图侧提供的工具/约定 + 纪律侧的用户实践协同**。详细分工见 [§6.0](#60-每条原则的两侧组成读-6164-前必读)。

### 0.5 实现策略的核心信念

要达成 §0.4 的目标,必须接受两个事实(不是手段,是前提):

1. **目标是消除"对齐劳动",不是消除迭代**。

   真正该消除的:开发期间人反复提醒 AI **"注意命名"、"注意结构"、"注意规范"** 这一类**对齐对话** —— 这是真正的内耗,不是 AI 错,是规范没在系统层固化。
   
   不该追求的:让 AI"一次写对"或"零迭代"。合理迭代本身不是问题。
   
   **解法**:规范靠环境 + 文档自维持(hooks / lint / types / tests / AGENTS.md / spec.md),让对齐对话发生在**系统跟 AI 之间**,不再发生在**人跟 AI 之间**(见 §6.3)。

2. **方法论 core 必须 portable;adapter 可以 opinionated**。

   `AGENTS.md` / `docs/actions/` / `spec.md` / ADR / proof bundle 这层用最广可读的格式(markdown + 标准约定),让 Claude Code、Codex 和手工流程都能执行同一方法论。Claude Code plugin 是当前最成熟 adapter;Codex adapter 可以另行实现,但不能复制一套不同的方法论。

   **底层逻辑**:底层工具是 weeks-级别迁移成本,上层规范(AGENTS.md / spec.md)是 months-级别投入。上层规范必须 portable;工具特有能力(hooks / plugin manifests / sub-agent 配置)放进 adapter,不要反向污染 core。详见 §7.6 反模式 + [`cross-tool-methodology.md`](cross-tool-methodology.md)。

3. **Plugin / skill 工具的角色:scaffold + 条件性框架问 + 提醒 + 兜底,不当 interviewer 替 user 决策业务细节**。

   Plugin 应该做的:
   - **Scaffold** ── 起骨架(spec/plan/tasks 模板 / AGENTS.md 多层 / path-scoped rules;Claude materialization 为 `.claude/rules/`)
   - **条件性框架 Q&A** ── 只问 user **当下能答 + audit 无法替代 + 延后成本极高** 的 branch 决策(如 slug / module 边界 / tier 归属);这些 once-and-done,不属"反复提醒"
   - **Reminders** ── 把 mission-critical checkpoint(如 Scope "不做" / Sibling Alignment)前置作提醒,让 user 在 conversational fill 时主动注意,不预问
   - **Adaptive hooks** ── 被动触发(user 提到选型不确定 → dispatch tech-researcher;要查外部库 → context7),不预设题
   - **Audit safety net** ── decision-completeness-auditor catch plant,`/spec-quality-check` gate 把关质量

   Plugin **不该做**的:
   - 预设**固定 Q&A interview**(13 题清单式问业务细节)── feature 类型多样(CRUD / FE / job / refactor / ML 各不同),固定 Q&A 不可能通用
   - 早期强问 user **答不准** 的内容(Scope "不做" 要看完架构才知边界;Sibling Alignment 要熟 sibling 模块现有约定)── 早问只会让 user 编凑数答案污染 spec
   - 替 user 决策**业务细节**(字段名 / endpoint path / 错误码 / library 选择)── 这些应 conversational fill,系统侧 audit 兜底 plant

   **底层逻辑**:这是 §0.4 "不依赖反复人工提醒" + §0.5 信念 #1 "对齐对话在系统 - AI 之间"在 adapter 层的落地。**关键区分:framework decision(必问)vs business detail(conversational fill + gate)** ── 准则是"audit 能否 cheaply catch + user 是否当下能答 + 延后成本"。详见 [§6.3 规则由环境强制](#63-规则由环境强制environment-enforced-rules) + `/feature-init` SKILL.md 实现。

**做对了之后的副产物**(不追求,但顺带得到):
- 迭代成本自然下降 —— 系统接管机械合规后,你不必盯每一步
- AI 输出更稳定 —— 规范常驻 → 输入更清晰 → 输出收敛
- 项目跨人 / 基本跨工具传递成本低 —— 上层 markdown 资产可读性强(但工具切换本身不是 project-workflow 优化目标)

---

## 1. P0:Project Setup(项目第一天)

### 1.0 P0 前置:pre-init brainstorm(可选)

**触发**:还没想清楚"项目要做什么"——只有模糊想法,先 brainstorm 再起 P0。

| 你的状态 | 该做什么 |
|---|---|
| **完全模糊**("想做个 X,具体形态没想清")| 主会话跟 AI 自由 brainstorm(核心用户 / 最痛问题 / MVP 边界 / 2-3 个 reference 项目)→ 1-2 小时通常够 → 完了再跑 `/project-init` |
| **已有 idea + 不确定栈** | 跳过 brainstorm,**直接 `/project-init`** —— Q&A "不确定"时自动 dispatch [`tech-researcher`](reviewers/tech-researcher.md) 调研 |
| **Retrofit 既有项目** | 跳过 —— 跑 [`/project-personalize`](../skills/project-personalize/SKILL.md)(已有 codebase 已经是 brainstorm 产物)|

**project-workflow 不工具化这个阶段**——brainstorm 本质发散,SOP / mandatory skill(Superpowers 风格)反而磕碰。**主会话自由对话最合适**;产物**不必落盘**,直接喂 `/project-init` Q&A 即可。若要存档,走 GitHub Discussions / Issues(per [§4.4](#44-backlog-与讨论走平台不进-repo-文件) "AI 读 → 文件,人类协作 → 平台")。

**外部工具**(可选):Anthropic 内置 / ECC / Superpowers 各有 brainstorming skill,选你顺手的或直接用 AI 主会话 —— project-workflow 不强制。

### 1.1 触发与目标

**触发**:
- 新项目第一天
- 老项目首次引入 AI 协作

**目标**:60 分钟内,通过一次交互式 project setup 生成完整 starter kit,让后续所有开发都站在一致基线上。

### 1.2 产出物(完整 starter kit)

P0 产出物分**两层**(职责严格不重叠):

**A. 方法论层**(必备,语言中立,模板见 [`template/`](../template/))

```
项目根/
├── AGENTS.md                       # 项目级约定入口,跨工具事实标准
├── CLAUDE.md                       # Claude adapter alias:1 行 @AGENTS.md(或 symlink)
├── .claude/
│   ├── rules/                      # Claude adapter 对 path-scoped rules 的 materialization
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── security.md
│   ├── hooks/
│   │   └── lint-on-edit.js         # 骨架(具体 lint 命令栈相关,见 B 层)
│   └── settings.json
├── .codex/                         # Codex adapter runtime enforcement
│   ├── hooks.json                  # PostToolUse hook mapping
│   └── hooks/
│       └── lint-on-edit.js         # thin wrapper over .claude/hooks/lint-on-edit.js
├── docs/
│   ├── adr/                        # 架构决策记录
│   │   ├── README.md
│   │   └── 0000-template.md
│   └── gotchas.md                  # 工程陷阱清单(从 blueprint 仓库复制进项目)
│   # docs/specs/changes/<NNN>-<slug>/ 由 /feature-init 按需创建;
│   # spec/plan/tasks 模板由 /feature-init 提供,项目本地默认不持有
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

**规则**:A 层是"方法论 + adapter materialization",换什么栈都不变;B 层是"工程化",换栈重写。**永远不在 A 层放栈特定应用代码**(那是 B 层的事),否则 template 会污染。

> **跨工具口径**:`docs/specs/`、`docs/specs/changes/`、`docs/adr/`、`AGENTS.md` 是目标项目的 portable core 文件。路径级规则的 portable core 是"哪些规则作用于哪些路径"这个语义;`.claude/rules/` 只是 Claude adapter 的默认实现。Codex / OpenCode / Cursor 应映射到自己的规则载体,而不是把 `.claude/rules/` 当成方法论本体。

**关于 `CLAUDE.local.md`**:**不在 P0 自动创建**。它是 gitignored 的个人项目私有覆盖(沙箱 URL / 临时 WIP / 个人测试账号等),**需要时再手动 `touch`**。`.gitignore` 提前列好,这样用户哪天创建它不需要再改 .gitignore。
官方推荐用法详见 [Anthropic — CLAUDE.md docs](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)。

<a id="13-a-类约定的内容标准agentsmd--claude-rules"></a>
<a id="13-a-类约定的内容标准agentsmd--clauderules"></a>

### 1.3 A 类约定的内容标准(AGENTS.md + path-scoped rules)

A 类约定有两个 core 载体——**AGENTS.md**(嵌套 / 全局加载)+ **path-scoped rules**(扁平 / 路径或 topic 触发)。Claude Code adapter 默认把 path-scoped rules materialize 为 **`.claude/rules/<topic>.md`**;Codex / OpenCode / Cursor 应映射到自己的规则载体。本文用 `.claude/rules/` 讲机制时,指的是 Claude adapter 实现,不是方法论本体。

#### AGENTS.md 内容标准

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

#### Path-scoped rules 内容标准(Claude materialization: `.claude/rules/<topic>.md`)

跟 AGENTS.md 不同的约束(因为不全局加载):

| 标准 | 数值/做法 |
|---|---|
| 大小上限 | < 300 行(比 AGENTS.md 宽,因为按需加载) |
| 拆分时机 | 一个 topic > 200 行 → 拆 sub-topic;一个 file 涉多 framework → 按 framework 拆 |
| 结构 | markdown headers + bullets;顶部一行注释指向 ADR / 社区 source(可追溯) |
| frontmatter | `globs: pattern1, pattern2`(comma-separated 字符串;**不要**用 `paths:` YAML 列表,silently fails —— 见 §1.6) |

**典型 topic 拆分**(P0 默认 `/project-init` 生成):
- `code-style.md` —— 命名 / 缩进 / 行宽 / 注释纪律 / 函数大小
- `testing.md` —— 框架 / 文件组织 / TDD 纪律 / 覆盖率
- `security.md` —— 🚫 Never / ⚠️ Ask first / ✅ Always

**何时加新 topic file**:
- framework-specific 约定多了(如 FastAPI、Vue 项目级风格) → `fastapi.md` / `vue.md` 加 globs 限定该 tier
- 跨多文件类型的 cross-cutting 约束(如 i18n、accessibility) → 独立 topic

#### AGENTS.md vs path-scoped rules:写哪边?

| 维度 | AGENTS.md | path-scoped rules(Claude: `.claude/rules/<topic>.md`) |
|---|---|---|
| **加载** | session 启动全文载 | 文件触发 globs 时按需载 |
| **适合内容** | 项目级 always-on 心智(commands / boundaries / 项目结构 / 跨 tier 通用约定) | 路径级 / topic-级长尾(code-style / testing / security / framework-specific 约定) |
| **大小约束** | 严(< 200 行) | 宽(< 300 行) |
| **决策口诀** | 任何文件都要看的 → AGENTS.md | 只有某类文件要看的 → path-scoped rules |

**典型分工**:

```
AGENTS.md(全局加载,精简):
├── Commands              (项目级,任何任务都要)
├── Boundaries            (任何修改都要)
├── 项目结构 + 关键依赖    (任何修改都要)
└── 测试运行方式 + 覆盖率门槛 (任何修改都要)

path-scoped rules(Claude materialization: .claude/rules/ 按需加载):
├── code-style.md   (globs: src/**/*.{ts,py} —— 改源码才用)
├── testing.md       (globs: tests/**/*.{ts,py} —— 写测试才用)
├── security.md      (无 globs / 有意全局 —— 安全规则适用任何代码,见 §1.6)
└── <framework>.md   (如 fastapi.md / vue.md —— 仅该 framework 文件)
```

**A 类反模式**:
- "任何文件都要看的项目级约定"塞进 path-scoped rules —— 只有匹配路径的文件触发时才加载,其他时候 AI 看不到 → 漂移
- framework-specific 详规则全塞 AGENTS.md → 突破 < 200 行,所有 session 全部加载 → context budget 爆炸
- 同一规则在 AGENTS.md + path-scoped rules 两边重复 → 删 AGENTS.md 那份(后者更精准 path-scoped)
- 新建 path-scoped rule 但忘设路径匹配(Claude: `globs:`) → 失去 path-scoped 优势,等于扁平 always-on

> **A 类不止 P0 写**:AGENTS.md(3 层)和 path-scoped rules 各自的**更新频率与触发跨 P2/P4**,AGENTS.md 详见 [§5.0 三层 AGENTS.md 的更新频率梯度](#50-三层-agentsmd-的更新频率梯度);path-scoped rules 多在 P2 内当 framework / topic 模式提炼出来时新增/扩充(扁平,没 tier/模块嵌套梯度)。

### 1.4 AGENTS.md + CLAUDE.md 嵌套层次(子级覆盖父级)

```
1. 用户级           ~/.claude/CLAUDE.md               (跨所有项目)
2. 项目级 root      ./AGENTS.md + ./CLAUDE.md         (团队共享,本手册重点)
3. 子目录(按需加载,2 种用法):
   ├─ Tier 级      ./backend/AGENTS.md + CLAUDE.md
                  ./frontend/AGENTS.md + CLAUDE.md              (仅多 tier 项目)
   └─ 模块级       ./<module>/AGENTS.md + CLAUDE.md  (仅模块反常时,见 §2.3)
4. 私有覆盖        ./CLAUDE.local.md                 (gitignored,可选)
```

> Anthropic 还支持**系统级** `/etc/claude-code/CLAUDE.md`(全机器范围,企业 IT/DevOps 强制策略用)——project-workflow audience(个人 / 小团队)碰不到,本手册不列入主线。

**Tier vs 模块的区别**:
- **Tier**:架构性分层(全栈的前后端、客户端/服务端、web/api/worker 等)。**是否存在**取决于项目结构,**单 tier 项目不存在这层**。
- **模块**:tier 内(或单 tier 项目里直接在项目根下)的代码组织单位。

→ 项目类型对照表见 §0.3。

**加载机制**:
- 第 1 / 2 / 4 层在 session 启动时全文加载
- 第 3 层(子目录)**按需加载**(Claude 读该目录内文件时加载)
- 跟 `@imports` 语法配合,可以把长尾内容拆出主文件;注意被 import 的内容加载后仍占 context(见 §1.5)

**子级覆盖父级**:同名约束以更深层为准(模块级 boundaries > tier 级 boundaries > 项目级 boundaries)。

#### 双文件方案(命名约定)

> 本手册术语:每层用 `AGENTS.md`(canonical 内容)+ `CLAUDE.md`(1 行 `@AGENTS.md` alias)的**双文件 pattern**。项目根 / tier 级 / 模块级(反常时)全部一致。

折中两个极端:

| 选项 | 怎么做 | 问题 |
|---|---|---|
| 纯 `CLAUDE.md`(v1 老风格) | 规则只放 CLAUDE.md | Claude Code 专属,Codex / Cursor / OpenCode 不读 → **不跨工具** |
| 纯 `AGENTS.md`(纯跨工具) | 规则只放 AGENTS.md,无 CLAUDE.md | Claude Code 子目录靠 CLAUDE.md 触发自动加载,缺它 → **tier / 模块级规则进不了 context** |
| **双文件**(本手册采用) | AGENTS.md 是 canonical;CLAUDE.md 1 行 `@AGENTS.md` 把内容 inline 进来 | 跨工具读 AGENTS.md ✅;Claude Code 加载 CLAUDE.md → @import → AGENTS.md 内容进 context ✅ |

各处引用此节锚点("跟双文件方案对齐")避免重复定义。**注意**:跟 §1.3 反模式"AGENTS.md + CLAUDE.md 双文件独立维护"对照 —— 那个反模式是**两份都填内容 + 互相漂移**;双文件方案是**AGENTS.md 填,CLAUDE.md 仅 1 行 alias**,**没有漂移空间**。

### 1.5 `@imports` 语法(官方支持)

> 何时选 `@imports` vs path-scoped rules?决策口诀见 [§1.3](#13-a-类约定的内容标准agentsmd--claude-rules)。本节只讲 `@imports` 机制本身。

AGENTS.md / CLAUDE.md 可以用 `@path/to/file` 拉别的文件入 context,**递归最深 5 层**:

```markdown
# AGENTS.md

@docs/architecture.md
@.claude/rules/security.md

## 本文件主体(短小核心)
- ...
```

**为什么用**:把"长尾内容"(完整架构文档、共享规则)拆出去,主文件保持 < 100 行;AI 读时仍加载 import 内容。它节省的是主文件复杂度和维护成本,不是已加载后的 token 成本;真正的按需 context 节省主要来自 path-scoped rules(Claude: `.claude/rules/`)、skills 和主动 `/clear` / `/compact`。

### 1.6 路径级规则:Claude materialization `.claude/rules/`(官方支持)

模块化 instructions 的 core 语义是"某些规则只作用于某些路径 / topic"。Claude Code adapter 用 `.claude/rules/<topic>.md` + frontmatter materialize 这个语义,让规则**只在匹配文件被 Claude 读取时触发**:

```markdown
---
globs: <tier>/**/*.py, <other-tier>/**/*.ts
---

# API 开发规则

- 所有 endpoint 必须 input validation
- 用标准 error response 格式
```

更多 globs 写法(单 tier / 多 tier / 跨语言)见 [§1.3 典型分工](#13-a-类约定的内容标准agentsmd--claude-rules) 代码块。

#### Frontmatter 格式选择

| 格式 | 状态 | 推荐 |
|---|---|---|
| `globs: pattern1, pattern2`(comma 分隔字符串) | ✅ 可靠 | **本 plugin 推荐** |
| `paths: **/*.py`(单行 unquoted)| ✅ work | 备选 |
| `paths:` + YAML 列表(`- "**/*.py"`)| ❌ **silently fails** | **不要用** |
| 无 frontmatter | ✅ work | 全量加载,适合 security 等通用规则 |

> ⚠️ **`paths:` YAML 列表是 Anthropic 文档教的格式,但实际有 bug**:
> 见 [Issue #17204](https://github.com/anthropics/claude-code/issues/17204) —— 静默失败、无 error。
> 本 plugin template + 本文档都已切到 `globs:` 格式规避此问题。

#### 已知 limitation

- **Write/Create 文件不触发规则加载**,只 Read 触发:见 [Issue #23478](https://github.com/anthropics/claude-code/issues/23478)(Anthropic 已 closed as not planned)
  - 实际影响:AI 用 Write 工具新建文件时,匹配 globs 的规则**不会进 context**
  - workaround:PostToolUse hook 在 Write 后强制 Read,见上述 issue
  - 简化:大部分修改场景走 Edit(基于已 Read 的文件),规则正常加载;只有"凭空新建文件"时失效
- 通配符遵循标准 glob:`**` 递归、`*` 单层、`{a,b}` 任一、**不支持** `!exclude` 排除
- 路径相对 project root
- 多 globs 之间是 OR(任一匹配即触发)

#### Debug 步骤

规则没生效时:
1. 确认 frontmatter 用的是 `globs:`(不是 `paths:` YAML 列表)
2. 让 Claude `cat .claude/rules/<file>.md` 确认 frontmatter 解析正确
3. 让 Claude Read 一个**应该匹配**的文件(如 `backend/app/main.py`),然后问"刚才加载了哪些 .claude/rules/?"—— 看实际触发情况
4. 若仍不工作,检查是否是 Write 不触发的 bug(见上)

> **adapter 定位:Claude Code first,methodology portable**
>
> Claude Code adapter 默认把路径级规则放在 `.claude/rules/<topic>.md` + `globs:` frontmatter,享 path-scoped 加载;`/project-init` 模板自动按此结构生成。`.claude/rules/` 是 Claude-private 目录,其他 AI 工具(Codex / OpenCode / Cursor)不读。跨工具迁移时不要复制一份新方法论,而是把同一套 A 类约定映射到目标 adapter 的规则 / hook 载体;具体边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

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

**ADR 与其他文档的关系**:5 类文档(A 约定 / B 任务 / C 决策 / D 基础设施 / E 产品事实)总框架见 [§0.3 文档职责 5 类](#03-概念区分钉死再读后续)。ADR 是 C 类,**唯一回答"当时为什么这么选"**——跟 AGENTS.md(A 类规则)/ spec.md(B 类 WHAT)/ plan.md(B 类 HOW)/ current truth(E 类现状)分工正交,不重叠。

> **典型分工例**:"项目用 SQLAlchemy 2.0" 这条规则进 AGENTS.md(A 类);**为什么** 选 SQLAlchemy 2.0 over Tortoise / Prisma 进 ADR(C 类);某 feature 怎么用 SQLAlchemy 2.0 写 query 进 plan.md(B 类)。

### 1.9 平台协作(默认不铺模板)

**立场**:project-workflow P0 starter **默认不预置** `.github/ISSUE_TEMPLATE/` 或 `.github/PULL_REQUEST_TEMPLATE.md`。原因:

- 单人项目 / 小团队不需要模板约束,proof bundle 走 [`tasks.md` 末尾的 `## Proof Bundle` 节](#33-交付阶段proof-bundle)即可
- 平台协作的**原则**(人类协作走平台、不进 repo 文件)由 [§4.4](#44-backlog-与讨论走平台不进-repo-文件) 承接,不需要模板
- 模板是**团队场景才付得起的复杂度**——出现外部 contributor / 多人协作时再加,P0 不预付

**何时加**:仓库开始接受外部 issue / PR、或团队成员 ≥ 2 人 且观察到 PR 描述质量不一致。届时手动 `mkdir .github/PULL_REQUEST_TEMPLATE.md` 内嵌 [§3.3 proof bundle 5 项](#33-交付阶段proof-bundle) checklist 即可。GitLab 等价:`.gitlab/merge_request_templates/`。

### 1.10 Q&A 设计(Project Setup skill 问什么)

> **形态说明**:Project Setup 是 **skill / adapter action,不是独立 CLI**。前提是用户已经:(1) 创建项目目录、(2) 打开 AI coding tool。在 AI session 内调用 `project-init` 对应入口(Claude `/project-workflow:project-init`,Codex `$project-init`,或手工按 action 执行),adapter 用适合宿主环境的交互节奏收集 2-4 组 baseline 信息,基于答案与项目 manifests 渲染 starter kit。CLI 形态仅作可选边缘场景(CI 自动建项目)。

#### 实际问什么(对齐 plugin `/project-init` 实现)

**轮 1 — 项目类型** ← 决定 tier 结构 + 后续 Q&A 走向
- (a) Fullstack / (b) Web Backend / (c) Web Frontend / (d) CLI·Library / (e) Mobile / (f) 其他
- 若 (a) → 追加 1.5 tier 命名(default: `backend` + `frontend`)

**轮 2 — 主语言**(跨 tier 共性 auto-derive,user 可 override)← 影响 globs / 命令推导
- 主语言?(若多语言列 2-3 个)
- (Fullstack only)据主语言 auto-derive 跨 tier 共性,**不预问**:
  - mixed-lang(Python+TS / Go+TS / etc.)→ **per-tier**(test/lint/pkg-mgr 挪到 Step 5.1 各 tier 单独问)
  - single-lang(全 TS / 全 Python / etc.)→ **shared**(本轮追加问 test framework / lint / pkg-mgr 全 tier 共享)
  - 告知 user 推断结果,user 可 reply `'per-tier'` override

**Step 5.1 mini-Q&A(仅 Fullstack,每 tier 一轮)** ← 填 tier-level AGENTS.md
- **Service-style** tier(backend / api / worker / etc.)required:框架 / ORM / 数据库 / source layout / [mixed-lang: test/lint/pkg-mgr];optional:任务队列 / Migration 工具
- **UI-style** tier(frontend / web / mobile / etc.)required:框架 / UI 库 / state 管理 / [Nuxt/Next: 渲染模式] / [mixed-lang: test/lint/pkg-mgr];optional:样式方案 / E2E 框架
- **Chat-context skip**:跑 mini-Q&A 前扫本 session 对话,user 已 hint 的题跳过

题量(F-69/70 简化后):单 tier ~3-4 题 / single-lang fullstack ~6-7 题 / mixed-lang fullstack ~12-14 题。

#### 不问什么(故意省的题,每项都有原则)

| 项 | 怎么处理 | 为什么不问 |
|---|---|---|
| 项目名 | 不收集 | A 层不存项目名(那是 B 层 `package.json` / `pyproject.toml` 的事,见 §1.2) |
| 起服务 / 测试 / lint 命令 | framework + pkg-mgr 推导 | 直接问 = 冗余;framework + pkg-mgr 足够推 |
| 部署命令 `{{DEPLOY_COMMAND}}` | 固定填 deferred 占位 | B 层未起,P0 拍脑袋写 = aspirational(违 §0.5 信念 1) |
| 目录组织模式 | default "按 feature/domain"(见 §2.5) | 反模式("按 type"散布)社区共识,无信息增量 |
| 代码风格 / STYLE_HIGHLIGHT | 据栈推 1-3 条真特殊点 | 通用 default 不算特殊 |
| 测试覆盖率门槛 | default 80 | 社区惯例,99% 接受 |
| Boundaries 三档 | template default(改 API / 加依赖 / 改迁移 / 改权限) | default 足够 baseline;**P0 后用户 review 节按项目特点补 ⚠️ Ask first 项** |
| 分支命名 | hardcode `feat/<NNN>-<slug>` + `fix/<scope>` | 跟 `/feature-init` 工具行为对齐;问了工具也不响应 = 假定制 |
| Git 平台 | hardcode GitHub(PR / `.github/`) | 系统其他地方都默认 GitHub 词汇,问 GitLab 只改一行文案 = 假定制 |
| 特殊约束(性能 / 合规 / 安全) | 不问 | P0 无基线数据,拍脑袋写 = aspirational;真需要的项目 P0 后写 ADR + 加节(见 §1.8) |

> 这些**省掉的**都对应一个反 aspirational 信念:**让 AI 凭训练即兴生成"看起来对"的内容,比留空 / 用 default 更糟**(详 §0.5 信念 1)。问了也拿不到具体答案 → 用 default 或 deferred 占位,**不让 LLM 编**。

#### 关键纪律

- 每题 1 句话能答;答不出 → dispatch [`tech-researcher`](reviewers/tech-researcher.md) sub-agent 调研,返 2-3 候选 + 推荐,用户确认再回填
- 二选一 / 填空 > 开放式
- 答案累积在 agent 内存,**Preview Gate 强制用户审完才落盘**(根 AGENTS.md + path-scoped rules materialization 一组 preview;Claude 为 `.claude/rules/*`;tier-level AGENTS.md 单 tier 一组 preview)

### 1.11 校验

- `/memory`(Claude Code)或对应工具命令:确认 AGENTS.md / CLAUDE.md 加载
- 跑一次 `pnpm` / `npm` / `cargo` / 等标准命令,确认 AGENTS.md 写的命令正确
- 改一个文件,看 hook 自动跑(lint/format 生效)
- 把 AGENTS.md 给 AI 读一遍,问它"基于本文件总结这个项目",看理解是否准确

### 1.12 生成纪律(Generation Discipline)

> **Serves §0.5 信念 1**:消除"P0 setup 期间的人工对齐劳动"——用户审 AGENTS.md 时不应该靠肉眼分辨"哪些是 agent 猜的"。

#### 主张

P0 生成(`/project-init` / `/project-personalize`)Preview Gate 落盘**之前**,待写入的所有文件里**每条特定字符串决策**(模块名 / 路径 / broker / 端口 / 包名 / 命名空间 / etc.)必须 trace 回三类来源之一:

- ✅ Q&A 直接答 → 标 `(Q&A 轮 N)`
- ⚠️ 语言/社区惯例 → 标 `(Python app/ 惯例)` / `(cargo init 默认 src/)`
- 🚫 纯 plant 无出处 → **禁入库**,必须满足下列之一:
  - (a) 改成显式 deferred:`(待定,见 ADR 000N-XXX)`
  - (b) 回 Q&A 追问用户
  - (c) 显式标 template default + 注明改时同步指针

#### 底层逻辑

§1.10 "不问什么"已经处理一半("不该问的题不让 LLM 即兴编")。本节处理另一半:**该问的题用 plant 顶包**。两类失败模式正交:

| §1.10 防 | 本节防 |
|---|---|
| Aspirational(P0 没数据时 AI 编"看起来对"的特殊约束 / 性能门槛) | Plant(Q&A 未问的决策细节 agent 自行填,且填得不自洽) |

不防的代价是:用户拿到 AGENTS.md 跑命令 → 报错 → 回查发现是 agent 猜的。**P0 生成期的对齐对话被推到 P2 runtime,违 §0.5 信念 1**。

#### 依据

| 类型 | 内容 |
|---|---|
| 实战观察 | P0 fullstack Q&A 实测:Q&A 只覆盖 framework / ORM / DB 等高层选型,**fill placeholder 阶段 agent 易 plant 未问的细节**(src 包根 / 任务队列 broker / 入口模块路径 / 等),且 plant 跨多处不自洽(同一 src 路径 3 处写法)。Plant 不留追溯,用户审 AGENTS.md 时无法分辨"agent 猜的"还是"项目真决策" |
| 类比 §6.4 Reviewer 承诺 | "Cite-or-skip"(reviewer 不写没引用的 finding)→ 本节 "Trace-or-defer"(generator 不写没追溯的决策);两者都是把"主观判断"压成"机械可查" |
| 业界对照 | Spec Kit / mcpmarket Drift Detection 都做 P3 spec-vs-code drift,**P0 generation 期的 plant 防线没人专门做** —— 本节填补 |

#### 怎么用

##### Generator 承诺(类比 §6.4 Reviewer 承诺,落地形态见下)

| 承诺 | 含义 |
|---|---|
| **Trace-or-defer** | 每条 plant 决策必须 trace 来源或显式 deferred,不允许无标记 plant 入库 |
| **Cross-file consistency** | 同一决策多处引用必须对齐(grep 自检,而非"写完不看") |
| **Anti-cargo-cult** | Q&A 选项 / 默认值不引用具体已存在项目(monorepo 兄弟 / 父仓库 reference),用栈通用描述 |
| **Greenfield isolation** | 默认值基于语言/社区惯例,不基于父目录 / 兄弟项目偏好 |

##### 落地形态(二选一,都符合本节主张)

| 形态 | 适用 | 实施 |
|---|---|---|
| **Skill 内置** | 决策类型少 / skill prompt 没膨胀 | SKILL.md Preview Gate 之前加 self-audit step,扫 + 列决策矩阵 + 严重项 block Preview |
| **Sub-agent reviewer**(推荐:可靠性更高) | 决策类型多 / 想跨 skill 复用(/project-init + /project-personalize + /agents-md-revise) | dispatch 独立 `decision-completeness-auditor` read-only agent,返结构化报告,skill block on 🚫 项;agent 上下文干净,不受 fill 任务惯性影响 |

无论哪种形态,**Preview Gate 必须强制 block 严重项,不允许"audit 报警但用户一键 approve 略过"**。

#### 失效情形

- **既有项目 retrofit**(/project-personalize Path C):代码可读,plant 决策能从代码扫出,本节弱化为"agent 标注哪些是扫出来的、哪些是真 plant",不强 block
- **P0 前 brainstorm**:用户也没决策,brainstorm 阶段所有"决策"都是探索,本节不适用
- **真正的 deferred**:标了 `(待定,见 ADR)` 就是合法非 plant(部署命令 / Celery broker 等 B 层未起场景)
- **生成 ≤ 1 处的决策**:单点决策无跨文件一致性问题,Trace-or-defer 适用但 Cross-file consistency 不适用

#### 跟其他原则的边界

- **vs §6.4 三层 review**:**不是第 4 类 review**。§6.4 是 P3 implementation 完成时按规则源分层审产物;本节是 P0 setup 生成时审决策追溯。时机 / 对象 / 失败处置都不同
- **vs §6.3 环境强制**:§6.3 是 P2/P4 持续 runtime(hook),本节是 P0 一次性 generation gate;前者治持续漂移,后者治源头污染
- **vs §1.10 Q&A 设计**:互补——§1.10 列"不问什么"(防 aspirational),本节列"plant 怎么处理"(防 unanchored plant)。两节共同覆盖 P0 内容来源纪律

#### 给 plugin 实施者的提示

不要一次到位上多个 audit agents。建议增量:

1. **先**:Skill 内置 self-audit + Generator 承诺写进 SKILL.md(轻量,验证概念)
2. **后**(实施 #1 之后跑 ≥ 2 次 validation 仍发现 plant):升级成 sub-agent
3. **同时**:其他 audit(内容争议性 / starter 缺失生成)**别捆绑**,验证 #1 收益后再单独加。每个 audit agent 独立服务一类正交 finding(对应 §7.4 反 over-engineer)
4. **成熟后降频**(对应 §7.9 门空转):audit 防 plant 的价值随项目成熟递减,但每次 dispatch 是真实 token / 时间成本。**Per-feature 调度点**(`/feature-init` / `/spec-revise`)在**最近 ≥ 3 个 feature 的 audit 全零 🚫**(从各 feature artifact 里记录的 audit 结果行读,无额外存储)时,可降为抽查(仅全道触发)或 opt-in;**一旦再出现 🚫 立即恢复强制**。P0 一次性 gate(`/project-init` / `/project-personalize`)和 `/agents-md-revise` patch apply **不降频** —— 它们本来就低频,且是 plant 风险最高的场景

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
| `<module>/AGENTS.md` + `CLAUDE.md` alias | **仅当模块"反常"时**(见 §2.3),99% 情况下不写 |

### 2.3 "反常"判定:何时该写模块 AGENTS.md

只在以下情形写,否则**不写**(避免文档增殖):

| 反常情形 | 例 |
|---|---|
| 用了跟父级默认不同的存储模型 | 一个模块用 Redis,其他用 PostgreSQL |
| 有特殊并发/性能约束 | 一个模块必须 lock-free |
| 对外提供稳定 API 契约,不允许随意改 | 一个模块是公共 SDK 边界 |
| 用了不同的第三方库范式 | 一个模块用 React,其他用 Vue(罕见) |

**差量原则**:模块 AGENTS.md 只写**跟父级(tier 级或项目级)默认的差异**,绝不重复父级已经说过的事。

**文件命名**:写 `<module>/AGENTS.md`(主)+ `<module>/CLAUDE.md`(1 行 `@AGENTS.md` alias),跟项目 / tier 级**双文件方案**一致(见 [§1.4](#14-agentsmd--claudemd-嵌套层次子级覆盖父级))。

**父级是什么**(取决于项目结构):
- 多 tier 项目:模块的父级是 tier(如 `backend/AGENTS.md`)
- 单 tier / 无 tier 项目:模块的父级是项目根(`AGENTS.md`)

### 2.4 谁做 & 校验

**谁做**:由 P2 spec 阶段(plan.md 的"模块影响范围"节)驱动决定。**不是独立动作**。

**校验**:模块 AGENTS.md 写完后,问 AI:"读这个模块的 AGENTS.md,有哪些信息是父级 AGENTS.md 已经说过的?"如果有重复,删。

### 2.5 模块组织建议:领域优先,不要技术分层

project-workflow 对模块**长什么样**有 opinionated 偏好(不强制):

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
- **超大型项目** → 考虑更重的 Hexagonal / Onion / Clean Architecture;project-workflow 只给基础 DDD-aligned,不覆盖这类决策

**project-workflow 不强制 DDD**,只是给 opinionated default。**重型 DDD ceremony**(entity / value object / aggregate / repository 四层、Domain Event、Anti-Corruption Layer 等)是另一个 layer 的决策,**不在 project-workflow 强制范围**——你按需取。

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
4. **若反常**(参见 [§2.3](#23-反常判定何时该写模块-agentsmd) 判定)→ 写 / 改对应 `<module>/AGENTS.md`(+ 1 行 `CLAUDE.md` alias)
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

### 3.0 P2 流程全景(skill 视角)

下图把 P2 各 skill 的触发节点 + 文档产物串起来,作为 §3.1-3.5 detail 章节的导航地图:

```
[P0 完成] AGENTS.md / path-scoped rules 已就位(Claude: .claude/rules/)
   │
   ▼
─────────── 规划阶段(§3.1)───────────
/project-workflow:feature-init <slug>
   ├─ 创建 docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md
   ├─ 检测 Module Setup(§2 sub-flow);新模块时反常判定**不预问**(99% n)→ 作 reminder 输出
   ├─ (若 user 已在本 session chat 讨论过 feature)读 chat 上下文 → 据已讨论事实 pre-fill placeholder
   └─ 报告 + reminders + audit(**零强制 Q&A**)
        ├─ Mission-critical reminders:Scope "不做"(Q2)+ (多模块)Sibling Alignment(Q6)── user 自判,不预问
        ├─ Conversational fill 引导:tech-researcher / context7 等 adaptive reminders 在主会话**被动触发**
        └─ decision-completeness-auditor 审 chat pre-fill 内容(纯空骨架则跳过)
        │
        ▼
   主会话 conversational fill 剩余 TODOs(primary mode;chat-as-context 已 pre-fill 的则跳过)
        │
        ▼
─────── 实施前 gate(§3.7 / spec-driven.md §3.7)───────
/project-workflow:spec-quality-check
   ├─ M1-M5 机械检(六要素齐 / "不做" 必有 / Sibling Alignment 填了吗 ...)
   └─ dispatch spec-quality-reviewer 主观二审(Verification 机械化 / Outcomes 具体 / Constraints 真假 / tasks verifiable)
        │
   ┌────┴────┐
   ▼         ▼
 Fail       Pass
   │         │
   │      git commit spec/plan/tasks + git checkout -b feat/<NNN>-<slug>(§3.4)
   │         │
   │         ▼
   │   ─────── 实施阶段(§3.2)───────
   │   按 tasks.md 一步步实施,**不打断 AI 执行流**
   │     ├─ L1 hook PostToolUse 持续跑(lint/format/type)→ AI 自修
   │     ├─ LSP 实时反馈
   │     └─ 中途真发现 spec/plan 错? → /project-workflow:spec-revise(§3.5)
   │           (ADR + spec.md `## 修订记录` + plan/tasks 跨文件同步)
   │         │
   │         ▼
   │   ─────── 端点 gate(§3.3 proof bundle)───────
   │   /project-workflow:feature-done
   │     ├─ L1 重检(hooks 一次性回扫)
   │     ├─ L2 review(agents-md-reviewer 拿 AGENTS.md + path-scoped rules 作 context;Claude 为 .claude/rules/)
   │     ├─ L3 review(spec-reviewer 拿 spec.md 作 context)
   │     ├─ current-truth check(仅当 docs/specs/<area>.md 存在:是否矛盾 / 是否需更新)
   │     └─ Proof bundle 装配(§3.3 五项:Diff / Tests / Review / Drift / 开放问题)
   │         │
   │         ▼
   │   PR / 合并(团队场景)或 merge to main(单人)
   │     └─ /project-workflow:feature-archive(默认清扫模式,可攒几个 feature 批量跑)
   │          → (若有 pending)合并结论进 docs/specs/<area>.md
   │          → 已交付 feature 整目录 git mv → docs/specs/changes/archive/;被取代老 spec 标 已取代/已废弃(spec-driven.md §5)
   │
   └→ 修 spec/plan → 重跑 spec-quality-check
```

**两类 "spec review" 别混淆**:

| Skill | 何时 | 检查什么 |
|---|---|---|
| `/spec-quality-check` | **实施前** | **spec 本身**够不够好(7 问质量) |
| `/feature-done` 的 L3 层 | **实施后端点** | **代码**做了 spec 说要做的事吗(code-vs-spec drift) |

**局部复查怎么做**:`/feature-done` 是 L1+L2+L3+proof-bundle 的唯一端点入口,不再拆分独立的 helper 命令。需要单独重跑某一层时:L1 直接跑项目 check 命令;L2 / L3 在主会话直接 dispatch [`agents-md-reviewer`](reviewers/agents-md-reviewer.md) / [`spec-reviewer`](reviewers/spec-reviewer.md) sub-agent;proof bundle 修补则重跑 `/feature-done`(幂等,复用有效缓存)。

**详细机制见**:[§3.1 规划阶段](#31-规划阶段)(决策清单)/ [§3.2 实现阶段](#32-实现阶段不要打断-ai-执行流)(不打断纪律)/ [§3.3 交付阶段 proof bundle](#33-交付阶段proof-bundle) / [§3.4 与平台流程协作](#34-与平台流程的协作) / [§3.5 中途修订](#35-开发中发现-specplan-错怎么办) / [§3.7 7 问 quality](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist)。

### 3.1 规划阶段

**决策清单**:

```
是否正在按已确认 spec/tasks 实施?
  YES → 继续原 tasks;若 spec/plan 错,走 spec-revise
  NO  → 继续判断是否需要新 artifact

这个任务是否需要新的 project-workflow artifact?
  改变 docs/specs/<area>.md 已声明的当前行为或持久规则? → 无论 diff 多小,至少轻车道
    (current truth 的唯一写入口在管线上,绕过管线的行为变更会让它静默腐化;
     未被 domain doc 声明的局部行为小改不受此限,照常直接做)
  NO → 不调用 /feature-init,直接做;遵守 AGENTS/path rules,最终说明 diff / checks / residual risk
  YES → 继续判断 Light / Full

是否跨模块 / 跨职责边界,或涉及架构、数据模型、API/schema 契约、迁移、权限、安全、多租户、不变量路径?
  YES → 起新功能目录 docs/specs/changes/<NNN>-<slug>/,写 spec.md + plan.md(全道)
  NO  → 轻车道:同一模块内、有记录/验证价值的小改仅写 tasks.md(目标/边界 + 验证 + proof,免 frozen spec/plan),见 spec-driven.md §3.2.5

不确定点属于哪类?
  API/DB/security/auth/权限/data contract/跨模块/高爆破半径不确定 → 全道
  UI 文案/样式/组件拆分/局部 refactor/测试写法不确定 → 不因此升级全道
  业务目标不确定 → 先问用户,不建 artifact

直接做或轻车道实施中发现触达 API/DB/security/multi-tenant/evidence invariants/跨模块/高爆破半径?
  YES → 停止普通实现,升级为 light/full artifact 流程
  NO  → 继续当前路径

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

> 上面是**行动决策**(要不要启动 project-workflow / 要不要起 spec / 要不要 Sibling Alignment)。spec/plan **写完后**的**质量自检**(7 问 checklist)见 [`spec-driven.md §3.7`](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist) —— 全道实施开始前必跑。

**全道写完 spec.md / plan.md 后,实施前必跑 [`spec-driven.md §3.7` 7 问 quality checklist](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist)**(或 `/spec-quality-check` skill)—— 本节决策清单是"要不要写 spec";§3.7 是"已经写完的 spec 够不够好"。两步互补,都不可省。

**Gate 语义**:
- `failed > 0` → **不进入实施**。先修 spec / plan / tasks,再重跑 quality check。
- `failed = 0` 且 `borderline > 0` → 可继续,但必须在 plan.md `## 4. 风险与未决` 或 tasks.md 实施记录里记下风险和修法。
- 全部 pass → 进入实施。

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

受 OpenAI Symphony "manage work, not agents" 和工作交接状态思想启发:AI 不是只"交代码",而是交可审查、可接手的工作结果。本 workflow 把这个要求落成 proof bundle。功能完成时主动产出:

```
1. Diff           —— 变更摘要
2. Test results   —— 自动跑过的单测/集成测,失败列表
3. Review summary —— L1/L2/L3 三层验证摘要
                     必须提供两类 context:
                       · A 类约定:AGENTS.md(3 层)+ 命中本 feature 路径的路径级规则(L2 项目约定合规)
                       · docs/specs/changes/<NNN>/spec.md 路径(L3 功能规约合规)
4. AGENTS.md drift —— 本次工作产生了哪些可能值得沉淀的项目级约定?
                     (列建议项,不直接改 AGENTS.md;详见 P4)
5. 开放问题       —— AI 主动列出做了什么取舍、有没有 TODO
```

你只在这一刻审一次,通过就合并,不通过就回 worktree 让它再跑。

**关键设计**:`feature-done` 是端点**组合点**,proof bundle 是证据**落点** —— reviewer 各管各,组合在端点 action 发生,结果写回 proof bundle。不要把 L1/L2/L3 的规则源混成一个泛泛的"统一检查"。

**proof bundle 的载体**:`docs/specs/changes/<NNN>-<slug>/tasks.md` 末尾的 `## Proof Bundle` 节(模板已预留)。完成时填,不必走 PR 流程。

**Canonical verdict**(所有 adapter / skill 共用):

| 条件 | Verdict | 说明 |
|---|---|---|
| L1 失败(测试 / lint / typecheck 红) | 🔴 BLOCKED | 机械验证不通过,先修代码或环境 |
| L2 critical violation | 🔴 BLOCKED | 违反安全 / 合规 / 项目硬约定,不能作为可交付状态 |
| L2 non-critical partial / ambiguity | 🟡 NEEDS WORK | 可由用户接受,但必须在 proof bundle 标清楚 |
| L3 missing / deviation / scope creep | 🟡 NEEDS WORK | 用户二选一:修实现或走 spec-revise 更新契约 |
| Proof bundle 缺测试证据 / 开放问题未闭环 | 🟡 NEEDS WORK | 证据不完整,不能标 READY |
| L1 绿 + L2 clean/accepted + L3 clean + proof bundle 完整 | 🟢 READY | 可 commit / PR |

轻车道 feature 无 frozen `spec.md`,因此 L3 = N/A;但 proof bundle 必须包含 `## 验证` 全过和不变量反核。若实际 diff 触达不变量路径,verdict 至少 🟡 NEEDS WORK,并应升级为全道补 spec。

> 团队 / 外部协作场景:可自行加 `.github/PULL_REQUEST_TEMPLATE.md`,内容同 5 项 —— 见 [§1.9](#19-平台协作默认不铺模板)。project-workflow 默认不预置。

### 3.4 与平台流程的协作

| 节点 | 平台动作 |
|---|---|
| spec 起草 | 可选:开 GitHub Issue,标 label `feature`,描述放 outcomes 摘要 |
| 实施开始 | git branch `feat/<NNN>-<slug>` |
| 交付 | proof bundle 填入 `tasks.md` 末尾 `## Proof Bundle` 节;若走 PR,PR 描述直接复制该节内容 |
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
| 发现需要拆 / 合 / 改 module(可能含 module-level AGENTS.md 调整)| ✅ 真错 | 走 [§2.6 Module 中途变更 SOP](#26-module-中途变更feature-实施中发现边界要调整) |
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

**工具**:[`/project-workflow:spec-revise`](../skills/spec-revise/SKILL.md) 自动化本 SOP——orchestrate ADR 起草 + spec.md `## 修订记录` 格式化追加 + plan.md prior decisions + tasks.md 重排 + `decision-completeness-auditor` 兜底(Step 7.5,catch plant)+ Diff Review Gate(Step 7.6,user 可一键 revert 全部改动)。**不强制起 ADR**:用户判断"不必修(只是模糊)"时,引导写 plan.md prior decisions 即可。

---

## 4. P3:Continuous Maintenance(开发期间持续)

### 4.1 三层错位的检查机制

按规则源分类,各管各:

| 层 | 规则来源 | 检查什么 | 检查机制 | 时机 |
|---|---|---|---|---|
| **L1 机械层** | tool config(lint/type/test)+ 语言/团队通用卫生规则 | 代码机械合规吗?(lint/type/test/format) | hook(保存时单文件 lint+format,**自动改**)+ `feature-done` 端点全量 check(单独重跑 = 直接跑项目 check 命令) | 保存后 + 端点 |
| **L2 项目约定** | `AGENTS.md` + path-scoped rules(A 类约定全集;Claude materialization 为 `.claude/rules/*.md`) | 代码长得像这个项目吗? | linter + agent review | hook + 端点 |
| **L3 功能规约** | `docs/specs/changes/<NNN>/spec.md` | 代码做了说要做的事吗? | 测试 + agent review + 人审 | 交付时 |

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
- **AGENTS.md drift 建议**:衔接 [§5.2 触发模式](#52-两种触发模式)

### 4.4 backlog 与讨论(走平台,不进 repo 文件)

| 信息类型 | 位置 |
|---|---|
| 未决提案(< 50 行能讲清楚) | GitHub Issue + label `proposal` 或 GitHub Discussions |
| 详细设计(> 200 行,要 review) | GitHub Issue / Discussion 草案;接受后沉淀到 `docs/actions/` / `docs/reviewers/` / `workflow.md` / ADR,不长期保留草案文件 |
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

> **范围**:P4 **只动 A 类约定**(`AGENTS.md` 多层嵌套 + path-scoped rules;Claude materialization 为 `.claude/rules/*.md`)。其他文档各有自己的演化通道:
>
> | 文档 | 是否在 P4 | 演化通道 |
> |---|---|---|
> | **A 类约定**(`AGENTS.md` + path-scoped rules) | ✅ 是 | 本节 —— 跨 feature 持续累积、定期主动 refresh(工具:[`/project-workflow:agents-md-revise`](../skills/agents-md-revise/SKILL.md)) |
> | **ADR**(C 类决策) | ❌ 不 | append-only;过时只能 `Superseded by NNNN`,从不"refresh" |
> | **spec.md / plan.md / tasks.md**(B 类任务) | ❌ 不 | per-feature 冻结归档;中途发现错走 [§3.5 spec-revise](#35-开发中发现-specplan-错怎么办) |
> | **spec ↔ 代码 漂移** | ❌ 不(走端点拦截) | [§6.4 L3 reviewer](#64-按规则源分层验证three-layer-review-separation) 每个 feature 交付前检查,不等到 P4 |
>
> **底层逻辑**:[§0.1 命题 3 Drift](#01-这本手册解决什么) 的三个维度(时间 / 空间 / 演进)全是**规则**演化,规则只住在 A 类约定里 —— 所以 P4 自然只针对它。

### 5.0 三层 AGENTS.md 的更新频率梯度

P4 范围声明说"只动 AGENTS.md",但 AGENTS.md 有 3 层(项目/tier/模块),各自实际更新节奏跨 P2/P4 分工。**P4 主战场是项目级,tier/模块级更多在 P2 内顺手做**:

| 层级 | 更新频率 | 典型触发 | 跟 phase 关系 |
|---|---|---|---|
| **项目级** `AGENTS.md` | 最低(月级或更低) | P4 主动 refresh / 重大架构选型变化 / 多 feature 反复出现某约束 | **P4 主战场**;不在单 feature 内 |
| **Tier 级** `<tier>/AGENTS.md` | 中(数周到月) | 某 tier 内多个模块共用模式提炼 / 加新 tier-wide 库 | 偶尔 P2 in-feature(发现新模式时 codify);P4 顺带 review |
| **模块级** `<module>/AGENTS.md` | 最高(单 feature 周期内常见) | [§2.6 模块边界调整](#26-module-中途变更feature-实施中发现边界要调整) / [§3.5 spec-revise](#35-开发中发现-specplan-错怎么办) / 新增 / 拆分模块时建立 | **几乎全 P2 in-feature**;[proof bundle](#33-交付阶段proof-bundle) item 5a/5b 显式审计;P4 一般不动 |

**反模式**:
- 把 P0 一次 Q&A 当"终身合同",任何后续变化都拖到 P4 —— 模块级反常约定常在第一次写到该模块的 feature 中固化下来,不在 P4 等
- 把 P4 想成"全 3 层一起 refresh" —— 实际 P4 只看项目级,tier/模块级各有 P2 内的触发点

### 5.1 何时触发

- **周期性**:每 2 周或 month 跑一次主动 refresh
- **感知到 drift**:用户感觉"反复跟 AI 提醒同一件事 ≥ 2 次"
- **~~信号触发 hook~~**:🚫 **project-workflow 不实施** —— hook 自动检测 "记得 X" 重复并主动 nudge 跟 [§0.5 信念 1](#05-实现策略的核心信念)("消除对齐劳动")**相悖**(系统主动提示本身就是新对齐对话源),且模式识别误报率高。用户感知 drift → 走"主动 refresh" 即可

### 5.2 两种触发模式

| 模式 | 触发 | 工具 |
|---|---|---|
| **A. 主动 refresh** | 用户感知到 drift / 周期到了 / 大依赖升级后 | [`/project-workflow:agents-md-revise`](../skills/agents-md-revise/SKILL.md) —— 扫客观 drift,逐条 yes/no/ignore-forever,apply + commit 草稿 |
| **B. 端点反思**(顺手) | feature 完成时 | `feature-done` 写 proof bundle Item 5a(已应用)+ Item 5b(待 backlog);需修补时重跑 `feature-done`(幂等) |

> 历史上还有 "模式 C 信号触发 hook" —— **project-workflow 不实施**,理由见 §5.1 注。

### 5.3 工具流程概览

详细 step 见 [`/agents-md-revise` SKILL.md](../skills/agents-md-revise/SKILL.md)。5 步骨架:

1. **读 A 类约定全集**:`AGENTS.md` 多层嵌套 + path-scoped rules(Claude: `.claude/rules/*.md`),提取每条可验证 statement
2. **扫项目客观状态**:`package.json` / `pyproject.toml` / 实际目录 / `.env.example` / 工具版本
3. **计算客观 drift + 生成报告**:仅 Critical(命令 / 依赖 / 目录 / 版本 / 配置),零误报
4. **用户逐条决定**:yes / no / ignore-forever(写 `.claude/refresh-ignore`)/ quit
5. **应用 patches + commit 草稿**:Edit 改文件,**不自动 commit** 留给用户

### 5.4 与平台流程的协作

- **refresh 结果走 PR**:`/agents-md-revise` 产出的 diff,建议以 PR 形式提交(`chore: refresh A 类约定(N 条 drift)`),便于团队 review

### 5.5 演进 drift 的应对策略

> **project-workflow stance**:演进维度 drift([§0.1 命题 3](#01-这本手册解决什么))**不做主动工具化**,用 git history + grandfather 应对。

**非正式 changelog 走 git**:`git log AGENTS.md` 给规则变更历史,`git blame AGENTS.md` 给"这条规则什么时候来的"。**不必另写一份 markdown changelog**——重复 git 已有的事。

**Grandfather 默认**:老代码大量违反新规则时,**默认接受**(参见 [§6.4 失效情形](#64-按规则源分层验证three-layer-review-separation) "legacy 代码" 条),只对新改动 enforce。不主动扫描回填。

**何时偏离 grandfather**:

| 场景 | 应对 |
|---|---|
| 规则变更涉及**安全 / 合规**(SQL 注入、密钥处理等)| 必须回填,不能 grandfather |
| **首次引入** AGENTS.md(项目本来没有,这次加上)| 一次性扫描 + 回填合理 |
| **小项目**(< 30 文件)| 回填成本低,顺手做 |
| 其他 | 用 [§5.2 模式 A 主动 refresh](#52-两种触发模式) 跑 `/agents-md-revise` 更新 A 类约定;老代码自然演化(下次改它时按新规则)|

**为什么不做完整 changelog 机制**:
- 社群证据:演进 drift 是 Tier 2(verification > 空间 drift > 演进 drift)
- 现成替代:git history 覆盖 80% 需求(`git log` / `git blame` AGENTS.md 即可)
- 跟 §6.4 grandfather 默认对齐(避免方法论自冲突)

---

## 6. 方法论支柱(4 条)

只有 4 条核心原则,**每条独立、各管一件事、删了崩**。其他"原则"是这 4 条的推论或具体场景的 tactic,不在本章重复。

### 6.0 每条原则的两侧组成(读 §6.1-6.4 前必读)

> **术语提示**:本节用"**蓝图侧 / 纪律侧**"区分**谁来支撑**(工具 vs 人);§6.4 的 **L1/L2/L3** 是另一回事(review 分层 —— 通用规则 / 项目约定 / 功能规约)。不要混。

每条原则都由两侧共同支撑,**缺一不可**:

- **蓝图侧**(Blueprint —— 本项目提供):skill / template / hook 配置 / proof bundle workflow 等
- **纪律侧**(Discipline —— 用户协作行为):`/clear` / 真去写 spec / 端点 review 不偷懒等

**4 条原则的蓝图/纪律平衡很不一样**,真实预期对照表:

| 原则 | 蓝图侧提供 | 纪律侧实践 | 蓝图/纪律 占比 |
|---|---|---|---|
| **6.1** Spec-driven | `/feature-init` feature artifact 模板 + `/project-init` skill(P0) + Refresh skill(P4) | 真去写、维护必要 artifact | ~50 / 50 |
| **6.2** Context budget | AGENTS.md 默认 < 200 行 + hook 检测警告 + refresh skill 检查行数 | `/clear` 频繁、`/compact` 节点、一会话一任务 | **~30 / 70**(纪律侧最重) |
| **6.3** Environment-enforced | hook scripts + settings.json template + Project Setup skill 自动配 | 几乎零 | **~95 / 5**(蓝图侧最重) |
| **6.4** 三层验证错位 | proof bundle workflow(§3.3)+ adapter reviewer + reviewer context 注入 | 真的端点 review 不偷懒 | ~60 / 40 |

**读后续 4 条原则时记住**:**§6.3 几乎全自动,§6.2 主要靠你**。其他两条混合。这不是 bug,是**某些事情天然适合工具管,某些事情天然只能靠人**。

### 6.1 规约先于代码(Spec-driven)

> **Serves Tier 1 命题**:Verification(**输入侧** —— 把"做什么"冻结成契约,让验证有对照物)。参见 [§0.1 命题 1](#01-这本手册解决什么)。

#### 主张

规约(spec)是 source of truth / 行为契约,代码是 AI 根据契约生成和修改的实现产物。任何有 blast radius 的 AI 协作改动,**必须有可追踪 feature artifact 兜底**:全道用 `spec.md` / `plan.md` / `tasks.md`;轻车道小改用 `tasks.md` 的目标 / 边界 / 验证 / proof;小 bugfix / 文案 / 样式 / 局部测试修复等无 artifact 价值的任务不启动 project-workflow,直接做并说明验证。

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
| 跨模块 / 跨职责边界 OR 数据模型 OR API/schema 契约 OR 迁移 / 权限 / 安全 / 不变量路径 | 必写 spec(`docs/specs/changes/<NNN>-<slug>/spec.md`)|
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
| 官方建议 | `/clear` / `/compact` / `--add-dir` / `.claude/rules/` path-scoped 是 Anthropic 给的 context 管理工具;`@imports` 是官方支持的组织与引用机制,但 import 内容加载后仍占 context |

#### 怎么用

| 场景 | 动作 |
|---|---|
| 长 session 跨多任务 | `/clear` 频繁,**一会话一任务** |
| CLAUDE.md / AGENTS.md | 主体 < 200 行;共享长尾可用 `@imports` 组织,路径相关长尾优先放 path-scoped rules 做按需加载(Claude: `.claude/rules/`) |
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
- **跨工具实现差异** → Claude Code / Codex / OpenCode 的 hook 配置、输入格式、授权模型不同 —— 概念通用但桥接成本不为零

---

### 6.4 按规则源分层验证(Three-Layer Review Separation)

> **Serves Tier 1 命题**:Verification(**输出侧** —— 三层错位机制把"是否验证过"变成可重复、可追溯的产物)。参见 [§0.1 命题 1](#01-这本手册解决什么)。

#### 主张

对照规则检查代码这件事,根据**规则的来源**分三层(L1 / L2 / L3),每层用不同机制 —— **不要混在一起做**。

| 层 | 规则源 | 问的问题 | 失败模式 |
|---|---|---|---|
| **L1** 通用规则 | language defaults + 团队全局规则(Claude adapter 可放 `~/.claude/rules/*`) | 代码规范吗? | 通用工程错误 |
| **L2** 项目约定 | `AGENTS.md` + 路径级项目规则(Claude adapter 为 `.claude/rules/`) | 长得像这个项目吗? | 风格/结构错 |
| **L3** 功能规约 | `docs/specs/changes/<NNN>/spec.md` | 做了说要做的事吗? | 行为/范围错 |

#### 底层逻辑

三层的失败模式**正交** —— 一层错(代码不规范)、另一层错(不像本项目代码)、第三层错(没实现需求)。混合 review 会:

1. reviewer prompt 过长 → 判断弱化
2. 一层错被另一层"通过"掩盖 → 漏检
3. 无法精准修复 → 不知道是结构问题还是行为问题

→ **正交问题用正交工具,各管各**。

#### 依据

| 类型 | 内容 |
|---|---|
| 官方结构 | Claude Code 把规则分为 `~/.claude/rules/`(用户级)、`CLAUDE.md` alias(项目/子目录级)和 docs/specs/changes/(变更级);project-workflow 把 portable source 收敛到 `AGENTS.md` + path-scoped rules,再由 adapter 映射到工具文件 |
| 业界对照 | Spec Kit 用 `spec.md` + `plan.md` + `tasks.md` 三文件;mcpmarket "Drift Detection" / "Drift Analysis" / Cavekit `/ck:check` 都偏向 spec-vs-code drift(L3);项目约定合规(L2)通常由项目规则、review prompt 或人工 review 承担 → 印证 L2/L3 是不同问题 |
| 综合命名 | 三层分类是我的综合命名,但底层事实(三种规则源)是官方分层的具体化 |

#### 怎么用

| 层 | 工具 | 时机 |
|---|---|---|
| L1 | hook(eslint/ruff/gofmt,保存时单文件 lint+format,**自动改文件**)+ endpoint check(默认由 `feature-done` 跑;单独重跑 = 直接跑项目 check 命令)| 保存后 + 端点 |
| L2 | reviewer agent + AGENTS.md 作 context | 端点(P3 proof bundle) |
| L3 | reviewer agent + spec.md 作 context + 测试 | 端点(P3 proof bundle) |

**组合在端点 action**:`feature-done` 是唯一端点组合点,顺序聚合 L1 / L2 / L3 / proof bundle 并给出单一 verdict。所有 adapter 只暴露这一个端点入口;局部复查通过重跑 `feature-done`(幂等 + 缓存复用)或在主会话直接 dispatch reviewer sub-agent 完成,不设第二套 helper 命令。

#### L2 / L3 Reviewer 承诺

调用 [`agents-md-reviewer`](reviewers/agents-md-reviewer.md) / [`spec-reviewer`](reviewers/spec-reviewer.md) 时,reviewer 遵守以下契约——这些不是建议,是 reviewer 给 caller 的硬承诺:

| 承诺 | 含义 | 对应命题([§0.1](#01-这本手册解决什么)) |
|---|---|---|
| **Cite-or-skip** | 每条 finding 必须引用规则原文(`AGENTS.md §X` / `spec.md §X` + ≤ 1 行原文)。不允许新增"通用最佳实践"建议 | Verification(输出可追溯)|
| **Fresh-read mandate** | 每次调用必须重读规则文件(不依赖对话上下文),保证 reviewer 不被会话漂移影响 | Drift 时间维度(同代码两次结果可重现)|
| **4-phase methodology** | Extract checklist → Verify(distributed rule 禁止 spot-check)→ Per-element matrix(失败时)→ Calibrated confidence | Verification(机械流程减少漏检)|
| **Coverage 指标** | 输出 `coverage = fully_verified / total × 100%`;high confidence 需 ≥ 95% **且**无 skipped | Verification(覆盖率可量化)|
| **Ambiguity feedback** | 发现规则模糊或矛盾时主动 flag 给 caller(`📝 ambiguities` 段) | Drift 演进维度(规则瑕疵闭环到 P4)|

**workflow 调用方不必背契约**,但**知道这些保证**有助于判断 review 结果可信度,以及解释"为什么 reviewer 不给某条它做不到的建议"。完整契约定义见 reviewer skill 文件本身。

#### L2/L3 Finding 重叠时的去重规则

L2 / L3 reviewer 独立 dispatch,各看各的规则源(AGENTS.md vs spec.md),**不互相感知**。同一行被双 flag 是正交设计的正常代价,不是 bug。**`feature-done` / proof-bundle 装配层在 Review summary 中按下表去重**(reviewer 承诺不改):

| 场景 | 规则 |
|---|---|
| 双 flag 同一行 + **同根因**(e.g. 都说"该加 error handling") | **L3 为准** —— spec 是 feature 强契约,修 L3 同时修 L2 |
| 双 flag 同一行 + **不同根因**(e.g. L2 说"命名漂",L3 说"行为不符 §1 Outcomes") | **两条都保留**,各自处理 |
| 仅 L2 flag,代码符合 spec | L2 为准(spec 没禁的约定一致性优先) |
| 仅 L3 flag | L3 为准(spec 是 feature 基线) |

**Why L3 > L2 同根因时**:L3 违反 = verification 直接 fail(行为/范围错);L2 违反 = drift(风格/结构错)。严重性 L3 高;一个 fix 通常两边都满足,先按 L3 框架修。

**落地**:此规则由 `feature-done` 的 proof-bundle 装配步骤执行。Reviewer 各自报独立 finding,**去重在 aggregator**,不下沉到 reviewer 内部(否则违反 §6.4 主张的"正交问题正交工具")。

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
**核心**:WHAT 进 spec(用户视角,冻结);HOW 进 plan(技术视角,可补)。详见 [`spec-driven.md §6.7`](spec-driven.md#67-specmd-和-planmd-内容混淆)。

### 7.6 不要把上层投资沉到底层工具
**症状**:把项目规则只写进单一工具私有格式(如 `.cursorrules` 只 Cursor 读)而不是 AGENTS.md
**修正**:协作约定写在**广泛可读**的位置(AGENTS.md / `docs/`,主力 Claude Code 但 OpenCode / Codex 也能读),工具特定位置只放工具特异配置(如 `.claude/hooks/` / `.claude/settings.json`)。project-workflow 不强求"工具完全无关",但要避免锁死单一工具的私有格式 —— 见 [§0.5 信念 2](#05-实现策略的核心信念)。

### 7.7 不要在 P0 没做完就跳到 P2
**症状**:还没建 AGENTS.md / hooks 就开始写 feature
**后果**:基线缺失,每个 feature 都要重新讨论项目惯例
**修正**:严格按 P0 → P2 顺序;P0 没做完不开 feature(模块新增是 P2 内 sub-flow,见 §2)

### 7.8 不要把 backlog 塞进 repo 文件
**症状**:`docs/backlog.md` / `TODO.md` 跟踪未决事项
**后果**:重复维护(Issues + 文件),搜索 / 排序 / 通知都退化
**修正**:backlog 走 GitHub/GitLab Issues + labels;只有"详细设计 > 200 行"才单独成文件

### 7.9 不要让 review 门空转(太安静)
**症状**:连续 N 个 feature,某道门(L2/L3/proof/auditor)产出**零任何 severity 的 findings**(连 ambiguity/advisory 都没),只剩模板套话
**注意**:零 must-fix ≠ 空转 —— 约定成熟 + 规则内化后,活的门仍会偶尔吐 partial/ambiguity(补单测、reframe 判据)。真信号是**连任何 severity 都不再产出**
**修正**:该门对本项目边际递减 → 精简(降频 / 合并 / 退轻车道);别只因"还在跑"就留
**信号来源**:不用凭感觉 —— `feature-done` 聚合报告的"门健康"行会统计各门本次 finding 数,并在某门连续 ≥ 3 个 feature 零产出时显式提示(数据读自历史 proof bundle,无额外存储)

### 7.10 不要让 review 门太吵(误报侵蚀信任)
**症状**:门反复对**既有 baseline / 非 patch 内容**开火(如 auditor retrofit 模式误判既有决策),或 dismissal-rate 高到人开始橡皮图章
**后果**:信任流失 → 人无视门 → 门名存实亡(比空转更危险,它还在烧成本)
**修正**:校准该门(收紧 scope / 修 retrofit 契约 / 调阈值);把"findings 被驳回率"当数据信号

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

- **Agent review(P2.3 / P3)**:Claude adapter 可用 `pr-review-toolkit:review-pr`;其他 adapter 用等价 reviewer → 交付时跑
- **安全(P2.3)**:`/security-review` 原生 → 涉及认证/输入/密钥时
- **文档拉取**:`context7` MCP → 外部库版本相关问题
- **提交**:`commit-commands` skill

### 8.5 本地开发 + 同步发布

栈适配 tactic(具体配置看你用的脚手架仓库自身的 `DEPLOYMENT.md`):

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
| Hooks 概念在各工具有等价物 | 各工具 hook 配置、事件 schema、授权模型不同,跨工具桥接成本不为零 |
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

- **`~/.claude/rules/`**(Claude Code 官方支持):Claude adapter 的全局规则载体,跨项目通用,P0 时可初始化
- **project-workflow v3**:本手册是它的核心文档,`template/` 存放 P0 starter assets 与插件内 feature 模板,tools/ 是 P0/P4 工具
- **`pr-review-toolkit`**:Claude adapter 可用的 P2.3 / P3 端点 reviewer;其他 adapter 应提供等价 reviewer
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
- [Anthropic Engineering — Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) —— orchestrator-worker 模式官方 codify(project-workflow sub-agent 设计的依据)

### 业界实践(借鉴)

**Verification 命题**:
- [GitHub Spec Kit](https://github.com/github/spec-kit) —— 重型 spec 工具链
- [Fission-AI OpenSpec](https://github.com/Fission-AI/OpenSpec) —— spec delta 流派(只记 per-feature 变化)+ 原生 AGENTS.md 集成;跟 project-workflow `docs/specs/changes/<NNN>-<slug>/` 同构
- [Addy Osmani — How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) —— 轻量 spec 流派
- [Spec-Driven Development arXiv 2602.00180](https://arxiv.org/abs/2602.00180) —— 110k+ bug 数据
- [OpenAI Symphony](https://github.com/openai/symphony) —— manage work, not agents;对 project-workflow 的工作交接状态、可接手交付思想有启发,但 proof bundle 是本 workflow 的落地综合
- [Testing Is the New Bottleneck for AI-Driven Development — MetalBear](https://metalbear.com/blog/testing-bottleneck-ai/) —— 验证瓶颈现象描述

**Context-as-RAM 命题**:
- [Mem0 — State of AI Agent Memory 2026](https://mem0.ai/blog/state-of-ai-agent-memory-2026) —— "Context Window Behaves Like RAM, Not Storage"
- [State of Context Engineering 2026](https://www.newsletter.swirlai.com/p/state-of-context-engineering-in-2026) —— Aurimas Griciūnas 综述

**Drift 命题**:
- [Martin Fowler — Encoding Team Standards](https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html) —— 团队约定机读化
- [Propel Code — AI Codebase Drift Cleanup Loops](https://www.propelcode.ai/blog/ai-codebase-drift-cleanup-loops) —— drift 检测产品视角
- [Your AI-written codebase is drifting — DEV Community](https://dev.to/skaaz/your-ai-written-codebase-is-drifting-heres-how-to-measure-it-f10) —— drift 度量方法

**工作流哲学**:
- [AGENTS.md](https://agents.md/) —— 跨工具 AI 协作约定标准(project-workflow 整套约定层架在此之上;Martin Fowler 那条是观点,这条是标准本身)
- [Addy Osmani — My LLM coding workflow 2026](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)
- [Matt Pocock — Skills for Real Engineers](https://github.com/mattpocock/skills) —— small composable 哲学
- [Jesse Vincent — Superpowers](https://github.com/obra/superpowers) —— 反向参考(process-owning 风格)
- [Michael Nygard — Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) —— ADR 模板源

### 内部交叉

- [`spec-driven.md`](spec-driven.md) — P2 spec 三文件详解
- [`tooling.md`](tooling.md) — 各 AI 工具横向比较
- [`skills/agents-md-revise/SKILL.md`](../skills/agents-md-revise/SKILL.md) — P4 主动 refresh skill 详细 step
