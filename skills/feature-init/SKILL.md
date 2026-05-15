---
name: feature-init
description: Start a new feature spec — create docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md from project template. Auto-detect if a new module is needed and add module setup to plan/tasks (per workflow §2 Module Setup sub-flow). Optional Step 7 walks user through Q&A fill of §3-5 TODOs with §3.7 quality criteria internalized (can dispatch tech-researcher sub-agent for stack-unsure choices).
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Spec Init

User wants to start a new feature. Their input: `$ARGUMENTS`

## Step 1 — Parse input

`$ARGUMENTS` may be one of:
- `<slug>` only — e.g., `email-verification`
- `<slug>: <description>` — e.g., `email-verification: send verify link on register`
- Empty — ask user "feature slug? (kebab-case)" then proceed

Slug requirements:
- kebab-case only (`a-z0-9-`)
- 2-40 chars
- No leading/trailing hyphen

If invalid, ask user to correct before proceeding.

## Step 2 — Determine the NNN number

```bash
ls docs/specs/ | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

Take the highest leading number, increment by 1, zero-pad to 3 digits. If `docs/specs/` doesn't exist or is empty, start with `001`.

## Step 3 — Read project context

**必读**(不存在则中止):
- `AGENTS.md` — 项目级约定。**若缺**:报 "项目无 v2 baseline。先跑 `/project-workflow:project-init`(空目录)或 `/project-workflow:project-personalize`(已 clone scaffold)。" 然后中止。

**选读**(skip silently if missing):
- `docs/specs/_template/{spec,plan,tasks}.md` — 仅当项目自定义 override(有 `.user-customized` 哨兵)
- `<tier>/AGENTS.md` for each detected tier — 拿 tier-specific conventions

### 扫描项目结构(tier-aware)

不写死 `backend/` `frontend/`。改据**实际**推:

1. 根 `AGENTS.md` 提到的 tier 目录 → primary source
2. 若不明,扫 cwd 下:含 `AGENTS.md` 的子目录(maxdepth 2)
3. 每个 tier 内扫模块:
   - Service-style tier(有 `pyproject.toml` / `requirements.txt` / `go.mod` / `Cargo.toml`):扫 `<tier>/src/*/` 或 `<tier>/app/*/` 或 `<tier>/internal/*/`(语言惯例)
   - UI-style tier(有 `package.json`):扫 `<tier>/src/modules/*/` 或 `<tier>/src/views/*/` 或 `<tier>/src/features/*/`
4. 单 tier 项目(根有 `pyproject.toml` / `package.json` 等):扫 `./src/*/` 或语言惯例位置

若 tier 命名 / 模块位置都识别不出,**问用户**:"我没识别出模块结构。本 feature 涉及哪些目录?"

## Step 4 — Detect Module Setup needs (workflow §2 sub-flow)

Based on slug + description + existing modules, decide:

| Situation | Module action |
|---|---|
| Feature clearly extends one existing module | No new module; note "extends `<X>`" in plan |
| Feature crosses 2+ existing modules with no clear home | Ask user: which module owns it / split how |
| Feature is a wholly new domain (e.g., `notifications` when none exists) | **New module needed** — add module skeleton to plan/tasks |
| Cross-tier feature (e.g., auth) | Likely needs module in **both** tiers; check each tier separately |

**If unsure, ASK the user before generating files.** Don't fabricate module decisions.

## Step 5 — Generate the three files

Create directory `docs/specs/<NNN>-<slug>/` and write:

### `spec.md`(WHAT — frozen once approved;**canonical 4 节**,跟 [spec-driven.md §3.3](../../docs/spec-driven.md) 一致)

> ⚠️ Agent 写文件前必须把 `<TODAY>` 替换为今天日期(YYYY-MM-DD 格式)。

```markdown
# <NNN> <slug> — Spec

> 创建于 <TODAY> · 状态:**草稿** / 评审中 / 已确认 / 已实现 / 已上线
>
> **本文件回答 WHAT —— 做什么、为什么。评审通过后冻结,需变更则起新功能 spec。**
> 写法详见 [`docs/spec-driven.md`](../../docs/spec-driven.md)(plugin 仓)。

## 1. Outcomes

> 场景化散文 **或** API 行为描述。**不要**用 user story 句式("As a X I want Y...")。

{{TODO — 谁,在什么场景下,能做什么。具体动作,不写 wish list}}

## 2. Scope boundaries

**做**:
- {{TODO}}

**不做**(显式列出避免 scope creep,至少 2-3 条):
- {{TODO}}

## 3. Constraints

> 性能 / 安全 / 兼容性 / 法规等**硬数字**约束。**不**写 "希望快"(那是 wish);写 "P95 < 200ms"。

- {{TODO}}

## 4. Verification

> 上线前怎么验证。具体、可执行,**不要**写"覆盖率 80%"这种空话。

- 单测:{{TODO 测什么场景}}
- 集成:{{TODO 测什么端到端流程}}
- 手测:{{TODO 运行什么命令验证什么}}
- 上线指标:{{若适用}}
- L1 review(`/project-workflow:l1-review`)pass
- L2 review(`/project-workflow:l2-review`)pass
- L3 review(`/project-workflow:l3-review`)pass —— 本文件是 L3 基线
```

> **数据模型 / API 契约不在 spec.md** —— canonical 把它们放进 plan.md §2 架构决策(HOW),不混淆 WHAT 和 HOW。

### `plan.md`(HOW — 实施中可改;**canonical 4 节**)

```markdown
# <NNN> <slug> — Plan

> 基于 spec.md。回答 **HOW** —— 怎么做。实施中可改;改的同时在 §3 Prior decisions 写"为什么改"。

## 1. 模块影响范围

列出本 feature 涉及的所有模块(新增 + 改动),按 tier 分组:

- `<tier>/<module>/` —— {{新增模块 / 改:加 xxx / 改:替换 yyy}}
- ...

### 1.1 Sibling Alignment(涉及多模块时必填)

| 兄弟模块 | 对齐方式 | 备注 |
|---|---|---|
| `<sibling-module>` | **Align**(沿用现有约定) / **Deviate**(本 feature 特例,写理由) / **Codify**(把本 feature 模式提升为约定,更新 AGENTS.md)| {{TODO}} |

> 单模块 feature 可省本子节。多模块 feature 不填 = drift 风险(见 [spec-driven.md §3.7 Q6](../../docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist))。

## 2. 架构决策

> 数据模型、API 契约、关键算法、状态管理 —— **本 feature 的具体技术形状**。
> 不重复 spec.md(spec 写做什么,plan 写怎么做)。

### 数据模型(若适用)

{{TODO — 关键 entity 字段、关系、索引}}

### API 契约(若适用)

| Method | Path | Body | Response | Errors |
|---|---|---|---|---|
| {{TODO}} | | | | 401 / 404 / 422 / ... |

### 关键算法 / 状态机(若适用)

{{TODO}}

## 3. Prior decisions

> 每个决策**带 why**,实施中遇到诱惑回头讨论时 = 关闭讨论的依据。

| 决策 | 为什么 |
|---|---|
| {{TODO 用 X 不用 Y}} | {{TODO 具体原因}} |

## 4. 风险与未决

### 风险

- {{TODO}}

### 未决(实施时决)

- {{TODO}}

## 5. 实施顺序

{{若全栈 feature 走 [workflow §8.6](../../docs/workflow.md) 后端先行;else: by phase}}

1. {{TODO}}
```

### `tasks.md`(STEPS — 实施中实时更新;**canonical 2 节 + Proof Bundle 占位**)

```markdown
# <NNN> <slug> — Tasks

> 基于 plan.md。颗粒度 30 分钟 - 2 小时,实施时勾选 + 加注。

## 1. 任务清单

### Setup(若 plan 标注新增模块)
- [ ] 建 `<tier>/<module-path>/` 目录
- [ ] 五件套文件(`{__init__,models,schemas,service,router}.py` 或 tier 等价)
- [ ] 注册 router 到 `main.py` / wire into app
- [ ] Alembic migration(若改 DB schema)

### Backend
- [ ] {{TODO 拆 30min-2h 颗粒度}}

### Frontend(若适用)
- [ ] {{TODO}}

### Tests
- [ ] {{TODO 单测}}
- [ ] {{TODO 集成 / e2e}}

### Acceptance
- [ ] spec §4 Verification 全部 pass
- [ ] Proof bundle 就绪(`/project-workflow:proof-bundle`)

## 2. 实施记录

> 实施中的偏差 / 补充决策 / 临时方案。**不改 spec.md**;plan.md 有补充则在 plan 加注。

- {{YYYY-MM-DD: 偏差描述}}

## Proof Bundle

> 由 `/project-workflow:proof-bundle` 填。本节实施前留占位,完成后由 skill 写入。

- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:`<X>/<Y>` passed, coverage `<Z>%`
- [ ] L1 合规
- [ ] L2 合规(reviewer 提供 AGENTS.md 作 context 跑过)
- [ ] L3 合规(reviewer 提供 spec.md 作 context 跑过)
- [ ] AGENTS.md 实际改动审计(item 5a)
- [ ] AGENTS.md drift 建议(item 5b)
- [ ] 手测确认 happy path 跑通
```

## Step 6 — Report back

After creating, output:

```
✅ Spec created: docs/specs/<NNN>-<slug>/
   ├── spec.md  — Fill §1 Outcomes / §3 Constraints(§2 Scope 末轮补"不做")
   ├── plan.md  — Fill §1 模块影响 / §2 架构决策(Data Model / API)/ §3 Prior decisions
   └── tasks.md — Fill §1 任务清单(30min-2h 颗粒度)

📌 Module decision: {{one of:}}
   - Extends existing `<module>` (no new module)
   - New module recommended: `<path>` (plan/tasks include skeleton setup)
   - Needs user clarification: <which option>

Next steps:
1. (推荐)立刻进 Step 7 Q&A 走完 spec §1-3 + plan §2 fill(本 skill 内置)
2. 或选 n 跳过 → 后续自己跟 AI 在主会话填(参考 [`spec-driven.md §3.6.5`](../../docs/spec-driven.md#365-phase-a-填-todos-的-ai-协作-sop))
3. 填完跑 `/project-workflow:spec-quality-check` — pre-implementation gate
4. Implement following tasks.md
5. 实施中真发现 spec/plan 错时:`/project-workflow:spec-revise`(走 [workflow.md §3.5](../../docs/workflow.md#35-开发中发现-specplan-错怎么办))
6. 完成时:`/project-workflow:feature-done`(L1+L2+L3+proof-bundle)
```

## Step 7 — (Optional)Q&A 填 TODOs

After Step 6 报告完成,**询问用户是否立即进 Q&A fill 阶段**:

```
spec.md §1 / §3 + plan.md §2 还有 TODOs。要我现在 Q&A 走完吗?
  (y)es      → 我按 canonical 4 节走 spec §1 Outcomes → plan §2 架构决策(Data Model + API)
                → spec §3 Constraints → spec §2 末轮补"不做" → plan §1.1 Sibling Alignment(若多模块)
  (n)o       → 你后续自由填(我退出)
  (s)kip §X  → 只填指定节(如 'skip 架构' 跳过 plan §2)
```

若用户答 (n) → exit。若 (y) 或 (s),按下面顺序执行 7.1-7.6。

**贯穿 Step 7 的纪律**(对应 [`spec-driven.md §3.7`](../../docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist) 7 问):

| Q | 内容 | Step 7 落实 |
|---|---|---|
| Q1 | spec.md 4 节齐(Outcomes / Scope / Constraints / Verification) | Step 7.1 + 7.3 + 7.4 强制走完 |
| Q2 | 必有"不做"显式列出 | Step 7.4 末轮补 |
| Q3 | Verification 可机械化(L1/L2/L3 / 具体测试场景)| spec.md §4 Verification 模板已含;Step 7.4 提醒确认 |
| Q4 | Outcomes 具体(场景 + 动作)| Step 7.1 引导问 |
| Q5 | Constraints 真假(硬数字 / 法规,不是 wish list)| Step 7.3 引导追问 |
| Q6 | plan.md §1.1 Sibling Alignment(多模块时必填)| Step 7.6 引导(单模块 skip)|
| Q7 | tasks verifiable | tasks.md 模板已 verifiable;Step 7 不重复 |

### Step 7.1 — spec.md §1 Outcomes(~3-5 个引导问题)

按顺序问用户(每问后等回答再下一问):

```
1. "这个 feature 的核心场景是什么?**谁、什么场景、能做什么** —— 具体动作,不要 'as a user I want'。"
2. "有什么边界 case?(异常输入 / 时序问题 / 权限边缘 / 并发情况 / etc.)"
3. (按需)"这个场景跟现有 features 有 overlap 吗?"
```

收齐答案 → 用 Edit 工具写进 spec.md §1。完成后 1 行确认:

> "✅ §1 Outcomes 已填:<总结>。OK 进 plan §2 架构决策吗?"

### Step 7.2 — plan.md §2 架构决策(数据模型 + API + 关键算法)

> Canonical 把 Data Model + API Contract 放在 plan.md §2(HOW),不在 spec.md(WHAT)。

按顺序问(必要时跳过不适用项):

```
1. (若涉及数据持久化)"核心 entity 是什么?关键 3-5 个字段 + 关系(1-1 / 1-N / N-N)?"
2. (若涉及 HTTP API)"暴露哪些 endpoint?Method + Path + 请求体 + 响应体?"
3. (若涉及 HTTP API)"错误路径有哪些?(401 / 404 / 422 / 409 / 500 ...)"
   → 主动追问 "401 / 404 case 覆盖了吗?"(对应 §3.7 Q3 可测验证)
4. (按需,若用户对 ORM / API 风格 / 序列化方式不确定)"用 X 还是 Y?要我调研吗?"
   → 用户 yes → dispatch [`tech-researcher`](../../agents/tech-researcher.md) sub-agent
5. (若有关键算法 / 状态机)"算法 / 状态转移?"
```

写进 plan.md §2 各子节(数据模型 / API 契约 / 关键算法)。确认。

### Step 7.3 — spec.md §3 Constraints(硬约束)

```
1. "有什么硬性能约束?(P95 时延 / 并发 / QPS 上限 / 等)"
2. "有什么硬安全约束?(token 强度 / rate limit / 等)"
3. "有什么硬合规约束?(GDPR / PCI / 数据驻留 / 等)"
4. "有什么硬兼容性约束?(必须支持的浏览器 / Node 版本 / etc.)"
```

**关键纪律**:每条都追问"这是 wish 还是真约束?"(spec-driven §3.7 Q5)
- 用户答"希望快" → "量化:P95 < 多少 ms?"
- 用户答"安全要好" → "具体威胁模型 / 必守的合规项?"

不能量化的**删掉**,不进 §3 Constraints。

写进 spec.md §3。确认。

### Step 7.4 — spec.md §2 Scope 末轮补"不做"(最关键的一步)

**为什么单独最后做**:用户走完 §1 + plan §2 + §3 后才知道 scope 真实边界,**这时问"什么不做"答得最准**。

```
"现在你看了 §1 Outcomes + plan 架构决策 + §3 Constraints,有哪些**显式不做**的事?
 (例:'本版只支持 email 邀请,不发短信' / '不做 race condition 处理,假设单点写' / etc.)
 
 至少列 2-3 条 —— 这是 scope creep 防御。"
```

写进 spec.md §2 `**不做**:` 清单。

### Step 7.5 — spec.md §4 Verification 复核(快确认)

模板已含 L1/L2/L3 + 单测 / 集成 / 手测 占位。问用户:

```
"§4 Verification 里需要补哪些 feature-specific 验证场景?
 (例:'单测 token 过期场景' / '集成 invite → register 完整流' / '手测真邮箱')"
```

补完确认。

### Step 7.6 — plan.md §1.1 Sibling Alignment(仅多模块 feature)

若 Step 4 检测到 feature 涉及多模块(跨 tier 或同 tier 多 module)→ 强制走;**单模块 feature 跳过**。

```
"本 feature 影响多个模块,需要兄弟模块对齐分类:

对每个兄弟模块,选 Align / Deviate / Codify 三选一:
  - Align(沿用现有约定)
  - Deviate(本 feature 特例,写理由)
  - Codify(本 feature 引入的新模式应该提升为约定 → 同步改 AGENTS.md)"
```

写进 plan.md §1.1 表格。确认。

### Step 7.7 — 报告 + 提示下一步

```
✅ spec §1 + plan §2 + spec §3 + spec §2 Exclude + spec §4 + plan §1.1 已 Q&A 填完。

下一步建议:
1. 跑 `/project-workflow:spec-quality-check` 验最后那 5%(机械检 + 主观二审)
2. 通过后 `git commit` spec.md + plan.md + tasks.md → 进 implementation
3. 实施中发现 spec 错 → `/project-workflow:spec-revise`
4. 完成时 → `/project-workflow:feature-done`(L1+L2+L3+proof-bundle)
```

### Step 7 Failure modes

| 错误 | 应对 |
|---|---|
| 用户 Q&A 中途想退出 | 保存已填部分,告诉用户 "已写到 §X,后续可以自己续填" |
| 用户对某节业务概念完全没想清 | 跳过该节(填 `{{TODO — pending business decision: <topic>}}`),提示用户 quality-check 前要填 |
| Step 7.2 dispatch tech-researcher 失败 | 退回 user 自答,不阻塞 fill 流程 |
| 用户回答跟前面 §自相矛盾 | 提示 "§1 你说 X,§3 这里说 Y,是 X 还是 Y?",请求澄清 |
| 多模块但用户拒填 §1.1 Sibling Alignment | 警告 "spec-quality-check 会标 Q6 fail";尊重用户决定但留警告 |

## Notes

- **Do not** generate code yet — this is the planning artifact only
- **Do not** overwrite existing `docs/specs/<NNN>-<slug>/` (collision detection: error out)
- **Template source**:本 SKILL.md § Step 5 起的 spec/plan/tasks 内置模板是 canonical source。若项目有 `docs/specs/_template/`(用户手工 mkdir + `.user-customized` 哨兵),则优先读本地 override
