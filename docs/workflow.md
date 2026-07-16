# AI 辅助开发工作流手册:5 阶段通用蓝图

> 本手册是 [project-workflow v3](https://github.com/shrekshrek/project-workflow) 的核心文档。
>
> 描述任何**新项目从启动到持续维护**的 5 阶段流程。**方法论核心工具无关、栈无关**(具体栈映射见 §8;工具适配边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md))。
>
> 风格:opinionated 但可 hack —— 任何一条都可以为具体场景偏离,只要清楚为什么。
>
> **统一流程原则**:个人开发与团队开发使用同一条 per-change 流程。每个人在自己的工作范围内按相同的 no-artifact / light / full 分流、验证、归档后提交即可;project-workflow 不要求额外 team mode、协作层或并发协调协议。

---

## 0. 起点

### 0.1 这本手册解决什么

AI 协作开发有**三个 Tier 1 工程痛点**,本手册的 5 阶段、4 支柱、所有具体机制都为这三件事服务。

#### 命题 1:Verification —— AI 生成快过人类验证

**问题**:AI 代码产出速度远超团队 validate 能力,没看过的代码进仓库,bug / hallucination / 偏离 spec 都被漏过。**这个不对称随模型代际增强而加剧,不会被更强的模型消解**——单位人工验证时间对应的未审查产出只会更多,而"要做什么"的意图仍然只在用户脑中,无法由模型自证。

**社群证据**:Boris Cherny(Anthropic / Claude Code lead):*"The most important thing is to give Claude a way to verify."*(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:
- **输入侧**:[§6.1 Spec-driven](#61-规约先于代码spec-driven) —— 用 spec.md 把"做什么"冻结成契约
- **输出侧**:[§6.4 三层 review](#64-按规则源分层验证three-layer-review-separation)(L1 机械 / L2 项目约定 / L3 spec 合规)+ [§3.3 delivery receipt](#33-交付阶段delivery-receipt)

#### 命题 2:Context-as-RAM —— 上下文是有限预算,不是无底磁盘

**问题**:AI 的 context window 行为像 RAM 不像 storage —— 装得越多 attention 越散,长会话依从度下降,token 成本爆炸。

**社群证据**:[Mem0 — Context Window Behaves Like RAM, Not Storage](https://mem0.ai/blog/state-of-ai-agent-memory-2026)(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:[§6.2 Context budget](#62-上下文是有限预算context-budget) —— AGENTS.md 行数纪律 + path-scoped rules 按需加载(Claude: `.claude/rules/`) + `@imports` 组织长尾 + `/clear` / `/compact` + 小 composable skills

#### 命题 3:Drift —— 规范在时间/空间/演进三向漂移

**问题**:AI 没有跨会话长期记忆,规范会朝三个方向漂——**时间**(同代码不同 session 评判不同)、**空间**(模块 A 跟模块 B 风格不一致)、**演进**(项目第 1 月跟第 6 月代码风格差)。即使单人串行开发,不同 session 也不共享记忆;`AGENTS.md` 因而承担跨 session 的项目约定入口。

**社群证据**:[Martin Fowler — Encoding Team Standards](https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html)(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:[§6.3 Env-enforced rules](#63-规则由环境强制environment-enforced-rules)(active hooks / endpoint checks)+ [§1 P0 AGENTS.md](#1-p0project-setup项目第一天) 单一 source of truth + [§5 P4 Drift Refresh](#5-p4drift-refresh主动修正)

#### 跨层不一致(全栈 tactic,不是独立命题)

全栈项目的前/后/DB 跨 tier 契约漂移**是真实问题但社群证据较弱**(被视为通用架构问题,不是 AI 特有)。project-workflow 不把它升级为独立命题,而是作为全栈项目的具体战术处理 —— 见 [§8.6 Contract-first](#86-全栈项目的契约先行contract-first-tactic)。

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
│ ─ 六文件中立 baseline;有 scaffold 后再 personalize          │
│ ─ 工具:project-init action(Claude / Codex / manual adapters) │
├─────────────────────────────────────────────────────────────┤
│ P2: Tracked Feature Development                             │
│ ─ /feature-init <slug> → full:spec/plan/tasks 或 light:tasks │
│ ─ 跨 tier 契约先确定 → 按依赖实施 → receipt → archive 收尾   │
│ ─ 存量 spec 冲突/旧 spec 污染 → /spec-reconcile retrofit    │
│                                                             │
│   ↳ Module Setup sub-flow(P2 内嵌触发,非独立 phase)        │
│      ─ spec 阶段识别"需新模块" → plan 加边界 → tasks 加骨架  │
│      ─ 仅"反常"时加 <module>/AGENTS.md(见 §2.3)             │
├─────────────────────────────────────────────────────────────┤
│ P3: Continuous Maintenance(开发期间常驻)                    │
│ ─ active hooks 增量校验;端点 L1/L2 始终存在               │
│ ─ 端点 review:L3 spec 合规 + AGENTS.md drift 建议           │
│ ─ backlog / discussions 走平台原生(Issues / Discussions)   │
├─────────────────────────────────────────────────────────────┤
│ P4: Drift Refresh(信号触发)                               │
│ ─ /agents-md-revise 用户在发现客观 drift 时主动调用      │
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
| **P4** Drift Refresh | Drift(信号触发修正、演进维度) | §6.3 env-enforced(规则更新) |

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
| **宿主私有路径规则**(可选) | 例如 Claude `.claude/rules/*.md`;不是 portable core | plugin 保留示例和机制说明;仅在具体宿主、具体项目需要时启用,其他 adapter 无需读取或翻译 |
| **跨功能决策**(扁平,不嵌套) | `docs/adr/NNNN-<title>.md` | 重大架构选择 / spec-revise 满足 `ADR_REQUIRED`([§3.5](#35-开发中发现-specplan-错怎么办))/ 模块边界变更([§2.6](#26-module-中途变更feature-实施中发现边界要调整)) 时 |
| **工具基础设施**(扁平,不嵌套) | `.gitignore`;有已验证命令时才 materialize adapter hooks/settings;drift 状态按需 | P0 不创建 no-op hook |

#### 文档职责 5 类(总框架)

> 上一张表是**空间正交轴**(文件住在哪);本表是**职责正交轴**(文件回答什么问题)。

| 类别 | 文件 | 回答什么问题 | 时间维度 | 何时存在 |
|---|---|---|---|---|
| **A. 约定**(Conventions) | portable core 是 `AGENTS.md`(项目 / tier / 模块嵌套)+ adapter alias;宿主私有 scoped rules 可选 | "我们**现在**怎么工作?"(规则 / 风格 / 最佳实践) | 当前态;AGENTS.md 频率梯度见 [§1.3](#13-agentsmd-的内容标准),Claude 可选规则见 [§1.6](#16-路径级规则claude-rules官方支持) | 项目级必然;tier / 模块级与宿主私有资产可选 |
| **B. 变更**(Changes) | `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` 或轻车道 `tasks.md`;交付后移入 `docs/specs/changes/archive/` | "这次 tracked change **做什么 + 怎么做 + 步骤**?" | per-change 生命周期,完成后**物理归档** | `/feature-init` 或行为变更下限(轻车道) |
| **C. 决策**(ADR) | `docs/adr/NNNN-<title>.md` | "**当时为什么**这么选?+ trade-off?" | Accepted 后正文冻结;取代时只改状态并新建 ADR | 重大架构选择 / spec-revise 满足 `ADR_REQUIRED` / 模块边界变更时(§3.5 / §2.6)|
| **D. 工具基础设施**(Infra) | `.gitignore` + 条件式 adapter hooks/settings | "工具**自动跑**什么?" | 普通 repo 代码生命周期 | 有可靠命令才创建 |
| **E. 产品事实**(Domain docs) | `docs/specs/index.md` + 按需 `docs/specs/<area>.md`;变更在 `docs/specs/changes/` | "这个产品/系统域**现在**怎么工作?" | 当前态;`feature-archive` merge 更新 | P0 建索引;area doc 在有当前事实可沉淀时创建 |

**两轴交叉规则**:
- 代码组织维度只影响 **A. 约定** 中 AGENTS.md 的嵌套层数(根 / tier / 模块);宿主私有规则只增强对应宿主,不要求跨 adapter 映射
- B / C / D / E 四类与代码组织维度独立,**不按 tier / 模块嵌套**

**A vs E 分界**(都是"当前态",别混):A 回答**工程上怎么干活**(命令 / 风格 / 边界),E 回答**产品现在长什么样**(IA / 行为 / 契约现状)。工程约定永远进 A,产品域现状进 E;E 不存在时,B 类历史 spec 只是审计材料,不是实施基线(见 [spec-driven.md §5](spec-driven.md#5-spec-生命周期))。

**A–E 生命周期归口**:

| 类别 | 创建 | 正常演化 | 关闭 / 修复 |
|---|---|---|---|
| **A 约定** | `project-init` / retrofit 的 `project-personalize` | feature 内发现的新约定随该 change 更新;客观 drift 才用 `agents-md-revise` | 不归档,始终维护当前态;L2/Drift 提供反馈 |
| **B 变更** | `feature-init` 先判 no artifact / light / full;仅 light/full 创建 | draft 自由填;冻结契约真错才 `spec-revise`;`feature-done` 判兑现 | `feature-archive` 物理归档;历史混乱才 `spec-reconcile` |
| **C 决策** | 规划或 `spec-revise` 中仅 `ADR_REQUIRED=yes` 时创建 | Accepted 后正文不改;新决定用新 ADR,旧 ADR 只改为 `Superseded by NNNN` | `feature-archive` 做一致性检查;`spec-reconcile` 经用户确认修冲突,不做按年龄清扫 |
| **D 基础设施** | `project-init` 不创建;`project-personalize` 只在命令 active + verified 且用户选择时创建 | 当普通 repo 基础设施变更处理:按风险直接改、走 light 或 full lane,并验证真实执行 | 不设专用周期 action;失效 hook 修复或删除,不能留 no-op mapping |
| **E 产品事实** | P0 只建索引;首个持久事实由 `feature-archive` 创建 area doc | `feature-done` 标 pending,`feature-archive` 替换式合并当前事实 | 历史冲突才 `spec-reconcile`;核对日期是读者信号,不由 A 类 drift action 代管 |

> **`docs/gotchas.md` 归口**(A 类附属证据 ledger):职责上属 A——回答"工程上怎么干活",L2 review 把它并入 A 类约定全集消费;但它不是 A 的 core 载体,记录的是**已复现事故的证据**(反例 → 正例 → 为什么)而非强制规范,P4 drift refresh 不管它。生命周期:P0 生成空 ledger(文件头自带写入门槛与出口纪律),只有真实复现并验证过的故障才追加;出口两条——**升格即删条**(正例提炼进 AGENTS.md / path rules 后删除原条)与**前提失效即删条**(依赖的栈/基建移除后删除),git history 即归档。只进不出的 ledger 必然腐化成下一个污染源。

**新读者心智地图**(读完本节就能定位任何文档):

```
"想看项目规则 / 架构约定"     → A(项目 AGENTS.md)
"想看本 tier 特殊约定"        → A(<tier>/AGENTS.md)
"想看代码风格 / 测试 / 安全"  → A(path-scoped rules;Claude: .claude/rules/<topic>.md)
"想看 feature 设计"          → B(docs/specs/changes/<NNN>-<slug>/;已交付的在 docs/specs/changes/archive/,只当历史读)
"想看为什么选 X"             → C(docs/adr/NNNN-<X>.md)
"想看 hook / 工具配置"        → D(.claude/hooks/, .claude/settings.json, .codex/hooks.json)
"想看某产品域现在的样子"      → E(docs/specs/<area>.md;没有 E 时可临时读最新 active spec;archive 只作历史证据,不当当前基线)
```

#### Methodology core vs runtime adapter

project-workflow 分两层:

| 层 | 负责什么 | 是否绑定工具 | 例 |
|---|---|---|---|
| **Methodology core** | 流程、不变量、workflow action、reviewer 方法、文档契约、review 分层 | 否 | `AGENTS.md`, `docs/actions/`, `docs/reviewers/`, `docs/specs/`, `docs/specs/changes/`, ADR, proof bundle, L1/L2/L3 |
| **Runtime adapter** | 把 core 自动化到某个工具 | 是 | Claude Code plugin skills, Codex skills/plugins/hooks, shell scripts |

Core docs 只定义"应该发生什么";adapter docs 定义"在某个工具里怎么触发"。其中 `docs/actions/` 是每个 workflow action 的唯一权威层,定义触发、输入、输出、不变量和验证;`docs/reviewers/` 是 reviewer / auditor / researcher 的唯一权威层。本文用 `/feature-init` 等短写表示 action 名,不是绑定某个宿主的精确命令;Claude Code 使用 `/project-workflow:*`,Codex 使用同名 `$skill`,手工模式直接按 action spec 执行。完整映射见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

### 0.4 项目核心目标

> **项目可控、规范自维持** —— 多模块/多功能按各自 change 独立推进,每个增量跟项目整体保持一致,**不依赖反复人工提醒**。

三个子目标(后续 5 阶段流程都是为这三件事服务):

| 子目标 | 含义 | 主要支撑机制 |
|---|---|---|
| **解耦开发** | 模块/功能可独立推进,边界清晰 | 功能 spec + 模块化 + 契约先于实现(§8.6) |
| **规范一致** | 跨模块/跨功能的代码风格/架构/约定不漂移 | AGENTS.md + active hooks / endpoint checks(§6.3) |
| **方向稳定** | 每个增量不会跑偏,AI 输出始终在 spec 边界内 | 三层 review(§6.4)+ proof bundle 端点验证(§3.3) |

**关于"自维持"的真实含义**:这不是"100% 自动化",而是 **蓝图侧提供的工具/约定 + 纪律侧的用户实践协同**。详细分工见 [§6.0](#60-每条原则的两侧组成读-6164-前必读)。

### 0.5 实现策略的核心信念

要达成 §0.4 的目标,必须接受两个事实(不是手段,是前提):

1. **目标是消除"对齐劳动",不是消除迭代**。

   真正该消除的:开发期间人反复提醒 AI **"注意命名"、"注意结构"、"注意规范"** 这一类**对齐对话** —— 这是真正的内耗,不是 AI 错,是规范没在系统层固化。
   
   不该追求的:让 AI"一次写对"或"零迭代"。合理迭代本身不是问题。
   
   **解法**:规范靠环境 + 文档自维持(hooks / lint / types / tests / AGENTS.md / spec.md),让对齐对话发生在**系统跟 AI 之间**,不再发生在**人跟 AI 之间**(见 §6.3)。

2. **方法论 core 必须 portable;adapter 可以 opinionated**。

   `AGENTS.md` / `docs/actions/` / `spec.md` / ADR / proof bundle 这层用最广可读的格式(markdown + 标准约定),让 Claude Code、Codex 和手工流程都能执行同一方法论。仓库分别维护 Claude Code 与 Codex 的 host-native adapter;两端只实现各自运行时细节,不能复制一套不同的方法论。

   **底层逻辑**:底层工具是 weeks-级别迁移成本,上层规范(AGENTS.md / spec.md)是 months-级别投入。上层规范必须 portable;工具特有能力(hooks / plugin manifests / sub-agent 配置)放进 adapter,不要反向污染 core。详见 §7.6 反模式 + [`cross-tool-methodology.md`](cross-tool-methodology.md)。

3. **Plugin / skill 工具的角色:scaffold + 条件性框架问 + 提醒 + 兜底,不当 interviewer 替 user 决策业务细节**。

   Plugin 应该做的:
   - **Scaffold** ── 空项目只起中立六文件 baseline;feature 按需起 light/full artifact;现有代码用 personalize 补真实约定
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
| **已有 idea + 不确定栈** | 跳过 brainstorm,直接 `/project-init` 建中立 baseline;代码 scaffold 前不替用户选栈 |
| **Retrofit 既有项目** | 跳过 —— 跑 [`project-personalize`](actions/project-personalize.md)(已有 codebase 已经是 brainstorm 产物)|

**project-workflow 不工具化这个阶段**——brainstorm 本质发散,SOP / mandatory skill(Superpowers 风格)反而磕碰。**主会话自由对话最合适**;产物不必落盘。空目录仍先用 `project-init` 建中立 baseline;代码 scaffold 存在后再由 `project-personalize` 从仓库事实补约定。若要保存产品讨论,走 GitHub Discussions / Issues(per [§4.4](#44-backlog-与讨论走平台不进-repo-文件) "AI 读 → 文件,人类协作 → 平台")。

**外部工具**(可选):Anthropic 内置 / ECC / Superpowers 各有 brainstorming skill,选你顺手的或直接用 AI 主会话 —— project-workflow 不强制。

### 1.1 触发与目标

**触发**:
- 新项目第一天
- 老项目首次引入 AI 协作

**目标**:几分钟内生成中立、无栈猜测的六文件 baseline,让后续开发有统一入口。代码 scaffold 存在后,再用 `project-personalize` 从真实仓库证据补命令、路径、tier、可选 rules/hooks。

### 1.2 产出物(中立 baseline + 保留的可选能力)

P0 产出物分**两层**(职责严格不重叠):

**默认写入目标项目的六个文件**:

```
项目根/
├── AGENTS.md                       # 项目级约定入口,跨工具事实标准
├── CLAUDE.md                       # Claude adapter alias:1 行 @AGENTS.md(或 symlink)
├── docs/
│   ├── specs/index.md              # current-truth 索引
│   ├── adr/README.md               # ADR 使用说明;模板留在 plugin
│   └── gotchas.md                  # project-local 已验证工程陷阱 ledger(初始为空)
│   # docs/specs/changes/<NNN>-<slug>/ 由 /feature-init 按需创建;
│   # spec/plan/tasks 模板由 /feature-init 提供,项目本地默认不持有
└── .gitignore                      # 预防性含 CLAUDE.local.md、.env*
```

**代码 scaffold 后按证据补充的工程化层**(栈相关,由项目自身形成):

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

**规则**:六文件 baseline 是方法论入口;B 层是工程化,换栈重写。**永远不在 baseline 猜栈特定应用代码或命令**。plugin/source library 继续保留 nested AGENTS、Claude rules、hooks、tier 示例、spec/ADR 模板、researcher/auditor 等完整能力;默认不复制不等于删除。

> **跨工具口径**:`docs/specs/`、`docs/specs/changes/`、`docs/adr/`、`AGENTS.md` 是目标项目的 portable core 文件。`.claude/rules/` 等目录是宿主私有、项目自有的可选资产;其他工具不必读取、复制或翻译。

**关于 `CLAUDE.local.md`**:**不在 P0 自动创建**。它是 gitignored 的个人项目私有覆盖(沙箱 URL / 临时 WIP / 个人测试账号等),**需要时再手动 `touch`**。`.gitignore` 提前列好,这样用户哪天创建它不需要再改 .gitignore。
官方推荐用法详见 [Anthropic — CLAUDE.md docs](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)。

<a id="13-a-类约定的内容标准agentsmd--claude-rules"></a>
<a id="13-a-类约定的内容标准agentsmd--clauderules"></a>

<a id="13-agentsmd-的内容标准"></a>
### 1.3 A 类约定的内容标准(AGENTS.md + 可选宿主私有规则)

A 类约定的 portable core 载体是 **AGENTS.md**(根 / tier / module 嵌套)。某些宿主还支持私有 scoped rules;例如 Claude Code 可用 **`.claude/rules/<topic>.md`** 做路径或 topic 触发。这是保留的可选能力,不是 P0 默认产物,也不是其他 adapter 必须映射的第二套 core。

#### AGENTS.md 内容标准

**Anthropic 官方没有固定模板**。下表区分当前官方建议与 project-workflow 自身的预算纪律:

| 标准 | 数值/做法 |
|---|---|
| 官方大小目标 | < 200 lines;更长仍完整加载,但增加 context 并降低遵循度 |
| 项目理想目标 | ~100 lines,为方法论预算目标,不是 runtime 硬限制 |
| 指令数量 | 无官方固定数字;只保留每次 session 都必须知道的事实 |
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
| frontmatter | `paths:` YAML 列表;每个 pattern 一个 quoted list item(见 §1.6);无 `paths:` 表示全局规则 |

**典型 topic 拆分**(Claude-local 可选能力,按需由 `project-personalize` 创建):
- `code-style.md` —— 命名 / 缩进 / 行宽 / 注释纪律 / 函数大小
- `testing.md` —— 框架 / 文件组织 / TDD 纪律 / 覆盖率
- `security.md` —— 🚫 Never / ⚠️ Ask first / ✅ Always

**何时加新 topic file**:
- framework-specific 约定多了(如 FastAPI、Vue 项目级风格) → `fastapi.md` / `vue.md` 加 `paths:` 限定该 tier
- 跨多文件类型的 cross-cutting 约束(如 i18n、accessibility) → 独立 topic

#### AGENTS.md vs path-scoped rules:写哪边?

| 维度 | AGENTS.md | path-scoped rules(Claude: `.claude/rules/<topic>.md`) |
|---|---|---|
| **加载** | session 启动全文载 | 文件命中 `paths:` 时按需载;无 `paths:` 的 rule 全局载入 |
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
├── code-style.md   (paths 包含 `src/**/*.{ts,py}` —— 改源码才用)
├── testing.md       (paths 包含 `tests/**/*.{ts,py}` —— 写测试才用)
├── security.md      (无 paths / 有意全局 —— 安全规则适用任何代码,见 §1.6)
└── <framework>.md   (如 fastapi.md / vue.md —— 仅该 framework 文件)
```

**A 类反模式**:
- "任何文件都要看的项目级约定"塞进 path-scoped rules —— 只有匹配路径的文件触发时才加载,其他时候 AI 看不到 → 漂移
- framework-specific 详规则全塞 AGENTS.md → 突破 < 200 行,所有 session 全部加载 → context budget 爆炸
- 同一规则在 AGENTS.md + 宿主私有 path-scoped rules 两边无意重复 → 先判断 portability:跨工具约定保留在 AGENTS.md(宿主规则只放增量);仅约束该宿主的规则保留在 rules 并明确 host-specific 范围
- 新建 path-scoped rule 但忘设 `paths:` → 失去 path-scoped 优势,等于扁平 always-on

> **A 类不止 P0 写**:AGENTS.md 的更新频率与触发跨 P2/P4,详见 [§5.0 三层 AGENTS.md 的更新频率梯度](#50-三层-agentsmd-的更新频率梯度);Claude-local scoped rules 只在该项目实际采用时随相关 change 或 `project-personalize` 新增/扩充。

<a id="14-claudemd-嵌套层次子级覆盖父级"></a>
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
| 纯 `CLAUDE.md` | 规则只放 CLAUDE.md | Claude Code 专属,Codex / Cursor / OpenCode 不读 → **不跨工具** |
| 纯 `AGENTS.md`(纯跨工具) | 规则只放 AGENTS.md,无 CLAUDE.md | Claude Code 子目录靠 CLAUDE.md 触发自动加载,缺它 → **tier / 模块级规则进不了 context** |
| **双文件**(本手册采用) | AGENTS.md 是 canonical;CLAUDE.md 1 行 `@AGENTS.md` 把内容 inline 进来 | 跨工具读 AGENTS.md ✅;Claude Code 加载 CLAUDE.md → @import → AGENTS.md 内容进 context ✅ |

各处引用此节锚点("跟双文件方案对齐")避免重复定义。**注意**:跟 §1.3 反模式"AGENTS.md + CLAUDE.md 双文件独立维护"对照 —— 那个反模式是**两份都填内容 + 互相漂移**;双文件方案是**AGENTS.md 填,CLAUDE.md 仅 1 行 alias**,**没有漂移空间**。

### 1.5 `@imports` 语法(官方支持)

> 何时选 `@imports` vs path-scoped rules?决策口诀见 [§1.3](#13-a-类约定的内容标准agentsmd--claude-rules)。本节只讲 `@imports` 机制本身。

AGENTS.md / CLAUDE.md 可以用 `@path/to/file` 拉别的文件入 context,**递归最深 5 层**:

```markdown
# AGENTS.md

@docs/architecture.md

## 本文件主体(短小核心)
- ...
```

**为什么用**:把"长尾内容"(完整架构文档、共享规则)拆出去,主文件保持 < 100 行;AI 读时仍加载 import 内容。它节省的是主文件复杂度和维护成本,不是已加载后的 token 成本;真正的按需 context 节省主要来自 path-scoped rules(Claude: `.claude/rules/`)、skills 和主动 `/clear` / `/compact`。

<a id="16-路径级规则claude-rules官方支持"></a>
### 1.6 路径级规则:Claude materialization `.claude/rules/`(官方支持)

模块化 instructions 的 core 语义是"某些规则只作用于某些路径 / topic"。Claude Code adapter 用 `.claude/rules/<topic>.md` + frontmatter materialize 这个语义,让规则**只在匹配文件被 Claude 读取时触发**:

```markdown
---
paths:
  - "<tier>/**/*.py"
  - "<other-tier>/**/*.ts"
---

# API 开发规则

- 所有 endpoint 必须 input validation
- 用标准 error response 格式
```

更多 paths 写法(单 tier / 多 tier / 跨语言)见 [§1.3 典型分工](#13-a-类约定的内容标准agentsmd--claude-rules) 代码块。

#### Frontmatter 格式

按当前 [Claude Code 官方规则文档](https://code.claude.com/docs/en/memory#path-specific-rules)使用 `paths:` YAML 列表。每个 pattern 独立为 quoted list item;无 `paths:` 的 rule 在 session 启动时全局加载。Project-workflow 不再生成或解析历史 scope key / scalar scope;旧项目通过 `project-personalize` 迁移后再继续 workflow。

#### 已知 limitation

- **Write/Create 文件不触发规则加载**,只 Read 触发:见 [Issue #23478](https://github.com/anthropics/claude-code/issues/23478)(Anthropic 已 closed as not planned)
  - 实际影响:AI 用 Write 工具新建文件时,匹配 paths 的规则**不会进 context**
  - workaround:PostToolUse hook 在 Write 后强制 Read,见上述 issue
  - 简化:大部分修改场景走 Edit(基于已 Read 的文件),规则正常加载;只有"凭空新建文件"时失效
- 通配符遵循标准 glob:`**` 递归、`*` 单层、`{a,b}` 任一、**不支持** `!exclude` 排除
- 路径相对 project root
- 多个 paths list item 之间是 OR(任一匹配即触发)

#### Debug 步骤

规则没生效时:
1. 确认 frontmatter 用的是 `paths:` YAML 列表,每个 pattern 是 quoted list item
2. 让 Claude `cat .claude/rules/<file>.md` 确认 frontmatter 解析正确
3. 让 Claude Read 一个**应该匹配**的文件(如 `backend/app/main.py`),然后问"刚才加载了哪些 .claude/rules/?"—— 看实际触发情况
4. 若仍不工作,检查是否是 Write 不触发的 bug(见上)

> **adapter 定位:双端 host-native,methodology portable**
>
> Claude Code 项目需要路径级按需加载时,可用 `.claude/rules/<topic>.md` + `paths:` YAML-list frontmatter;无 `paths:` 的 rule 全局加载。`project-init` 不自动生成这些文件;有 scaffold 后由 `project-personalize` 在用户明确选择 Claude-local 能力时创建或修复。其他工具不读取或翻译这些文件。具体边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

### 1.7 Hooks 初始配置

P0 只有在确认存在 <5 秒、支持单文件参数且不会扩大写范围的命令时才 materialize hook adapter;否则项目内不生成 hook script/mapping,端点 L1 由 `feature-done` 跑全量 command。Plugin template 保留 hook source,不是目标项目里的 no-op scaffold。

> [docs/gotchas.md](gotchas.md) 是 plugin 自身从一个 fullstack 实例沉淀的证据库,只按当前栈需要查阅。`project-init` 生成的项目使用短的 project-local gotchas ledger,初始为空;只有真实复现并验证过的故障才写入,避免把 FastAPI/pnpm 等经验复制进无关项目。

settings.json 挂载:

```json
"hooks": {
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/lint-on-edit.cjs"
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
  let input;
  try {
    input = JSON.parse(data || '{}');
  } catch {
    console.error('[project-workflow] lint-on-edit: malformed hook JSON; skipping');
    process.exit(0);
  }
  const file = input.tool_input?.file_path;
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
└── 0001-<title>.md                 # 需要时由 action 从 plugin template 实例化
```

**Plugin 内模板**(基于 Michael Nygard 简化;项目目录不保留空模板):

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

- 单人项目 / 小团队不需要模板约束,delivery receipt 走 [`tasks.md` 末尾的 `## Proof Bundle` 节](#33-交付阶段delivery-receipt)即可
- 平台协作的**原则**(人类协作走平台、不进 repo 文件)由 [§4.4](#44-backlog-与讨论走平台不进-repo-文件) 承接,不需要模板
- 模板是**团队场景才付得起的复杂度**——出现外部 contributor / 多人协作时再加,P0 不预付

**何时加**:仓库开始接受外部 issue / PR、或团队成员 ≥ 2 人 且观察到 PR 描述质量不一致。届时手动 `mkdir .github/PULL_REQUEST_TEMPLATE.md`,引用或复制 [§3.3 delivery receipt](#33-交付阶段delivery-receipt) 的当前字段即可。GitLab 等价:`.gitlab/merge_request_templates/`。

### 1.10 初始化与个性化的提问边界

> **形态说明**:Project Setup 是 skill / adapter action,不是独立 CLI。空目录的 `project-init` 只确认目标路径并预览六文件 baseline,不做栈问卷;非空目录一律交给 `project-personalize`。

#### 实际问什么(对齐 `project-init` / `project-personalize` action)

`project-init` 不问栈问题。`project-personalize` 先读 manifests、lockfiles、目录和现有配置,只追问仓库证据无法回答且会实质改变结果的决定。tech-researcher、codebase-explorer、decision-completeness-auditor 仍按复杂度条件调用,而不是每次初始化固定运行。

#### 不问什么(故意省的题,每项都有原则)

| 项 | 怎么处理 | 为什么不问 |
|---|---|---|
| 项目名 | 不收集 | A 层不存项目名(那是 B 层 `package.json` / `pyproject.toml` 的事,见 §1.2) |
| 起服务 / 测试 / lint 命令 | `project-init` 留 deferred;`project-personalize` 从 manifest/配置验证 | 空目录没有证据,不能推断 |
| 部署命令 | `project-init` 不写;`project-personalize` 仅记录仓库已声明且可验证的命令 | B 层未起时拍脑袋写 = aspirational(违 §0.5 信念 1) |
| 目录组织模式 | `project-init` 不写;`project-personalize` 描述仓库现状 | 空目录没有证据,不预设 feature/domain 或 type layout |
| 代码风格 | `project-init` 不写;`project-personalize` 只记录已有 formatter/linter/config 与稳定代码模式 | 通用 default 不是项目事实 |
| 测试门槛 | 不设通用数字 default | 由项目现有 CI/配置或用户明确决定 |
| Boundaries 三档 | baseline 只放通用安全边界;项目特有边界由 `project-personalize` 从证据补 | 不为未知项目虚构 API/迁移/权限政策 |
| 分支命名 | baseline 不写;沿用仓库已有约定 | feature 编号不要求固定 branch pattern |
| Git 平台 | baseline 不写平台政策;平台协作由项目自己决定 | workflow 不把 GitHub/GitLab 设为运行前提 |
| 特殊约束(性能 / 合规 / 安全) | 不问 | P0 无基线数据,拍脑袋写 = aspirational;真需要的项目 P0 后写 ADR + 加节(见 §1.8) |

> 这些**省掉的**都对应一个反 aspirational 信念:**让 AI 凭训练即兴生成"看起来对"的内容,比保留中立 deferred 或不写更糟**(详 §0.5 信念 1)。没有仓库证据或用户决定时,**不让 LLM 编**。

#### 关键纪律

- 只在 `project-personalize` 遇到影响结果的真实缺口时提问;技术选型需要外部证据时按 [`tech-researcher`](reviewers/tech-researcher.md) 调研,返 2-3 候选 + 推荐,用户确认再回填
- 二选一 / 填空 > 开放式
- 所有目标文件先在 staging/内存形成一个 consolidated preview,用户审批后一次应用

### 1.11 校验

- `/memory`(Claude Code)或对应工具命令:确认 AGENTS.md / CLAUDE.md 加载
- `project-init` 只验证六文件、alias、无 placeholder、命令/路径仍为 deferred;`project-personalize` 才运行仓库声明的真实命令
- hook active 时改一个匹配文件验证真执行;未安装时确认项目内无 hook mapping/script并报告原因
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
| **Skill 内置 trace matrix** | 单一来源、单文件同步、具体值少 | 列“值 → 来源”;缺 trace block Preview |
| **Sub-agent reviewer** | 新 ownership/port/package/path/infra、弱证据、或生成决定跨多文件 | dispatch `decision-completeness-auditor`;must-fix block Preview |

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

按复杂度触发 audit,不按固定次数或 finding 数触发:简单单源同步用 inline trace;新 ownership/port/package/path/infra、弱证据或跨文件生成才用 auditor。Reviewer 的 sensitivity 由 known-bad mutation smoke 证明,不要用连续空报告推断有效性。

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
| `tasks.md` 加项 | 按当前栈写“建 `<module>` 最小入口 + 接入父级 composition point” |
| `<module>/AGENTS.md` + `CLAUDE.md` alias | **仅当模块"反常"时**(见 §2.3),通常不写 |

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

**Action**:[`spec-revise`](actions/spec-revise.md) 自动化本 SOP——module 模式覆盖本节流程(ADR 编号 + 跨文件一致性 + 修订记录格式)。

---

## 3. P2:Feature Development(每个功能)

每个 feature 走这个循环。**不是流程框架,是默认走法,可以随时偏离**。

### 3.0 P2 流程全景(skill 视角)

本节只给导航。每个 action 的触发、输入、输出、不变量和验证以 [`docs/actions/`](actions/) 为唯一权威;artifact 写法见 [`spec-driven.md`](spec-driven.md)。

```
[P0 完成]
   ├─ tiny/local 或 accepted-spec implementation → 直接实施
   └─ 需要追踪 → feature-init(no artifact / light / full)
          ├─ light → tasks + 验证
          └─ full → 与用户补完 spec/plan/tasks → spec-quality-check
                         ↓
                      实施
             (契约真错才 spec-revise)
                         ↓
                    feature-done
                         ↓
              PR/merge → feature-archive sweep

例外:历史 active specs 冲突才 spec-reconcile;客观约定 drift 才 agents-md-revise。
```

**两类 "spec review" 别混淆**:

| Skill | 何时 | 检查什么 |
|---|---|---|
| `/spec-quality-check` | **实施前** | **spec 本身**够不够好(7 问质量) |
| `/feature-done` 的 L3 层 | **实施后端点** | **代码**做了 spec 说要做的事吗(code-vs-spec drift) |

**局部复查怎么做**:`feature-done` 是 L1+L2+L3+proof-bundle 的唯一端点入口,不再拆分独立的 helper 命令。需要单独重跑某一层时:L1 直接跑项目 check 命令;L2 / L3 按 [`agents-md-reviewer`](reviewers/agents-md-reviewer.md) / [`spec-reviewer`](reviewers/spec-reviewer.md) 执行;proof bundle 修补则重跑 `feature-done`(幂等,复用有效缓存)。

**详细机制见**:[§3.1 规划阶段](#31-规划阶段)(决策清单)/ [§3.2 实现阶段](#32-实现阶段不要打断-ai-执行流)(不打断纪律)/ [§3.3 交付阶段 delivery receipt](#33-交付阶段delivery-receipt) / [§3.4 与平台流程协作](#34-与平台流程的协作) / [§3.5 中途修订](#35-开发中发现-specplan-错怎么办) / [§3.7 7 问 quality](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist)。

### 3.1 规划阶段

精确分类规则见 canonical [`feature-init` action](actions/feature-init.md)。规划阶段只坚持四个判断:

| 情形 | 路径 |
|---|---|
| tiny/local 或已确认 spec 覆盖实施 | 不建 artifact,直接做并验证 |
| 已声明 current-truth 行为发生变化 | 无论 diff 多小,至少轻车道 |
| 同一职责内、低风险、无契约/新模块/高爆破路径 | 轻车道 `tasks.md` |
| API/schema、迁移、安全/权限、跨模块、新模块或高爆破路径 | 全道 `spec.md + plan.md + tasks.md` |

不确定 UI 文案、样式、局部 refactor 或测试写法不强制升级全道;业务目标不确定时先问用户。多模块工作在 plan 做 Sibling Alignment,所有已定技术选择进入 Prior decisions。

**反模式**:用 plan.md 代替 spec.md。spec.md 写"做什么、为什么"(冻结),plan.md 写"怎么做、影响哪些模块"(实施中可补)。两个不能互替。

> 上面是**行动决策**(要不要启动 project-workflow / 要不要起 spec / 要不要 Sibling Alignment)。全车道 spec/plan/tasks 协作填完后,实施前按 [`spec-driven.md §3.7`](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist)运行 `/spec-quality-check`;精确 gate 语义以 canonical [`spec-quality-check` action](actions/spec-quality-check.md)为准。

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
- "这个变量名不太好" → active hook/L1 或 PR review 阶段统一改
- "这里我有个想法" → 记下来,等它跑完一段再说

**底层逻辑**:中途打断触发"AI 重新解释 → 用户重新评估 → AI 再写"的循环,这是单轮迭代成本高的元凶。环境层(§6.3)接管了机械合规,你不需要中途盯;端点 review(§3.3)管 substantive 问题。

### 3.3 交付阶段:delivery receipt

`feature-done` 把交付证据写入历史兼容的 `## Proof Bundle` 节,但内容是一份紧凑 delivery receipt。每个字段必须有消费者:

```
Verdict       —— 用户 / PR / archive
Change        —— 一行 identity;完整 diff 留给 Git
Checks        —— 命令、exit、test totals
Review execution —— reviewer、subagent/fallback mode、状态与 fallback reason
L2 / L3       —— verdict + exact applicable/unverified IDs + ambiguities + findings
Current truth —— feature-archive 是否需要 merge
Open questions / Drift —— 仅非空时保留
```

同一 receipt 必须在端点回复中直接展示,不能只写文件路径。PR 可原样复制;feature-archive 消费 Verdict/Current truth;P4 消费 Drift。

**关键设计**:`feature-done` 是端点**组合点**,proof bundle 是证据**落点** —— reviewer 各管各,组合在端点 action 发生,结果写回 proof bundle。不要把 L1/L2/L3 的规则源混成一个泛泛的"统一检查"。

**载体**:`tasks.md` 末尾 `## Proof Bundle`(兼容旧 artifact)。详细 schema 只由 [`feature-done` action](actions/feature-done.md) 定义。

Canonical verdict 由 [`feature-done` action](actions/feature-done.md) 定义:检查失败或仍有可修的 L2/L3/current-truth finding = `NEEDS WORK`;必要输入/环境缺失导致检查无法可靠运行 = `BLOCKED`;全部闭环 = `READY`。本文不复制判定表,避免与 action 漂移。

轻车道 feature 无 frozen `spec.md`,因此 L3 = N/A;但 proof bundle 必须包含 `## 验证` 全过。项目若已选择声明不变量路径,再反核实际 diff;命中时 verdict 至少 🟡 NEEDS WORK,并应升级为全道补 spec。未采用该可选清单的项目不需要空章节。

> 团队 / 外部协作场景:可自行加 `.github/PULL_REQUEST_TEMPLATE.md`,内容同 5 项 —— 见 [§1.9](#19-平台协作默认不铺模板)。project-workflow 默认不预置。

### 3.4 与平台流程的协作

| 节点 | 平台动作 |
|---|---|
| spec 起草 | 可选:开 GitHub Issue,标 label `feature`,描述放 outcomes 摘要 |
| 实施开始 | git branch `feat/<NNN>-<slug>` |
| 交付 | delivery receipt 写入 `tasks.md` 的 `## Proof Bundle`;PR 描述可原样复制 |
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
| 数据模型 / API 契约跟实际写时冲突 | ⚠️ 检查 | 模型错改 spec.md;代码错改代码;先写 revision record;只有形成持久架构/跨功能技术决策时才起 ADR |
| 发现需要拆 / 合 / 改 module(可能含 module-level AGENTS.md 调整)| ✅ 真错 | 走 [§2.6 Module 中途变更 SOP](#26-module-中途变更feature-实施中发现边界要调整) |
| Constraints 太死(实施才发现不必要)| ⚠️ 看 | 真不必要 → 改 spec.md §3 + revision record;满足 `ADR_REQUIRED` 时再用 ADR 记决定;只是难做 → 别动 spec |

Canonical [`spec-revise` action](actions/spec-revise.md) 定义修订 SOP:先停实施,始终写 spec revision record 并同步 plan/tasks;只有涉及架构/模块边界、持久跨功能技术决策或取代既有 ADR 时才创建 ADR。流程只保留两个批准点:先确认修订决定,再确认合并后的最终 diff。不得偷偷改冻结 spec、边改契约边改代码,或把全部修订拖到交付时一次性补写。只是措辞澄清且不改变契约时,写 plan prior decision 即可。

预防比修订便宜:全道实施前先跑 [`spec-driven.md §3.7`](spec-driven.md#37-specplan-写完后的质量自检7-问-checklist)。

---

## 4. P3:Continuous Maintenance(开发期间持续)

### 4.1 三层错位的检查机制

按规则源分类,各管各:

| 层 | 规则来源 | 检查什么 | 检查机制 | 时机 |
|---|---|---|---|---|
| **L1 机械层** | tool config(lint/type/test)+ 语言/团队通用卫生规则 | 代码机械合规吗?(lint/type/test/format) | hook(保存时单文件 lint+format,**自动改**)+ `feature-done` 端点全量 check(单独重跑 = 直接跑项目 check 命令) | 保存后 + 端点 |
| **L2 项目约定** | root/nested `AGENTS.md`;active adapter 可补 host-specific convention files | 代码长得像这个项目吗? | linter + agent review | hook + 端点 |
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

> **范围**:P4 **只动 A 类约定**(root/nested `AGENTS.md`,以及用户明确纳入本次修订的 host-specific convention files)。其他文档各有自己的演化通道:
>
> | 文档 | 是否在 P4 | 演化通道 |
> |---|---|---|
> | **A 类约定**(`AGENTS.md` + 本次选定的宿主私有规则) | ✅ 是 | 本节 —— 客观 drift 出现时主动 refresh(action:[`agents-md-revise`](actions/agents-md-revise.md)) |
> | **ADR**(C 类决策) | ❌ 不 | Accepted 后正文冻结;过时只能由新 ADR 取代并把旧状态改为 `Superseded by NNNN`,从不"refresh" |
> | **spec.md / plan.md / tasks.md**(B 类任务) | ❌ 不 | per-feature 冻结归档;中途发现错走 [§3.5 spec-revise](#35-开发中发现-specplan-错怎么办) |
> | **spec ↔ 代码 漂移** | ❌ 不(走端点拦截) | [§6.4 L3 reviewer](#64-按规则源分层验证three-layer-review-separation) 每个 feature 交付前检查,不等到 P4 |
>
> **底层逻辑**:[§0.1 命题 3 Drift](#01-这本手册解决什么) 的三个维度(时间 / 空间 / 演进)全是**规则**演化,规则只住在 A 类约定里 —— 所以 P4 自然只针对它。

### 5.0 三层 AGENTS.md 的更新频率梯度

P4 范围声明说"只动 AGENTS.md",但 AGENTS.md 有 3 层(项目/tier/模块),各自实际更新节奏跨 P2/P4 分工。**P4 主战场是项目级,tier/模块级更多在 P2 内顺手做**:

| 层级 | 更新频率 | 典型触发 | 跟 phase 关系 |
|---|---|---|---|
| **项目级** `AGENTS.md` | 最低 | P4 客观 drift audit / 重大架构选型变化 / 多 feature 反复出现某约束 | **P4 主战场**;不在单 feature 内 |
| **Tier 级** `<tier>/AGENTS.md` | 中(数周到月) | 某 tier 内多个模块共用模式提炼 / 加新 tier-wide 库 | 偶尔 P2 in-feature(发现新模式时 codify);P4 顺带 review |
| **模块级** `<module>/AGENTS.md` | 最高(单 feature 周期内常见) | [§2.6 模块边界调整](#26-module-中途变更feature-实施中发现边界要调整) / [§3.5 spec-revise](#35-开发中发现-specplan-错怎么办) / 新增 / 拆分模块时建立 | **几乎全 P2 in-feature**;delivery receipt 的 `Drift` 字段显式记录未沉淀约定;P4 一般不动 |

**反模式**:
- 把 P0 baseline 或首次 personalization 当"终身合同",任何后续变化都拖到 P4 —— 模块级反常约定常在第一次写到该模块的 feature 中固化下来,不在 P4 等
- 把 P4 当成"定期重写全部 3 层" —— P4 可以比对所有适用 A 类文件,但只 patch 有客观 drift 的项;tier/模块级约定更多在相关 P2 change 中及时演化

### 5.1 何时触发

- **客观状态已变**:命令、依赖、目录、版本、配置或 tier 边界与约定不一致
- **感知到 drift**:用户感觉"反复跟 AI 提醒同一件事 ≥ 2 次",或明确要求审计约定
- **~~信号触发 hook~~**:🚫 **project-workflow 不实施** —— hook 自动检测 "记得 X" 重复并主动 nudge 跟 [§0.5 信念 1](#05-实现策略的核心信念)("消除对齐劳动")**相悖**(系统主动提示本身就是新对齐对话源),且模式识别误报率高。用户感知 drift → 走"主动 refresh" 即可

### 5.2 两种触发模式

| 模式 | 触发 | 工具 |
|---|---|---|
| **A. 主动 refresh** | 用户感知到 drift / 发现客观不一致 / 大依赖升级后 | [`agents-md-revise`](actions/agents-md-revise.md) —— 扫客观 drift,逐条 apply / skip / stop,生成已批准 patch + commit 草稿 |
| **B. 端点反思**(顺手) | feature 完成时 | `feature-done` 只把可行动但未沉淀的约定写入 receipt 的可选 `Drift`;要持久修订时由用户调用 `agents-md-revise` |

> 历史上还有 "模式 C 信号触发 hook" —— **project-workflow 不实施**,理由见 §5.1 注。

### 5.3 工具流程概览

精确流程见 canonical [`agents-md-revise` action](actions/agents-md-revise.md):比较 A 类约定与客观仓库状态,只提出有证据的窄 patch,逐条由用户决定后应用,并保留 commit 给用户。Runtime skill 只负责在具体宿主中执行该契约。

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

<a id="60-每条原则的两侧组成读-6164-前必读"></a>
### 6.0 每条原则的两侧组成(读 §6.1-6.4 前必读)

> **术语提示**:本节用"**蓝图侧 / 纪律侧**"区分**谁来支撑**(工具 vs 人);§6.4 的 **L1/L2/L3** 是另一回事(review 分层 —— 通用规则 / 项目约定 / 功能规约)。不要混。

每条原则都由两侧共同支撑,**缺一不可**:

- **蓝图侧**(Blueprint —— 本项目提供):skill / template / hook 配置 / proof bundle workflow 等
- **纪律侧**(Discipline —— 用户协作行为):`/clear` / 真去写 spec / 端点 review 不偷懒等

**4 条原则的蓝图/纪律平衡很不一样**,真实预期对照表:

| 原则 | 蓝图侧提供 | 纪律侧实践 | 主要依赖 |
|---|---|---|---|
| **6.1** Spec-driven | `feature-init` artifact 模板 + `project-init` baseline + P4 refresh | 真去写、维护必要 artifact | 工具与用户共同完成 |
| **6.2** Context budget | AGENTS.md 预算纪律 + 可选检查 | 在长会话中主动收敛上下文、一会话聚焦一项任务 | 主要依赖使用纪律 |
| **6.3** Environment-enforced | 可选 hook source + verified-command gate + `project-personalize` 经确认 materialize | 选择是否启用并修复失效命令 | 启用后主要由工具执行 |
| **6.4** 三层验证错位 | delivery receipt workflow + adapter reviewer + reviewer context 注入 | 不跳过端点 review,处理 finding | 工具与用户共同闭环 |

**读后续 4 条原则时记住**:有些保障启用后适合工具持续执行,有些仍依赖使用者保持上下文和验收纪律;不使用伪精确比例描述两者关系。

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

通用跳过场景(tiny/local 低风险、探索性 spike、玩具)见 [§9 何时偏离](#9-何时偏离手册)。本原则特有的:

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
| 官方建议 | CLAUDE.md 目标保持在 200 行以内;更长仍会完整加载,但增加上下文占用并降低遵循度 |
| 官方建议 | `/clear` / `/compact` / `--add-dir` / `.claude/rules/` path-scoped 是 Anthropic 给的 context 管理工具;`@imports` 是官方支持的组织与引用机制,但 import 内容加载后仍占 context |

#### 怎么用

| 场景 | 动作 |
|---|---|
| 长 session 跨多任务 | `/clear` 频繁,**一会话一任务** |
| CLAUDE.md / AGENTS.md | 主体 < 200 行;共享长尾可用 `@imports` 组织,路径相关长尾优先放 path-scoped rules 做按需加载(Claude: `.claude/rules/`) |
| 多模块项目 | sub-agent 隔离上下文(每个 sub-agent 独立窗口) |
| 长文档参考 | progressive disclosure —— 用 `@` 按需拉,不全塞 |
| 长任务中段 | `/compact` 在逻辑节点(不是窗口爆掉时) |

> **数值是 model-sensitive tactic**:本节与 §1.3 的具体数字(行数目标 / `/clear`、`/compact` 时机 / sub-agent 拆分阈值)随模型代际、窗口大小与工具版本老化最快,以官方当前文档为校准来源;核心主张(context 是有限预算,装什么/何时清是工程决策)不随之变化。

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
| 官方建议 | CLAUDE.md 目标保持在 200 行以内;更长仍会完整加载,但增加上下文占用并降低遵循度 |
| 社区实践 | ECC 等大型能力包广泛使用 hooks,说明环境强制是常见落地路径;具体事件数随版本变化,不作为本方法论依据 |

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
| 官方结构 | Claude Code 可用 `~/.claude/rules/`(用户级)、项目 `.claude/rules/` 和 `CLAUDE.md`;project-workflow 的 portable convention source 收敛到 root/nested `AGENTS.md`,宿主私有 rules 只增强对应宿主 |
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

L2/L3 都遵守 cite-or-skip、fresh read、完整 applicable population 和 ambiguity feedback:没有规则引用或没有完整验证就不能给 clean pass。精确输入、输出与阻断条件只在 canonical [`agents-md-reviewer`](reviewers/agents-md-reviewer.md)和 [`spec-reviewer`](reviewers/spec-reviewer.md)定义,避免三处复制同一契约。

#### L2/L3 Finding 重叠时的去重规则

L2 / L3 reviewer 独立看各自规则源,不互相感知。同一行同根因时由 `feature-done` 装配层保留更强的 L3 finding;不同根因则都保留。去重只发生在 aggregator,不下沉到 reviewer;精确规则以 canonical [`feature-done` action](actions/feature-done.md)为准。

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
**症状**:把项目规则只写进单一工具私有格式(如 `.cursor/rules/` 只 Cursor 读)而不是 AGENTS.md
**修正**:协作约定写在**广泛可读**的位置(AGENTS.md / `docs/`,Claude Code、Codex 与其他兼容工具都能读),工具特定位置只放工具特异配置(如 `.claude/hooks/` / `.claude/settings.json`)。project-workflow 不强求"工具完全无关",但要避免锁死单一工具的私有格式 —— 见 [§0.5 信念 2](#05-实现策略的核心信念)。

### 7.7 不要在 P0 没做完就跳到 P2
**症状**:还没建 AGENTS.md / 必要规则就开始写 feature(hook 可按需缺省)
**后果**:基线缺失,每个 feature 都要重新讨论项目惯例
**修正**:严格按 P0 → P2 顺序;P0 没做完不开 feature(模块新增是 P2 内 sub-flow,见 §2)

### 7.8 不要把 backlog 塞进 repo 文件
**症状**:`docs/backlog.md` / `TODO.md` 跟踪未决事项
**后果**:重复维护(Issues + 文件),搜索 / 排序 / 通知都退化
**修正**:backlog 走 GitHub/GitLab Issues + labels;只有"详细设计 > 200 行"才单独成文件

### 7.9 不要让 review 门空转(太安静)
**症状**:门只输出模板套话,没有 exact scope、applicable population、unverified items、ambiguities 或引用证据
**注意**:零 findings 可以代表高质量,也可以代表漏检;finding 数不是 sensitivity 指标
**修正**:零 finding 只有 evidence-backed 才 PASS;known-bad mutation smoke 验 sensitivity。连续零只提示成本校准,是否降频由用户结合 mutation 结果和决策价值判断

### 7.10 不要让 review 门太吵(误报侵蚀信任)
**症状**:门反复对**既有 baseline / 非 patch 内容**开火(如 auditor retrofit 模式误判既有决策),或 dismissal-rate 高到人开始橡皮图章
**后果**:信任流失 → 人无视门 → 门名存实亡(比空转更危险,它还在烧成本)
**修正**:校准该门(收紧 scope / 修 retrofit 契约 / 调阈值);把"findings 被驳回率"当数据信号

---

## 8. 栈适配示范(以 Nuxt 4 + FastAPI 为例)

> **栈适配层** —— 本节是把 P0-P4 落到具体工具命令的映射。**换栈只需重写本节**,前面的方法论(§0-7、§9、§10)不变。
>
> **栈级陷阱**:[`docs/gotchas.md`](gotchas.md) —— 从真实搭建过程沉淀的踩坑示范 ledger(完整历史条目在 git history)。

### 8.1 Vue 3 / Nuxt 4 前端

| 层 | 工具 | 用法 |
|---|---|---|
| 实时(P3) | Volar / Vue LSP | 类型错即写即知 |
| Hook(P3) | `eslint --fix` on .vue/.ts/.tsx | `.claude/hooks/lint-on-edit.cjs` 中 case 分支 |
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

### 8.6 全栈项目的契约先行(Contract-First Tactic)

**仅适用全栈项目**(前端依赖后端 API 的项目)。这是 §6.1 spec-driven 在全栈场景的时间维度落地。

**主张**:全栈功能开发时,先确定跨 tier 契约,再按真实依赖和可验证阶段安排实现顺序;不固定要求后端代码先写。

**为什么**:依赖方看到不完整契约时容易自行补全并形成跨层漂移。先把 API/schema/event/fixture 的边界写清并可验证,各 tier 才能基于同一事实实施。

**怎么用**:
- plan.md 的 task breakdown 按依赖或可独立验证的 phase 排列,不默认某个 tier 先行
- API 已存在时,前端基于可访问的 schema/swagger 和真实或契约 fixture 实施
- API 尚未实现时,先冻结可测试的 contract/fixture;后端、前端可顺序执行,也可各自基于同一契约推进
- 纯前端、纯后端或不跨 tier 的改动不套用本战术

**与 AI 协作的特殊考量**:AI 在 prompt 里看到不完整的跨层定义时倾向自行"补全"。明确契约 + 可执行验证能消除这个猜测空间,而不必强制一种实现顺序。

---

## 9. 何时偏离手册

| 场景 | 建议偏离方式 |
|---|---|
| tiny/local、低风险且未改变已声明 current truth | 不建 feature artifact,直接做并跑相关检查;hook 仅在 active 时提供增量反馈 |
| 探索性 spike | worktree + vibe coding;只有留下持久架构/跨功能技术决定时才补 ADR |
| 紧急生产 hotfix | 直接修,事后补 spec 和测试,记 tech debt |
| 架构变更 | **不要偏离**:必须写 spec + ADR,worktree 隔离试 |
| 低风险文档编辑 | 不建 feature artifact,检查 diff 与本地 links;契约/流程语义变更仍按风险选 light/full |
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
| 宿主 plugin/skill 接口保持兼容 | 各宿主接口会演进;project-workflow 以各自 adapter 封装差异,并保留 manual fallback |

### 10.3 已知失败模式

| 失败模式 | 信号 | 应对 |
|---|---|---|
| **过度工程化** | P0 配了一堆 hook / rules / ADR 模板,实际 feature 还没开发 | 把 P0 砍到 30 分钟内能完成的最小集 |
| **spec 变 todo list** | spec.md §1-4 模糊,§5 task 详细 | 严格按 1→6 顺序,§5 在 §1-4 写完之后 |
| **CLAUDE.md 膨胀** | 项目 6 月后 CLAUDE.md > 300 行,AI 依从度肉眼下降 | P4 refresh,把可机械化的搬 hooks(§6.3) |
| **hook 不稳定** | hook 频繁失败但不影响开发(因为没读 stderr) | 失败用 `exit 2`,把信息回喂 AI |
| **三层 review 重叠** | reviewer 一个 review 把 L1/L2/L3 全跑了,prompt 1000+ tokens | 拆 reviewer 调用,各自只给对应 context |

### 10.4 演化承诺

本手册不是终版。明确的演化触发点:

- **半年内**(2026-11 之前):Phase 2 在真实项目跑通后,如发现失败模式 → 修订
- **AGENTS.md 渗透率变化** → §1.3-1.4 内容跟进
- **宿主 plugin/skill/hook 接口发生兼容性变化** → adapter 与安装文档同步
- **跨工具实测发现差异** → §6.3 失效情形扩充
- **新的方法论流派出现** → §6 重新审视

---

## 附:跟现有工具的关系

- **`~/.claude/rules/`**(Claude Code 官方支持):Claude 用户级规则载体;不属于项目 baseline,是否使用由用户自行决定
- **project-workflow v3**:本手册是它的核心文档;`template/` 存放 P0 starter assets 与 feature 模板,`adapters/` 承载 host-native actions,`scripts/` 负责 release checks 与 package build
- **`pr-review-toolkit`**:Claude adapter 可用的 P2.3 / P3 端点 reviewer;其他 adapter 应提供等价 reviewer
- **`context7` MCP**:P2 实施期间外部库文档拉取
- **GitHub Spec Kit `/speckit.clarify`**:P2 spec 不完整时的 Q&A 工具(可选)

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
- [`actions/agents-md-revise.md`](actions/agents-md-revise.md) — P4 主动 refresh action contract;宿主执行细节由各自 adapter 提供
