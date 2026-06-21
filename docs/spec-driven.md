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

**文档归属**(对应 [workflow.md §0.3 文档职责 4 类](workflow.md#文档职责-4-类总框架),本文档展开 B 类的细节):

| 类别 | 文件 | 本文档涉及? |
|---|---|---|
| **A. 约定** — 项目级常识 / Tier 级约定 / 模块级反常 / 路径级 topic 详规则 | 根 `AGENTS.md` + tier `<tier>/AGENTS.md` + 模块 `<module>/AGENTS.md`(均含 1 行 `CLAUDE.md` alias)+ `.claude/rules/*.md`(扁平 + globs 路径触发) | §2 速查,详 workflow.md §1.3 |
| **B. 任务** — 功能级 spec / plan / tasks | `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md` | **§3 起本文档主题** |
| **C. 决策** — 架构选择 + trade-off | `docs/adr/NNNN-<title>.md` | 不在本文档,见 workflow.md §1.8 |
| **D. 工具基础设施** — hook / lint / settings | `.claude/{hooks,settings.json}` + `.gitignore`(`.github/` 模板 v2 默认不预置,见 workflow.md §1.9) | 不在本文档,见 workflow.md §1.6 / §1.7 |

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
- **功能级 spec**(B 类):Spec Kit 简化版 → `docs/specs/<NNN>-<slug>/` 三文件(本文档 §3 起)
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
- 嵌套层次:**用户 / 项目根 / 子目录(tier + 模块)/ 私有**(详细见 [workflow.md §1.4](workflow.md#14-agentsmd--claudemd-嵌套层次子级覆盖父级);系统级 `/etc/claude-code/CLAUDE.md` 为企业 IT 场景,v2 audience 不覆盖)
- 模块级 AGENTS.md(`<module>/AGENTS.md` + 1 行 `CLAUDE.md` alias)是**可选**,仅模块"反常"时才写(见 [workflow.md §2.3](workflow.md#23-反常判定何时该写模块-agentsmd))
- `.claude/rules/*.md`(扁平 + globs 路径触发)是 A 类 peer to AGENTS.md(workflow.md §0.3 / §1.3),不在嵌套层次表里,靠 frontmatter 实现路径作用域

维护工具:[`/project-workflow:agents-md-revise`](../skills/agents-md-revise/SKILL.md) —— P4 主动 refresh A 类约定全集(AGENTS.md 嵌套 + `.claude/rules/`)。

---

## 3. 功能级 spec(`docs/specs/<NNN>-<feature>/`,三文件)

> **写 spec 前先看**:[§3.8 Spec 编辑边界](#38-spec-编辑边界只有-1-条线) —— 是否已 git commit + 实施开始,决定 spec.md 能否直接改 vs 必走 SOP。这条边界规则是 §3 全章的前置假设。

每个新功能一个**目录**,目录下三个文件,按生命周期分工。模板由 [`/feature-init`](../skills/feature-init/SKILL.md) 提供,项目本地默认不持有。

### 3.1 三文件分工

> 本表展开 [workflow.md §1.8 4 类对比表](workflow.md#18-adr-目录初始化) 中 **B 类(spec/plan/tasks)** 的内部分工。

| 文件 | 回答 | 内容 | 何时冻结 |
|---|---|---|---|
| `spec.md` | **WHAT** | Outcomes / Scope boundaries / Constraints / Verification | 评审通过后冻结,变更 = 起新功能目录 |
| `plan.md` | **HOW** | 模块影响范围 / 架构决策 / Prior decisions / 风险 | 实施中可补充,不能推翻 spec.md |
| `tasks.md` | **STEPS** | Task breakdown(checkbox)+ 实施记录 | 实施中持续更新,完成后归档 |

**为什么分三文件**:三种生命周期不一样。spec.md 是与 stakeholder 的契约,改了等于变需求;plan.md 是技术草图,实施中会发现要补;tasks.md 是 live 进度,每天都动。混在一个文件里**等于把"冻结"和"动态"放一起,审核会乱**。

### 3.2 目录命名

```
docs/specs/
├── 001-auth/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
└── 002-invitation/
    ├── spec.md
    ├── plan.md
    └── tasks.md
```

- 目录名 `<NNN>-<slug>`,编号便于排序和引用
- 完成后**整个目录归档,不删、不改**;后续变更起新目录引用旧的(见 §5)

### 3.2.5 轻车道(小改:免 frozen spec + plan)

不是所有 feature 都值三件套。**bugfix / polish / additive 小改**走轻车道:`<NNN>-<slug>/` 目录下**只一个 `tasks.md`**(目标/边界 + 验证 + tasks + proof),无 frozen spec.md、无 plan.md。仍建目录(编号连续 + 引用一致),只是少两个文件。

**入口分流**(`/feature-init` Step 4.5 自动判,3 道 trip 全 yes 才轻车道,模糊默认全道):

| 轴 | 全 yes 才轻车道 |
|---|---|
| 规模 | ≤ ~1 模块 / 少量文件,无新模块 |
| 可逆性 | additive / bugfix / polish,非数据迁移 / API 或 schema 契约变更 |
| 爆破半径 | 不触达项目声明的灾难性不变量路径(项目在根 AGENTS.md 声明) |

**为什么这条边界**:三件套对小改是过度仪式(同 [workflow.md §7.4](workflow.md#74-不要为了用-ai-拒绝键盘改-5-行代码) 的精神);但**砍的是文档仪式,不是验证** —— 轻车道仍保留 `## 验证`(spec §4 等价)+ Proof bundle,仍跑 L1 + L2 + proof(L3 因无 frozen spec 跳过)。

**两道安全闸**(防轻车道变逃生舱):
1. **保守默认**:3 道 trip 任一 no / 不确定 → 全道;分类只在 feature-init 发生,**开工后不重判**。
2. **事后反核**:proof-bundle 对轻车道 feature grep 实际 diff vs 项目声明的不变量路径;命中 → 报"误分类,应走全道"(治"自报不碰不变量但实际碰了",如 014 式 backfill)。

**升级**:轻车道实施中发现需 spec(触达不变量 / 要契约变更)→ 停,重跑 `/feature-init` 选全道补 spec.md。

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

#### `docs/specs/002-invitation/spec.md`

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

#### `docs/specs/002-invitation/plan.md`

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

#### `docs/specs/002-invitation/tasks.md`

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

**为什么必跑**:实施开始后才发现"输入不清晰" → 回炒成本是 spec 阶段修的 5-10 倍。这 7 个问题是 v2 实证里**最常出错的 7 个位置**。

| # | 问题 | 不通过的修法 |
|---|---|---|
| 1 | spec.md 六要素是否齐?(Outcomes / Scope / Constraints / Verification + plan.md 的 Prior decisions / 模块影响)| 缺的回去补 —— 这 6 节是 spec 契约的最小集 |
| 2 | spec.md §2 Scope 是否显式写了 **`做 / Include` 清单 + `不做 / Exclude` 清单两份**?| **必写"不做"** —— 不写 AI 会自动加,scope creep 最大单一来源(见 [workflow.md §7.5](workflow.md#75-不要让-specmd-和-planmd-内容混淆)) |
| 3 | spec.md §4 Verification 是否能**机械化**(写出 test 能覆盖 / API 能 curl 测 / 数据可断言)?| 不可测的改成可测;留"人眼判断"等于没 verification |
| 4 | spec.md §1 Outcomes 是不是**具体场景**而不是模糊愿望?| "提升用户体验"→模糊;"用户邀请流 < 3 次点击完成"→具体 |
| 5 | spec.md §3 Constraints 是**真约束**还是 wish list?| "必须 Vue 3"→真约束;"希望响应快"→wish(扔掉或具体化:"P95 < 200ms")|
| 6 | plan.md §1.1 Sibling Alignment 是否填(涉及多模块时)?| 必填 Align/Deviate/Codify 三选一;空着是 [§0.1 命题 3 Drift](workflow.md#01-这本手册解决什么) 空间维度漂移的源头 |
| 7 | tasks.md 是否拆到 **verifiable step**(每个 task 完成时有明确产物 / test 通过 / API 能调)?| 笼统的"实施 X 模块"→拆成"建 X/router.py + 写 happy-path test + 跑 curl 通"等可断言步骤 |

**没全通过别开始实施**——开始后才发现要回炒成本高 5-10x。

**跟 [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) 的关系**:本节是 **pre-implementation 自检**(便宜阶段),§3.5 是 **mid-implementation 修订**(贵阶段)。两者都不可省。

**工具**:[`/project-workflow:spec-quality-check`](../skills/spec-quality-check/SKILL.md) 自动化本 7 问 checklist——机械检查(M1-M5)+ dispatch [`spec-quality-reviewer`](../agents/spec-quality-reviewer.md) sub-agent 做主观二审(Q4 Outcomes / Q5 Constraints / Q7 verifiable)。**实施前 gate**——pass / borderline / fail 三档 verdict + 修法建议。

---

### 3.8 Spec 编辑边界(只有 1 条线)

spec.md 编辑规则**只看 1 个问题**:**是否已 git commit 到仓库 + 实施开始?**

| 状态 | 编辑规则 | 工具 |
|---|---|---|
| **未 commit** 或 **未开始 impl** | **自由编辑**(用户 + AI 主会话 iterate) | [`/feature-init`](../skills/feature-init/SKILL.md) Step 6 / [§3.6.5 Phase A SOP](#365-phase-a填-todos-的-ai-协作-sop)/ [`/spec-quality-check`](../skills/spec-quality-check/SKILL.md) |
| **已 commit 且开始 impl** | **必走 SOP**(ADR + `## 修订记录` 节追加 + 跨文件同步)| [`/spec-revise`](../skills/spec-revise/SKILL.md) |

**为什么这条边界**:spec 是契约。没人基于它写代码时,改是无成本的;基于它写过代码后,改 = 撕毁契约 → 需要决策审计(ADR)+ 变更记录(`## 修订记录`)+ 跨文件同步(plan / tasks / 可能 module AGENTS.md)。

**反模式**:把 commit 前的 iteration 改动当 frozen 后修订处理(起 ADR + `## 修订记录`)→ ceremony 过度,spec 反而难起步。**没 commit 前就是 draft,改它不算修订**。

**关于 spec.md 状态字段**(`> 状态: 草稿 / 评审中 / 已确认 / 已实现`,template 默认有):是**业务流程标签**,跟本节编辑边界**正交**。**已确认 = 冻结**(契约不动);**已实现 = 契约已被代码兑现**(spec 自身的兑现标记,不是部署状态)。部署 / 上线状态由 CI / 部署系统跟踪,不在 spec 上标(故无"已上线")。

> **谁翻**:`/proof-bundle` 给 🟢 READY 时翻(契约兑现的判定点);只动状态标记不动契约,不走修订 SOP。

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
请先阅读 docs/specs/002-invitation/spec.md 和 plan.md,然后从 tasks.md 第 1 条开始实现。
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
| **评审中** | ✅ 自由改 | ✅ 自由改 | ✅ 自由改 |
| **已确认**(开始实施) | **🔒 冻结**,变更 = 起新功能目录 | ✅ 可补充 prior decisions / 调整架构 | ✅ 持续更新进度 + 实施记录 |
| **已实现**(契约兑现) | 🔒 只读 | 🔒 只读 | ✅ 标 done |

> 无「已上线」阶段 —— 部署不在 spec 跟踪(见 [§3.8](#38-spec-编辑边界只有-1-条线))。

### 变更需求 = 起新功能目录

**不要改老 `<NNN>-<feature>/spec.md`**,起一份新功能目录引用旧的:

```
docs/specs/
├── 002-invitation/         # 老功能目录,保持冻结
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
└── 005-invitation-quota/   # 新功能目录
    ├── spec.md             # 第一段写"基于 002-invitation,本功能增加 X"
    ├── plan.md
    └── tasks.md
```

新功能 `spec.md` 顶部:

```markdown
# 005 invitation-quota — Spec

> 基于 [`002-invitation`](../002-invitation/),本功能增加管理员对团队的邀请配额管理。
> 与 002 的关系:002 的 Scope.不做 显式排除了配额,本功能解除该限制。
```

**为什么不改老 spec**:
- 老 spec 是"当时为什么这么做"的历史快照,改了就丢了
- 多人协作场景避免冲突
- git log 不能完全替代 —— spec 是设计意图,代码 diff 不是

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

### 6.6 用功能 spec 替代项目级 CLAUDE.md
**症状**:每个 `spec.md` 都重复说项目栈、命名约定、目录结构
**后果**:spec 臃肿,重复信息出错时多处要改
**修正**:项目级常识进 CLAUDE.md,spec 只写本功能特异的内容

### 6.7 spec.md 和 plan.md 内容混淆
**症状**:用户场景写在 plan,技术架构写在 spec
**后果**:评审看错文件,变更冻结失效
**修正**:WHAT 进 spec(用户视角),HOW 进 plan(技术视角);**评审者只看 spec.md**

---

## 7. 维护工具

按 feature 生命周期顺序,v2 ship 的工具:

| 任务 | 工具 |
|---|---|
| 起新 feature 三文件 | [`/feature-init <slug>`](../skills/feature-init/SKILL.md) —— 自动创建 `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md`(+ chat context pre-fill) |
| spec 写完后质量自检(实施前 gate) | [`/spec-quality-check`](../skills/spec-quality-check/SKILL.md) —— 机械化 §3.7 7 问 + dispatch [`spec-quality-reviewer`](../agents/spec-quality-reviewer.md) 做主观二审 |
| spec / plan 实施中发现错 | [`/spec-revise`](../skills/spec-revise/SKILL.md) —— orchestrate [workflow.md §3.5](workflow.md#35-开发中发现-specplan-错怎么办) / [§2.6](workflow.md#26-module-中途变更feature-实施中发现边界要调整) SOP(ADR + `## 修订记录` + plan prior decisions + tasks rebalance) |
| L3 spec 合规 review(实施后) | [`/l3-review`](../skills/l3-review/SKILL.md) —— dispatch [`spec-reviewer`](../agents/spec-reviewer.md) agent,按 §1 Outcomes / §2 Scope / §3 Constraints / §4 Verification 分组报告 |
| A 类约定(AGENTS.md 多层 + `.claude/rules/`)主动 refresh | [`/agents-md-revise`](../skills/agents-md-revise/SKILL.md) —— P4 主战场 |

**外部备选**(可选,跟 v2 工具并存):
- GitHub Spec Kit `/speckit.clarify` —— Q&A 引导补全 spec(若装 Spec Kit)。v2 的等价路径是主会话 conversational fill(§3.6.5),不需要单独 skill。

---

## 8. 参考与延伸

- [GitHub Spec Kit](https://github.com/github/spec-kit) — 重型流派,可以读它的 spec 模板找灵感
- [How to write a good spec for AI agents — Addy Osmani](https://addyosmani.com/blog/good-spec/) — 轻量流派,本项目项目级 spec 的来源
- [Spec-Driven Development: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) — 学术视角,11 万 bug 数据来源
- [Spec-Driven Development with AI Coding Agents — amux](https://amux.io/guides/spec-driven-development/) — 实践综合
- [My LLM coding workflow going into 2026 — Addy Osmani](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e) — 怎么把 spec 喂给 AI 的实战
