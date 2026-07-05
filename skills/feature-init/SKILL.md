---
name: feature-init
model: sonnet
description: Create a feature artifact only when the task needs new project-workflow tracking. Full lane creates docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md; light lane creates tasks.md only. Tiny bugfixes, wording/style tweaks, local test fixes, low-risk docs, and work already covered by an accepted spec should skip this skill.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Feature Init

Canonical action spec: `docs/actions/feature-init.md`. Follow that file for methodology rules; this skill adds Claude Code execution details.

Start a tracked feature artifact when the task needs project-workflow. Business 细节走主会话 conversational fill([spec-driven.md §3.6.5](../../docs/spec-driven.md#365-phase-a填-todos-的-ai-协作-sop));全道质量由 `/spec-quality-check` 把关。

**Use when**: P2 — 值得 track 的新 feature / 变更。全道 = 跨模块/跨边界或架构 / 数据模型 / API 契约变更([workflow.md §3.1](../../docs/workflow.md#31-规划阶段));同模块小改可走轻车道(仅 tasks.md,见 Step 4.5);键盘级局部改 / 文案样式 / 局部测试修复 / 低风险文档不启动 project-workflow。已确认 spec 下的实施任务继续原 `tasks.md`;spec/plan 错走 `/spec-revise`。
**Not for**: P0 scaffolding(`/project-init`)/ 实施中改 spec(`/spec-revise`)/ 收尾交付(`/feature-done`)。

User input: `$ARGUMENTS` — feature slug + optional description.

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
{ ls docs/specs/ ; ls docs/specs/archive/ 2>/dev/null ; } | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

最大编号 +1 补零到 3 位(**active + archive 共用序列**,归档编号不复用);空则从 `001` 起。

**NNN 前缀冲突**(Step 1 给了 NNN 时):等于 auto → 静默用;大于 auto → 问用哪个;≤ existing → 报 collision,改 auto 或换 slug。

## Step 3 — 读项目 context

> A 类约定两个 core 载体(workflow §0.3 / §1.3):AGENTS.md 多层 + path-scoped rules(Claude materialization = `.claude/rules/*.md`)。

**必读**:`AGENTS.md` —— 缺则报 "项目无 v2 baseline,先跑 `/project-init` 或 `/project-personalize`" 并中止。

**选读**(缺失静默跳过):
- **`docs/current/<area>.md`**(若存在且本 feature 触达该域)—— E 类产品事实,**优先于历史 feature spec** 作 pre-fill context;spec 引用它并按 delta 写变更([spec-driven §5.2](../../docs/spec-driven.md#52-current-truthe-类产品域现状))。**只读活动区**:`docs/specs/archive/` 不作 context 来源(持久结论在 current truth 里)。活动区同域有互相矛盾的历史 spec → Step 6 提示先跑 `/spec-reconcile`
- `<tier>/AGENTS.md` 每个 tier —— tier 特异约定
- **`.claude/rules/*.md` 全集** —— 读 frontmatter `globs:`,记"哪条规则约束哪些路径",供 Step 5 pre-fill + Step 6 reminders 对照 feature scope
- **本 session 早期对话** —— user 已讨论过本 feature 的,提取**用户明确给的细节**作 Step 5 pre-fill input

### 扫描项目结构(tier-aware)

不写死 `backend/` `frontend/`,据实际推:根 AGENTS.md 提到的 tier 目录 → 不明则扫含 AGENTS.md 的子目录(maxdepth 2)→ 每 tier 按类型扫模块(service:`src|app|internal/*/`;UI:`src/{modules,views,features}/*/`;单 tier 扫 `./src/*/`)。识别不出 → 问用户 "本 feature 涉及哪些目录?"

## Step 4 — 检测 Module Setup 需要(workflow §2)

| 情形 | 模块决策 |
|---|---|
| 明确扩展某一既有模块 | 不建新模块;plan 注 "extends `<X>`" |
| 横跨 2+ 模块,主家不明 | 问用户:哪个承担 / 怎么拆 |
| 全新领域 | **需新建模块** —— plan/tasks 加 skeleton |
| 跨 tier feature | 逐 tier 单独判 |

**不确定时先问用户,不编造模块决定。** 新模块的反常判定(跟父级约定是否不同)不预问——99% 选 n,作 Step 6.2 reminder 给 user 自判(workflow §2.3)。

## Step 4.5 — 入口分流(无需新 artifact / 轻车道 / 全道)

先判**是否需要新 artifact**(判据 [spec-driven §3.2.5](../../docs/spec-driven.md#325-入口分流先判是否需要-project-workflow))。**不启动 project-workflow**:小 bugfix / 文案样式微调 / 局部测试期望修复 / 低风险文档 / 键盘级局部改 / 已确认 spec 下的实施任务(spec/plan 错走 `/spec-revise`)。

**行为变更下限**(上列的例外,**仅当触达的域已有 `docs/current/<area>.md`**):改变用户可见行为或持久规则(默认值 / 校验上限 / 重试策略 / 状态流转)的改动,无论 diff 多小至少走轻车道 —— current truth 唯一写入口在管线上,绕过即静默腐化。该域未覆盖 → 不受此限。

命中"无需 artifact" → 输出 "No new project-workflow artifact needed; continue directly and close with checks." 停止本 skill;直接做仍遵守 AGENTS.md / path rules / lint / test / hook。

需要 artifact 时,3 道 trip **全 yes 才轻车道,任一 no → 全道**:

| # | 判据 | no → |
|---|------|------|
| 1 规模 | ≤ ~1 个内聚模块 / 单一职责,**且 Step 4 未判定新建模块**;文件数只是辅助信号 | 全道 |
| 2 可逆性 | additive / bugfix / polish 易回滚;**非**数据迁移 / API 或 schema 契约变更 | 全道 |
| 3 爆破半径 | 不触达根 AGENTS.md「灾难性不变量 / 高爆破半径路径」节声明的路径(节缺失则问用户保守判)| 全道 |

**不确定时分级**:不确定是否触达 API / DB / security / auth / multi-tenant / 迁移 / 跨模块契约 → 全道;不确定 UI 文案 / 样式 / 组件拆分 / 测试写法 → 不因此升级;不确定业务目标 → 先问用户,不建 spec。

**Bundle rule**:多个相关小改合成一个中等 feature,不碎 spec。轻车道是优化不是逃生舱;直接实施或轻车道中发现触达高危面 → 停,补 artifact 再继续。

## Step 5 — 生成 spec 文件(按车道)

模板源 `$PLUGIN_ROOT/template/docs/specs/_template/`。全道 = `{spec,plan,tasks}.md`;轻车道 = 仅 `tasks-light.md` → `tasks.md`。

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(ls -d ~/.claude/plugins/cache/project-workflow/project-workflow/*/ 2>/dev/null | sort -V | tail -1)}"
SRC="$PLUGIN_ROOT/template/docs/specs/_template"
mkdir -p "docs/specs/$NNN-$SLUG"
cp "$SRC/spec.md" "$SRC/plan.md" "$SRC/tasks.md" "docs/specs/$NNN-$SLUG/"   # 全道
# 轻车道改为只:cp "$SRC/tasks-light.md" "docs/specs/$NNN-$SLUG/tasks.md"
```

复制后 Edit 替换 `<NNN>` / `<slug>` / `<TODAY>`(YYYY-MM-DD,仅全道 spec.md)。`{{TODO ...}}` markers **保留**给后续 conversational fill。

### Chat context pre-fill(若 Step 3 提取到对话)

只 pre-fill user **明确给的事实**(outcomes / scope / constraints / 框架决策 / entity / endpoint);未讨论项留 `{{TODO ...}}` 或 `(待 ADR-NNNN-XXX)`。**不凭印象补**——user 说 "做 email verification" 没说 endpoint 路径就不要 plant `/api/v1/auth/verify`。pre-fill 处 inline 标注 `<!-- pre-filled from chat: <quote> -->` 供 6.3 audit trace。

## Step 6 — 报告 + reminders + audit

### 6.1 文件 ready 报告

报告:创建路径 + 车道(全道三件套结构 / 轻车道仅 tasks.md);Module decision(扩展既有 `<module>` / 建议新模块 `<path>` 已加 skeleton / 需用户澄清);(若触发)chat pre-fill 说明——详见文件内 inline 标注;(若 Step 3 命中)⚠️ 本域有 current truth `docs/current/<area>.md`,spec 请引用并按 delta 写;(若发现矛盾历史 spec)⚠️ 建议先跑 `/spec-reconcile <area>`。

### 6.2 Reminders(user 自判,不预问)

```
⚠️ Mission-critical checkpoints:
  全道(spec-quality-check 会 gate):spec.md §2 `**不做**:` 至少 2-3 条(Q2);
    (多模块)plan.md §1.1 Sibling Alignment 每个兄弟模块选 Align / Deviate / Codify(Q6)
  轻车道:tasks.md 目标/边界 至少 1 条"不做" + 验证 至少 1 条可机验项(/spec-quality-check 不适用轻车道)

📌 (若建了新模块)`<path>` 若反常(不同存储 / 特殊并发 / 公共 API 契约)→ 补 `<path>/AGENTS.md`
   (差量于父级)+ CLAUDE.md 1 行 alias;不反常不加(workflow §2.3)

💡 Conversational fill 引导:主会话接着聊业务想法,AI 据 placeholder 迭代填(§3.6.5 SOP);
   不确定 stack 说 'research X vs Y' → tech-researcher;要查外部库版本约束说 '拉 context7 文档'
   → 摘进 plan.md §2;不确定细节用 `(待 ADR-NNNN-XXX)` defer,不 plant 'reasonable default';
   对照 `.claude/rules/<framework>.md` 已定 idiom 写,避免 drift
```

### 6.3 决策完整性 audit(默认强制,workflow §1.12)

**降频条件**:最近 ≥ 3 个 feature 的 audit 全零 🚫(查收尾输出记录)→ 轻车道可跳过(报告标 "audit: 降频跳过"),全道仍跑;任一次再出 🚫 恢复强制;历史读不到照常跑。

Dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md)审 pre-fill 内容(纯空骨架可跳过):
- `files_to_audit`: 全道 `{spec,plan}.md`;轻车道 `tasks.md`
- `qa_answers`: Step 4 框架决策(slug / NNN / module setup)+ chat 中 user 明确给的业务事实;`language_conventions`: null
- `plugin_hardcoded_defaults`: `{value: "NNN-<slug>", source: "workflow.md §3 spec-driven"}` 一条

**典型 plant**(audit 应 catch):endpoint path 凭空 / 错误码具体值无 trace(rules 文件规定则 ✅)/ 字段名超出对话事实 / HTTP method 推测 → 🚫。**Block 规则**:🚫 > 0 → 告诉 user 主会话据 feedback 修;⚠️ 不 block(spec-quality-check 还会再 audit)。

### 6.4 收尾

报告 scaffold + pre-fill 完成、audit 结果(N 🚫 / M ⚠️ 或跳过原因),下一步:主会话 conversational fill 剩余 placeholder → 填完跑 `/spec-quality-check` 迭代到 pass。

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

- **Do not** generate code / overwrite existing `docs/specs/<NNN>-<slug>/`(碰撞报错退出)
- 仅在 slug / tier / module 不明时问;business 细节走主会话 conversational fill
- 车道完整判据 + 安全闸(验证保留 / 事后反核)见 [spec-driven §3.2.5](../../docs/spec-driven.md#325-入口分流先判是否需要-project-workflow)
