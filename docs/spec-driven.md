# 规约驱动开发(Spec-Driven Development)实践指南

> [README](../README.md) 里 spec-driven 主题的展开。
>
> 与 [workflow.md §1 P0 Project Setup](workflow.md#1-p0project-setup项目第一天) 和 [§3 P2 Feature Development](workflow.md#3-p2feature-development每个功能) 互补:
> workflow 说"启动时该做这件事",本文档说"具体怎么写、怎么用、怎么更新"。

---

## 0. 这本文档不是什么

- **不是 GitHub Spec Kit 的复刻**:不上工具链(`.specify/` 目录、slash commands)
- **不是 user story 写作教程**:本项目用场景化散文,不用 Agile 句式
- **不要求每个改动都写 spec**:跳过条件见 [workflow.md §3.1 规划阶段](workflow.md#31-规划阶段) + [§9 何时偏离](workflow.md#9-何时偏离手册)

---

## 0.1 前置:概念清晰 —— 模块 vs 功能

读本文之前先钉死两个概念,**spec 是功能级文档,不是模块级文档**:

| 概念 | 是什么 | 寿命 | 例子 |
|---|---|---|---|
| **模块**(module) | 代码组织单位(目录) | 长期存在,跟项目同寿 | `backend/src/invitations/` |
| **功能**(feature) | 一次开发任务的用户能力 | **有起止**,完成后归档 | "用户邀请流" 开发任务 |

**关键关系**:一个功能可横跨多个模块;一个模块可被多个功能修改。

**文档归属**(对应 [workflow.md §0.3 文档职责 5 类](workflow.md#文档职责-5-类总框架),本文档展开 B 类的细节):

| 类别 | 文件 | 本文档涉及? |
|---|---|---|
| **A. 约定** — 项目级常识 / Tier 级约定 / 模块级反常 / 可选宿主私有详规则 | 根 `AGENTS.md` + tier `<tier>/AGENTS.md` + 模块 `<module>/AGENTS.md`;active host 可另有私有 scoped rules | §2 速查,详 workflow.md §1.3 |
| **B. 变更** — 功能级 change spec / plan / tasks | `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` | **§3 起本文档主题** |
| **C. 决策** — 架构选择 + trade-off | `docs/adr/NNNN-<title>.md` | 不在本文档,见 workflow.md §1.8 |
| **D. 工具基础设施** — hook / lint / settings | 有已验证命令时才 materialize adapter hooks/settings;`.gitignore` 始终存在 | 不在本文档,见 workflow.md §1.6 / §1.7 |
| **E. 产品事实** — 长周期产品域的当前现状 | `docs/specs/<area>.md`(可选 `docs/specs/index.md` 域索引) | **§5 生命周期部分**(current truth 与 spec 状态的关系) |

> "Tier" 概念详见 [workflow.md §0.3](workflow.md#03-概念区分钉死再读后续)。简言之:**全栈/多端项目的架构性分层**(前后端、客户端服务端等);单 tier 项目不存在这层。

---

## 1. 业界三流派(选一个心智模型)

> **本节范围**:仅 spec/plan/tasks(**B 类任务**)的写法流派。**C 类决策(ADR)** 自成一派(Michael Nygard 2011),见 [workflow.md §1.8](workflow.md#18-adr-目录初始化);**A 类约定(AGENTS.md)** 见 [workflow.md §1.3](workflow.md#13-agentsmd-的内容标准)。

| 流派 | 代表 | 形态 | 适合谁 |
|---|---|---|---|
| **重型** | [GitHub Spec Kit](https://github.com/github/spec-kit) | `.specify/specs/<NNN>/{spec,plan,tasks}.md` + command suite | 大团队、流程纪律强 |
| **轻量** | [Addy Osmani agents.md](https://addyosmani.com/blog/good-spec/) | 根目录单文件六要素 | 单人/小团队、要灵活 |
| **学术** | [SDD: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) | spec 是契约,代码是契约的实现 | 高合规、强保证场景 |

### 本项目采用混合

- **项目级约定**(A 类):agents.md 风格 → 根 `AGENTS.md`(workflow §1.3)
- **变更级 artifact**(B 类):Spec Kit 简化版 → `docs/specs/changes/<NNN>-<slug>/`(full lane 三件套;轻车道仅 `tasks.md`)
- **架构决策**(C 类):具体 ADR → `docs/adr/`;空模板保留在 plugin,需要时实例化(详见 workflow.md §1.8)
- **哲学**:学术 SDD 的"spec-as-contract"精神,**不上** Spec Kit 的工具链负担

**为什么混合**:
- 全照 Spec Kit:工具链开销大,适合大团队
- 全照 agents.md:只有项目级,功能级 + 决策史缺位
- 学术派的契约精神告诉我们:spec **可以变更但不能模糊**

> A / B / C 三类的角色 + 寿命对比见 [workflow.md §1.8 ADR vs AGENTS.md vs spec vs plan](workflow.md#18-adr-目录初始化)。本文档 §3 起只展开 B 类(功能级 spec / plan / tasks)。

---

## 2. 项目级约定(AGENTS.md,CLAUDE.md 1 行 alias)

详细写法见 [workflow.md §1.3 AGENTS.md 的内容标准](workflow.md#13-agentsmd-的内容标准) + [§1.4 嵌套层次](workflow.md#14-claudemd-嵌套层次子级覆盖父级)。

要点速查:
- 项目级与 tier / 模块级都是事件触发,只在出现持久、可证实的约定变化时更新;作用域与 P2/P4 分工详见 [workflow.md §5.0 三层 AGENTS.md 的更新频率梯度](workflow.md#50-三层-agentsmd-的更新频率梯度)
- 六要素(Addy 框架):Commands / Testing / Project Structure / Code Style / Git Workflow / Boundaries
- Boundaries 三档:✅ Always / ⚠️ Ask first / 🚫 Never
- 嵌套层次:**用户 / 项目根 / 子目录(tier + 模块)/ 私有**(详细见 [workflow.md §1.4](workflow.md#14-agentsmd--claudemd-嵌套层次子级覆盖父级);系统级 `/etc/claude-code/CLAUDE.md` 为企业 IT 场景,project-workflow audience 不覆盖)
- 模块级 AGENTS.md(`<module>/AGENTS.md` + 1 行 `CLAUDE.md` alias)是**可选**,仅模块"反常"时才写(见 [workflow.md §2.3](workflow.md#23-反常判定何时该写模块-agentsmd))
- Guidance Placement:跨项目规则留 root;同 runtime 多个 sibling 的共同差量放 tier;只有真实父级例外放
  module;产品/临时语义留 spec/plan/ADR,可机械规则优先 lint/hook/test。嵌套文件只写父级差量,不能因
  根文件长或目录存在就创建/迁移
- portable A 类入口是 root/nested `AGENTS.md`;Claude `.claude/rules/*.md` + `paths:` YAML-list frontmatter 是可选宿主私有增强,不在嵌套层次表里,也不要求其他 adapter 翻译

维护 action:[`agents-md-revise`](actions/agents-md-revise.md) —— P4 主动 refresh root/nested AGENTS.md,以及用户明确纳入本次修订的宿主私有约定文件。

---

## 3. 变更级 artifact(`docs/specs/changes/<NNN>-<feature>/`)

> **写 spec 前先看**:[§3.8 Spec 编辑边界](#38-spec-编辑边界只有-1-条线) —— 是否已经开始依据它实施,决定 spec.md 能否直接改 vs 必走 SOP。Git commit 不参与这个边界。

需要追踪的 feature 一个**目录**。full lane 使用 spec / plan / tasks 三件套;轻车道只使用 tasks.md。模板由 [`feature-init`](actions/feature-init.md) 实例化,项目本地默认不持有。

### 3.1 三文件分工

> 本表展开 [workflow.md §1.8 5 类对比表](workflow.md#18-adr-目录初始化) 中 **B 类(spec/plan/tasks)** 的内部分工。

| 文件 | 回答 | 内容 | 何时冻结 |
|---|---|---|---|
| `spec.md` | **WHAT** | Outcomes / Scope boundaries / Constraints / Verification | 确认并开始实施后冻结,变更 = 起新功能目录 |
| `plan.md` | **HOW** | 模块影响范围 / 架构决策 / Prior decisions / 风险 | 实施中可补充,不能推翻 spec.md |
| `tasks.md` | **STEPS** | Task breakdown(checkbox)+ 实施记录 | 实施中持续更新,完成后归档 |

**为什么分三文件**:三种生命周期不一样。change spec 是与 stakeholder 的契约;plan.md 是技术草图;tasks.md 是 live 进度。

### 3.1.1 三形 change artifact(E 类按需后)

| 形态 | 何时 | `spec.md` | L3 基线 |
|---|---|---|---|
| **Brownfield 瘦** | 已有实质 `docs/specs/<area>.md` 覆盖本范围 | Motivation + References + Delta + Constraints + Verification | Delta + Constraints + Verification |
| **Greenfield 胖** | 尚无 domain 覆盖的新产品面 | §1–§4 全文 | §1–§4 |
| **轻车道** | 小改 | 无 spec;`tasks.md` + `## 验证` | tasks 验证节 |

E = `docs/specs/<area>.md`;B = `docs/specs/changes/<NNN>-*/`。domain doc 供 init/M6/L3 context,**不是** L3 全文对照基线。

### 3.2 目录命名

```
docs/specs/changes/
├── 001-auth/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── 002-invitation/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
└── archive/          # 已交付变更(由 /feature-archive 移入)
```

- 目录名 `<NNN>-<slug>`,编号便于排序和引用
- 完成后**整个目录归档,不删、不改**;后续变更起新目录引用旧的(见 §5)

### 3.2.5 入口分流:先判是否需要 project-workflow
<a id="325-轻车道小改免-frozen-spec--plan"></a>

本指南负责 artifact 的写法,不重复运行时分流规则;精确判定以 [`feature-init`](actions/feature-init.md) 为准。最短心智模型:

| 路径 | 何时使用 | Artifact |
|---|---|---|
| **直接做** | 局部、可逆、无契约且没有持久记录消费者;或已有 accepted spec 覆盖实施 | 无新 artifact |
| **Light lane** | 低风险小改,但交接、多步验收、审计/发布或 current-truth 更新需要持久清单 | `tasks.md` |
| **Full lane** | API/数据/安全/权限/架构/跨模块契约、新模块或其他高风险变更 | `spec.md + plan.md + tasks.md` |

改变已有 `docs/specs/<area>.md` 声明的持久行为时至少进入 Light lane。实施中发现原分类不再成立时停止并升级,不把 Light lane 当成逃生舱。

创建 artifact 前先做有界只读 Impact Preflight:确认当前 outcome/consumer、预期责任区域、Contract/
data/authorization/migration/release 信号、遗留或无法归属数据的处置、dirty worktree 重叠和高影响
未知项。高影响业务、所有权、授权、数据处置或发布耦合没确认时保持 pending,一次只问一个决定性
问题;不要先生成 speculative spec 再补答案。规模是复核信号,不是机械拆分阈值。

多个小改只有共享用户目标且必须同批交付时才合成一个 feature。能独立验收、上线和回滚且没有事务、契约或发布耦合的结果默认拆分;用户接受合并交付时,在 plan 现有 Prior decisions 或风险小节记录决定来源与协调/回滚风险。选择拆分时,先把暂缓结果持久化到既有 Issue/PM 系统并保留稳定引用,再只创建当前 child;不在 repo 另造 backlog,也不靠聊天记忆。责任面、migration 或外部契约宽度只是复核信号,不是硬阈值。

### 3.3 `spec.md` 写法(WHAT,冻结)

**包含 4 节**:Outcomes / Scope boundaries / Constraints / Verification。

#### Outcomes:场景化,不写 user story

| 好 ✅ | 坏 ❌ |
|---|---|
| 管理员在团队设置页输入邮箱发邀请,被邀请者收到邮件、点链接 24 小时内可注册并自动加入团队 | As a manager, I want to invite users so that they can join my team |

**为什么**:user story 句式 AI 知道 want 但不知道**场景细节**(在哪个页面?用户怎么收到?)。

#### Scope boundaries:**显式列做与不做**

| 好 ✅ | 坏 ❌ |
|---|---|
| 做:邮箱邀请、链接过期、注册自动加入<br>不做:多渠道、邀请额度、追踪 UI | 做用户邀请功能 |

**为什么**:不写"不做"的部分,**AI 会自动加**。这是 scope creep 最大单一来源。

#### Constraints:**硬数字**,不要模糊

| 好 ✅ | 坏 ❌ |
|---|---|
| 邀请 token 256-bit,签名而非加密;24h 过期,过期返回 410 Gone | 要保证安全 |

**为什么**:模糊约束 AI 怎么实现都"满足",最后跟你预期不一致。

#### Verification:最小证据义务,具体、可执行

| 好 ✅ | 坏 ❌ |
|---|---|
| token 生命周期与滥用风险 → service test 覆盖相关不变量<br>`Primary flow`:API 与邮件契约风险 → 一条 integration test 验邀请创建到 token 打开<br>只有 provider/config 变化时 → staging delivery smoke | 固定要求单测、集成、e2e 各一套,按 endpoint/状态码凑矩阵,或只写覆盖率 80% |

**为什么**:覆盖率、测试层数和 case 数都不等于覆盖**关键风险**。一个证据可以覆盖多个相关义务;只有交互维度会改变结果、已有回归要求或发布/合规契约存在时才展开矩阵。用户可见 outcome 只在现有义务中标一个 `Primary flow`,供交付预检优先运行,不是再加一套测试。

按主要风险选择能证明它们的**最小可执行验证集**。测试层级按需;除非各层证明不同风险,不要求在单测、集成和 e2e 中重复覆盖同一行为,也不按固定状态码凑错误路径矩阵。文档、配置或迁移型变更可使用相应的静态检查、CLI 或数据断言。

### 3.4 `plan.md` 写法(HOW,可补)

**包含 4 节**:模块影响范围 / 架构决策 / Prior decisions / 风险与未决。

#### 模块影响范围(feature ↔ module 的桥梁)

显式列出本功能动哪些**模块**(不是文件):

```markdown
## 1. 模块影响范围

- `backend/src/invitations/` —— 新增模块
- `backend/src/users/` —— 改:加 `accept_invitation` 方法
- `backend/src/email/` —— 改:加邀请邮件模板
- `frontend/layers/invitations/` —— 新增 layer
- `frontend/layers/teams/` —— 改:设置页加 form
```

**为什么**:这是 feature 跟 module 的**显式连接**,review 时一眼看出影响面;实施时知道哪些模块需要协调改动。

#### Prior decisions:**只把需要持久追踪的选择带“为什么 + 来源”写回**

| 好 ✅ | 坏 ❌ |
|---|---|
| 用 Resend 不用 SES:已有 Resend 账号,SES 要跑域名验证;来源=user confirmation 2025-02-06 | 用 Resend |

**为什么**:非显然技术选择、外部来源解释、冲突/bundled-risk 裁决或 supersede 决定如果不带原因,
AI 在实施中遇到问题会**重新打开讨论**(`要不要换 SES?`)。带原因 = 关闭讨论。普通 Outcomes、Scope、
Constraints、Exclusions 仍由 spec.md 单独拥有,不复制到本节;没有需追踪决定时明确写
`N/A(no durable why/source decision)`。

**关键纪律 —— 选择性当场写回**:讨论中形成上述需持久追踪的决定时,**立刻**追加到 plan.md §3,
写 why 和稳定来源。仓库证据写 path/section;用户决定写日期/current feature;取代旧语义时明确
supersedes。不要把 ordinary spec contract 再抄一遍。
不复制聊天原文。这一步常被忽略,但它既关闭重复讨论,也让下一会话能重新对账。

#### 架构决策

简述本功能在系统里的形状:数据模型、API 契约、关键算法、状态管理选择。
不重复 spec.md(spec 写做什么,plan 写怎么做)。

#### 风险与未决

实施前已知的风险点 + 还没敲定但会在实施中决定的事。**让未决浮上来**,不要假装都想清楚了。

### 3.5 `tasks.md` 写法(STEPS,实时)

**包含 2 节**:任务清单 + 实施记录。

#### 任务清单:按独立实施 / 验证 / review 边界拆分,按依赖排序

| 好 ✅ | 坏 ❌ |
|---|---|
| - [ ] 建 invitations migration 并验证升级/回滚<br>- [ ] 实现 invitation service 与 token 不变量<br>- [ ] 接入 API 与邮件契约<br>- [ ] 接入管理页和邀请落地页 | - [ ] 实现邀请功能 |

**为什么**:过粗会隐藏独立决策和失败点,过细则制造清单维护与重复验证。按可独立实施、验证或 review 的边界拆分;不要按预计时长或每个测试 case 机械切任务。

**跨 tier 契约先行**:先确定共同 API/schema/event/fixture,再按依赖或可独立验证的阶段排序;见 [workflow §8.6](workflow.md#86-全栈项目的契约先行contract-first-tactic)。

#### 实施记录

只记录实施过程中仍影响交付或后续维护的偏差、补充决策、临时方案。**不改 spec.md;若 plan.md
有补充,在 plan.md 加注**。不记录逐轮命令输出、调试时间线或已被后续结果取代的过程;最终检查
结果只进 Proof Bundle。没有持久记录时写"无"。

```markdown
## 实施记录
- 2026-05-09: Resend API 限速比预期严,加了指数退避
- 2026-05-10: 邀请落地页路由调整为 `/i/<token>`(原 `/invite/<token>` 跟现有冲突)
```

### 3.6 完整示范(用户邀请流)

完整 `spec.md` / `plan.md` / `tasks.md` 样例已移到按需参考的 [`docs/examples/full-feature-artifact.md`](examples/full-feature-artifact.md)。正文只保留规则与协作 SOP,避免示例中的路径、接口和技术选择被误当成默认值。

<a id="365-phase-a填-todos-的-ai-协作-sop"></a>
### 3.6.5 Phase A:填 TODOs 的 AI 协作 SOP(主会话用 ── primary mode)

**本节是 conversational fill 的 primary mode SOP**:`/feature-init` 先在主会话完成 Impact/
Necessity Preflight 和所有会改变 scope、ownership、authorization、data disposition 或 release
coupling 的高影响决定,再创建并预填 spec/plan/tasks scaffold。创建后只保留不改变契约的低层 TODO,
由 user 与 AI 按本节继续填(spec.md §1 Outcomes / §2 Scope "不做" / §3 Constraints / §4 Verification /
plan.md Delivery Shape Baseline / §1.1 Sibling Alignment / §2 架构决策 / §3 Prior decisions / tasks.md
任务清单等)。AI 应**读本节后按规则引导**,不依赖事后 quality-check 才发现根本方向错误。

> **本节既适用 `/feature-init` materialization 前后的 conversational fill,也适用主会话非-skill context 的纯人 + AI 协作填**。
> Plugin 不使用固定问卷:只对实际阻塞的高影响未知项一次问一个问题;低层实现细节可在 artifact 中保留 TODO。

#### 顺序:按节依次填,不跳

```
§1 Outcomes(场景)→ §3 Constraints → §4 Verification → §2 Scope 末轮补"不做"
```

> 数据模型 / API 契约 / 架构细节属 plan.md(HOW),不在 spec.md(WHAT);见 §3.1。

**为什么 §2 末轮补**:用户走完 §1/§3/§4 才知道 scope 真实边界,**此时问"什么不做"答得最准**。

#### 每节用 §3.7 quality 标准作引导问题

| 填的节 | AI 引导问题(对应 §3.7 哪条质量标准)|
|---|---|
| §1 Outcomes | "具体场景?谁在哪做什么、看到什么?边界 case?"(→ §3.7 Q4 具体度)|
| §3 Constraints | "真约束还是希望?如'希望快'→量化成'P95 < 200ms'"(→ §3.7 Q5 真假)|
| §4 Verification | "怎么机验?本次最关键的成功与错误路径是什么?用哪个最小测试层级就能证明主要风险?"(→ §3.7 Q3 可测)|
| §2 Scope(末轮)| "现在你知道边界了——**显式不做**哪些?至少列 2-3 条"(→ §3.7 Q2 必有"不做")|
| Delivery Shape Baseline | "谁现在使用?影响哪些责任区域/契约/数据/授权/迁移/发布?哪些新状态/API/管理能力没有当前 consumer?什么发现会触发暂停?"(→ §3.7 Q7c/Q7d)|
| Large/extra-large 实施顺序 | "哪些合同切片能在依赖工作开始前独立检查?每片关闭什么责任/契约/状态/用户路径,下一个 consumer 和最小 focused evidence 是什么?"(→ §3.7 Q7a/Q7d)|

#### 每节填完做 1 行确认

"§N 已填:<总结>。OK 进下一节?"

#### 用户不确定某节技术选型时

→ 只有当当前外部证据会实质影响选型时,AI 才建议使用 `tech-researcher`(可用 sub-agent,也可由主会话完成);不要为了覆盖 Agent 而调度,也不要替用户决定。

#### 末尾提示

先判断 plan 是否形成架构/模块边界、持久跨 feature 技术决定或取代既有 ADR。命中 `ADR_REQUIRED`
才从 plugin 模板实例化 ADR 并在 plan 引用;未命中 ADR 但属于非显然选择、外部解释、冲突/
bundled-risk 或 supersede 的决定才在 Prior decisions 写 why/source,普通实现细节不逐项记账。然后
提示:"全部填完。建议跑 `/project-workflow:spec-quality-check` 做 pre-impl gate 验证。"

#### 这跟 /spec-revise 的区别

| 维度 | Phase A AI 协作填 | /spec-revise(State 4 修订)|
|---|---|---|
| Spec 状态 | Draft → Filled(见 [§3.8](#38-spec-编辑边界只有-1-条线)) | Frozen |
| ADR | 按 `ADR_REQUIRED` 条件创建 | 按 `ADR_REQUIRED` 条件创建 |
| `## 修订记录` | ❌ 无需 | ✅ 必须 |
| 跨文件同步 | 自然(初次写 plan/tasks 一并) | ✅ 必须 orchestrate |
| Skill? | ❌ 主会话 AI 读本节直接做(`/feature-init` materialization 前关闭高影响决定,物化后只补低层 TODO)| ✅ /spec-revise |

---

### 3.7 Spec/Plan 写完后的质量自检(7 问 checklist)

**何时跑**:`/feature-init` 生成骨架 + 你填完 spec.md / plan.md 后,**开始实施前**主动跑一遍。

**为什么必跑**:实施开始后才发现"输入不清晰" → 回炒成本是 spec 阶段修的 5-10 倍。这 7 个问题是 project-workflow 实证里**最常出错的 7 个位置**。

在 7 问之前,同一个 fresh reviewer 先做一次 **Requirements Reconciliation**。调用方把当前已接受
用户决定、适用 current truth/ADR/Issue 和真正需要来源追踪的 plan Prior decisions 组装成临时
Requirements Source Map。用户明确提供或确认的 spec 可直接按 section 引用,不把普通契约内容复制
到 plan,然后双向检查:

- requirements → artifacts:接受的 outcome、规则、约束、排除、fallback、supersede 是否都落入 spec/plan/tasks;
- artifacts → requirements:artifact 新增的业务语义、ownership/authorization/data state、持久 workflow
  或 scope commitment 是否由用户提供/确认、来自适用外部来源,或仍明确标成待接受决定,并具有当前必要性;
- 新决定明确取代旧决定后,旧语义是否仍残留在正文、Verification、tasks、fallback 或 migration;
- ownership、authorization、hierarchy、fallback、unknown-data、migration 规则是否经反例检查。

结果只有 `ALIGNED`、`MISMATCH`、`SOURCE GAP`。后两者都阻断实施;`SOURCE GAP` 只用于无法解析的
外部事实、冲突或 supersede 权威,不是普通 spec 没有重复 plan 行。它不是第 8 个问题、不是第二个
reviewer,也不新增 action。

| # | 问题 | 不通过的修法 |
|---|---|---|
| 1 | spec.md 最小集是否齐?(Outcomes / Scope / Constraints / Verification + plan.md 的 Prior decisions section / 模块影响 / Delivery Shape Baseline)?没有需追踪决定时是否显式 N/A?由 Git 历史或当前用户确认的 pre-3.11 active artifact 能否从 Scope + Constraints + Module Impact 唯一推导边界?| 新 artifact 缺的回去补;旧 artifact 只有来源或边界含糊时才修订,不为 schema 单独迁移 |
| 2 | spec.md §2 Scope 是否显式写了 **`做 / Include` 清单 + `不做 / Exclude` 清单两份**?| **必写"不做"** —— 不写 AI 会自动加,scope creep 最大单一来源(见 [workflow.md §7.5](workflow.md#75-不要让-specmd-和-planmd-内容混淆)) |
| 3 | spec.md §4 Verification 是否用最小、非重复的证据义务覆盖主要行为/风险?矩阵是否有交互、回归、发布或合规依据?用户可见 outcome 是否在现有义务中恰好标一个 `Primary flow`?| 不可测的改成可测;同一证据能覆盖的义务合并;无依据矩阵删掉或收敛;主流程零个/多个则收敛为一个,不新增义务 |
| 4 | spec.md §1 Outcomes 是不是**具体场景**而不是模糊愿望?| "提升用户体验"→模糊;"用户邀请流 < 3 次点击完成"→具体 |
| 5 | spec.md §3 Constraints 是**真约束**还是 wish list?| "必须 Vue 3"→真约束;"希望响应快"→wish(扔掉或具体化:"P95 < 200ms")|
| 6 | plan.md §1.1 Sibling Alignment 是否填(涉及多模块时)?Codify 是否写明持久差量、来源和 root/tier/module/mechanical 精确落点?| 必填 Align/Deviate/Codify 三选一;Codify 不闭环则补落点和 tasks。嵌套 guidance 只写父级差量,普通 module 不为对称建文件 |
| 7a | tasks.md 是否按真正可独立实施、验证或 review 的边界拆分?| 笼统到隐藏多个决定时拆开;只是预计时长不同或每个 test case 不同则不要机械拆分 |
| 7b | 整个 artifact 是否仍是一个可独立演示、验收和回滚的交付结果?| 多个可独立交付结果且没有事务 / 契约 / 发布耦合 → 拆子 feature;接受合并交付时在 plan 既有的 Prior decisions 或风险小节写明结果、耦合/风险和决定来源。规模本身不改变 verdict |
| 7c | 每个新增持久状态、API、角色、工作流、管理面、队列或 runtime component 是否有当前 consumer,且当前 outcome 没有它就无法安全完成?| 只有未来可能性 → 删除或按用户意愿持久延期;不要用“更完整”代替当前必要性 |
| 7d | 新 artifact 的 Delivery Shape Baseline 是否完整记录当前 outcome/consumer、定性 delivery risk、预期责任区域、Contract/data/authorization/migration/release 信号、明确排除和 scope growth triggers?旧 artifact 是否有唯一可推导的 legacy boundary?| 高影响未知项先问清;large/XL 有可拆结果则拆,不可拆则写具体 coupling 和接受风险;旧 artifact 仅在边界不唯一时修订 |

**Gate 语义**:
- **Failed 项 > 0**:不要开始实施。先修 spec / plan / tasks,再重跑 quality check。
- **Failed = 0,但有 borderline**:可以进入实施,但要在 plan.md `## 4. 风险与未决` 或 tasks.md 实施记录里写清楚风险、接受理由和后续修法。
- **全部 pass**:进入实施。若当前请求已明确授权“检查通过就继续”,gate 同时把状态从 `草稿` 更新为 `已确认`;纯检查请求只报告结果。

7 问之外还有一组条件式 current-truth 检查:已有 domain doc 时检查 Domain References/Delta;没有则 N/A,不为了通过 gate 造空文档。ADR 仍按上节的规划判断创建,不属于本质量 gate 的独立硬门禁。

开始后才发现要回炒成本高 5-10x,所以 failed 项不能带进实现阶段。

**跟 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) 的关系**:本节是 **pre-implementation 自检**(便宜阶段),§3.5 是 **mid-implementation 修订**(贵阶段)。两者都不可省。

**Action**:[`spec-quality-check`](actions/spec-quality-check.md) 自动化本流程——机械检查(M1-M5)+ 同一
[`spec-quality-reviewer`](reviewers/spec-quality-reviewer.md) 先做 Requirements Reconciliation,再做主观
7 问(Q3/Q4/Q5/Q7a/Q7b/Q7c/Q7d)。在 dispatch boundary,Claude 必须用 named agent、Codex 必须用
general subagent;只有调度不可用/失败或无容量时才由主会话按同一 reviewer spec fallback,并记录原因。
缺执行证据 fail closed。**实施前 gate**——pass / borderline / fail 三档 verdict + 修法建议;
reconciliation 的 `MISMATCH`/`SOURCE GAP` 或其他 failed 都阻断实施,borderline 需要显式记录风险。

---

### 3.8 Spec 编辑边界(只有 1 条线)

spec.md 编辑规则**只看 1 个问题**:**是否已经开始依据它实施?**

| 状态 | 编辑规则 | 工具 |
|---|---|---|
| **尚未开始 impl** | **自由编辑**(用户 + AI 主会话 iterate) | [`feature-init`](actions/feature-init.md) / [§3.6.5 Phase A SOP](#365-phase-a填-todos-的-ai-协作-sop)/ [`spec-quality-check`](actions/spec-quality-check.md) |
| **已开始 impl** | **必走 SOP**(`## 修订记录` 节追加 + 跨文件同步;满足 `ADR_REQUIRED` 时加 ADR)| [`spec-revise`](actions/spec-revise.md) |

**为什么这条边界**:spec 是契约。没人基于它写代码时,改是无成本的;基于它写过代码后,改 = 撕毁契约 → 必须留下变更记录(`## 修订记录`)并跨文件同步(plan / tasks / 可能 module AGENTS.md)。ADR 只承载真正持久的架构/模块边界、跨功能技术决定或既有 ADR 的取代关系,不是每次修订的收据。

**反模式**:把实施前的 iteration 当 frozen 后修订处理(走完整 revision 流程),或给每次 frozen 修订无条件起 ADR → ceremony 过度,spec 反而难起步。Git commit 只是版本控制动作,不是契约边界。

**关于 spec.md 状态字段**(`> 状态: 草稿 / 已确认 / 已实现`,template 默认有):是**业务流程标签**,跟本节编辑边界**正交**。**草稿** = 仍可自由迭代;**已确认** = 用户接受并开始实施,契约冻结;**已实现** = 契约已被代码兑现(spec 自身的兑现标记,不是部署状态)。部署 / 上线状态由 CI / 部署系统跟踪,不在 spec 上标(故无"已上线")。交付后的生命周期状态(已取代 / 已废弃)与物理归档见 [§5.1](#51-生命周期状态全集--物理归档)。

> **谁翻**:`feature-done` 给 READY 时翻(契约兑现的判定点;重跑幂等)。只动状态标记不动契约,不走修订 SOP。

<details>
<summary>(细化命名,仅作工程参考——操作只看上面 1 条边界)</summary>

| 细化状态 | 何时 |
|---|---|
| Draft | `/feature-init` 刚生成,有 `{{TODO}}` |
| Filled | TODOs 填完,未 quality-check |
| Validated | `/spec-quality-check` 7 问通过 |
| Frozen | 用户已接受并开始依据它实施 |
| Revised | 经过至少一次 `/spec-revise` |

Draft / Filled / Validated **本质同档**(自由编辑);Frozen / Revised **本质同档**(走 SOP)。
</details>

---

## 4. AI 协作中的 spec 用法

> **跟 [workflow.md §3 P2 Feature Development](workflow.md#3-p2feature-development每个功能) 的关系**:
> §3 是 P2 阶段的**流程**(规划 / 实现 / 交付 / 修订),本节是 spec **文件本身在协作中怎么用**(喂给 AI / 实施中如何处理 / AI 跑偏怎么办)。两者互补:§3 管"什么时候做什么",本节管"具体跟 spec 文件怎么交互"。

### 4.1 怎么把 spec 喂给 AI

**正确做法**:新 session 第一句:

```
请先阅读 docs/specs/changes/002-invitation/spec.md 和 plan.md,然后从 tasks.md 第 1 条开始实现。
```

**错误做法**:把内容复制到 prompt 里。

**为什么**:文件路径让 AI 直接读最新版本;复制的内容会变成 stale 副本(你后续改了文件,prompt 里还是老的)。
**进阶**:不同阶段给不同文件 —— 评审阶段只给 `spec.md`,实施给 `spec.md + plan.md + tasks.md`,reviewer 检查给三份齐全。

### 4.2 实施中如果发现错

> **快查表** —— spec.md 修订(中 / 大档)的完整 SOP(`## 修订记录` 节 + 跨文件同步;符合 `ADR_REQUIRED` 时加 ADR)在 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办)。本表只回答"落在哪个文件"+"严重度分档"。

| 错的程度 | 落在哪个文件 | 怎么处理 |
|---|---|---|
| **小**(漏了一个需要持久 why/source 的 prior decision) | `plan.md` §3 Prior decisions | 当场追加,告诉 AI 重新读 plan.md;无需走 §3.5 SOP |
| **小**(临时方案、补丁) | `tasks.md` 实施记录 | 写一行,不改 spec/plan;无需走 SOP |
| **中**(plan 选型 / 模块边界 需调整) | `plan.md`(可能含 module AGENTS.md)| **走 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) SOP**(修订记录 + 跨文件同步;模块边界变化满足 `ADR_REQUIRED`);若涉模块边界变化,加走 [§2.6](workflow.md#26-module-中途变更feature-实施中发现边界要调整) |
| **大**(scope / outcomes 实际跟想做的不一样) | `spec.md` § 1/2(经 SOP)| **走 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) SOP**;若大到 outcomes 跑偏,起新功能目录 `<NNN+1>-<slug>/` 引用旧的(见 §5) |
| **Scope delta**(出现未声明持久状态/API/角色/工作流/管理面/队列/runtime/Provider/迁移/授权/发布边界) | 先对照 Delivery Shape Baseline | 立即停实现并分类:`necessary-detail` 留在原 outcome;`contract-correction` 走 `/spec-revise`;`separable-outcome` 拆 child;`speculative-capability` 删除/延期;`bundled-risk` 需具体 coupling + 用户接受 |

这里的“立即停”发生在继续为 delta 写生产代码、测试、migration 或兼容层之前。AI 先报告 delta、baseline
差异、当前必要性和推荐的删除/收窄/child/revise 方向;只有方向确需用户决定时才一次问一个问题并等待。
同一 outcome/baseline 内的 `necessary-detail` 或保持契约的更简单实现直接继续,不制造无意义确认。
已经写出的代码/测试不构成收编理由;full lane 也不例外。

Large/extra-large feature 在 plan §5 使用少量合同切片；切片转换与 context/session 恢复按
[`feature-init`](actions/feature-init.md#implementation-continuation-check) 执行静默 Continuation Check，
一致就继续，material mismatch 才触发 Scope Stop。
切片按可检查合同边界,不按 tier、目录、文件、测试层/case 或预计工时机械划分。
这约束的是切片边界,不是切片内部的真实依赖顺序。

测试遵循“最小充分证据”:每个新增 test layer、matrix、fixture 或 case 必须覆盖现有更便宜证据没有覆盖
的实质风险,或满足项目/发布约定。一个 evidence 可覆盖多个义务;优先扩展最近且清晰的已有测试,删除
已取代行为的测试并合并重叠 case。测试数量、层级对称和穷举 inventory 不提高 verdict。

### 4.3 AI 容易跑偏的两种场景

| 场景 | 根因 | 应对 |
|---|---|---|
| AI 主动加超出范围的功能 | `spec.md` 没写"不做" | 必填 §3.3 Scope boundaries 的"不做"部分 |
| AI 在开发中不断收编新状态/API/模块 | plan 没有 Delivery Shape Baseline / growth triggers | 触发即停,按 Scope delta 五分类处理;已经写了代码不构成收编理由 |
| AI 在实施中反复猜 | spec/plan 写得抽象 | 把 §3.3-3.5 的好/坏对照内化,自检一遍 |
| Large/extra-large 到端点才发现合同缺口 | plan §5 只有 tier/file 步骤,切片间未重读接受边界 | 改为合同切片;依赖切片前/恢复实施时做静默 Continuation Check,一致继续,material delta 才 Scope Stop |

---

## 5. Spec 生命周期

按文件区分,因为三个文件生命周期不同:

| 阶段 | spec.md | plan.md | tasks.md |
|---|---|---|---|
| **草稿** | ✅ 自由改 | ✅ 自由改 | ✅ 自由改 |
| **已确认**(开始实施) | **🔒 冻结**;真实契约错误走 `/spec-revise`;若 Outcomes 方向已变则起新功能目录 | ✅ 可补充 prior decisions;实质架构/模块变更走 `/spec-revise` | ✅ 持续更新进度 + 实施记录 |
| **已实现**(契约兑现) | 🔒 原则只读;仍在 active 且发现重大契约/plan/Verification 遗漏时只可由 `/spec-revise` 正式重开;已归档则永久只读 | 🔒 同左 | ✅ 标 done;正式重开时旧 Proof Bundle 原样保留为 superseded evidence |

> 无「已上线」阶段 —— 部署不在 spec 跟踪(见 [§3.8](#38-spec-编辑边界只有-1-条线))。

### 5.1 生命周期状态全集 + 物理归档

`已实现` 只说明"契约当时被兑现了",**不等于"仍是当前产品基线"**。长周期产品域(dashboard / IA / 报表流 / assistant 等)会积累多份 spec,后来的方向修正会让早先的 spec 过时——它们仍然是历史事实,但不能再当实施依据。状态全集(5 个):

| 状态 | 含义 | 能否指导新实施? | 谁来标 |
|---|---|---|---|
| `草稿` | 仍在迭代 | 否 | `/feature-init` 创建时默认 |
| `已确认` | 用户接受,实施开始,契约冻结 | ✅ 本 feature | 用户明确授权;可由 READY gate 消费“通过就继续”的条件授权 |
| `已实现` | 契约被代码兑现;若仍未归档,重大契约/plan/Verification 遗漏可经 `/spec-revise` 退回 `已确认` | 仅作历史;正式重开后恢复为本 feature 指引 | `feature-done` READY 时 |
| `已取代`(superseded) | 方向被后续 spec / ADR / current truth 替代 | ❌ | `feature-archive` / `spec-reconcile` |
| `已废弃`(abandoned) | 方向错误或不再需要,中途停止 | ❌ | `feature-archive` / `spec-reconcile` |

**物理归档是主机制,状态标记是辅助**:`docs/specs/changes/` 只放**进行中**的变更;交付收尾时用普通目录移动将整目录放进 `docs/specs/changes/archive/`(`/feature-archive` 默认清扫模式批量处理,full lane / light lane 一视同仁)。普通移动同时兼容 tracked/untracked artifact,Git 在提交时仍可识别 rename。理由:检索工具(grep / glob)尊重目录边界,不读文件顶部的状态行——只靠就地标记,agent 搜关键词照样命中旧 change 正文。目录隔离 + AGENTS.md 一行"检索现状排除 changes/archive/",才是机械可靠的注意力防线。

**重开边界**:`已实现` 不是日常可编辑状态。只有 feature 仍在 active tree、尚未归档且发现会改变交付判断的重大契约、plan 或 Verification 遗漏时,才能运行 `/spec-revise`:保留旧 receipt、退回 `已确认`、修订后重新走交付门禁。若契约不变而实现回归,修复实现并显式重跑 `feature-done`;由端点保存旧 receipt、写新 verdict,非 READY 时退回 `已确认`。已进入 `archive/` 的 feature 永久只读,后续变化必须建立 successor change。

**标记规则**:改状态标记 + 在文件顶部加一行指向替代物(新 spec / ADR / `docs/specs/<area>.md`)的链接,**不改正文、不删目录**。没有"历史基础"这类中间状态——若旧 spec 里的数据模型 / API / 基础设施仍有效,把这些**事实提炼进 `docs/specs/<area>.md`**,spec 本身照常归档;把旧 spec 留在活动区当参考,正是历史污染的入口。

### 5.2 Current truth(E 类,产品域现状)

`docs/specs/<area>.md` 回答"这个产品域**现在**怎么工作";feature spec 回答"这**一次** tracked change 想做什么"。两者分工:

- **何时创建**:P0 `project-init` 只创建 `docs/specs/index.md`;`feature-init` 只读取已有实质 area doc,不创建 E 类正文。首个 READY greenfield feature 由 `/feature-archive` 把持久结论沉淀成 `docs/specs/<area>.md`;retrofit 的历史冲突修复可由 `/spec-reconcile` 建立或修正 current truth。
- **谁维护**:`feature-done` 的 current-truth check 发现持久行为变更 → receipt 标 `update pending` → `feature-archive` **必须**基于当前状态 merge 回 `docs/specs/<area>.md`。
- **内容标准**:简洁、面向未来(现状是什么),不写演进史(那是 archive + ADR 的事)。**替换式维护**:合并 = 改写相关段落、删被推翻的旧句,不追加堆叠;单文件目标约 **150 行**左右,明显超过时检查是否该拆域或删过时细节;复杂 domain 只要内容仍是当前态、结构清晰、有用,可以超过。行为事实链接该域有效 ADR("为什么"一跳可达),不复述论证。
- **新鲜度自声明**:标题下第一行固定为 `> 最后核对:YYYY-MM-DD`,每次合并更新。feature 编号 / 来源写进 archive note、proof bundle 或 commit message,不要写进 E 类文件头部。过时的核对日期是可见的怀疑信号——绕过 feature 管线的改动无法被机制抓住,但至少让读者知道该打折扣。
- **change spec 引用 domain doc**:brownfield **必须** `## Domain References` + `## Delta`;greenfield 首次归档时由 `/feature-archive` 创建/更新 `docs/specs/<area>.md`,防重新定义整域。

可选辅助:`docs/specs/changes/index.md` 平铺列出全部 feature(编号 → 标题 / 状态 / 位置),让指向已归档 spec 的旧链接可解析。它是索引不是替代——注意力防线靠 archive/ 目录隔离,不靠这份清单。

### 变更需求 = 起新功能目录

**不要改老 `<NNN>-<feature>/spec.md`**,起一份新功能目录引用旧的:

```
docs/specs/changes/
├── archive/
│   └── 002-invitation/     # 老变更已交付收尾,整目录归档(内容保持冻结)
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
└── 005-invitation-quota/   # 新变更目录(进行中,留在活动区)
    ├── spec.md             # 第一段写"基于 002-invitation,本变更增加 X"
    ├── plan.md
    └── tasks.md
```

新功能 `spec.md` 顶部:

```markdown
# 005 invitation-quota — Spec

> 基于 `002-invitation`,本功能增加管理员对团队的邀请配额管理。
> 与 002 的关系:002 的 Scope.不做 显式排除了配额,本功能解除该限制。
```

**为什么不改老 spec**:
- 老 spec 是"当时为什么这么做"的历史快照,改了就丢了
- 多人协作场景避免冲突
- git log 不能完全替代 —— spec 是设计意图,代码 diff 不是

**反向标记别漏**:新 spec 引用老 spec 只是前向链接;若新 feature **取代**了老 spec 的方向(不只是叠加),交付后要给老 spec 标 `已取代` + 顶部替代链接,并随归档移入 `docs/specs/changes/archive/`(§5.1),否则老 spec 在未来 agent 眼里仍像有效基线。这一步由 `/feature-archive` 或 `/spec-reconcile` 完成。

---

## 6. 反模式

### 6.1 把 spec.md 写成 todo list
**症状**:`spec.md` 里塞 task,`tasks.md` 反而稀薄
**后果**:AI 把 spec 当步骤手册,失去对"目标"的理解
**修正**:`spec.md` 只写 WHAT(目标/边界/约束/验收),task 在 `tasks.md`

### 6.2 应持久追踪的 Prior decision 未记录
**症状**:非显然选择、外部解释、冲突/bundled-risk 或 supersede 决定没有 why/source,AI 在实施中反复重新讨论已经定好的事
**后果**:每次新 session 重新对齐,迭代成本暴涨,或无法判断旧决定是否已被取代
**修正**:只把上述决定**当场**追加到 `plan.md` §3,带原因和稳定来源。普通 spec 契约不复制;确实没有此类决定时写 `N/A(no durable why/source decision)` 不属于反模式

### 6.3 Outcomes 写成 user story
**症状**:`spec.md` Outcomes 用"As a X I want Y so that Z"
**后果**:AI 知道 want 不知道场景细节
**修正**:用真实场景描述(谁、在哪、做什么、看到什么)

### 6.4 改老功能 spec 而不起新目录
**症状**:在 `002-invitation/spec.md` 上加新需求
**后果**:历史决策丢失,无法追溯"当时为什么这么定"
**修正**:老目录冻结,变更起新功能目录引用

### 6.5 spec 写完不让 AI 直接读
**症状**:一边告诉 AI"按 spec 实现",一边粘贴部分内容到 prompt
**后果**:AI 看到的是 stale 子集
**修正**:让 AI 直接读 spec/plan/tasks 三文件,不要复制

### 6.6 用功能 spec 替代项目级 AGENTS.md
**症状**:每个 `spec.md` 都重复说项目栈、命名约定、目录结构
**后果**:spec 臃肿,重复信息出错时多处要改
**修正**:项目级常识进 `AGENTS.md`;Claude Code 通过 `CLAUDE.md` 1 行 alias 读取同一内容。spec 只写本功能特异的内容。

### 6.7 spec.md 和 plan.md 内容混淆
**症状**:用户场景写在 plan,技术架构写在 spec
**后果**:评审看错文件,变更冻结失效
**修正**:WHAT 进 spec(用户视角),HOW 进 plan(技术视角);**评审者只看 spec.md**

---

## 7. 维护工具

运行时入口和精确职责不在本文重复。按生命周期使用 [`feature-init`](actions/feature-init.md) → full lane 的 [`spec-quality-check`](actions/spec-quality-check.md) → [`feature-done`](actions/feature-done.md) → 同任务立即或凭稳定 receipt 周期性执行 [`feature-archive`](actions/feature-archive.md);只有契约实质变化、历史 spec 冲突或 A 类约定 drift 时,才分别使用 [`spec-revise`](actions/spec-revise.md)、[`spec-reconcile`](actions/spec-reconcile.md) 或 [`agents-md-revise`](actions/agents-md-revise.md)。完整入口表见 [`docs/actions/`](actions/README.md) 和 [`quickstart.md`](quickstart.md)。

---

## 8. 参考与延伸

- [GitHub Spec Kit](https://github.com/github/spec-kit) — 重型流派,可以读它的 spec 模板找灵感
- [How to write a good spec for AI agents — Addy Osmani](https://addyosmani.com/blog/good-spec/) — 轻量流派,本项目项目级 spec 的来源
- [Spec-Driven Development: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) — 学术视角,11 万 bug 数据来源
- [Spec-Driven Development with AI Coding Agents — amux](https://amux.io/guides/spec-driven-development/) — 实践综合
- [My LLM coding workflow going into 2026 — Addy Osmani](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e) — 怎么把 spec 喂给 AI 的实战
