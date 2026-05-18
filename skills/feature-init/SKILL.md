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
- `docs/specs/_template/{spec,plan,tasks}.md` —— 仅当项目自定义 override(有 `.user-customized` 哨兵)
- `<tier>/AGENTS.md` 每个检测到的 tier —— 拿 tier 特异约定
- **`.claude/rules/*.md` 全集** —— A 类 peer to AGENTS.md(典型:`code-style.md` / `testing.md` / `security.md` + 可能的 `<framework>.md`)。读每个文件的 frontmatter `globs:`,记下"哪条规则约束哪些路径",Step 7.2 / 7.5 引导时按此对照本 feature 的 scope 提示用户

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

**Canonical 模板**:`$PLUGIN_ROOT/template/docs/specs/_template/{spec,plan,tasks}.md`(3 个文件,内容跟 [spec-driven.md §3.3](../../docs/spec-driven.md) 一致)。

**用户 override**:若用户项目本地有 `./docs/specs/_template/` 且含 `.user-customized` 哨兵 → 优先用本地版,跳过 plugin source。

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(ls -d ~/.claude/plugins/cache/project-workflow/project-workflow/*/ 2>/dev/null | sort -V | tail -1)}"

# 优先本地 override,否则用 plugin canonical
if [ -f "./docs/specs/_template/.user-customized" ]; then
  SRC="./docs/specs/_template"
else
  SRC="$PLUGIN_ROOT/template/docs/specs/_template"
fi

mkdir -p "docs/specs/$NNN-$SLUG"
cp "$SRC/spec.md"  "docs/specs/$NNN-$SLUG/spec.md"
cp "$SRC/plan.md"  "docs/specs/$NNN-$SLUG/plan.md"
cp "$SRC/tasks.md" "docs/specs/$NNN-$SLUG/tasks.md"
```

复制后用 Edit 工具替换 3 个 placeholder(对 3 个文件分别处理):
- `<NNN>` → 实际编号(如 `001`)
- `<slug>` → 实际 slug(如 `email-verification`)
- `<TODAY>` → 今天日期(YYYY-MM-DD;仅 spec.md 有)

`{{TODO ...}}` markers **保留**,留给用户(或 Step 7 Q&A)填。

> **数据模型 / API 契约不在 spec.md** —— canonical 把它们放进 plan.md §2 架构决策(HOW),不混淆 WHAT 和 HOW。

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

⚠️ 选 (y) 前注意:若你是 LLM 替 user 走 Q&A,务必**只答 user 在 Q&A 真给的细节**;user 未给的字段类型 / 数值上限 / 表名 / 库选型 / ADR 编号等**留 `(待 ADR-NNNN-...)` deferred 形式**,**不要 plant**"reasonable default"(Step 7.6b decision-completeness audit 会拦,但前置不 plant 体验更好)。
⚠️ 选 (n) 前注意:user 自填**务必先读** scaffold base modules(如 `backend/app/<existing-module>/`)+ 既有 `.claude/rules/*.md`(尤其 `<framework>.md`),避免跨文件 inconsistency / 违反项目既有 rule(如 raw SQL 违反 `.claude/rules/fastapi.md` 的 `select()` 规则)。

要我现在 Q&A 走完上面的 TODOs 吗?
  (y)es      → Q&A 走 framing(spec §1 Outcomes / plan §2 framing / spec §3 Constraints / spec §2 末"不做" / plan §1.1 Sibling)
                架构决策细节(字段类型 / API 契约 / 错误码 / 算法 等)Q&A 不深问 → user 自填 plan.md §2 placeholder
  (n)o       → 你后续自由填全部 spec/plan/tasks(参考 [`spec-driven §3.6.5`](../../docs/spec-driven.md#365-phase-a填-todos-的-ai-协作-sop)),完了跑 `/project-workflow:spec-quality-check`
  (s)kip §X  → 只填指定节(如 'skip 架构 framing' 跳过 plan §2)
```

## Step 7 — (可选)Q&A 填 TODOs

Step 6 末尾收到用户答 (y) / (n) / (s)。若 (n) → exit。若 (y) 或 (s),按下面顺序执行 7.1-7.6。

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

### Step 7.2 — plan.md §2 ── framing only,**不深问决策细节**

> Q&A medium 不擅长收集 ≥ 20 项结构化决策(entity 字段 / API 契约 / 错误码 / pagination / etc.);Feature 类型多样(CRUD / FE / job / refactor / infra / ML),固定 Q&A 不通用。**Plugin 立场**:framing 由 Q&A,细节由 caller 文件编辑 + audit gate(Step 7.6b)catch plant + inconsistency。

问 framing:

```
1. "本 feature 大致形状?"(1-2 句)
   - HTTP API / 后台 job / 纯前端 / refactor / 其他?
   - 涉及数据持久化?
   - 涉及第三方库 / 外部 API?(若 yes 列已知)

2. (按需)用户对 ORM / API 风格 / 库选型不确定 → 先查 `.claude/rules/<framework>.md` 有无定论;无 + 用户要研究 → dispatch [`tech-researcher`](../../agents/tech-researcher.md)

3. (按需)plan §2 涉及多个外部库 / 不熟悉 API → 问"拉文档 reference?";yes → `context7` MCP(回退 `WebFetch`),关键部分摘进 plan.md §2
```

写 framing summary(2-3 句)进 plan.md §2 顶部 prose,**不**填具体字段 / 契约 / 错误码集。

提示用户:

> "✅ §2 framing 已记。具体架构决策(字段类型 / API 契约 / 错误码 / pagination / 算法)请**直接编辑 plan.md §2** placeholder;不确定细节用 `(待 ADR-NNNN-XXX)` defer,**不要 plant 'reasonable default'**;对照 `.claude/rules/<framework>.md` 项目已定 idiom 写。Step 7.6b audit 兜底。"

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

### Step 7.6b — 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

报告之前,dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md)(input/output 详见 agent doc)审 Step 7.1-7.6 累积填写:

- `files_to_audit`: `docs/specs/<NNN>-<slug>/{spec,plan}.md`(tasks.md 多为引用 spec/plan,通常不审 ── 除非 Step 7 也填了 tasks.md)
- `qa_answers`: Step 7.1-7.6 所有 Q&A 答案(Outcomes 场景 / API endpoints / 字段 / Constraints / Verification 场景 / Sibling Alignment / etc.),dot-path keyed
- `language_conventions`: null
- `plugin_hardcoded_defaults`: 最小集 — feature-level 主要审 plant **API path / 字段名 / 错误码 / library 选择**;`{value: "NNN-<slug>", source: "workflow.md §3 spec-driven", rationale: "feature 编号 + slug 约定"}` 一条即可

**典型 plant**(audit 应 catch):
- API endpoint path 凭空(`/api/v1/foo` Q&A 没具体路径) → 🚫
- 错误码具体值(401 / 404 / 422 Q&A 没问) → 🚫(若 .claude/rules/<framework>.md 规定则 ✅)
- 字段名 / entity 名超出 Q&A → 🚫
- HTTP method 推测(Q&A 答 "REST" 但具体 method / endpoint plant 出来) → 🚫

**Block 规则**:🚫 > 0 不进 Step 7.7,按 agent 修正选项处理(回 Q&A 追问 / deferred / 删过具体处)后**重跑本 step**;⚠️ 不 block,Step 7.7 同时展示。

### Step 7.7 — 报告 + 提示下一步

```
✅ spec §1 + plan §2 + spec §3 + spec §2 Exclude + spec §4 + plan §1.1 已 Q&A 填完。
✅ 决策完整性 audit 通过(0 🚫;N ⚠️ 已展示)。

下一步:跑 `/project-workflow:spec-quality-check` 验已填内容是否合格(机械检 + 主观二审)。
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

- **Do not** generate code —— 本 skill 只产规划 artifact
- **Do not** overwrite existing `docs/specs/<NNN>-<slug>/`(碰撞检测:报错退出)
- **Template source**:canonical 模板在 `$PLUGIN_ROOT/template/docs/specs/_template/{spec,plan,tasks}.md`(Step 5 直接 cp)。若项目有 `./docs/specs/_template/` + `.user-customized` 哨兵 → 优先用本地 override
