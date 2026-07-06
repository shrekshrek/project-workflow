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
| **A. 约定** — 项目级常识 / Tier 级约定 / 模块级反常 / 路径级 topic 详规则 | 根 `AGENTS.md` + tier `<tier>/AGENTS.md` + 模块 `<module>/AGENTS.md` + path-scoped rules(Claude materialization 为 `.claude/rules/*.md`) | §2 速查,详 workflow.md §1.3 |
| **B. 变更** — 功能级 change spec / plan / tasks | `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` | **§3 起本文档主题** |
| **C. 决策** — 架构选择 + trade-off | `docs/adr/NNNN-<title>.md` | 不在本文档,见 workflow.md §1.8 |
| **D. 工具基础设施** — hook / lint / settings | `.claude/{hooks,settings.json}` + `.gitignore`(`.github/` 模板默认不预置,见 workflow.md §1.9) | 不在本文档,见 workflow.md §1.6 / §1.7 |
| **E. 产品事实** — 长周期产品域的当前现状 | `docs/specs/<area>.md`(可选 `docs/specs/index.md` 域索引) | **§5 生命周期部分**(current truth 与 spec 状态的关系) |

> "Tier" 概念详见 [workflow.md §0.3](workflow.md#03-概念区分钉死再读后续)。简言之:**全栈/多端项目的架构性分层**(前后端、客户端服务端等);单 tier 项目不存在这层。

---

## 1. 业界三流派(选一个心智模型)

> **本节范围**:仅 spec/plan/tasks(**B 类任务**)的写法流派。**C 类决策(ADR)** 自成一派(Michael Nygard 2011),见 [workflow.md §1.8](workflow.md#18-adr-目录初始化);**A 类约定(AGENTS.md)** 见 [workflow.md §1.3](workflow.md#13-agentsmd-的内容标准)。

| 流派 | 代表 | 形态 | 适合谁 |
|---|---|---|---|
| **重型** | [GitHub Spec Kit](https://github.com/github/spec-kit) | `.specify/specs/<NNN>/{spec,plan,tasks}.md` + 6 个 slash commands | 大团队、流程纪律强 |
| **轻量** | [Addy Osmani agents.md](https://addyosmani.com/blog/good-spec/) | 根目录单文件六要素 | 单人/小团队、要灵活 |
| **学术** | [SDD: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) | spec 是契约,代码是契约的实现 | 高合规、强保证场景 |

### 本项目采用混合

- **项目级约定**(A 类):agents.md 风格 → 根 `AGENTS.md`(workflow §1.3)
- **变更级 artifact**(B 类):Spec Kit 简化版 → `docs/specs/changes/<NNN>-<slug>/`(全道三件套;轻车道仅 `tasks.md`)
- **架构决策**(C 类):Michael Nygard ADR 模板 → `docs/adr/`(详见 workflow.md §1.8,本文档不展开)
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
- 项目周期内**最低频更新**(明显低于 tier / 模块级 AGENTS.md);3 层频率梯度详见 [workflow.md §5.0 三层 AGENTS.md 的更新频率梯度](workflow.md#50-三层-agentsmd-的更新频率梯度)
- 六要素(Addy 框架):Commands / Testing / Project Structure / Code Style / Git Workflow / Boundaries
- Boundaries 三档:✅ Always / ⚠️ Ask first / 🚫 Never
- 嵌套层次:**用户 / 项目根 / 子目录(tier + 模块)/ 私有**(详细见 [workflow.md §1.4](workflow.md#14-agentsmd--claudemd-嵌套层次子级覆盖父级);系统级 `/etc/claude-code/CLAUDE.md` 为企业 IT 场景,project-workflow audience 不覆盖)
- 模块级 AGENTS.md(`<module>/AGENTS.md` + 1 行 `CLAUDE.md` alias)是**可选**,仅模块"反常"时才写(见 [workflow.md §2.3](workflow.md#23-反常判定何时该写模块-agentsmd))
- path-scoped rules 是 A 类 peer to AGENTS.md(workflow.md §0.3 / §1.3),不在嵌套层次表里;Claude adapter materialization 为 `.claude/rules/*.md` + `globs:` frontmatter

维护工具:[`/project-workflow:agents-md-revise`](../skills/agents-md-revise/SKILL.md) —— P4 主动 refresh A 类约定全集(AGENTS.md 嵌套 + path-scoped rules)。

---

## 3. 变更级 artifact(`docs/specs/changes/<NNN>-<feature>/`)

> **写 spec 前先看**:[§3.8 Spec 编辑边界](#38-spec-编辑边界只有-1-条线) —— 是否已 git commit + 实施开始,决定 spec.md 能否直接改 vs 必走 SOP。这条边界规则是 §3 全章的前置假设。

需要追踪的 feature 一个**目录**。全道使用 spec / plan / tasks 三件套;轻车道只使用 tasks.md。模板由 [`/feature-init`](../skills/feature-init/SKILL.md) 提供,项目本地默认不持有。

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

不是所有任务都应该启动 project-workflow。无需新 artifact 的任务不是一条 lane,而是直接不调用 `/feature-init`:小 bugfix、文案、样式、局部测试修复、低风险文档编辑,以及已确认 spec 下的实施任务,直接做并说明验证结果。直接做仍必须遵守 `AGENTS.md` / path rules,并跑相关 lint / type / test / hook。

**行为变更下限**(上述"直接做"的例外):改变 `docs/specs/<area>.md` 已声明的用户可见行为或持久规则(默认值 / 校验上限 / 重试策略 / 状态流转)时,无论 diff 多小**至少走轻车道**——current truth(§5.2)的唯一写入口在管线上,多次"太小不值得走流程"的行为改动累积绕过,它就静默过时了。未被 domain doc 声明的局部行为小改不因此强制进 project-workflow;照常直接做,最后说明验证结果。

一旦决定需要 artifact,才进入 `docs/specs/changes/<NNN>-<slug>/`,正式 artifact lane 只有两条:

| Lane | Artifact | 适用 |
|---|---|---|
| **Light lane** | `tasks.md` | 小而内聚、有验证/风险记录价值,但无 frozen spec / plan |
| **Full lane** | `spec.md + plan.md + tasks.md` | API/DB/security/auth/permissions/multi-tenant/data migration/跨模块契约/架构/用户承诺变化、新模块、高爆破半径路径 |

**Light lane 判据**(`/feature-init` Step 4.5 自动判,3 道 trip 全 yes 才 light):

| 轴 | 全 yes 才轻车道 |
|---|---|
| 规模 | ≤ ~1 个内聚模块 / 单一职责范围,无新模块;文件数只作辅助信号,不是硬阈值 |
| 可逆性 | additive / bugfix / polish,非数据迁移 / API 或 schema 契约变更 |
| 爆破半径 | 不触达项目声明的灾难性不变量路径(项目在根 AGENTS.md 声明) |

**不确定时分级**,不要一律 full:

- 不确定是否影响 API / DB / security / auth / permissions / multi-tenant / data migration / 跨模块契约 / 高爆破半径 → **Full lane**
- 不确定 UI 文案 / 样式 / 组件拆分 / 局部 refactor 形状 / 测试写法 → 不因此升级 Full;可直接做或 Light lane
- 不确定业务目标 / user-visible outcome → **先问用户**,不建 artifact

**为什么这条边界**:三件套对小改是过度仪式(同 [workflow.md §7.4](workflow.md#74-不要为了用-ai-拒绝键盘改-5-行代码) 的精神);同一模块内即使碰到 2-4 个配套文件,只要可逆、无契约变化、无高爆破半径,也可以轻车道。**砍的是文档仪式,不是验证** —— 轻车道仍保留 `## 验证`(spec §4 等价)+ Proof bundle,仍跑 L1 + L2 + proof(L3 因无 frozen spec 跳过)。

**组合规则**:多个相关小改应合成一个中等 feature,不要碎 spec。例如不要开 "按钮状态"、"表格列"、"详情抽屉" 三个 spec;应开一个 `workflow-run-history` feature。

**两道安全闸**(防轻车道变逃生舱):
1. **高风险保守**:3 道 trip 任一 no,或不确定是否触达高风险项 → 全道;分类只在 feature-init 发生,**开工后不重判**。
2. **事后反核**:`feature-done` 的 proof bundle 装配步骤对轻车道 feature grep 实际 diff vs 项目声明的不变量路径;命中 → 报"误分类,应走全道"(治"自报不碰不变量但实际碰了",如 014 式 backfill)。

**升级**:直接实施或轻车道中发现触达 API / DB / security / multi-tenant / evidence/data invariants / 跨模块契约 / 高爆破半径 → 停,补 light/full artifact;若需 frozen spec,重跑 `/feature-init` 选全道补 spec.md。

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

#### Verification:具体、可执行

| 好 ✅ | 坏 ❌ |
|---|---|
| 单测:invitation service 的过期/重复使用/token 伪造场景<br>集成:POST /invitations + 邮件 mock + GET<br>手测:实际发邮件给自己,完整跑一遍 | 测试覆盖率 80% |

**为什么**:覆盖率不等于覆盖**关键场景**。

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

#### Prior decisions:**带"为什么",当场写回**

| 好 ✅ | 坏 ❌ |
|---|---|
| 用 Resend 不用 SES:已有 Resend 账号,SES 要跑域名验证 | 用 Resend |

**为什么**:不带原因的决策,AI 在实施中遇到问题会**重新打开讨论**(`要不要换 SES?`)。带原因 = 关闭讨论。

**关键纪律 —— 当场写回**:每次跟 AI 讨论中作出的技术决策,**立刻**追加到 plan.md §3。这一步常被忽略,但**消除中途反思最大的杠杆**。

#### 架构决策

简述本功能在系统里的形状:数据模型、API 契约、关键算法、状态管理选择。
不重复 spec.md(spec 写做什么,plan 写怎么做)。

#### 风险与未决

实施前已知的风险点 + 还没敲定但会在实施中决定的事。**让未决浮上来**,不要假装都想清楚了。

### 3.5 `tasks.md` 写法(STEPS,实时)

**包含 2 节**:任务清单 + 实施记录。

#### 任务清单:30 分钟到 2 小时颗粒度,后端先行

| 好 ✅ | 坏 ❌ |
|---|---|
| - [ ] migration: invitations 表(2h)<br>- [ ] backend: POST /invitations(2h)<br>- [ ] backend: GET 校验(1.5h)<br>- [ ] frontend: 邀请管理页(2h)<br>- [ ] e2e: 完整流(1h) | - [ ] 实现邀请功能(8h) |

**为什么**:粗颗粒让 AI "整体规划",容易把多个决策打包,错难定位。30 分钟到 2 小时是 **单 session 能完成 + 你能 review** 的甜区。

**后端先行**:见 [workflow §8.6](workflow.md#86-全栈项目的后端先行backend-first-tactic)。

#### 实施记录

实施过程中的偏差、补充决策、临时方案。**不改 spec.md;若 plan.md 有补充,在 plan.md 加注**。

```markdown
## 实施记录
- 2026-05-09: Resend API 限速比预期严,加了指数退避
- 2026-05-10: 邀请落地页路由调整为 `/i/<token>`(原 `/invite/<token>` 跟现有冲突)
```

### 3.6 完整示范(用户邀请流)

#### `docs/specs/changes/002-invitation/spec.md`

```markdown
# 002 invitation — Spec

> 创建于 2026-05-08 · 状态:已确认

## 1. Outcomes

管理员在团队设置页输入邮箱发邀请,被邀请者收到邮件、点链接 24 小时内可注册并自动加入团队。
管理员可以在管理页面看到所有未使用的邀请,可手动撤销。

## 2. Scope boundaries

**做**:
- 单邮箱邀请、邮件发送、链接过期、注册自动入队
- 管理页面查看 + 撤销未使用邀请

**不做**:
- 多渠道(SMS / Slack / 企业微信)、邀请配额、追踪 UI、批量邀请

## 3. Constraints

- 邀请 token 256-bit,HMAC-SHA256 签名(不是加密)
- 24h 过期,过期访问返回 410 Gone
- 同邮箱 24h 内最多发 3 次(速率限制)
- 邮件发送失败必须可重试 3 次

## 4. Verification

- 单测:invitation service 的过期/重复使用/token 伪造/速率限制四场景
- 集成:POST + 邮件 mock 验 payload + GET 验 token 解码
- 手测:真实邮箱发,完整 happy path
- 上线指标:发送成功率 ≥ 99%
```

#### `docs/specs/changes/002-invitation/plan.md`

```markdown
# 002 invitation — Plan

> 基于 spec.md

## 1. 模块影响范围

- `backend/src/invitations/` —— 新增模块
- `backend/src/users/` —— 改:加 `accept_invitation` 方法
- `backend/src/email/` —— 改:加邀请模板
- `frontend/layers/invitations/` —— 新增 layer
- `frontend/layers/teams/` —— 改:设置页加 form

## 2. 架构决策

- 邀请数据模型:`invitations(id, team_id, email, token_hash, expires_at, created_by, used_at)`
- 邀请链接走 frontend 路由 `/i/<token>` → 调 backend `GET /invitations/<token>` → 落地页注册流
- 注册时校验 token 并在事务里 join team

## 3. Prior decisions

- Resend 不选 SES:已有 Resend 账号,SES 要跑域名验证
- token 存 hash 不存原文(类似密码):泄露 db 不能复用
- 邀请链接经前端而非直打 backend:UX(401 跳登录易处理)

## 4. 风险与未决

- 风险:Resend 配额上限不够支撑大量邀请 → 上线后观察
- 未决:邀请邮件文案 → 实施时跟产品对一遍
```

#### `docs/specs/changes/002-invitation/tasks.md`

```markdown
# 002 invitation — Tasks

> 基于 spec.md + plan.md

## 任务清单

### 后端
- [ ] migration: invitations 表(2h)
- [ ] backend: POST /invitations + Resend(2h)
- [ ] backend: GET /invitations/<token> + 注册时校验(1.5h)
- [ ] backend: DELETE /invitations/<id> 撤销(0.5h)

### 前端
- [ ] 团队设置页:发邀请 form(1h)
- [ ] 邀请管理页:列表 + 撤销(1.5h)
- [ ] 邀请落地页:接受 → 注册流(1h)

### 验证
- [ ] e2e: 发→收邮件→点链接→注册→入队(0.5h)
- [ ] 单测覆盖 spec.md §4 的四个核心场景(0.5h)

## 实施记录

- (实施时填)
```

---

### 3.6.5 Phase A:填 TODOs 的 AI 协作 SOP(主会话用 ── primary mode)

**本节是 conversational fill 的 primary mode SOP**:`/feature-init` 创建 spec/plan/tasks scaffold(+ chat context pre-fill + mission-critical reminders + decision-completeness audit;**零强制 Q&A**)后,**所有 TODOs 由 user 在主会话跟 AI 对话填**(spec.md §1 Outcomes / §2 Scope "不做" / §3 Constraints / §4 Verification / plan.md §1.1 Sibling Alignment / §2 架构决策 / §3 Prior decisions / tasks.md 任务清单 等)。AI 应**读本节后按规则引导** ── 保证 quality 标准 inline 内化,**不依赖事后 quality-check 才发现问题**。

> **本节既适用 `/feature-init` Step 6.2 conversational fill 引导后用户走的对话路径,也适用主会话非-skill context 的纯人 + AI 协作填**。
> Plugin **不预设** Q&A 替用户填这些 ── feature 类型多样,固定 Q&A 不可能通用;conversational 模式让 AI 据 user 真实业务上下文自适应 fill。

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
| §4 Verification | "怎么机验?关键场景 + **错误路径** 401/404/422 的测试?"(→ §3.7 Q3 可测)|
| §2 Scope(末轮)| "现在你知道边界了——**显式不做**哪些?至少列 2-3 条"(→ §3.7 Q2 必有"不做")|

#### 每节填完做 1 行确认

"§N 已填:<总结>。OK 进下一节?"

#### 用户不确定某节技术选型时

→ AI 主动建议 dispatch `tech-researcher` sub-agent 调研,而不是替用户决定。

#### 末尾提示

"全部填完。建议跑 `/project-workflow:spec-quality-check` 做 pre-impl gate 验证。"

#### 这跟 /spec-revise 的区别

| 维度 | Phase A AI 协作填 | /spec-revise(State 4 修订)|
|---|---|---|
| Spec 状态 | Draft → Filled(见 [§3.8](#38-spec-编辑边界只有-1-条线)) | Frozen |
| ADR | ❌ 无需 | ✅ 必须 |
| `## 修订记录` | ❌ 无需 | ✅ 必须 |
| 跨文件同步 | 自然(初次写 plan/tasks 一并) | ✅ 必须 orchestrate |
| Skill? | ❌ 主会话 AI 读本节直接做(/feature-init Step 6.2 引导 user 走本路径)| ✅ /spec-revise |

---

### 3.7 Spec/Plan 写完后的质量自检(7 问 checklist)

**何时跑**:`/feature-init` 生成骨架 + 你填完 spec.md / plan.md 后,**开始实施前**主动跑一遍。

**为什么必跑**:实施开始后才发现"输入不清晰" → 回炒成本是 spec 阶段修的 5-10 倍。这 7 个问题是 project-workflow 实证里**最常出错的 7 个位置**。

| # | 问题 | 不通过的修法 |
|---|---|---|
| 1 | spec.md 六要素是否齐?(Outcomes / Scope / Constraints / Verification + plan.md 的 Prior decisions / 模块影响)| 缺的回去补 —— 这 6 节是 spec 契约的最小集 |
| 2 | spec.md §2 Scope 是否显式写了 **`做 / Include` 清单 + `不做 / Exclude` 清单两份**?| **必写"不做"** —— 不写 AI 会自动加,scope creep 最大单一来源(见 [workflow.md §7.5](workflow.md#75-不要让-specmd-和-planmd-内容混淆)) |
| 3 | spec.md §4 Verification 是否能**机械化**(写出 test 能覆盖 / API 能 curl 测 / 数据可断言)?| 不可测的改成可测;留"人眼判断"等于没 verification |
| 4 | spec.md §1 Outcomes 是不是**具体场景**而不是模糊愿望?| "提升用户体验"→模糊;"用户邀请流 < 3 次点击完成"→具体 |
| 5 | spec.md §3 Constraints 是**真约束**还是 wish list?| "必须 Vue 3"→真约束;"希望响应快"→wish(扔掉或具体化:"P95 < 200ms")|
| 6 | plan.md §1.1 Sibling Alignment 是否填(涉及多模块时)?| 必填 Align/Deviate/Codify 三选一;空着是 [§0.1 命题 3 Drift](workflow.md#01-这本手册解决什么) 空间维度漂移的源头 |
| 7 | tasks.md 是否拆到 **verifiable step**(每个 task 完成时有明确产物 / test 通过 / API 能调)?| 笼统的"实施 X 模块"→拆成"建 X/router.py + 写 happy-path test + 跑 curl 通"等可断言步骤 |

**Gate 语义**:
- **Failed 项 > 0**:不要开始实施。先修 spec / plan / tasks,再重跑 quality check。
- **Failed = 0,但有 borderline**:可以进入实施,但要在 plan.md `## 4. 风险与未决` 或 tasks.md 实施记录里写清楚风险、接受理由和后续修法。
- **全部 pass**:进入实施。

开始后才发现要回炒成本高 5-10x,所以 failed 项不能带进实现阶段。

**跟 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) 的关系**:本节是 **pre-implementation 自检**(便宜阶段),§3.5 是 **mid-implementation 修订**(贵阶段)。两者都不可省。

**工具**:[`/project-workflow:spec-quality-check`](../skills/spec-quality-check/SKILL.md) 自动化本 7 问 checklist——机械检查(M1-M5)+ dispatch [`spec-quality-reviewer`](../agents/spec-quality-reviewer.md) sub-agent 做主观二审(Q4 Outcomes / Q5 Constraints / Q7 verifiable)。**实施前 gate**——pass / borderline / fail 三档 verdict + 修法建议;failed 阻断实施,borderline 需要显式记录风险。

---

### 3.8 Spec 编辑边界(只有 1 条线)

spec.md 编辑规则**只看 1 个问题**:**是否已 git commit 到仓库 + 实施开始?**

| 状态 | 编辑规则 | 工具 |
|---|---|---|
| **未 commit** 或 **未开始 impl** | **自由编辑**(用户 + AI 主会话 iterate) | [`/feature-init`](../skills/feature-init/SKILL.md) Step 6 / [§3.6.5 Phase A SOP](#365-phase-a填-todos-的-ai-协作-sop)/ [`/spec-quality-check`](../skills/spec-quality-check/SKILL.md) |
| **已 commit 且开始 impl** | **必走 SOP**(ADR + `## 修订记录` 节追加 + 跨文件同步)| [`/spec-revise`](../skills/spec-revise/SKILL.md) |

**为什么这条边界**:spec 是契约。没人基于它写代码时,改是无成本的;基于它写过代码后,改 = 撕毁契约 → 需要决策审计(ADR)+ 变更记录(`## 修订记录`)+ 跨文件同步(plan / tasks / 可能 module AGENTS.md)。

**反模式**:把 commit 前的 iteration 改动当 frozen 后修订处理(起 ADR + `## 修订记录`)→ ceremony 过度,spec 反而难起步。**没 commit 前就是 draft,改它不算修订**。

**关于 spec.md 状态字段**(`> 状态: 草稿 / 已确认 / 已实现`,template 默认有):是**业务流程标签**,跟本节编辑边界**正交**。**草稿** = 仍可自由迭代;**已确认** = 用户接受并开始实施,契约冻结;**已实现** = 契约已被代码兑现(spec 自身的兑现标记,不是部署状态)。部署 / 上线状态由 CI / 部署系统跟踪,不在 spec 上标(故无"已上线")。交付后的生命周期状态(已取代 / 已废弃)与物理归档见 [§5.1](#51-生命周期状态全集--物理归档)。

> **谁翻**:`feature-done` 给 READY 时翻(契约兑现的判定点;重跑幂等)。只动状态标记不动契约,不走修订 SOP。

<details>
<summary>(细化命名,仅作工程参考——操作只看上面 1 条边界)</summary>

| 细化状态 | 何时 |
|---|---|
| Draft | `/feature-init` 刚生成,有 `{{TODO}}` |
| Filled | TODOs 填完,未 quality-check |
| Validated | `/spec-quality-check` 7 问通过 |
| Frozen | git commit + impl 开始 |
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

> **快查表** —— spec.md 修订(中 / 大档)的完整 SOP(ADR + `## 修订记录` 节 + 跨文件同步)在 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办)。本表只回答"落在哪个文件"+"严重度分档"。

| 错的程度 | 落在哪个文件 | 怎么处理 |
|---|---|---|
| **小**(漏了一个 prior decision) | `plan.md` §3 Prior decisions | 当场追加,告诉 AI 重新读 plan.md;无需走 §3.5 SOP |
| **小**(临时方案、补丁) | `tasks.md` 实施记录 | 写一行,不改 spec/plan;无需走 SOP |
| **中**(plan 选型 / 模块边界 需调整) | `plan.md`(可能含 module AGENTS.md)| **走 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) SOP**(ADR + 修订记录);若涉模块边界变化,加走 [§2.6](workflow.md#26-module-中途变更feature-实施中发现边界要调整) |
| **大**(scope / outcomes 实际跟想做的不一样) | `spec.md` § 1/2(经 SOP)| **走 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) SOP**;若大到 outcomes 跑偏,起新功能目录 `<NNN+1>-<slug>/` 引用旧的(见 §5) |

### 4.3 AI 容易跑偏的两种场景

| 场景 | 根因 | 应对 |
|---|---|---|
| AI 主动加超出范围的功能 | `spec.md` 没写"不做" | 必填 §3.3 Scope boundaries 的"不做"部分 |
| AI 在实施中反复猜 | spec/plan 写得抽象 | 把 §3.3-3.5 的好/坏对照内化,自检一遍 |

---

## 5. Spec 生命周期

按文件区分,因为三个文件生命周期不同:

| 阶段 | spec.md | plan.md | tasks.md |
|---|---|---|---|
| **草稿** | ✅ 自由改 | ✅ 自由改 | ✅ 自由改 |
| **已确认**(开始实施) | **🔒 冻结**,变更 = 起新功能目录 | ✅ 可补充 prior decisions / 调整架构 | ✅ 持续更新进度 + 实施记录 |
| **已实现**(契约兑现) | 🔒 只读 | 🔒 只读 | ✅ 标 done |

> 无「已上线」阶段 —— 部署不在 spec 跟踪(见 [§3.8](#38-spec-编辑边界只有-1-条线))。

### 5.1 生命周期状态全集 + 物理归档

`已实现` 只说明"契约当时被兑现了",**不等于"仍是当前产品基线"**。长周期产品域(dashboard / IA / 报表流 / assistant 等)会积累多份 spec,后来的方向修正会让早先的 spec 过时——它们仍然是历史事实,但不能再当实施依据。状态全集(5 个):

| 状态 | 含义 | 能否指导新实施? | 谁来标 |
|---|---|---|---|
| `草稿` | 仍在迭代 | 否 | `/feature-init` 创建时默认 |
| `已确认` | 用户接受,实施开始,契约冻结 | ✅ 本 feature | 用户(spec-quality-check 后) |
| `已实现` | 契约被代码兑现 | 仅作历史 | `feature-done` READY 时 |
| `已取代`(superseded) | 方向被后续 spec / ADR / current truth 替代 | ❌ | `feature-archive` / `spec-reconcile` |
| `已废弃`(abandoned) | 方向错误或不再需要,中途停止 | ❌ | `feature-archive` / `spec-reconcile` |

**物理归档是主机制,状态标记是辅助**:`docs/specs/changes/` 只放**进行中**的变更;交付收尾时整目录 `git mv` 进 `docs/specs/changes/archive/`(`/feature-archive` 默认清扫模式批量处理,全道轻车道一视同仁)。理由:检索工具(grep / glob)尊重目录边界,不读文件顶部的状态行——只靠就地标记,agent 搜关键词照样命中旧 change 正文。目录隔离 + AGENTS.md 一行"检索现状排除 changes/archive/",才是机械可靠的注意力防线。

**标记规则**:改状态标记 + 在文件顶部加一行指向替代物(新 spec / ADR / `docs/specs/<area>.md`)的链接,**不改正文、不删目录**。没有"历史基础"这类中间状态——若旧 spec 里的数据模型 / API / 基础设施仍有效,把这些**事实提炼进 `docs/specs/<area>.md`**,spec 本身照常归档;把旧 spec 留在活动区当参考,正是历史污染的入口。

### 5.2 Current truth(E 类,产品域现状)

`docs/specs/<area>.md` 回答"这个产品域**现在**怎么工作";feature spec 回答"这**一次** tracked change 想做什么"。两者分工:

- **何时创建**:P0 `project-init` 只创建 `docs/specs/index.md`;`/feature-init` 只有在已有实质当前事实可写时才创建新 area,否则 greenfield change 先不建 E;`/feature-archive` 在首个 READY greenfield feature 后把持久结论沉淀成 `docs/specs/<area>.md`。
- **谁维护**:`feature-done` Step 5.5 发现持久行为变更 → proof pending → `feature-archive` **必须** merge 回 `docs/specs/<area>.md`。
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

### 6.2 plan.md Prior decisions 留空
**症状**:AI 在实施中反复重新讨论已经定好的事
**后果**:每次新 session 重新对齐,迭代成本暴涨
**修正**:任何讨论中已定的技术选型,**当场**追加到 `plan.md` §3,带原因

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

按 feature 生命周期顺序,project-workflow ship 的工具:

| 任务 | 工具 |
|---|---|
| 起新 feature artifact | [`/feature-init <slug>`](../skills/feature-init/SKILL.md) —— 全道创建 `spec/plan/tasks`;轻车道只创建 `tasks.md` |
| spec 写完后质量自检(实施前 gate) | [`/spec-quality-check`](../skills/spec-quality-check/SKILL.md) —— 机械化 §3.7 7 问 + dispatch [`spec-quality-reviewer`](../agents/spec-quality-reviewer.md) 做主观二审 |
| spec / plan 实施中发现错 | [`/spec-revise`](../skills/spec-revise/SKILL.md) —— orchestrate [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) / [§2.6](workflow.md#26-module-中途变更feature-实施中发现边界要调整) SOP(ADR + `## 修订记录` + plan prior decisions + tasks rebalance) |
| 完成交付(实施后) | [`/feature-done`](../skills/feature-done/SKILL.md) —— 默认端点门禁:L1 / L2 / L3 / current-truth check / proof bundle 聚合成一个 READY / NEEDS WORK / BLOCKED verdict;局部复查 = 重跑本 skill 或主会话直接 dispatch [`spec-reviewer`](../agents/spec-reviewer.md) / [`agents-md-reviewer`](../agents/agents-md-reviewer.md) |
| 生命周期收尾(周期性清扫或单 feature) | [`/feature-archive`](../skills/feature-archive/SKILL.md) —— 合并持久结论进 `docs/specs/<area>.md`,已交付 feature 整目录移入 `docs/specs/changes/archive/`,被取代的老 spec 标 已取代/已废弃(§5.1) |
| 多 spec 漂移诊断(存量烂摊子 retrofit / 怀疑老 spec 误导实施时) | [`/spec-reconcile`](../skills/spec-reconcile/SKILL.md) —— 冲突矩阵 + 精选 source of truth + 生命周期修正 + 归档 |
| A 类约定(AGENTS.md 多层 + path-scoped rules)主动 refresh | [`/agents-md-revise`](../skills/agents-md-revise/SKILL.md) —— P4 主战场 |

**外部备选**(可选,跟 project-workflow 工具并存):
- GitHub Spec Kit `/speckit.clarify` —— Q&A 引导补全 spec(若装 Spec Kit)。project-workflow 的等价路径是主会话 conversational fill(§3.6.5),不需要单独 skill。

---

## 8. 参考与延伸

- [GitHub Spec Kit](https://github.com/github/spec-kit) — 重型流派,可以读它的 spec 模板找灵感
- [How to write a good spec for AI agents — Addy Osmani](https://addyosmani.com/blog/good-spec/) — 轻量流派,本项目项目级 spec 的来源
- [Spec-Driven Development: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) — 学术视角,11 万 bug 数据来源
- [Spec-Driven Development with AI Coding Agents — amux](https://amux.io/guides/spec-driven-development/) — 实践综合
- [My LLM coding workflow going into 2026 — Addy Osmani](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e) — 怎么把 spec 喂给 AI 的实战
