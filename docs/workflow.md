# AI 辅助开发工作流手册:四个运行阶段的通用蓝图

> 本手册是 [project-workflow v3](https://github.com/shrekshrek/project-workflow) 的核心文档。
>
> 描述任何**新项目从启动到持续维护**的四个运行阶段。阶段沿用历史编号 P0 / P2 / P3 / P4；P1 已降为 P2 内部 sub-flow。**方法论核心工具无关、栈无关**(具体栈映射见 §8;工具适配边界见 [`cross-tool-methodology.md`](cross-tool-methodology.md))。
>
> 风格:opinionated 但可 hack —— 任何一条都可以为具体场景偏离,只要清楚为什么。
>
> **统一流程原则**:个人开发与团队开发使用同一条 per-change 流程。每个人在自己的工作范围内按相同的按需记录、风险验证、归档后提交即可;project-workflow 不要求额外 team mode、协作层或并发协调协议。

---

## 0. 起点

### 0.1 这本手册解决什么

AI 协作开发有**三个 Tier 1 工程痛点**,本手册的四个运行阶段、4 支柱、所有具体机制都为这三件事服务。

#### 命题 1:Verification —— AI 生成快过人类验证

**问题**:AI 代码产出速度远超团队 validate 能力,没看过的代码进仓库,bug / hallucination / 偏离 spec 都被漏过。**这个不对称随模型代际增强而加剧,不会被更强的模型消解**——单位人工验证时间对应的未审查产出只会更多,而"要做什么"的意图仍然只在用户脑中,无法由模型自证。

**社群证据**:Boris Cherny(Anthropic / Claude Code lead):*"The most important thing is to give Claude a way to verify."*(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:
- **输入侧**:[§6.1 共识与验证](#61-共识与验证先于正式实现) —— 用 spec.md 保存已确认的行为与验收依据
- **输出侧**:[§6.4 三层 review](#64-按规则源分层验证three-layer-review-separation)(L1 机械 / L2 项目约定 / L3 spec 合规)+ [§3.3 delivery receipt](#33-交付阶段delivery-receipt)

#### 命题 2:Context-as-RAM —— 上下文是有限预算,不是无底磁盘

**问题**:AI 的 context window 行为像 RAM 不像 storage —— 装得越多 attention 越散,长会话依从度下降,token 成本爆炸。

**社群证据**:[Mem0 — Context Window Behaves Like RAM, Not Storage](https://mem0.ai/blog/state-of-ai-agent-memory-2026)(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:[§6.2 Context budget](#62-上下文是有限预算context-budget) —— AGENTS.md 行数纪律 + path-scoped rules 按需加载(Claude: `.claude/rules/`) + `@imports` 组织长尾 + 宿主支持的上下文重置/压缩 + 小 composable skills

#### 命题 3:Drift —— 规范在时间/空间/演进三向漂移

**问题**:AI 没有跨会话长期记忆,规范会朝三个方向漂——**时间**(同代码不同 session 评判不同)、**空间**(模块 A 跟模块 B 风格不一致)、**演进**(项目第 1 月跟第 6 月代码风格差)。即使单人串行开发,不同 session 也不共享记忆;`AGENTS.md` 因而承担跨 session 的项目约定入口。

**社群证据**:[Martin Fowler — Encoding Team Standards](https://martinfowler.com/articles/reduce-friction-ai/encoding-team-standards.html)(更多见 [§参考与延伸](#参考与延伸))

**v3 主力支撑**:[§6.3 Env-enforced rules](#63-规则由环境强制environment-enforced-rules)(阶段检查 / endpoint checks)+ [§1 P0 AGENTS.md](#1-p0project-setup项目第一天) 单一 source of truth + [§5 P4 Drift Refresh](#5-p4drift-refresh主动修正)

#### 跨层不一致(全栈 tactic,不是独立命题)

全栈项目的前/后/DB 跨 tier 契约漂移**是真实问题但社群证据较弱**(被视为通用架构问题,不是 AI 特有)。project-workflow 不把它升级为独立命题,而是作为全栈项目的具体战术处理 —— 见 [§8.1 Contract-first](#81-全栈项目的契约先行contract-first-tactic)。

---

**本手册不是什么**(boundary,避免误解):

- **不是 process-owning 框架**:不强制按某固定顺序敲某些命令(反例见 [§7.2](#72-不要叠加两个-process-owning-框架))
- **不承诺"AI 一次写对"**:目标是消除"对齐劳动"([§0.5](#05-实现策略的核心信念)),不消除迭代
- **不是某个工具的使用手册**:Claude Code / Codex / 手工流程都是 runtime adapter;本手册定义的是 adapter 之上的工程方法。

### 0.2 四个运行阶段全景

> **关于编号**:下图没有 P1 是**有意**——早期版本把"P1 Module Setup"列为独立阶段,实践证明**模块几乎不独立发生,几乎总是 P2 feature 的子产物**,所以降级为 P2 sub-flow。空着 P1 保留这段设计 narrative;详细机制见 [§2 Module Setup](#2-module-setupp2-内的-sub-flow非独立-phase)。

```
┌─────────────────────────────────────────────────────────────┐
│ P0: Project Setup(项目第一天)                                   │
│ ─ 无冲突且无需个性化时建中立 baseline;有项目证据才 personalize │
│ ─ 工具:project-init action(Claude / Codex / manual adapters) │
├─────────────────────────────────────────────────────────────┤
│ P2: Tracked Feature Development                             │
│ ─ 先沟通/按需试验 → 确认 → 一份 spec → 实施 │
│ ─ 跨 tier 契约先确定 → 按依赖实施 → receipt → archive 收尾   │
│ ─ 存量 spec 冲突/旧 spec 污染 → /spec-reconcile retrofit    │
│                                                             │
│   ↳ Module Setup sub-flow(P2 内嵌触发,非独立 phase)        │
│      ─ 发现模块需要 → 在功能记录中明确边界与接入步骤  │
│      ─ 仅"反常"时加 <module>/AGENTS.md(见 §2.3)             │
├─────────────────────────────────────────────────────────────┤
│ P3: Continuous Maintenance(开发期间常驻)                    │
│ ─ 阶段 focused 验证;端点 L1 + 按风险适用的独立 L2/L3          │
│ ─ 两种审查均适用时:高风险并行,否则先 L3 后 L2            │
│ ─ backlog / discussions 走平台原生(Issues / Discussions)   │
├─────────────────────────────────────────────────────────────┤
│ P4: Drift Refresh(信号触发)                               │
│ ─ /agents-md-revise 用户在发现客观 drift 时主动调用      │
│ ─ Q&A → 建议 diff → 当前请求内应用；新政策才确认              │
└─────────────────────────────────────────────────────────────┘
```

每阶段的详细 **触发** / **产出** / **谁做** / **校验** 见各 phase 章节([§1](#1-p0project-setup项目第一天) / [§3](#3-p2feature-development每个功能) / [§4](#4-p3continuous-maintenance开发期间持续) / [§5](#5-p4drift-refresh主动修正))。

#### 阶段 × 命题 × 支柱 映射

每个阶段不是平均服务所有命题,而是各有侧重。这张表让你一眼看出"做这个阶段是为了谁":

| 阶段 | 主要服务的 Tier 1 命题 | 关键支柱 |
|---|---|---|
| **P0** Project Setup | Drift(锚定基线)+ Verification(契约模板) | §6.1 共识与验证 / §6.3 env-enforced |
| **P2** Feature Dev | Verification(每个功能交付前验证) | §6.1 共识与验证 / §6.4 three-layer review |
| Module Setup(P2 sub-flow) | Drift(模块边界、空间一致) | §6.1 共识与验证 |
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
| **功能级** | `docs/specs/changes/<NNN>-<slug>/` ;archive 在 `docs/specs/changes/archive/` | `/feature-init` |
| **产品域级**(扁平) | `docs/specs/index.md` + 按需 `docs/specs/<area>.md` | P0 `project-init` 建索引;正文 `/feature-archive` merge |
| **宿主私有路径规则**(可选) | 例如 Claude `.claude/rules/*.md`;不是 portable core | plugin 保留示例和机制说明;仅在具体宿主、具体项目需要时启用,其他 adapter 无需读取或翻译 |
| **跨功能决策**(扁平,不嵌套) | `docs/adr/NNNN-<title>.md` | 重大架构选择 / spec-revise 满足 `ADR_REQUIRED`([§3.5](#35-开发中发现已确认内容有误怎么办))/ 模块边界变更([§2.6](#26-module-中途变更feature-实施中发现边界要调整)) 时 |
| **工具基础设施**(扁平,不嵌套) | `.gitignore` 与项目自有检查配置 | P0 仅提供中立 baseline |

#### 文档职责 5 类(总框架)

> 上一张表是**空间正交轴**(文件住在哪);本表是**职责正交轴**(文件回答什么问题)。

| 类别 | 文件 | 回答什么问题 | 时间维度 | 何时存在 |
|---|---|---|---|---|
| **A. 约定**(Conventions) | portable core 是 `AGENTS.md`(项目 / tier / 模块嵌套)+ adapter alias;宿主私有 scoped rules 可选 | "我们**现在**怎么工作?"(规则 / 风格 / 最佳实践) | 当前态;AGENTS.md 频率梯度见 [§1.3](#13-agentsmd-的内容标准),Claude 可选规则见 [§1.6](#16-路径级规则claude-rules官方支持) | 项目级必然;tier / 模块级与宿主私有资产可选 |
| **B. 变更**(Changes) | `docs/specs/changes/<NNN>-<slug>/spec.md` ;交付后移入 `docs/specs/changes/archive/` | "这次 tracked change **做什么 + 怎么做 + 步骤**?" | per-change 生命周期,完成后**物理归档** | `/feature-init` 或当前事实变更需追踪 |
| **C. 决策**(ADR) | `docs/adr/NNNN-<title>.md` | "**当时为什么**这么选?+ trade-off?" | Accepted 后正文冻结;取代时只改状态并新建 ADR | 重大架构选择 / spec-revise 满足 `ADR_REQUIRED` / 模块边界变更时(§3.5 / §2.6)|
| **D. 工具基础设施**(Infra) | `.gitignore` + 项目检查配置 | "工具**运行什么检查**?" | 普通 repo 代码生命周期 | 按项目实际需要维护 |
| **E. 产品事实**(Domain docs) | `docs/specs/index.md` + 按需 `docs/specs/<area>.md`;变更在 `docs/specs/changes/` | "这个产品/系统域**现在**怎么工作?" | 当前态;`feature-archive` merge 更新 | P0 建索引;area doc 在有当前事实可沉淀时创建 |

**两轴交叉规则**:
- 代码组织维度只影响 **A. 约定** 中 AGENTS.md 的嵌套层数(根 / tier / 模块);宿主私有规则只增强对应宿主,不要求跨 adapter 映射
- B / C / D / E 四类与代码组织维度独立,**不按 tier / 模块嵌套**

**A vs E 分界**(都是"当前态",别混):A 回答**工程上怎么干活**(命令 / 风格 / 边界),E 回答**产品现在长什么样**(IA / 行为 / 契约现状)。工程约定永远进 A,产品域现状进 E;E 不存在时,B 类历史 spec 只是审计材料,不是实施基线(见 [spec-driven.md §5](spec-driven.md))。

**A–E 生命周期归口**:

| 类别 | 创建 | 正常演化 | 关闭 / 修复 |
|---|---|---|---|
| **A 约定** | 可无冲突建立中立 baseline 的 `project-init` / 有项目证据或 partial/custom baseline 的 `project-personalize` | feature 内发现的新约定随该 change 更新;客观 drift 才用 `agents-md-revise` | 不归档,始终维护当前态;L2/Drift 提供反馈 |
| **B 变更** | `feature-init` 判断是否需要记录；默认只建 spec | draft 自由填;冻结契约真错才 `spec-revise`;`feature-done` 判兑现 | `feature-archive` 物理归档;历史混乱才 `spec-reconcile` |
| **C 决策** | 规划或 `spec-revise` 中仅 `ADR_REQUIRED=yes` 时创建 | Accepted 后正文不改;新决定用新 ADR,旧 ADR 只改为 `Superseded by NNNN` | `feature-archive` 做一致性检查;`spec-reconcile` 经用户确认修冲突,不做按年龄清扫 |
| **D 基础设施** | baseline 提供 `.gitignore`；检查配置由项目维护 | 按普通项目变更处理并验证真实执行 | 随项目需要维护 |
| **E 产品事实** | P0 只建索引;首个持久事实由 `feature-archive` 创建 area doc | `feature-done` 标 pending,`feature-archive` 替换式合并当前事实 | 历史冲突才 `spec-reconcile`;核对日期是读者信号,不由 A 类 drift action 代管 |

> **`docs/gotchas.md` 归口**(A 类附属证据 ledger):职责上属 A——回答"工程上怎么干活",L2 review 把它并入 A 类约定全集消费;但它不是 A 的 core 载体,记录的是**已复现事故的证据**(反例 → 正例 → 为什么)而非强制规范,P4 drift refresh 不管它。生命周期:P0 生成空 ledger(文件头自带写入门槛与出口纪律),只有真实复现并验证过的故障才追加;出口两条——**升格即删条**(正例提炼进 AGENTS.md / path rules 后删除原条)与**前提失效即删条**(依赖的栈/基建移除后删除),git history 即归档。只进不出的 ledger 必然腐化成下一个污染源。

**新读者心智地图**(读完本节就能定位任何文档):

```
"想看项目规则 / 架构约定"     → A(项目 AGENTS.md)
"想看本 tier 特殊约定"        → A(<tier>/AGENTS.md)
"想看代码风格 / 测试 / 安全"  → A(path-scoped rules;Claude: .claude/rules/<topic>.md)
"想看 feature 设计"          → B(docs/specs/changes/<NNN>-<slug>/;已交付的在 docs/specs/changes/archive/,只当历史读)
"想看为什么选 X"             → C(docs/adr/NNNN-<X>.md)
"想看检查 / 工具配置"        → D(项目 lint / test / CI 配置)
"想看某产品域现在的样子"      → E(docs/specs/<area>.md;没有 E 时可临时读最新 active spec;archive 只作历史证据,不当当前基线)
```

#### Methodology core vs runtime adapter

project-workflow 分两层:

| 层 | 负责什么 | 是否绑定工具 | 例 |
|---|---|---|---|
| **Methodology core** | 流程、不变量、workflow action、reviewer 方法、文档契约、review 分层 | 否 | `AGENTS.md`, `docs/actions/`, `docs/reviewers/`, `docs/specs/`, `docs/specs/changes/`, ADR, proof bundle, L1/L2/L3 |
| **Runtime adapter** | 把 core 自动化到某个工具 | 是 | Claude Code plugin skills, Codex skills/plugins, shell scripts |

Core docs 只定义"应该发生什么";adapter docs 定义"在某个工具里怎么触发"。其中 `docs/actions/` 是每个 workflow action 的唯一权威层,定义触发、输入、输出、不变量和验证;`docs/reviewers/` 是 reviewer / auditor / researcher 的唯一权威层。本文用 `/feature-init` 等短写表示 action 名,不是绑定某个宿主的精确命令;Claude Code 使用 `/project-workflow:*`,Codex 使用同名 `$skill`,手工模式直接按 action spec 执行。完整映射见 [`cross-tool-methodology.md`](cross-tool-methodology.md)。

### 0.4 项目核心目标

> **项目可控、规范自维持** —— 多模块/多功能按各自 change 独立推进,每个增量跟项目整体保持一致,**不依赖反复人工提醒**。

三个子目标(后续四个运行阶段都是为这三件事服务):

| 子目标 | 含义 | 主要支撑机制 |
|---|---|---|
| **解耦开发** | 模块/功能可独立推进,边界清晰 | 功能 spec + 模块化 + 契约先于实现(§8.1) |
| **规范一致** | 跨模块/跨功能的代码风格/架构/约定不漂移 | AGENTS.md + 阶段检查 / endpoint checks(§6.3) |
| **方向稳定** | 每个增量不会跑偏,AI 输出始终在 spec 边界内 | 三层 review(§6.4)+ proof bundle 端点验证(§3.3) |

**关于"自维持"的真实含义**:这不是"100% 自动化",而是 **蓝图侧提供的工具/约定 + 纪律侧的用户实践协同**。详细分工见 [§6.0](#60-每条原则的两侧组成读-6164-前必读)。

### 0.5 实现策略的核心信念

要达成 §0.4 的目标,必须接受两个事实(不是手段,是前提):

1. **目标是消除"对齐劳动",不是消除迭代**。

   真正该消除的:开发期间人反复提醒 AI **"注意命名"、"注意结构"、"注意规范"** 这一类**对齐对话** —— 这是真正的内耗,不是 AI 错,是规范没在系统层固化。
   
   不该追求的:让 AI"一次写对"或"零迭代"。合理迭代本身不是问题。
   
   **解法**:规范靠环境 + 文档自维持(lint / types / tests / AGENTS.md / spec.md),让对齐对话发生在**系统跟 AI 之间**,不再发生在**人跟 AI 之间**(见 §6.3)。

2. **方法论 core 必须 portable;adapter 可以 opinionated**。

   `AGENTS.md` / `docs/actions/` / `spec.md` / ADR / proof bundle 这层用最广可读的格式(markdown + 标准约定),让 Claude Code、Codex 和手工流程都能执行同一方法论。仓库分别维护 Claude Code 与 Codex 的 host-native adapter;两端只实现各自运行时细节,不能复制一套不同的方法论。

   **底层逻辑**:底层工具是 weeks-级别迁移成本,上层规范(AGENTS.md / spec.md)是 months-级别投入。上层规范必须 portable;工具特有能力(plugin manifests / sub-agent 配置)放进 adapter,不要反向污染 core。详见 §7.6 反模式 + [`cross-tool-methodology.md`](cross-tool-methodology.md)。

3. **Plugin / skill 工具的角色:scaffold + 条件性框架问 + 提醒 + 兜底,不当 interviewer 替 user 决策业务细节**。

   Plugin 应该做的:
   - **Scaffold** ── 空项目只起中立六文件 baseline;feature 按需创建一份 spec;现有代码用 personalize 补真实约定
   - **条件性框架 Q&A** ── 只问 user **当下能答 + audit 无法替代 + 延后成本极高** 的 branch 决策(如 slug / module 边界 / tier 归属);这些 once-and-done,不属"反复提醒"
   - **Reminders** ── 把 mission-critical checkpoint(如 Scope "不做" / Sibling Alignment)前置作提醒,让 user 在 conversational fill 时主动注意,不预问
   - **按需研究** ── 被动触发(user 提到选型不确定 → 按需研究;外部库行为不确定 → 查当前权威文档),不预设题
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
| **完全模糊**("想做个 X,具体形态没想清")| 主会话跟 AI 自由 brainstorm(核心用户 / 最痛问题 / MVP 边界 / 2-3 个 reference 项目)→ 1-2 小时通常够 → 完成后按目录状态选择项目接入 action |
| **已有 idea + baseline-compatible 目录** | 跳过 brainstorm,直接 `/project-init` 建中立 baseline;不替用户选栈 |
| **Retrofit 既有项目** | 跳过 —— 跑 [`project-personalize`](actions/project-personalize.md)(已有 codebase 已经是 brainstorm 产物)|

**project-workflow 不工具化这个阶段**——brainstorm 本质发散,SOP / mandatory skill(Superpowers 风格)反而磕碰。**主会话自由对话最合适**;产物不必落盘。项目接入按现有内容是否需要影响 working agreement 二选一:六个 baseline 目标都不存在,且目录为空或只有无关资料时用 `project-init`;已有项目证据或 partial/custom baseline 时用 `project-personalize`。完全匹配的中立 baseline 加无关资料表示已经初始化但尚无可个性化的项目证据。资料性质确实不清时只问一次,不按“目录非空”机械升级。若代码 scaffold 工具要求目标目录为空,先运行该工具,再对生成后的项目运行 `project-personalize`。若要保存产品讨论,走 GitHub Discussions / Issues(per [§4.4](#44-backlog-与讨论走平台不进-repo-文件) "AI 读 → 文件,人类协作 → 平台")。

**外部工具**(可选):Anthropic 内置 / ECC / Superpowers 各有 brainstorming skill,选你顺手的或直接用 AI 主会话 —— project-workflow 不强制。

### 1.1 触发与目标

**触发**:
- 新项目第一天
- 老项目首次引入 AI 协作

**目标**:按证据与 baseline 冲突状态完成正确的 P0 交接。`project-init` 在六个目标都不存在且无需个性化时生成中立、无栈猜测的 baseline,保留已有无关资料;`project-personalize` 为已有项目证据或 partial/custom baseline 的目标建立或调整约定。前者表示 workflow baseline ready,应用结构可仍待定,并把用户路由到“首个 feature 内的最小架构”或“确有跨 feature 消费者时的独立 architecture-shaped change”;后者表示 working agreement 与当前可观察结构对齐,可提供架构设计证据但不负责设计或判定优劣。

### 1.2 产出物(中立 baseline + 保留的可选能力)

P0 产出物分**两层**(职责严格不重叠):

**`project-init` 默认写入 baseline-compatible 目标的六个文件**:

```
项目根/
├── AGENTS.md                       # 项目级约定入口,跨工具事实标准
├── CLAUDE.md                       # Claude adapter alias:1 行 @AGENTS.md(或 symlink)
├── docs/
│   ├── specs/index.md              # current-truth 索引
│   ├── adr/README.md               # ADR 使用说明;模板留在 plugin
│   └── gotchas.md                  # project-local 已验证工程陷阱 ledger(初始为空)
│   # docs/specs/changes/<NNN>-<slug>/ 由 /feature-init 按需创建;
│   # 默认 spec 模板由 /feature-init 提供,项目本地默认不持有
└── .gitignore                      # 预防性含 CLAUDE.local.md、.env*
```

**`project-personalize` 在存在项目证据或 partial/custom baseline 的目标中按证据处理的工程化层**(栈相关,由项目自身形成):

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

**规则**:六文件 baseline 是方法论入口;B 层是工程化,换栈重写。**永远不在 baseline 猜栈特定应用代码或命令**。plugin/source library 继续保留 nested AGENTS、Claude rules、tier 示例、spec/ADR 模板、researcher/auditor 等完整能力;默认不复制不等于删除。

> **跨工具口径**:`docs/specs/`、`docs/specs/changes/`、`docs/adr/`、`AGENTS.md` 是目标项目的 portable core 文件。`.claude/rules/` 等目录是宿主私有、项目自有的可选资产;其他工具不必读取、复制或翻译。

**关于 `CLAUDE.local.md`**:**不在 P0 自动创建**。它是 gitignored 的个人项目私有覆盖(沙箱 URL / 临时 WIP / 个人测试账号等),**需要时再手动 `touch`**。`.gitignore` 提前列好,这样用户哪天创建它不需要再改 .gitignore。
官方推荐用法详见 [Anthropic — CLAUDE.md docs](https://code.claude.com/docs/en/memory#choose-where-to-put-claude-md-files)。

<a id="13-a-类约定的内容标准agentsmd--claude-rules"></a>
<a id="13-a-类约定的内容标准agentsmd--clauderules"></a>

<a id="13-agentsmd-的内容标准"></a>
### 1.3 A 类约定的内容标准(AGENTS.md + 可选宿主私有规则)

A 类约定的 portable core 载体是 **AGENTS.md**(根 / tier / module 嵌套)。某些宿主还支持私有 scoped rules;例如 Claude Code 可用 **`.claude/rules/<topic>.md`** 做路径或 topic 触发。这是保留的可选能力,不是 P0 默认产物,也不是其他 adapter 必须映射的第二套 core。

#### AGENTS.md 内容标准

**没有固定模板**。核心是让每条内容都值得在相关 session 中进入上下文:

| 标准 | 数值/做法 |
|---|---|
| 上下文预算 | 保持短而有用；出现重复、可推断内容或长教程时按职责拆分/链接，不设机械行数门槛 |
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
> 检查:`CLAUDE.md` 应保持为指向 `AGENTS.md` 的 alias，而不是第二份独立说明。

#### Path-scoped rules 内容标准(Claude materialization: `.claude/rules/<topic>.md`)

跟 AGENTS.md 不同的约束(因为不全局加载):

| 标准 | 数值/做法 |
|---|---|
| 内容预算 | 保留该 scope 命中时真正需要的差量；主题或适用路径分叉时再拆 |
| 结构 | markdown headers + bullets;顶部一行注释指向 ADR / 社区 source(可追溯) |
| frontmatter | `paths:` YAML 列表;每个 pattern 一个 quoted list item(见 §1.6);无 `paths:` 表示全局规则 |

**典型 topic 拆分**(Claude-local 可选能力,按需由 `project-personalize` 创建):
- `code-style.md` —— 命名 / 缩进 / 行宽 / 注释纪律 / 函数大小
- `testing.md` —— 已采用的测试层级 / 文件组织 / 风险驱动验证 / 适用命令
- `security.md` —— 🚫 Never / ⚠️ Ask first / ✅ Always

**何时加新 topic file**:
- framework-specific 约定多了(如 FastAPI、Vue 项目级风格) → `fastapi.md` / `vue.md` 加 `paths:` 限定该 tier
- 跨多文件类型的 cross-cutting 约束(如 i18n、accessibility) → 独立 topic

#### AGENTS.md vs path-scoped rules:写哪边?

| 维度 | AGENTS.md | path-scoped rules(Claude: `.claude/rules/<topic>.md`) |
|---|---|---|
| **加载** | session 启动全文载 | 文件命中 `paths:` 时按需载;无 `paths:` 的 rule 全局载入 |
| **适合内容** | 项目级 always-on 心智(commands / boundaries / 项目结构 / 跨 tier 通用约定) | 路径级 / topic-级长尾(code-style / testing / security / framework-specific 约定) |
| **内容预算** | 最严，只留全局常驻事实 | 可容纳路径级差量，但仍避免教程和重复 |
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
- framework-specific 详规则全塞 AGENTS.md → 所有 session 都加载无关长尾，消耗 context budget
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

Claude Code 可用 `@path/to/file` 从 AGENTS.md / CLAUDE.md 组织共享长尾。Import 改善文件维护，
但内容加载后仍占上下文；真正的按需节省来自 scoped rules、skills 和宿主支持的上下文管理。
其他宿主无需实现相同语法。何时使用 import 或 scoped rule，见 [§1.3](#13-a-类约定的内容标准agentsmd--claude-rules)。

<a id="16-路径级规则claude-rules官方支持"></a>
### 1.6 路径级规则:Claude materialization `.claude/rules/`(官方支持)

核心语义是“规则只作用于特定路径或 topic”。Claude adapter 可用 `.claude/rules/<topic>.md` 和
`paths:` YAML 列表承载；无 `paths:` 的规则全局加载：

```markdown
---
paths:
  - "<tier>/**/*.py"
  - "<other-tier>/**/*.ts"
---

# API rules
```

每个 pattern 使用独立 quoted list item；路径相对项目根。Claude 当前只在读取匹配文件时保证加载
scoped rule，新建文件场景需以当前官方行为实测。`project-init` 不生成这些宿主私有文件；
`project-personalize` 仅在用户选择且项目证据支持时创建或修复。其他 adapter 不读取或翻译它们。
具体语法以 [Claude Code 官方文档](https://code.claude.com/docs/en/memory#path-specific-rules)为准。

### 1.7 项目检查与故障记录

从项目证据识别真实检查命令，由实施阶段和 `feature-done` 按变更范围运行。项目已有的工具配置保持原样。

项目本地 gotchas ledger 初始为空，只记录真实复现并验证过的故障；plugin 自身的
[`docs/gotchas.md`](gotchas.md) 仅作 example-of-one，不复制到无关项目。

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

- 单人项目 / 小团队不需要模板约束,delivery receipt 走 [默认 spec 末尾的 `## Proof Bundle` 节](#33-交付阶段delivery-receipt)即可
- 平台协作的**原则**(人类协作走平台、不进 repo 文件)由 [§4.4](#44-backlog-与讨论走平台不进-repo-文件) 承接,不需要模板
- 模板是**团队场景才付得起的复杂度**——出现外部 contributor / 多人协作时再加,P0 不预付

**何时加**:仓库开始接受外部 issue / PR、或团队成员 ≥ 2 人 且观察到 PR 描述质量不一致。届时手动 `mkdir .github/PULL_REQUEST_TEMPLATE.md`,引用或复制 [§3.3 delivery receipt](#33-交付阶段delivery-receipt) 的当前字段即可。GitLab 等价:`.gitlab/merge_request_templates/`。

### 1.10 初始化与个性化的提问边界

> **形态说明**:Project Setup 是 skill / adapter action,不是独立 CLI。`project-init` 适用于六个目标路径都不存在且现有内容无需个性化的目录,只预览并加入六文件 baseline,不做栈问卷或解释无关资料;完全匹配的 baseline 加无关资料时报告已初始化。已有项目证据或 partial/custom baseline 时交给 `project-personalize`。两者不是前后必经步骤。

#### 实际问什么(对齐 `project-init` / `project-personalize` action)

`project-init` 不问栈问题。`project-personalize` 先读 manifests、lockfiles、目录和现有配置,再把适用内容分为
“已观察 / 建议调整 / 待确认”；待确认项只询问会实质改变 working agreement 的问题,依赖问题按顺序推进，相关独立问题可合并；回答后即时更新
待应用方案,不复述已确认内容。tech-researcher、codebase-explorer、decision-completeness-auditor 仍按复杂度
条件调用,而不是每次初始化固定运行。

#### 不问什么(故意省的题,每项都有原则)

| 项 | 怎么处理 | 为什么不问 |
|---|---|---|
| 项目名 | 不收集 | A 层不存项目名(那是 B 层 `package.json` / `pyproject.toml` 的事,见 §1.2) |
| 起服务 / 测试 / lint 命令 | `project-init` 留 deferred;`project-personalize` 从 manifest/配置验证 | baseline-compatible 目标没有这类证据,不能推断 |
| 部署命令 | `project-init` 不写;`project-personalize` 仅记录仓库已声明且可验证的命令 | B 层未起时拍脑袋写 = aspirational(违 §0.5 信念 1) |
| 目录组织模式 | `project-init` 不写;`project-personalize` 描述仓库现状 | baseline-compatible 目标没有这类证据,不预设 feature/domain 或 type layout |
| 代码风格 | `project-init` 不写;`project-personalize` 只记录已有 formatter/linter/config 与稳定代码模式 | 通用 default 不是项目事实 |
| 测试门槛 | 不设通用数字 default | 由项目现有 CI/配置或用户明确决定 |
| Boundaries 三档 | baseline 只放通用安全边界;项目特有边界由 `project-personalize` 从证据补 | 不为未知项目虚构 API/迁移/权限政策 |
| 分支命名 | baseline 不写;沿用仓库已有约定 | feature 编号不要求固定 branch pattern |
| Git 平台 | baseline 不写平台政策;平台协作由项目自己决定 | workflow 不把 GitHub/GitLab 设为运行前提 |
| 特殊约束(性能 / 合规 / 安全) | 不问 | P0 无基线数据,拍脑袋写 = aspirational;真需要的项目 P0 后写 ADR + 加节(见 §1.8) |

> 这些**省掉的**都对应一个反 aspirational 信念:**让 AI 凭训练即兴生成"看起来对"的内容,比保留中立 deferred 或不写更糟**(详 §0.5 信念 1)。没有仓库证据或用户决定时,**不让 LLM 编**。

#### 关键纪律

- 只把仓库无法证明、不能安全 deferred、且会改变命令/路径/规则/归属的事项放入“待确认”
- 问题集保持最小，二选一/填空优先;技术选型需外部证据时才运行 [`tech-researcher`](reviewers/tech-researcher.md)
- 所有目标文件先在 staging/内存形成一个变更摘要并预检；当前请求已授权的范围直接应用，新增政策或外部写入再确认

### 1.11 校验

- `/memory`(Claude Code)或对应工具命令:确认 AGENTS.md / CLAUDE.md 加载
- `project-init` 验证六文件、alias、无 placeholder、命令/路径可保持 deferred;`project-personalize` 验证仓库声明的真实命令与约定。前者完成 baseline,后者完成 evidence alignment;两者都可把下一步交给直接开发或 `feature-init`
- 把 AGENTS.md 给 AI 读一遍,问它"基于本文件总结这个项目",看理解是否准确

### 1.12 生成证据纪律(Evidence Discipline)

P0 写入前，每个项目特定的命令、路径、名称、端口、归属或规则都必须来自仓库证据、当前用户决定
或适用的已接受 spec/ADR。生态惯例只能作为待选择建议，不能伪装成项目事实；内部来源追踪不写成
`Q&A 轮 N` 等标记污染最终文件。

处理顺序保持简单：

1. 仓库已经证明的直接采用并保留来源；同一事实跨文件出现时检查一致性。
2. 未被证明但可安全暂缓的省略或明确 deferred，不为占位而虚构 ADR、命令或目录。
3. 只有答案会改变 working agreement 且不能安全暂缓时才询问；依赖问题顺序推进，相关独立问题可合并。
4. 简单单源同步用 inline trace；新 ownership/port/package/path/infra、弱证据、冲突证据或跨文件高影响同步才调用 `decision-completeness-auditor`。
5. 阻塞审计或未解决的实质决定保持目标不变；没有阻塞时预检 staged changes，并在当前请求已授权范围内应用，不再增加形式化审批。

`project-init` 因缺少项目证据而保持中立；`project-personalize` 先读仓库再补最小 working agreement。
产品或架构方向不在 P0 猜测，交给 `feature-init`。本节是生成时的来源约束，不是 P3 的第 4 层 review，
也不要求用户看到内部 trace matrix。

---

## 2. Module Setup(P2 内的 sub-flow,非独立 phase)

### 2.1 何时启动 sub-flow

当 feature 需要新的长期责任边界，或现有边界已无法清楚承载该责任时，在 P2 规划中展开 module
sub-flow。仅新增文件、调整模块内部结构或普通移动/重命名不单独展开。

### 2.2 产出物(写入现有功能记录,按需展开)

不创建额外 module 文档：在现有功能记录中明确可见范围、责任、契约、与现有模块的关系及必要的
建立与接入步骤。已有设计/任务附件有用时继续引用。只有 §2.3 的持久父级例外成立时才创建模块级 guidance。

### 2.3 "反常"判定:何时该写模块 AGENTS.md

模块级 AGENTS.md 只承载持久、明确限定在该 subtree、与父级真实不同且反复推断有成本或风险的
差量。共享差量放到最近的共同父级；产品语义、临时 feature 细节和 ADR 理由不放入 guidance；可机械
判定的规则优先交给 lint/test。采用 Claude 兼容层时，同目录 CLAUDE.md 仍只是一行 alias。
精确放置规则见 [`agents-md-revise`](actions/agents-md-revise.md#guidance-placement-contract)。

### 2.4 谁做 & 校验

由 feature 的已确认方案驱动，不是独立 action。校验责任边界、父子 guidance 无重复，以及任何 alias
仍指向同一 canonical AGENTS.md。

### 2.5 模块组织建议:领域优先,不要技术分层

有清晰领域责任时优先按领域组织，使术语、代码和 feature 边界对齐；简单 CRUD、CLI、玩具或尚未形成
稳定领域边界的项目保持平实结构。project-workflow 不强制 DDD、Clean Architecture 或固定目录形态，
只要求选择能被当前团队维护并支持所选 outcome。

### 2.6 Module 中途变更(feature 实施中发现边界要调整)

实施中发现模块应拆分、合并、迁移责任或新增持久边界时，先按 `feature-init` 的 Scope Stop 判断是否
仍在接受范围内。改变已确认 artifact 时用 [`spec-revise`](actions/spec-revise.md) 同步受影响的记录与已有附件；
只有满足 `ADR_REQUIRED` 或 Guidance Placement 时才增加相应持久资产。完成必要复查后再恢复依赖工作。

---

## 3. P2:Feature Development(每个功能)

本节解释 feature 生命周期的目的与边界。精确触发、输入、输出、verdict 和例外只在 [`docs/actions/`](actions/) 维护;这里不再复制可执行 SOP。

### 3.0 P2 流程全景(skill 视角)

沟通问题 → 必要时调查/试验 → 确认方案和验收 → 实现并验证。
实现中的重要新发现会回到沟通，不要求事先发现全部任务。无需记录的小改直接做，需要追踪时默认一份 spec，已有记录优先复用。

### 3.1 规划阶段

[feature-init](actions/feature-init.md) 拥有沟通、记录需要、授权、上下文和范围暂停规则；[spec-quality-check](actions/spec-quality-check.md) 检查依据是否足以开始。文档内容是否有用比章节是否齐全重要，独立审查按风险和项目要求决定。普通讨论不强制启动命令或创建文件。

### 3.2 实现阶段:机械细节不中断,方向风险及时沟通

普通实现细节和任务细化由 AI 按已有约定处理。影响范围、方案、成本、数据、权限或验收的新发现，先暂停相关实施、说明影响与建议，用户确认后局部更新并继续。已写代码不构成扩大范围的理由。

在真实依赖或风险检查点验证并汇报；按事先约定的阶段边界等待用户，不增加逐文件审批。先回应当前问题，在自然节点写回有用结论，保留否定约束、未决问题和授权范围。精确执行边界只见 [feature-init](actions/feature-init.md#implementation-scope-stop)。

### 3.3 交付阶段:delivery receipt

[feature-done](actions/feature-done.md) 在一个稳定快照上检查实际改动、L1、适用的独立 L2/L3 和当前事实，汇总真实证据。新记录的收据位于 spec.md，外部报告引用它，不复制整段日志。小文件不减免必要验证，多文件不自动增加审查。

### 3.4 与平台流程的协作

已有 Issue/PR 可引用同一记录。平台写入仍需授权，不是讨论或开始实现的前置条件。明确关闭/归档/提交时，READY 后由 [feature-archive](actions/feature-archive.md) 合并有效的当前事实、移动目录并验证链接；只要求交付时可停在 READY、archive pending。

### 3.5 开发中发现已确认内容有误怎么办

重要新发现通过 [spec-revise](actions/spec-revise.md) 更新受影响的已确认内容、任务和验收；未受影响的决定和有效证据保留。不需要重建 feature 或重新走全部访谈。普通任务拆分不改变验收；实现回归修实现，不能改预期掩盖失败。已归档的后续变化使用 successor change。

---

## 4. P3:Continuous Maintenance(开发期间持续)

### 4.1 三层错位的检查机制

L1 处理机械规则，L2 对照项目约定，L3 对照 feature 契约。实施中运行成本匹配的局部证据，交付时由
`feature-done` 汇合适用层级；定义与 rationale 只见 [§6.4](#64-按规则源分层验证three-layer-review-separation)。

### 4.2 反馈按成本分层

反馈按成本分层：

```
反馈层级    动作                  例子
─────────────────────────────────────
即时        文件级确定性反馈       formatter / lint / LSP
阶段        当前责任或契约检查     focused test / typecheck
交付        feature 风险与契约检查 reviewer / integration / e2e
PR / 发布   人审与发布级自动化     CI / release checks
```

每层只承担与成本和风险匹配的检查。阶段验证尽早暴露局部问题，交付与 CI 承担适用的完整检查；
主观判断交给 reviewer 和用户，有效机械证据按端点规则复用。

### 4.3 端点 review:每个 feature 完成时

端点使用 AGENTS.md 做 L2、change spec 做 L3，并把有效证据写入 Proof Bundle；精确调度和 verdict
只由 [`feature-done`](actions/feature-done.md) 定义。发现 convention drift 时转入 [§5](#5-p4drift-refresh主动修正)。

### 4.4 backlog 与讨论(走平台,不进 repo 文件)

| 信息类型 | 位置 |
|---|---|
| 未决提案 / 讨论 | GitHub Issue + label `proposal` 或 GitHub Discussions |
| 需要长期执行的已接受设计 | 按职责沉淀到 spec / plan / ADR / action；讨论草案不与正式文档并存 |
| Bug / Feature 请求 | Issues |
| 公开讨论 / Q&A | Discussions |
| 架构决策 | ADR `docs/adr/`(留 repo,因为是历史记录) |
| 待办进度 | Project board / Milestones |

**判定原则**:**AI 要读 → 文件**,**人类协作 → 平台**。

### 4.5 校验

有效信号是：机械错误能在最近边界被发现，Proof Bundle 没有漏掉适用层级，同一约定无需反复人工提醒。

---

## 5. P4:Drift Refresh(主动修正)

P4 只修 root/nested AGENTS.md，以及用户明确纳入本次修订的宿主私有约定。ADR 由新 ADR 取代，
feature artifact 走自身生命周期，spec/代码偏差由端点处理；不要借 drift refresh 改写其他职责层。

### 5.0 三层 AGENTS.md 的更新频率梯度

任何层级都只在出现持久、可证实的约定变化时更新：

| 层级 | 更新频率 | 典型触发 | 跟 phase 关系 |
|---|---|---|---|
| **项目级** `AGENTS.md` | 低频、事件触发 | P4 客观 drift audit / 重大架构选型变化 / 多 feature 反复出现某约束 / feature 明确选择跨项目 `Codify` | **P4 主战场**;明确的跨项目 `Codify` 也可在 P2 内完成 |
| **Tier 级** `<tier>/AGENTS.md` | 偶发、事件触发 | 某 runtime 内多个 sibling 模块形成共同差量 / 加入持久 tier-wide 库或约束 | P2 明确 `Codify` 时及时更新;P4 处理客观 drift |
| **模块级** `<module>/AGENTS.md` | 少见、事件触发 | 模块新增或改变一个满足 [§2.3](#23-反常判定何时该写模块-agentsmd) 四项门槛的持久父级例外 | 通常由相关 P2 change 明确 `Codify`;P4 可修正或删除孤立 guidance |

### 5.1 何时触发

- **客观状态已变**:命令、依赖、目录、版本、配置或 tier 边界与约定不一致
- **感知到 drift**:用户感觉"反复跟 AI 提醒同一件事 ≥ 2 次",或明确要求审计约定
- **放置 drift**:父子重复、持久局部特例无 owner、alias 失效、模块移动后 guidance 孤立，或 prompt
  规则已有可靠机械门禁

### 5.2 两种触发模式

| 模式 | 触发 | 工具 |
|---|---|---|
| **A. 主动 refresh** | 用户感知到 drift / 发现客观不一致 / 大依赖升级后 | [`agents-md-revise`](actions/agents-md-revise.md) |
| **B. 端点反馈** | feature 完成时 | `feature-done` 阻断未兑现的显式 Codify；其他机会仅报告，需要时再运行 `agents-md-revise` |

### 5.3 工具流程概览

精确流程见 canonical [`agents-md-revise` action](actions/agents-md-revise.md):比较 A 类约定与客观仓库
状态,检查 root/tier/module 放置、父子重复、一行 alias、孤立 guidance 和可机械化出口,只提出有证据的
窄 patch;物质歧义先澄清,其余改动在当前请求授权范围内应用。它不评价架构是否正确。

### 5.4 与平台流程的协作

- 团队项目可通过普通 PR review refresh diff；project-workflow 不规定提交格式。

### 5.5 演进 drift 的应对策略

规则历史使用 Git，不另建重复 changelog。新规则通常只约束新改动；安全、合规或低成本明确回填的
场景可以扩大修复范围。P4 不做周期性全量重写。

---

## 6. 方法论支柱(4 条)

只有 4 条核心原则,**每条独立、各管一件事、删了崩**。其他"原则"是这 4 条的推论或具体场景的 tactic,不在本章重复。

<a id="60-每条原则的两侧组成读-6164-前必读"></a>
### 6.0 每条原则的两侧组成(读 §6.1-6.4 前必读)

> **术语提示**:本节用"**蓝图侧 / 纪律侧**"区分**谁来支撑**(工具 vs 人);§6.4 的 **L1/L2/L3** 是另一回事(review 分层 —— 通用规则 / 项目约定 / 功能规约)。不要混。

每条原则都由两侧共同支撑,**缺一不可**:

- **蓝图侧**(Blueprint —— 本项目提供):skill / template / proof bundle workflow 等
- **纪律侧**(Discipline —— 用户协作行为):按需保存结论 / 保留上下文中的约束与未决问题 / 完成必要验证等

**4 条原则的蓝图/纪律平衡很不一样**,真实预期对照表:

| 原则 | 蓝图侧提供 | 纪律侧实践 | 主要依赖 |
|---|---|---|---|
| **6.1** 共识与验证 | 沟通、按需试验与功能记录 | 保留确认的例子和实际证据 | 工具与用户共同完成 |
| **6.2** Context budget | AGENTS.md 预算纪律 + 可选检查 | 在长会话中主动收敛上下文、一会话聚焦一项任务 | 主要依赖使用纪律 |
| **6.3** Environment-enforced | 阶段验证与交付 L1 | 维护真实命令、处理检查结果 | 项目工具与工作流共同完成 |
| **6.4** 三层验证错位 | delivery receipt workflow + adapter reviewer + reviewer context 注入 | 不跳过端点 review,处理 finding | 工具与用户共同闭环 |

**读后续 4 条原则时记住**:有些保障启用后适合工具持续执行,有些仍依赖使用者保持上下文和验收纪律;不使用伪精确比例描述两者关系。

### 6.1 共识与验证先于正式实现

对问题、范围和怎样算正确形成足够共识，再正式实现。关键假设可以先通过获准的有限试验验证；简单明确的工作不需要额外试验或完整文档。

记录保存已确认行为和有用证据，使实施与交付有依据。默认一份简短 spec，不把文件数量、固定章节或一次试验成功当成理解充分。实施中继续学习，重要变化先沟通再修订，普通细节不打断。

这一原则借鉴 [BDD 的具体例子](https://cucumber.io/docs/bdd/) 和 [Shape Up 的按需结构](https://basecamp.com/shapeup/4.1-appendix-02)。详细执行规则只有 [feature-init](actions/feature-init.md) 一个所有者；写法见 [功能记录指南](spec-driven.md)。

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
| 工具事实 | 常驻说明、imports 和按需规则最终都会占用被加载 session 的 context；具体加载机制以当前宿主文档为准 |

#### 怎么用

| 场景 | 动作 |
|---|---|
| 长 session 跨多任务 | 只在切换独立任务或上下文确有需要时新开会话；先保留决策、限制、未决问题和下一步，不因文档更新清空上下文 |
| CLAUDE.md / AGENTS.md | 只保留常驻事实；共享长尾用引用组织，路径相关长尾优先放宿主支持的 scoped rules |
| 多模块项目 | sub-agent 隔离上下文(每个 sub-agent 独立窗口) |
| 长文档参考 | progressive disclosure —— 用 `@` 按需拉,不全塞 |
| 长任务中段 | 在逻辑节点使用宿主支持的 context compaction(不是窗口爆掉时) |

> 清理、压缩和任务拆分的时机随模型、窗口和宿主变化；核心判断始终是当前上下文是否仍服务当前任务。

#### 失效情形

- **探索性深度对话** → 上下文累积本身是价值,不该清
- **跨多轮的链式推理** → 提前清会断思路
- **过度压缩上下文** → 关键细节被压成摘要,后续需要时丢失
- **过度拆分 sub-agent** → 调度成本大于上下文隔离或并行收益

---

### 6.3 规则由环境强制(Environment-Enforced Rules)

> **Serves Tier 1 命题**:Drift(用机械检查把规范固化在环境里,对抗时间/空间漂移)。参见 [§0.1 命题 3](#01-这本手册解决什么)。

#### 主张

能机械判定的规范由项目的 lint、format、typecheck 和 tests 验证；协作指令保留项目特有的约定与边界。

#### 底层逻辑

可执行检查提供可重复的结果与定位信息，减少反复人工提醒。`AGENTS.md` 记录命令及其适用范围，
阶段验证尽早发现问题，交付端点检查必要证据是否完整。

#### 怎么用

| 场景 | 动作 |
|---|---|
| 反复出现的机械错误 | 优先使用项目已有检查；确有缺口时补充相应 lint 或 test |
| 运行检查 | 保留命令、结果与失败位置；失败修复后复验受影响证据 |
| 维护 AGENTS.md | 保留真实命令和必要约定，避免复制工具已能判定的细节 |
| 多文件/跨语言检查 | 使用各自项目命令，按真实依赖确定验证范围 |

#### 失效情形

- **审美/设计判断**(代码"够不够清晰" / "命名好不好") → 需要 agent review 或人审
- **跨文件/跨模块语义** → 需要覆盖相关依赖的 typecheck 或测试
- **业务规则正确性** → 需要已接受契约与相应行为证据
- **长跑检查** → 放在适用的交付或 CI 环节，避免每次编辑重复运行

---

### 6.4 按规则源分层验证(Three-Layer Review Separation)

> **Serves Tier 1 命题**:Verification(**输出侧** —— 三层错位机制把"是否验证过"变成可重复、可追溯的产物)。参见 [§0.1 命题 1](#01-这本手册解决什么)。

#### 主张

对照规则检查代码这件事,根据**规则的来源**分三层(L1 / L2 / L3),每层用不同机制 —— **不要混在一起做**。

| 层 | 规则源 | 问的问题 | 失败模式 |
|---|---|---|---|
| **L1** 通用规则 | language defaults + 团队全局规则(Claude adapter 可放 `~/.claude/rules/*`) | 代码规范吗? | 通用工程错误 |
| **L2** 项目约定 | `AGENTS.md` + 路径级项目规则(Claude adapter 为 `.claude/rules/`) | 长得像这个项目吗? | 风格/结构错 |
| **L3** 功能规约 | 已接受的功能记录  | 做了说要做的事吗? | 行为/范围错 |

三层失败模式正交：通用工程错误、项目约定偏离、功能契约偏离不能互相证明通过。分层能缩短
review context、避免一层结果掩盖另一层，并让修复指向明确规则源。

#### 怎么用

| 层 | 工具 | 时机 |
|---|---|---|
| L1 | 阶段 focused checks + `feature-done` 的 Verification 与变更项目标准命令；全仓/发布套件按实际需要运行，有效证据按端点规则复用 | 阶段 + 端点 |
| L2 | reviewer agent + AGENTS.md 作 context | 端点(P3 proof bundle) |
| L3 | reviewer agent + accepted feature artifact + 已有测试证据 | 端点，按适用性 |

`feature-done` 是唯一端点组合点：必要 L1 之后，实际风险和项目要求决定独立 L2/L3 的适用性与调度。每个 gate run 只审一个稳定快照并返回一个终态；端点外的修复与复验按原请求授权和 `feature-done` 规则继续。
Reviewers 遵守 cite-or-skip、fresh read、完整适用范围和 ambiguity feedback；精确授权、调度、规则源、fallback、证据、漂移、去重及复审规则只见
[`feature-done`](actions/feature-done.md)、[`agents-md-reviewer`](reviewers/agents-md-reviewer.md) 和
[`spec-reviewer`](reviewers/spec-reviewer.md)。

#### 失效情形

通用情形见 [§9 何时偏离](#9-何时偏离手册)。本原则特有的:

- **设计期** → 还没代码,L1 / L2 都用不上,只 review spec 文本
- **完全 AI 自主项目**(没人定项目约定) → 没有 AGENTS.md 时 L2 退化为 L1
- **legacy 代码** → 老代码大量违反 L1/L2,先 lock("不报警旧代码"),只对新改动 enforce

---

## 7. 反模式(明确说"不要")

### 7.1 不要把文档齐全当成理解充分

模板不能替代沟通和证据。出现重要新发现时，及时解释、确认并局部更新；不要因为已有 spec 而继续错误方向，也不要每发现一个实现细节就重启流程。

### 7.2 不要叠加两个 process-owning 框架
**症状**:同时装 superpowers + project-workflow / ECC + project-workflow 等
**修正**:挑一个,其他用 small composable skill 补

### 7.3 不要把 review 留到 PR(也不要每行做)
**修正**:L1 管机械检查，agent review 管约定与契约，人审管方向。**三层错位**

### 7.4 不要为了用 AI 拒绝键盘改 5 行代码
**症状**:改动 < 5 行且你脑子里有答案,还非要让 AI 写
**修正**:AI 不是宗教,小改自己来更快

### 7.5 不要重复维护同一个决定

默认一份 spec 可以同时说明行为、必要理由和简短进度。只有确有阅读/交接需要才拆出设计或清单，其他文件引用接受规则，不再复制一份。

### 7.6 不要把上层投资沉到底层工具
**症状**:把项目规则只写进单一工具私有格式(如 `.cursor/rules/` 只 Cursor 读)而不是 AGENTS.md
**修正**:协作约定写在**广泛可读**的位置(AGENTS.md / `docs/`,Claude Code、Codex 与其他兼容工具都能读),工具特定位置只放工具特异配置(如 plugin manifest)。project-workflow 不强求"工具完全无关",但要避免锁死单一工具的私有格式 —— 见 [§0.5 信念 2](#05-实现策略的核心信念)。

### 7.7 不要在 P0 没做完就跳到 P2
**症状**:还没建 AGENTS.md / 必要规则就开始写 feature
**后果**:基线缺失,每个 feature 都要重新讨论项目惯例
**修正**:严格按 P0 → P2 顺序;P0 没做完不开 feature(模块新增是 P2 内 sub-flow,见 §2)

### 7.8 不要把 backlog 塞进 repo 文件
**症状**:`docs/backlog.md` / `TODO.md` 跟踪未决事项
**后果**:重复维护(Issues + 文件),搜索 / 排序 / 通知都退化
**修正**:backlog 走 GitHub/GitLab Issues + labels；只有被接受且需要长期执行的设计才按职责沉淀到 repo

### 7.9 不要让 review 门空转(太安静)
**症状**:门只输出模板套话,没有 exact scope、applicable population、unverified items、ambiguities 或引用证据
**注意**:零 findings 可以代表高质量,也可以代表漏检;finding 数不是 sensitivity 指标
**修正**:零 finding 只有 evidence-backed 才 PASS;known-bad mutation smoke 验 sensitivity。连续零只提示成本校准,是否降频由用户结合 mutation 结果和决策价值判断

### 7.10 不要让 review 门太吵(误报侵蚀信任)
**症状**:门反复对**既有 baseline / 非 patch 内容**开火(如 auditor retrofit 模式误判既有决策),或 dismissal-rate 高到人开始橡皮图章
**后果**:信任流失 → 人无视门 → 门名存实亡(比空转更危险,它还在烧成本)
**修正**:校准该门(收紧 scope / 修 retrofit 契约 / 调阈值);把"findings 被驳回率"当数据信号

---

## 8. 栈适配原则

P0-P4 不绑定语言或框架。项目个性化时从仓库事实识别 formatter、lint、typecheck、test、build 和发布命令，再把它们放到成本匹配的层级：局部检查进入实施阶段，feature 检查进入交付端点，发布级检查按风险触发。不要仅因某个框架常见就新增依赖或命令。

具体命令以仓库配置、`AGENTS.md` 和部署文档为准；真实踩坑可记录到 [`docs/gotchas.md`](gotchas.md)，不在通用手册维护容易过期的工具清单。外部文档、专项安全审查或额外 reviewer 只在当前风险需要且宿主具备相应能力时使用。

### 8.1 全栈项目的契约先行(Contract-First Tactic)

**仅适用全栈项目**(前端依赖后端 API 的项目)。这是 §6.1 共识与验证 在全栈场景的时间维度落地。

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
| tiny/local、低风险且未改变已声明 current truth | 不建 feature artifact,直接做并跑相关检查 |
| 探索性 spike | worktree + vibe coding;只有留下持久架构/跨功能技术决定时才补 ADR |
| 紧急生产 hotfix | 直接修,事后补 spec 和测试,记 tech debt |
| 架构变更 | 按 `feature-init` 判断文档需要；只有命中 `ADR_REQUIRED` 才写 ADR，隔离方式按仓库与风险选择 |
| 低风险文档编辑 | 不建 feature artifact，检查 diff 与本地 links；语义变更仍按实际文档需要分流 |
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
| 宿主 plugin/skill 接口保持兼容 | 各宿主接口会演进;project-workflow 以各自 adapter 封装差异,并保留 manual fallback |

### 10.3 已知失败模式

| 失败模式 | 信号 | 应对 |
|---|---|---|
| **过度工程化** | P0 配了一堆 rules / ADR 模板,实际 feature 还没开发 | 收敛到首个 feature 真正需要的最小基线，其余按证据增补 |
| **spec 变 todo list** | Outcomes / Scope / Constraints / Verification 模糊，tasks 却很详细 | 先关闭契约与验收未知项，再拆实施任务 |
| **项目说明膨胀** | 同一规则在多个文件重复，旧例子开始压过当前约定 | P4 refresh；保留最接近执行点的权威规则，外围文档改为摘要和链接，可机械规则交给 lint/test |
| **三层 review 重叠** | reviewer 一个 review 把 L1/L2/L3 全跑了,prompt 1000+ tokens | 拆 reviewer 调用,各自只给对应 context |

### 10.4 演化承诺

本手册不是终版。明确的演化触发点:

- **真实项目出现可复现失败模式** → 修订对应流程与回归检查
- **AGENTS.md 渗透率变化** → §1.3-1.4 内容跟进
- **宿主 plugin/skill 接口发生兼容性变化** → adapter 与安装文档同步
- **跨工具实测发现差异** → §6.3 失效情形扩充
- **新的方法论流派出现** → §6 重新审视

---

## 附:跟现有工具的关系

- **`~/.claude/rules/`**(Claude Code 官方支持):Claude 用户级规则载体;不属于项目 baseline,是否使用由用户自行决定
- **project-workflow v3**:本手册是它的核心文档;`template/` 存放 P0 starter assets 与 feature 模板,`adapters/` 承载 host-native actions,`scripts/` 负责 release checks 与 package build
- **GitHub Spec Kit `/speckit.clarify`**:P2 spec 不完整时的 Q&A 工具(可选)

---

## 参考与延伸

### 官方文档(权威依据)

- [Anthropic — CLAUDE.md / memory](https://code.claude.com/docs/en/memory)
- [Anthropic — Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
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
