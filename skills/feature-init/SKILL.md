---
name: feature-init
description: Start a new feature spec — create docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md from project template. Auto-detect if a new module is needed and add module setup to plan/tasks (per workflow §2 Module Setup sub-flow). Optional Step 7 walks user through Q&A fill of §3-5 TODOs with §3.7 quality criteria internalized (can dispatch tech-researcher sub-agent for stack-unsure choices).
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Feature Init

Start a new feature's spec/plan/tasks triplet (P2 entry point). Optional Step 7 walks the user through Q&A fill, aligned with the 7-question quality checklist in [spec-driven.md §3.7](../../docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist).

**Use when**: P2 — starting a new feature; changes span 3+ files OR touch architecture / data model / API contract ([workflow.md §3.1](../../docs/workflow.md#31-规划阶段)).
**Not for**: P0 project scaffolding (use `/project-workflow:project-init`) / mid-implementation spec revision (use `/project-workflow:spec-revise`) / endpoint delivery (use `/project-workflow:feature-done`).

User input: `$ARGUMENTS` — feature slug + optional description.

> **重要 — chat 作 context 输入**(workflow `Phase 1 → 2` 桥):若用户在本 session 中已经跟你**讨论过本 feature 细节**(outcomes / scope / constraints / 架构方向 / edge cases / etc.),**用该对话作 input**:Step 5 后据对话提取已讨论的事实 + 决策填进 spec/plan/tasks placeholder;Step 7.A/B 强约束已被对话覆盖时直接填,未覆盖才问。这避免 user 把已讨论的内容重复填一遍。

## Step 1 — 解析输入(可选 `$ARGUMENTS`)

| 输入格式 | 例 | 处理 |
|---|---|---|
| 仅 `<slug>` | `email-verification` | 直接用 |
| `<slug>: <description>` | `email-verification: send verify link on register` | 拆 slug 和 description |
| 空 | — | 问用户 "feature slug? (kebab-case)" 后继续 |

Slug 要求:
- kebab-case only(`a-z0-9-`)
- 2-40 chars
- 不能以 `-` 开头或结尾

不合法 → 请用户改正再继续。

## Step 2 — 确定 NNN 编号

```bash
ls docs/specs/ | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

取最大的前导编号 +1,补零到 3 位。若 `docs/specs/` 不存在或为空,从 `001` 起。

## Step 3 — 读项目 context

> A 类约定有两个载体(workflow.md §0.3 / §1.3):**AGENTS.md** 多层 + **`.claude/rules/*.md`** 扁平 globs 路径触发。两者都是项目约定 source-of-truth,Step 7 引导填空时要参考全集。

**必读**(不存在则中止):
- `AGENTS.md` — 项目级约定。**若缺**:报 "项目无 v2 baseline。先跑 `/project-workflow:project-init`(空目录)或 `/project-workflow:project-personalize`(已 clone scaffold)。" 然后中止。

**选读**(缺失则静默跳过):
- `<tier>/AGENTS.md` 每个检测到的 tier —— 拿 tier 特异约定
- **`.claude/rules/*.md` 全集** —— A 类 peer to AGENTS.md(典型:`code-style.md` / `testing.md` / `security.md` + 可能的 `<framework>.md`)。读每个文件的 frontmatter `globs:`,记下"哪条规则约束哪些路径",Step 7 强约束 + Step 7.D conversational fill 引导时按此对照本 feature 的 scope 提示用户
- **本 session 早期对话**(若 user 已讨论过本 feature)── 提取 outcomes / scope / constraints / 架构方向 / edge cases / 业务事实 等 用户明确给的细节;Step 5 后用作 placeholder pre-fill input

### 扫描项目结构(tier-aware)

不写死 `backend/` `frontend/`。改据**实际**推:

1. 根 `AGENTS.md` 提到的 tier 目录 → primary source
2. 若不明,扫 cwd 下:含 `AGENTS.md` 的子目录(maxdepth 2)
3. 每个 tier 内扫模块:
   - Service-style tier(有 `pyproject.toml` / `requirements.txt` / `go.mod` / `Cargo.toml`):扫 `<tier>/src/*/` 或 `<tier>/app/*/` 或 `<tier>/internal/*/`(语言惯例)
   - UI-style tier(有 `package.json`):扫 `<tier>/src/modules/*/` 或 `<tier>/src/views/*/` 或 `<tier>/src/features/*/`
4. 单 tier 项目(根有 `pyproject.toml` / `package.json` 等):扫 `./src/*/` 或语言惯例位置

若 tier 命名 / 模块位置都识别不出,**问用户**:"我没识别出模块结构。本 feature 涉及哪些目录?"

## Step 4 — 检测 Module Setup 需要(workflow §2 sub-flow)

据 slug + 描述 + 既有模块判定:

| 情形 | 模块决策 |
|---|---|
| Feature 明确扩展某一既有模块 | 不建新模块;plan 注 "extends `<X>`" |
| Feature 横跨 2+ 既有模块,主家不明 | 问用户:哪个模块承担 / 怎么拆 |
| Feature 是全新领域(如 `notifications` 之前不存在) | **需新建模块** —— plan/tasks 加模块 skeleton |
| 跨 tier feature(如 auth) | 多半每个 tier 都要建对应模块;逐 tier 单独判 |

**不确定时,生成文件前先问用户。** 不要编造模块决定。

### Step 4.1 — (新模块时)反常判定 + module-level AGENTS.md

仅当 Step 4 决定 **New module needed** 时触发。99% 新模块跟父级(tier / 项目)默认一致,**不写** `<module>/AGENTS.md`;只在"反常"时才写(workflow.md §2.3 判定)。

问用户:

```
新建模块 <module-path>。这个模块是否"反常"——跟父级默认约定不同?常见反常情形:
  - 存储模型不同(如其他模块 PostgreSQL,本模块 Redis)
  - 特殊并发 / 性能约束(如必须 lock-free)
  - 对外稳定 API 契约(公共 SDK 边界)
  - 用了不同的第三方库范式

(n)o      → 不写 module-level AGENTS.md(99% 选这个)
(y)es     → 简述反常点,plan/tasks 加 "<module>/AGENTS.md + CLAUDE.md alias" skeleton 项
```

若 `(y)es`,把反常点写进 plan.md §1 模块影响范围的 "新模块反常约定" 子节,并在 tasks.md 加 task "建 `<module>/AGENTS.md`(差量于父级)+ `<module>/CLAUDE.md` 1 行 alias"。

**默认 n**:99% 新模块跟父级一致,不应每个都问。只在用户主动提到反常点时改 y。

## Step 5 — 生成三个文件(从 plugin 模板 cp + Edit placeholder)

**模板源**:`$PLUGIN_ROOT/template/docs/specs/_template/{spec,plan,tasks}.md`(3 个文件,内容跟 [spec-driven.md §3.3](../../docs/spec-driven.md) 一致)。

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(ls -d ~/.claude/plugins/cache/project-workflow/project-workflow/*/ 2>/dev/null | sort -V | tail -1)}"
SRC="$PLUGIN_ROOT/template/docs/specs/_template"

mkdir -p "docs/specs/$NNN-$SLUG"
cp "$SRC/spec.md"  "docs/specs/$NNN-$SLUG/spec.md"
cp "$SRC/plan.md"  "docs/specs/$NNN-$SLUG/plan.md"
cp "$SRC/tasks.md" "docs/specs/$NNN-$SLUG/tasks.md"
```

复制后用 Edit 工具替换 3 个 placeholder(对 3 个文件分别处理):
- `<NNN>` → 实际编号(如 `001`)
- `<slug>` → 实际 slug(如 `email-verification`)
- `<TODAY>` → 今天日期(YYYY-MM-DD;仅 spec.md 有)

`{{TODO ...}}` markers **保留**,留给用户(或 Step 7 强约束 / 后续 conversational fill)填。

**若 Step 3 提取到 chat context**(用户在本 session 已讨论 feature 细节):据对话中**明确给的事实**(outcomes 场景 / scope 边界 / constraints 数字 / 框架决策 / 已定的 entity / endpoint 等)pre-fill 对应 placeholder,**留下未讨论 / 未确定项** 作 `{{TODO ...}}` 或 `(待 ADR-NNNN-XXX)` defer。**不要**凭印象补 chat 没说的细节。

## Step 6 — 报告

文件创建后,输出:

```
✅ Spec created: docs/specs/<NNN>-<slug>/
   ├── spec.md  —— 待填 §1 Outcomes / §3 Constraints(§2 Scope 末轮补"不做")
   ├── plan.md  —— 待填 §1 模块影响 / §2 架构决策(Data Model / API)/ §3 Prior decisions
   └── tasks.md —— 待填 §1 任务清单(30min-2h 颗粒度)

📌 Module decision: {{以下之一}}
   - 扩展既有 `<module>`(不建新模块)
   - 建议新模块:`<path>`(plan/tasks 已加 skeleton)
   - 需用户澄清:<具体选项>

⚠️ (y) 注意:LLM 替走时**只答 user 真给的细节**;未给的字段 / 数值 / 表名 / 库 / ADR 编号留 `(待 ADR-NNNN-...)` deferred,**不要 plant** "reasonable default"。
⚠️ (n) 注意:user 自填前**先读** scaffold base modules + 既有 `.claude/rules/*.md`(尤其 `<framework>.md`),避免跨文件 inconsistency。

要我现在走 mission-critical 强约束 + adaptive hooks 吗?
  (y)es      → 走 Step 7:
                - 7.A 必走:Scope "不做"(workflow §3.7 Q2 强约束)
                - 7.B 多模块必走:Sibling Alignment(workflow §3.7 Q6 强约束)
                - 7.C 按需 dispatch:tech-researcher(stack 选型不确定时)/ context7(外部库文档拉取时)
                - 7.D 其余 TODOs(Outcomes / Constraints / 架构 / etc.)**plugin 不预设 Q&A** → 你主会话跟 AI 对话填
                - 7.E 决策完整性 audit 兜底
  (n)o       → 你后续主会话自由填全部 spec/plan/tasks(参考 [`spec-driven §3.6.5`](../../docs/spec-driven.md#365-phase-a填-todos-的-ai-协作-sop)),完了跑 `/project-workflow:spec-quality-check`
  (s)kip 7.X → 只走指定 sub-step(如 'skip 7.A' 跳过 Scope "不做"强约束 ── 不推荐)
```

## Step 7 — (可选)Mission-critical 强约束 + adaptive hooks

> Plugin 只做 scaffold + 强约束 checkpoints + audit safety net,**不预设 Q&A interview**;细节由 user 主会话填(见 [spec-driven.md §3.6.5](../../docs/spec-driven.md#365-phase-a填-todos-的-ai-协作-sop))。

Step 6 末尾用户答 (y) / (n) / (s)。若 (n) → exit。若 (y) / (s) → 走下面 5 个 sub-step。

### Step 7.A — 必走:Scope "不做"(workflow §3.7 Q2 强约束)

`{{TODO}}` 占位中**最易遗漏 + 最贵的**就是 "Exclude / 不做" 清单 ── scope creep 防御主战场。无论 feature 类型,本 step **必填**。

**若 Step 3 chat context 已覆盖** ── 用户在对话已明确说"不做 X / Y / Z" → 直接据对话填,**不重复问**。
**未覆盖时**才问 user:

```
"显式列至少 2-3 条本 feature 不做的事 ── 例:
  - '本版只支持 email 邀请,不发短信'
  - '不做 race condition 处理,假设单点写'
  - '本 feature 不动权限模型,沿用现有 RBAC'"
```

写进 spec.md §2 `**不做**:` 清单。

### Step 7.B — 多模块时必走:Sibling Alignment(workflow §3.7 Q6 强约束)

仅当 Step 4 检测到本 feature 涉及多模块(跨 tier 或同 tier 多 module)── 必填。

**若 Step 3 chat context 已覆盖** sibling 对齐方式(用户已说"backend 跟现有约定,frontend 新 pattern" 等)→ 直接据对话填,**不重复问**。
**未覆盖时**才问 user:

```
"本 feature 影响多个模块,每个兄弟模块选 Align / Deviate / Codify 三选一:
  - Align(沿用现有约定)
  - Deviate(本 feature 特例,写理由)
  - Codify(本 feature 引入的新模式应该提升为约定 → 同步改 AGENTS.md / 加 .claude/rules/<topic>.md;否则后续 features 看不到)"
```

写进 plan.md §1.1 表格。单模块 feature 跳过本 sub-step。

### Step 7.C — Adaptive hooks(按需触发,不预设题)

仅当对话中用户提到 / 暗示以下情况时**主动 dispatch**:

- 用户对 **stack / library 选型不确定** → 先查 `.claude/rules/<framework>.md` 有无定论;无 + 用户要研究 → dispatch [`tech-researcher`](../../agents/tech-researcher.md) sub-agent
- 用户提到 **多外部库 / 不熟悉 API / 版本相关问题** → 问 "拉文档 reference?";yes → 用 `context7` MCP(回退 `WebFetch`)拉版本约束 / breaking changes / 推荐用法,摘进 plan.md §2(避免实施时 AI 猜 API 形状,workflow §3.1 决策清单 #3)

**不主动追问**;**不预设题** ── caller / user 自然对话中触发即可。

### Step 7.D — 其余 TODOs:**conversational fill mode**(plugin 不预设 Q&A)

spec.md §1 Outcomes / §3 Constraints / §4 Verification / plan.md §2 架构决策 / plan.md §3 Prior decisions 等 TODOs ── **plugin 不预设 Q&A interview**。

**若 Step 3 chat context 已部分覆盖** → Step 5 已据 chat pre-fill 对应 placeholder。告诉 user:

```
"📝 spec.md / plan.md / tasks.md placeholder 已就位
   (若你跟 AI 已 chat 讨论本 feature → 据 chat 已 pre-fill 对应部分)

剩余 TODOs / 未 pre-fill 项请继续主会话对话填:

  1. 贴 / 接着聊业务想法 → AI 据 placeholder 引导你迭代填(参考 spec-driven.md §3.6.5 SOP)
  2. 不确定 stack / library 时直接说 'research X vs Y for [context]' → AI 会用 tech-researcher
  3. 不确定细节(字段类型 / API 契约 / 错误码 / etc.)用 `(待 ADR-NNNN-XXX)` defer 形式 ── **不要凭印象 plant 'reasonable default'**
  4. 对照 `.claude/rules/<framework>.md` 中项目已定的 idiom 写,避免 drift

填完后跑 `/project-workflow:spec-quality-check` 验已填内容是否合格(机械检 + 主观二审 + 决策完整性 audit 三层兜底)── 迭代到 pass。"
```

### Step 7.E — 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

报告之前,dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md) 审 Step 7.A + 7.B 累积填写 + user 主会话填的内容(若已 commit 进文件):

- `files_to_audit`: `docs/specs/<NNN>-<slug>/{spec,plan}.md`
- `qa_answers`: Step 7.A 答案(Scope "不做")+ Step 7.B 答案(Sibling Alignment 若多模块)+ Step 6 / Step 4 框架决策(slug / NNN / module setup);若 user 已开始主会话 fill,加 user 在对话中明确给的业务事实
- `language_conventions`: null
- `plugin_hardcoded_defaults`: `{value: "NNN-<slug>", source: "workflow.md §3 spec-driven"}` 一条即可

**典型 plant**(audit 应 catch):
- API endpoint path 凭空(`/api/v1/foo` 无 trace)→ 🚫
- 错误码具体值无 trace → 🚫(若 `.claude/rules/<framework>.md` 规定则 ✅)
- 字段名 / entity 名超出对话事实 → 🚫
- HTTP method 推测 → 🚫

**Block 规则**:🚫 > 0 → 提示 user 在主会话据 audit feedback 修后重跑 audit;⚠️ 不 block。

### Step 7.F — 报告 + 提示下一步

```
✅ Step 7.A Scope "不做" 强约束已填
✅ (若多模块)Step 7.B Sibling Alignment 已填
✅ Step 7.E 决策完整性 audit 通过(N 🚫 / M ⚠️)

📝 其余 TODOs 请主会话 conversational fill(见 Step 7.D 引导)。
   填完后跑 `/project-workflow:spec-quality-check` 验收。
```

### Step 7 Failure modes

| 错误 | 应对 |
|---|---|
| User 拒填 Step 7.A "不做" | 警告 "spec-quality-check Q2 会 fail";尊重用户决定但留警告;占位写 `{{TODO ── 用户主会话补 Exclude 清单}}` |
| User 拒填 Step 7.B Sibling Alignment(多模块时)| 警告 "spec-quality-check Q6 会 fail";尊重但留警告 |
| Step 7.C tech-researcher / context7 dispatch 失败 | 退回 user 自填,不阻塞流程 |
| Step 7.E audit 标 🚫 | 告诉 user 在主会话据 audit 反馈修;skill 不主动重 audit(等 user 主动跑 `/spec-quality-check` 或本 skill 重入) |

## Notes

- **Do not** generate code —— 本 skill 只产规划 artifact
- **Do not** overwrite existing `docs/specs/<NNN>-<slug>/`(碰撞检测:报错退出)
