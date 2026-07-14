---
name: feature-init
model: sonnet
description: "Create a feature artifact when tracking is needed. Full lane: docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md (brownfield lean when a substantive domain doc exists; greenfield full spec otherwise). Light lane: tasks.md only. Reads E-class domain docs under docs/specs/ when present."
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Feature Init

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

Start a tracked feature artifact when the task needs project-workflow. Business 细节走主会话 conversational fill([spec-driven.md §3.6.5](../../docs/spec-driven.md#365-phase-a填-todos-的-ai-协作-sop));全道质量由 `/spec-quality-check` 把关。

**Use when**: P2 — 值得 track 的新 feature / 变更。全道 = 跨模块/跨边界或架构 / 数据模型 / API 契约变更([workflow.md §3.1](../../docs/workflow.md#31-规划阶段));同模块小改可走轻车道(仅 tasks.md,见 Step 4.5);键盘级局部改 / 文案样式 / 局部测试修复 / 低风险文档不启动 project-workflow。已确认 spec 下的实施任务继续原 `tasks.md`;spec/plan 错走 `/spec-revise`。
**Not for**: P0 scaffolding(`/project-init`)/ 实施中改 spec(`/spec-revise`)/ 收尾交付(`/feature-done`)。

User input: `$ARGUMENTS` — feature slug + optional description.

## Step 0 — 确认目标项目根

`TARGET_ROOT` 是本次 feature artifact 的唯一写入根目录,必须包含 `AGENTS.md` 和 `docs/specs/`。解析顺序按 canonical Invariants(cwd → 最近父级 → 单一子目录 → 问用户,不猜);用了非 cwd 候选要在报告中写明。
后续 Bash / Edit / Write / apply_patch 都必须写入 `$TARGET_ROOT` 下的路径;不要依赖先前 `cd` 状态或裸 `docs/specs/...` 相对路径。创建完成后验证文件确实落在 `$TARGET_ROOT/docs/specs/changes/<NNN>-<slug>/`。

## Step 1 — 解析输入

| 输入格式 | 处理 |
|---|---|
| 仅 `<slug>` | 直接用 |
| `<slug>: <description>` | 拆 slug 和 description |
| `<NNN>-<slug>`(± description)| strip 前导 `\d{3}-` 作 slug,NNN 进 Step 2 校验 |
| 空 | 问用户 "feature slug? (kebab-case)" |

Slug 要求(strip 后):kebab-case(`a-z0-9-`)、2-40 chars、不以 `-` 开头结尾;不合法请用户改正。

## Step 2 — 预备 NNN 编号(仅 artifact 情况使用)

只算候选编号;若 Step 4.5 判定无需 artifact,不分配不建目录。

```bash
{ ls "$TARGET_ROOT/docs/specs/changes/" ; ls "$TARGET_ROOT/docs/specs/changes/archive/" 2>/dev/null ; } | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

编号规则与 **NNN 前缀冲突**(Step 1 给了 NNN 时)按 canonical [Shared runtime conventions](../../docs/actions/README.md#shared-runtime-conventions) + canonical Outputs 的冲突三分支处理;不覆盖既有目录。

## Step 3 — 读项目 context

> A 类约定两个 core 载体(workflow §0.3 / §1.3):AGENTS.md 多层 + path-scoped rules(Claude materialization = `.claude/rules/*.md`)。

**必读**:
- `$TARGET_ROOT/AGENTS.md` —— 缺则报 "项目无 project-workflow baseline,先跑 `/project-init` 或 `/project-personalize`" 并中止。
- **`$TARGET_ROOT/docs/specs/`(E 类)** —— 读 `index.md`(若存在)+ 全部已有 `docs/specs/<area>.md`(排除 `index.md`)。已有 area doc **优先于** `docs/specs/changes/archive/` 里历史 change 作 pre-fill context。活动区同域有互相矛盾的历史 change → Step 6 提示 `/spec-reconcile`。

**选读**(缺失静默跳过):
- `<tier>/AGENTS.md` 每个 tier —— tier 特异约定
- **`.claude/rules/*.md` 全集** —— 读 frontmatter `paths:` YAML 列表,记"哪条规则约束哪些路径";无 `paths:` 按全局规则,供 Step 5 pre-fill + Step 6 reminders 对照 feature scope
- **本 session 早期对话** —— user 已讨论过本 feature 的,提取**用户明确给的细节**作 Step 5 pre-fill input

### 扫描项目结构(tier-aware)

不写死 `backend/` `frontend/`,据实际推:根 AGENTS.md 提到的 tier 目录 → 不明则扫含 AGENTS.md 的子目录(maxdepth 2)→ 每 tier 按类型扫模块(service:`src|app|internal/*/`;UI:`src/{modules,views,features}/*/`;单 tier 扫 `./src/*/`)。识别不出 → 问用户 "本 feature 涉及哪些目录?"

### Step 3.5 — 域(E)判定

1. **推断触达域** `primary_area`:从 slug / description / 模块路径 / chat;无法推断 → 问 user 选一个 area(kebab-case);仍不明可先用 slug 作为候选。
2. **已有实质 E**:`docs/specs/<primary_area>.md` 存在且包含非模板的当前行为 / 关键约束 → `SPEC_SHAPE=brownfield`,全道用 `spec-brownfield.md`。
3. **无实质 E**:不要为了分类先创建空 domain doc → `SPEC_SHAPE=greenfield`,全道用 `spec-greenfield.md`;首个 READY 后 `/feature-archive` 必须把持久结论 merge 进新建 domain doc。
4. **显式创建例外**:只有当用户已提供可写入 E 的当前事实,且希望先建立 domain baseline 时,才从 `$PLUGIN_ROOT/template/docs/specs/_template/domain.md` 创建 `$TARGET_ROOT/docs/specs/<primary_area>.md` 并更新 `$TARGET_ROOT/docs/specs/index.md`;创建后仍需确认这些事实不是本次 change 的未验证意图。
5. 记录 `SPEC_SHAPE=brownfield|greenfield` 供 Step 5 / Step 6 使用。

## Step 4 — 检测 Module Setup 需要(workflow §2)

判定按 [workflow.md §2](../../docs/workflow.md#2-module-setupp2-内的-sub-flow非独立-phase):扩展既有模块 → 不建新模块,plan 注 "extends `<X>`";全新领域 → 需新建模块,plan/tasks 加 skeleton;跨 tier 逐 tier 单独判。**横跨 2+ 模块主家不明或任何不确定 → 先问用户,不编造模块决定。** 新模块的反常判定不预问——作 Step 6.2 reminder 给 user 自判(workflow §2.3)。

## Step 4.5 — 入口分流(无需新 artifact / 轻车道 / 全道)

分流语义(是否需要新 artifact / 3 道 trip / 不确定分级 / Bundle rule / 升级安全闸)**整体按 canonical Lane Classification 执行**,细化判据见 [spec-driven §3.2.5](../../docs/spec-driven.md#325-入口分流先判是否需要-project-workflow);此处只记 Claude 执行点:

- 命中"无需新 artifact" → 输出 "No new project-workflow artifact needed; continue directly and close with checks." 停止本 skill;直接做仍遵守 AGENTS.md / path rules / lint / test / hook。
- **行为变更下限**:改变 `docs/specs/<area>.md` 已声明行为/持久规则 → 无论 diff 多小至少走轻车道(domain doc 唯一写入口是 `feature-done` pending → `feature-archive` merge,绕过即腐化)。
- 3 道 trip(规模 / 可逆性 / 爆破半径)**全 yes 才轻车道,任一 no → 全道**;规模项要求 Step 4 未判定新建模块;爆破半径对照根 AGENTS.md「灾难性不变量 / 高爆破半径路径」节(节缺失则问用户保守判)。
- 不确定分级与 Bundle rule 按 canonical;不确定业务目标 → 先问用户,不建 spec。

## Step 5 — 生成 change artifact(按车道)

模板源 `$PLUGIN_ROOT/template/docs/specs/changes/_template/`。全道 = `{spec,plan,tasks}.md`;轻车道 = 仅 `tasks-light.md` → `tasks.md`。创建必须调用 packaged materializer;不要用 `mkdir -p` + `cp` 自行重写 no-clobber 逻辑。

```bash
PLUGIN_ROOT="${PROJECT_WORKFLOW_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${CODEX_PLUGIN_ROOT:-}}}"
MATERIALIZER="${PLUGIN_ROOT:+$PLUGIN_ROOT/scripts/materialize-feature-artifact.cjs}"
if [ -z "$PLUGIN_ROOT" ] || [ ! -d "$PLUGIN_ROOT/template" ] || [ ! -f "$MATERIALIZER" ]; then
  MATERIALIZER="$(find "$HOME/.claude/plugins/cache" "$HOME/.codex/plugins/cache" -type f -path '*/project-workflow*/scripts/materialize-feature-artifact.cjs' -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | grep '/scripts/materialize-feature-artifact.cjs$' | head -1)"
  PLUGIN_ROOT="${MATERIALIZER%/scripts/materialize-feature-artifact.cjs}"
fi
[ -n "$PLUGIN_ROOT" ] && [ -d "$PLUGIN_ROOT/template" ] && [ -f "$MATERIALIZER" ] || { echo "Cannot resolve a compatible project-workflow package with feature materializer"; exit 1; }
# 全道:
node "$MATERIALIZER" --target "$TARGET_ROOT" --number "$NNN" --slug "$SLUG" --lane full --shape "$SPEC_SHAPE"
# 轻车道(替代上一行):
# node "$MATERIALIZER" --target "$TARGET_ROOT" --number "$NNN" --slug "$SLUG" --lane light
CHANGE_DIR="$TARGET_ROOT/docs/specs/changes/$NNN-$SLUG"
```

若 materializer 报 NNN 正被预约,只按错误中给出的 next NNN 更新 `$NNN` 后重试一次;不删除未知预约文件,也不退回手写 `mkdir` / `cp`。

复制后 Edit 替换 `<NNN>` / `<slug>` / `<TODAY>` / `{{area}}`→`primary_area`(brownfield)。`{{TODO ...}}` **保留**给 conversational fill。

**Brownfield pre-fill**:读 `$TARGET_ROOT/docs/specs/<primary_area>.md`,Motivation/Delta 只写**相对 domain 的差异**,不复制 domain 全文。

### Chat context pre-fill(若 Step 3 提取到对话)

只 pre-fill user **明确给的事实**(outcomes / scope / constraints / 框架决策 / entity / endpoint);未讨论项留 `{{TODO ...}}` 或 `(待 ADR-NNNN-XXX)`。**不凭印象补**——user 说 "做 email verification" 没说 endpoint 路径就不要 plant `/api/v1/auth/verify`。pre-fill 处 inline 标注 `<!-- pre-filled from chat: <quote> -->` 供 6.3 audit trace。

## Step 6 — 报告 + reminders + audit

### 6.1 文件 ready 报告

报告:创建路径 + 车道 + **spec 形态(brownfield/greenfield)** + `primary_area`;Module decision…;(brownfield)⚠️ change spec 填 Motivation + Delta,域全貌在 `docs/specs/<area>.md`;(greenfield)⚠️ 填 §1–§4,首次归档时由 `/feature-archive` 创建/更新 domain doc;(若发现矛盾历史 change)⚠️ `/spec-reconcile <area>`。

### 6.2 Reminders(user 自判,不预问)

```
⚠️ Mission-critical checkpoints:
  全道 brownfield(spec-quality-check):Delta 三子节 + Constraints + Verification;Motivation 不重复 domain doc
  全道 greenfield:spec.md §2 `**不做**:` 至少 2-3 条(Q2);§1 Outcomes 具体(Q4)
    (多模块)plan.md §1.1 Sibling Alignment 每个兄弟模块 Align / Deviate / Codify(Q6)
  轻车道:tasks.md 目标/边界 至少 1 条"不做" + 验证 至少 1 条可机验项(/spec-quality-check 不适用轻车道)

📌 (若建了新模块)`<path>` 若反常(不同存储 / 特殊并发 / 公共 API 契约)→ 补 `<path>/AGENTS.md`
   (差量于父级)+ CLAUDE.md 1 行 alias;不反常不加(workflow §2.3)

💡 Conversational fill 引导:主会话接着聊业务想法,AI 据 placeholder 迭代填(§3.6.5 SOP);
   不确定 stack 说 'research X vs Y' → tech-researcher;要查外部库当前版本/约束 → tech-researcher 查官方文档
   → 摘进 plan.md §2;不确定细节用 `(待 ADR-NNNN-XXX)` defer,不 plant 'reasonable default';
   只有架构/模块边界、持久跨 feature 技术决定或取代既有 ADR 时才实例化 ADR并在 plan 引用;
   对照 `.claude/rules/<framework>.md` 已定 idiom 写,避免 drift
```

### 6.3 按 pre-fill 复杂度选择 trace check / auditor

纯空骨架跳过。dispatch 与否按 canonical [Dispatch Boundary](../../docs/reviewers/decision-completeness-auditor.md#dispatch-boundary) 判:简单单源 pre-fill → 主 skill 输出“值 → 来源”紧凑 trace matrix;命中 boundary → dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md):
- `files_to_audit`: 全道 `{spec,plan}.md`;轻车道 `tasks.md`
- `qa_answers`: Step 4 框架决策(slug / NNN / module setup)+ chat 中 user 明确给的业务事实;`language_conventions`: null
- `plugin_hardcoded_defaults`: `{value: "NNN-<slug>", source: "workflow.md §3 spec-driven"}` 一条

**典型 plant**(audit 应 catch):endpoint path 凭空 / 错误码具体值无 trace(rules 文件规定则 ✅)/ 字段名超出对话事实 / HTTP method 推测 → 🚫。**Block 规则**:🚫 > 0 → 告诉 user 主会话据 feedback 修;⚠️ 不 block(spec-quality-check 还会再 audit)。

### 6.4 收尾

报告 scaffold + pre-fill 完成、trace/audit 结果与选择原因,下一步:主会话 conversational fill 剩余 placeholder → 填完跑 `/spec-quality-check`。

## Failure modes

| 错误 | 应对 |
|---|---|
| AGENTS.md 不存在 | 中止,提示 `/project-init` 或 `/project-personalize` |
| Tier / 模块结构识别不出 | 问 user "本 feature 涉及哪些目录?" |
| Module 决策不明 | 生成文件前问 user,不编造 |
| Pre-fill 不确定 | 留 `{{TODO}}` / `(待 ADR-NNNN-XXX)`,不 plant |
| Audit 标 🚫 | 告诉 user 主会话修;skill 不主动重 audit |
| User 拒填 mission-critical 项 | 不阻塞 —— spec-quality-check Q2/Q6 会 gate |
| 输入带 `NNN-` 前缀 | 不报错:strip 作 slug,NNN 进 Step 2 校验 |

## Notes

- **Do not** generate code / overwrite existing `docs/specs/changes/<NNN>-<slug>/`(碰撞报错退出)
- 仅在 slug / tier / module 不明时问;business 细节走主会话 conversational fill
- 车道完整判据 + 安全闸(验证保留 / 事后反核)见 [spec-driven §3.2.5](../../docs/spec-driven.md#325-入口分流先判是否需要-project-workflow)
