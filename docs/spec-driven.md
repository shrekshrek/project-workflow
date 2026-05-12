# 规约驱动开发(Spec-Driven Development)实践指南

> [README 议题 1](../README.md#1-spec-driven-development规约驱动开发) 的展开。
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

**文档归属**:
- 项目级常识 → 根 `AGENTS.md` + `CLAUDE.md`
- **Tier 级**约定(仅多 tier 项目)→ `backend/CLAUDE.md` / `frontend/CLAUDE.md` 等
- **模块级**(仅当模块反常时) → `<module>/CLAUDE.md`(差量,不重复父级)
- **功能级** → `docs/specs/<NNN>-<feature>/{spec,plan,tasks}.md`(本文档主题)

> "Tier" 概念详见 [workflow.md §0.3](workflow.md#03-概念区分钉死再读后续)。简言之:**全栈/多端项目的架构性分层**(前后端、客户端服务端等);单 tier 项目不存在这层。

---

## 1. 业界三流派(选一个心智模型)

| 流派 | 代表 | 形态 | 适合谁 |
|---|---|---|---|
| **重型** | [GitHub Spec Kit](https://github.com/github/spec-kit) | `.specify/specs/<NNN>/{spec,plan,tasks}.md` + 6 个 slash commands | 大团队、流程纪律强 |
| **轻量** | [Addy Osmani agents.md](https://addyosmani.com/blog/good-spec/) | 根目录单文件六要素 | 单人/小团队、要灵活 |
| **学术** | [SDD: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) | spec 是契约,代码是契约的实现 | 高合规、强保证场景 |

### 本项目采用混合

- **项目级**:agents.md 风格 → Claude Code 的 `CLAUDE.md`(workflow §1.1)
- **功能级**:Spec Kit 简化版 → 单文件六要素(workflow §1.2)
- **哲学**:学术 SDD 的"spec-as-contract"精神,**不上** Spec Kit 的工具链负担

**为什么混合**:
- 全照 Spec Kit:工具链开销大,适合大团队
- 全照 agents.md:只有项目级,功能级缺位
- 学术派的契约精神告诉我们:spec **可以变更但不能模糊**

---

## 2. 项目级 spec(CLAUDE.md)

详细写法见 [workflow.md §1.3 AGENTS.md 的内容标准](workflow.md#13-agentsmd-的内容标准) + [§1.4 嵌套层次](workflow.md#14-claudemd-嵌套层次子级覆盖父级)。

要点速查:
- 整个项目周期写 1 次,缓慢演化
- 六要素(Addy 框架):Commands / Testing / Project Structure / Code Style / Git Workflow / Boundaries
- Boundaries 三档:✅ Always / ⚠️ Ask first / 🚫 Never
- 嵌套层次:**系统 / 用户 / 项目根 / 子目录(tier + 模块)/ 私有**(详细见 workflow.md §1.4)
- 模块级 CLAUDE.md 是**可选**,仅模块"反常"时才写(见 [workflow.md §2.3](workflow.md#23-反常判定何时该写模块-claudemd))

维护工具(规划中):见 [proposals/agents-md-maintenance-skill.md](proposals/agents-md-maintenance-skill.md)。

---

## 3. 功能级 spec(`docs/specs/<NNN>-<feature>/`,三文件)

每个新功能一个**目录**,目录下三个文件,按生命周期分工。模板:[`docs/specs/_template/`](specs/_template/)。

### 3.1 三文件分工

| 文件 | 回答 | 内容 | 何时冻结 |
|---|---|---|---|
| `spec.md` | **WHAT** | Outcomes / Scope boundaries / Constraints / Verification | 评审通过后冻结,变更 = 起新功能目录 |
| `plan.md` | **HOW** | 模块影响范围 / 架构决策 / Prior decisions / 风险 | 实施中可补充,不能推翻 spec.md |
| `tasks.md` | **STEPS** | Task breakdown(checkbox)+ 实施记录 | 实施中持续更新,完成后归档 |

**为什么分三文件**:三种生命周期不一样。spec.md 是与 stakeholder 的契约,改了等于变需求;plan.md 是技术草图,实施中会发现要补;tasks.md 是 live 进度,每天都动。混在一个文件里**等于把"冻结"和"动态"放一起,审核会乱**。

### 3.2 目录命名

```
docs/specs/
├── _template/                # 复制此目录开新功能
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
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

## 4. AI 协作中的 spec 用法

### 4.1 怎么把 spec 喂给 AI

**正确做法**:新 session 第一句:

```
请先阅读 docs/specs/002-invitation/spec.md 和 plan.md,然后从 tasks.md 第 1 条开始实现。
```

**错误做法**:把内容复制到 prompt 里。

**为什么**:文件路径让 AI 直接读最新版本;复制的内容会变成 stale 副本(你后续改了文件,prompt 里还是老的)。
**进阶**:不同阶段给不同文件 —— 评审阶段只给 `spec.md`,实施给 `spec.md + plan.md + tasks.md`,reviewer 检查给三份齐全。

### 4.2 实施中如果发现错

| 错的程度 | 落在哪个文件 | 怎么处理 |
|---|---|---|
| **小**(漏了一个 prior decision) | `plan.md` | 当场追加,告诉 AI 重新读 plan.md |
| **小**(临时方案、补丁) | `tasks.md` 实施记录 | 写一行,不改 spec/plan |
| **中**(plan 选型需调整) | `plan.md` | 改并加 git log;不改 spec.md |
| **大**(scope / outcomes 实际跟想做的不一样) | **不能改 `spec.md`** | 停。回去讨论。起新功能目录 `<NNN+1>-<slug>/` 引用旧的(见 §5) |

### 4.3 AI 容易跑偏的两种场景

| 场景 | 根因 | 应对 |
|---|---|---|
| AI 主动加超出范围的功能 | `spec.md` 没写"不做" | 必填 §3.3 Scope boundaries 的"不做"部分 |
| AI 在实施中反复猜 | spec/plan 写得抽象 | 把 §3.3-3.5 的好/坏对照内化,自检一遍 |

### 4.4 Prior decisions 的特别用法

每次跟 AI 讨论中**做出的技术决策**,**当场追加到 `plan.md` §3 Prior decisions**。这一步常被忽略,但**消除中途反思最大的杠杆**。

例:

```
你:"用 Pinia 还是 useState?"
AI:"Pinia,因为需要 SSR 兼容..."
你:"OK,Pinia。"

→ 立刻在 spec §4 加一行:
   "状态管理用 Pinia 不用 useState:SSR 兼容"
```

下次新 session,AI 不会重新问。

---

## 5. Spec 生命周期

按文件区分,因为三个文件生命周期不同:

| 阶段 | spec.md | plan.md | tasks.md |
|---|---|---|---|
| **草稿** | ✅ 自由改 | ✅ 自由改 | ✅ 自由改 |
| **评审** | ✅ 自由改 | ✅ 自由改 | ✅ 自由改 |
| **已确认**(开始实施) | **🔒 冻结**,变更 = 起新功能目录 | ✅ 可补充 prior decisions / 调整架构 | ✅ 持续更新进度 + 实施记录 |
| **已实现**(上线前) | 🔒 只读 | 🔒 只读 | ✅ 标 done |
| **已上线** | 🔒 归档 | 🔒 归档 | 🔒 归档 |

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

| 任务 | 工具 |
|---|---|
| 起新 feature 三文件 | 复制 [`_template/`](specs/_template/) 整个目录,改名为 `<NNN>-<slug>/` |
| spec 不完整想 AI 帮你补 | GitHub Spec Kit `/speckit.clarify`(若装) —— Q&A 引导补全 |
| L3 检查代码合规 | `pr-review-toolkit:review-pr`,提供 spec.md + plan.md 路径作 context,见 [workflow §6.4](workflow.md#64-按规则源分层验证three-layer-review-separation) |
| CLAUDE.md(项目/Tier/模块级)维护 | 见 [`proposals/agents-md-maintenance-skill.md`](proposals/agents-md-maintenance-skill.md)(规划中) |

---

## 8. 参考与延伸

- [GitHub Spec Kit](https://github.com/github/spec-kit) — 重型流派,可以读它的 spec 模板找灵感
- [How to write a good spec for AI agents — Addy Osmani](https://addyosmani.com/blog/good-spec/) — 轻量流派,本项目项目级 spec 的来源
- [Spec-Driven Development: From Code to Contract — arXiv 2602.00180](https://arxiv.org/abs/2602.00180) — 学术视角,11 万 bug 数据来源
- [Spec-Driven Development with AI Coding Agents — amux](https://amux.io/guides/spec-driven-development/) — 实践综合
- [My LLM coding workflow going into 2026 — Addy Osmani](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e) — 怎么把 spec 喂给 AI 的实战
