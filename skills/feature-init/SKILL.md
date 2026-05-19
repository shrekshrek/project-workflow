---
name: feature-init
description: Start a new feature spec — create docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md from project template. Auto-detect if a new module is needed and add module setup to plan/tasks (per workflow §2 Module Setup sub-flow). Scaffold + chat-context pre-fill + reminders + decision-completeness audit; conditional framework Q&A only (slug / tier / module).
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Feature Init

Start a new feature's spec/plan/tasks triplet (P2 entry point)。Business 细节走主会话 conversational fill(见 [spec-driven.md §3.6.5](../../docs/spec-driven.md#365-phase-a填-todos-的-ai-协作-sop));质量由 `/spec-quality-check` 把关。

**Use when**: P2 — starting a new feature; changes span 3+ files OR touch architecture / data model / API contract ([workflow.md §3.1](../../docs/workflow.md#31-规划阶段)).
**Not for**: P0 project scaffolding (use `/project-workflow:project-init`) / mid-implementation spec revision (use `/project-workflow:spec-revise`) / endpoint delivery (use `/project-workflow:feature-done`).

User input: `$ARGUMENTS` — feature slug + optional description.

## Step 1 — 解析输入(可选 `$ARGUMENTS`)

| 输入格式 | 例 | 处理 |
|---|---|---|
| 仅 `<slug>` | `email-verification` | 直接用 |
| `<slug>: <description>` | `email-verification: send verify link on register` | 拆 slug 和 description |
| `<NNN>-<slug>` 或 `<NNN>-<slug>: <desc>` | `003-email-verification` | 检测到前导 `\d{3}-` → strip 作 slug,前缀 NNN 进 Step 2 校验 |
| 空 | — | 问用户 "feature slug? (kebab-case)" 后继续 |

Slug 要求(strip NNN 前缀后):
- kebab-case only(`a-z0-9-`)
- 2-40 chars
- 不能以 `-` 开头或结尾

不合法 → 请用户改正再继续。

## Step 2 — 确定 NNN 编号

```bash
ls docs/specs/ | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

取最大的前导编号 +1,补零到 3 位。若 `docs/specs/` 不存在或为空,从 `001` 起。

**NNN 前缀冲突处理**(若 Step 1 给了 NNN 前缀):

| 情形 | 处理 |
|---|---|
| User-given == auto +1 | 静默继续 |
| User-given > auto +1 | 问 user:"用 auto `<auto>` 还是 user-given `<given>`?" |
| User-given ≤ existing | 报 collision:"`docs/specs/<NNN-given>-*` 已存在,改用 auto `<auto>` 或换 slug?" |

## Step 3 — 读项目 context

> A 类约定有两个载体(workflow.md §0.3 / §1.3):**AGENTS.md** 多层 + **`.claude/rules/*.md`** 扁平 globs 路径触发。两者都是项目约定 source-of-truth。

**必读**(不存在则中止):
- `AGENTS.md` — 项目级约定。**若缺**:报 "项目无 v2 baseline。先跑 `/project-workflow:project-init`(空目录)或 `/project-workflow:project-personalize`(已 clone scaffold)。" 然后中止。

**选读**(缺失则静默跳过):
- `<tier>/AGENTS.md` 每个检测到的 tier —— 拿 tier 特异约定
- **`.claude/rules/*.md` 全集** —— A 类 peer to AGENTS.md(典型:`code-style.md` / `testing.md` / `security.md` + 可能的 `<framework>.md`)。读每个文件 frontmatter `globs:`,记下"哪条规则约束哪些路径",Step 5 pre-fill + Step 6 reminders 按此对照本 feature scope 提示 user
- **本 session 早期对话**(workflow `Phase 1 → 2` 桥)── 若 user 已跟 AI 讨论过本 feature(outcomes / scope / constraints / 架构方向 / edge cases / 业务事实 / etc.),提取**用户明确给的细节**作 Step 5 placeholder pre-fill input

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

新建模块时:plan/tasks 加 skeleton 项。**反常判定(新模块跟父级约定是否不同)不预问** ── 99% 选 n;作为 Step 6.2 reminder 输出给 user 自判(workflow.md §2.3)。

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

`{{TODO ...}}` markers **保留**,留给用户后续 conversational fill。

### Chat context pre-fill(若 Step 3 提取到对话)

据 user 在本 session 对话中**明确给的事实**(outcomes 场景 / scope 边界 / constraints 数字 / 框架决策 / 已定的 entity / endpoint / etc.)pre-fill 对应 placeholder,**留下未讨论 / 未确定项** 作 `{{TODO ...}}` 或 `(待 ADR-NNNN-XXX)` defer。

**不要凭印象**补 chat 没说的细节 ── 比如 user 说 "做 email verification" 但没说 endpoint 路径,**不要 plant** `/api/v1/auth/verify`;留 `{{TODO — endpoint path}}` 或 `(待 ADR-NNNN-API)`。

pre-fill 时在对应位置 inline 标注 `<!-- pre-filled from chat: <quote> -->`,Step 6.3 audit 可据此 trace。

## Step 6 — 报告 + reminders + audit

### 6.1 文件 ready 报告

```
✅ Spec created: docs/specs/<NNN>-<slug>/
   ├── spec.md  —— §1 Outcomes / §2 Scope / §3 Constraints / §4 Verification
   ├── plan.md  —— §1 模块影响 / §2 架构决策 / §3 Prior decisions
   └── tasks.md —— §1 任务清单(30min-2h 颗粒度)

📌 Module decision: {{以下之一}}
   - 扩展既有 `<module>`(不建新模块)
   - 建议新模块:`<path>`(plan/tasks 已加 skeleton)
   - 需用户澄清:<具体选项>

📝 (若 chat context 触发)已据本 session 对话 pre-fill 部分 placeholder ── 详见 spec/plan/tasks 内 inline `<!-- pre-filled from chat -->` 标注。
```

### 6.2 Reminders(user 自判,不预问)

```
⚠️ Mission-critical checkpoints(`/spec-quality-check` 会 gate,不填进不了实施):
  - spec.md §2 `**不做**:` 至少 2-3 条(Q2 强约束)── scope creep 防御主战场
  - (若多模块)plan.md §1.1 Sibling Alignment ── 每个兄弟模块选 Align / Deviate / Codify(Q6 强约束)

📌 (若 Step 4 建了新模块)新模块 `<path>` 若反常(不同存储 / 特殊并发 / 公共 API 契约 / 不同第三方库范式)── 后续记得加 `<path>/AGENTS.md`(差量于父级)+ `<path>/CLAUDE.md` 1 行 alias。99% 模块跟父级一致,不反常就不加(workflow.md §2.3)。

💡 Conversational fill 引导(主会话继续聊):
  1. 贴 / 接着聊业务想法 → AI 据 placeholder 引导迭代填(参考 spec-driven.md §3.6.5 SOP)
  2. 不确定 stack / library 时直接说 'research X vs Y for [context]' → AI 会用 tech-researcher
  3. 不熟悉外部库 / 要查版本约束时说 '拉 context7 文档' → AI 用 context7 MCP(回退 WebFetch)摘进 plan.md §2,避免实施时 AI 猜 API 形状(workflow §3.1 决策清单 #3)
  4. 不确定细节(字段类型 / API 契约 / 错误码 / etc.)用 `(待 ADR-NNNN-XXX)` defer ── **不要凭印象 plant 'reasonable default'**
  5. 对照 `.claude/rules/<framework>.md` 中项目已定的 idiom 写,避免 drift
```

### 6.3 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

Dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md) 审 Step 5 chat pre-fill 的内容(若有 pre-fill;若纯空骨架则可跳过):

- `files_to_audit`: `docs/specs/<NNN>-<slug>/{spec,plan}.md`
- `qa_answers`: Step 4 框架决策(slug / NNN / module setup)+ Step 3 chat context 中 user 明确给的业务事实
- `language_conventions`: null
- `plugin_hardcoded_defaults`: `{value: "NNN-<slug>", source: "workflow.md §3 spec-driven"}` 一条即可

**典型 plant**(audit 应 catch):
- API endpoint path 凭空(`/api/v1/foo` 无 trace)→ 🚫
- 错误码具体值无 trace → 🚫(若 `.claude/rules/<framework>.md` 规定则 ✅)
- 字段名 / entity 名超出对话事实 → 🚫
- HTTP method 推测 → 🚫

**Block 规则**:🚫 > 0 → 告诉 user 在主会话据 audit feedback 修;⚠️ 不 block,直接展示(/spec-quality-check 时还会再 audit 一轮)。

### 6.4 收尾

```
✅ Scaffold + (若有)chat pre-fill 完成
✅ 决策完整性 audit:N 🚫 / M ⚠️(或:跳过 ── 纯空骨架无 pre-fill)

📝 下一步:主会话 conversational fill 剩余 placeholder(见 6.2 引导)
   填完后跑 `/project-workflow:spec-quality-check` 验收(机械检 + 主观二审 + audit 三层兜底)── 迭代到 pass。
```

## Failure modes

| 错误 | 应对 |
|---|---|
| AGENTS.md 不存在 | 中止,提示跑 `/project-init`(空目录)或 `/project-personalize`(已 clone scaffold)|
| Tier / 模块结构识别不出 | 问 user "本 feature 涉及哪些目录?" |
| Step 4 module 决策不明 | 生成文件前问 user,不要编造 |
| Step 5 chat context pre-fill 不确定 | 留 `{{TODO}}` 或 `(待 ADR-NNNN-XXX)`,不 plant default |
| Step 6.3 audit 标 🚫 | 告诉 user 主会话据 audit 反馈修;skill 不主动重 audit(等 user 主动跑 `/spec-quality-check`) |
| User 拒填 reminder 中的 mission-critical 项 | 不阻塞 ── `/spec-quality-check` Q2/Q6 会 gate,user 早晚要补 |
| Step 1 user 带了 `NNN-` 前缀(`003-foo`)| **不报错**:strip 前缀作 slug;前缀 NNN 进 Step 2 校验(匹配 / 跳号 / 冲突 三种处理)|

## Notes

- **Do not** generate code —— 本 skill 只产规划 artifact
- **Do not** overwrite existing `docs/specs/<NNN>-<slug>/`(碰撞检测:报错退出)
- **Conditional framework Q&A only**:仅在 slug / tier / module 不明时问;business 细节走主会话 conversational fill
