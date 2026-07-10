---
name: project-personalize
model: sonnet
description: Adapt a copied scaffold or retrofit a non-empty existing codebase to project-workflow. Creates, repairs, or personalizes AGENTS.md, scoped rules, commands, tiers, paths, and conventions from repository evidence plus user decisions. Accepts optional `$ARGUMENTS` target path. Not for an empty greenfield directory; use /project-init there.
---

**Response language**: Match the user's prompt language. File edits stay in the file's existing language.

# Project Personalize

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

Adapt a copied scaffold or non-empty existing codebase to project-workflow. The target may have a complete, partial, unrelated, or missing baseline.

**Use when**: clone 了 project-workflow-shaped scaffold / 非空既有项目 retrofit 进 project-workflow / 旧版升级后 baseline 或 tier-level 文件缺失。
**Not for**: greenfield 空目录 —— 用 `/project-workflow:project-init`。

## Step 0 — 解析 target 目录(可选 `$ARGUMENTS`)

空 → target = cwd;相对路径基于 cwd 解析;绝对路径直接用。目录不存在 → 报错中止。目录为空或仅含版本控制元数据 → 建议 `/project-init`;目录非空则继续 retrofit。然后 `cd "$TARGET_DIR"`——**后续所有 Step 的 bash / Edit / Write 都对此目录操作**。

## Step 1 — Detect existing state

`ls -la` 后报告:

| 检查项 | 状态 |
|---|---|
| 根 `AGENTS.md` | 存在 / 不存在 |
| 根 `AGENTS.md` 是否有 baseline 六要素 | 检测 `## Commands` + `## Testing` + `## Project Structure` + `## Code Style` + `## Git Workflow` + `## Boundaries` 齐否 |
| 根 `CLAUDE.md` | 存在与否 + 是否 `@AGENTS.md` alias |
| `.claude/rules/` | 存在 / 不存在 |
| Tier 目录 | 列出找到的 tier + 每个 tier 的 `AGENTS.md` / `CLAUDE.md` 状态 |

把状态分为三类并继续,不得形成循环重定向:
- baseline 完整 → personalization mode
- `AGENTS.md` 存在但缺部分六要素或使用自定义标题 → in-place retrofit;保留有效内容,只补缺口
- `AGENTS.md` 不存在但 codebase 非空 → bootstrap retrofit;从 plugin template 生成最小 baseline 草稿,再用仓库证据与用户答案渲染

只有目标目录为空时才建议 `/project-init`。

## Step 2 — User picks paths(可多选)

报告 detect 状态后展示可用 path,记录选择执行对应 Step 4.x。partial/missing baseline 时先加入 `(0) 建立或补齐 baseline` 且默认选中:

```
(A) 替换 scaffold default 值 —— 扫 AGENTS.md / docker-compose.yml 等找疑似 default
    (项目名 / DB 名 / container_name / domain),一一问实际值后替换
(B) 补齐 tier-level AGENTS.md(双文件方案)—— tier 有 CLAUDE.md 但无 AGENTS.md 时,
    内容移到 AGENTS.md,CLAUDE.md 改 1 行 @AGENTS.md alias
(C) 扫 codebase 推 Project Structure —— 扫实际目录 + 框架检测,更新 AGENTS.md 对应节
(D) 都不做,直接中止 → baseline 已完整时才可直接跑 /feature-init

要做哪些?(如 'A+B' / '全部' / 'D')
```

## Step 3 — `.claude/rules/` 自动加载检查(强制)

Claude Code 自动递归发现 `.claude/rules/**/*.md`;无 `paths:` 的 `security.md` 全局加载。检查根 AGENTS.md / CLAUDE.md:
- 存在 active 或 commented `.claude/rules/` import → 记为待移除的 stale scaffold 值,纳入 preview + approval
- 不存在 import → ✅

同时检查每个 rule:路径级规则必须用 `paths:` YAML list,global rule 必须省略 `paths:`;历史 scope key/scalar scope 记为必须迁移项,不维持兼容。

## Step 4.0 — 建立或补齐 baseline(仅 partial/missing)

- missing:从 `${CLAUDE_PLUGIN_ROOT}/template/` 复制最小 baseline,排除 examples、multi-tier examples 和 feature/domain templates;现有代码与配置永不覆盖。
- partial:保留已有 `AGENTS.md` 全部有效内容,补 Commands / Testing / Project Structure / Code Style / Git Workflow / Boundaries 中缺失的职责,标题可沿用项目语言与既有命名。
- 只使用 manifests、实际目录、已有配置和用户答案填值;未知命令显式 deferred。preview 后才写。
- hook 只有在确认 <5 秒、安全且支持单文件参数的命令后才激活并实测;否则保持 skeleton,记录 `hook: scaffold/inactive + reason`,端点检查交给 `feature-done`。

## Step 4.A — 替换 scaffold default 值

```bash
grep -lE '(scaffold|template|example|my-?app|sample|placeholder|TBD)' \
  AGENTS.md docker-compose*.yml package.json pyproject.toml .env.example 2>/dev/null
```

对每个 hit 检查上下文,跟用户逐项确认("这看起来是 scaffold default,你项目的实际值?答 '保留不改' / '改成 X'"),收齐后 Edit 批量替换。

**典型替换位置**:项目名(README / package.json / pyproject.toml `name`)、数据库名(env / docker-compose / connection strings)、container_name、domain / URL、auth secret 占位符。
**不要替换**:框架版本号(除非用户要求)、License、Author 信息(git config 已决定 commit author)。

## Step 4.B — 补齐 tier-level AGENTS.md(双文件方案)

先扫描列 plan,AskUserQuestion 确认后才执行:

```bash
find . -maxdepth 2 -name CLAUDE.md -not -path './CLAUDE.md' -exec dirname {} \; | sort -u | \
while read tier_dir; do
  [ -f "$tier_dir/CLAUDE.md" ] && [ ! -f "$tier_dir/AGENTS.md" ] && \
    ! grep -qE '^@AGENTS\.md\s*$' "$tier_dir/CLAUDE.md" && \
    echo "  📝 $(basename "$tier_dir")/ — mv CLAUDE.md ($(wc -l < "$tier_dir/CLAUDE.md") 行) → AGENTS.md + CLAUDE.md 变 @alias"
done
```

确认选项:`(y)` 全做 / `(n)` 取消 / `(s)` 列号多选。确认后每 tier 执行 `mv CLAUDE.md AGENTS.md && echo '@AGENTS.md' > CLAUDE.md`,报告结果。

## Step 4.C — 扫 codebase 推 Project Structure(委托 codebase-explorer)

Dispatch [`codebase-explorer`](../../agents/codebase-explorer.md) sub-agent,prompt 至少含:
- `Project root`: . (cwd)
- `Tier context`: Step 1 detect 到的 tier dirs(如 backend + frontend)
- `Existing AGENTS.md`: ./AGENTS.md(对比已声明 vs 实际)
→ 扫顶层结构 + framework manifest + module structure + 规模,返回结构化报告 + `## Project Structure` 节更新建议。

拿到报告后:1) **完整展示给用户**(报告本身是 deliverable) 2) 问"要写入 AGENTS.md 吗?(yes / no / edit 后写入)" 3) yes / edit 后 → Edit 替换对应节;no → 跳过。

## Step 4.D — 决策完整性 audit(强制,workflow §1.12)

落盘前 dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md)审 4.A/B/C 累积修改:
- `files_to_audit`: 本次涉及的所有文件(根 AGENTS.md + tier-level + `.claude/rules/*`)inline content
- `qa_answers`: Step 2 选的 paths + 4.A 替换答案 + 4.B tier 答案 + 4.C 接受/拒绝决定;`language_conventions`: null
- `plugin_hardcoded_defaults`: 同 `/project-init` reference.md R6 清单
- **Retrofit 模式**:从既有代码扫出的决策(framework / tier 命名)标 `(retrofit: from existing code)` 视同 ✅

**Block 规则**:🚫 > 0 不进 Step 5,按修正选项处理后重跑本 step;⚠️ 不 block,Step 6 一并展示。

## Step 5 — Self-verify(强制)

```bash
# V1 placeholder 残留            # V2 frontmatter(description + paths YAML list;security.md 仅 description)
grep -rn '{{' --include='*.md' AGENTS.md .claude/rules/*.md 2>/dev/null
head -10 .claude/rules/*.md 2>/dev/null
```

agent 据输出对照:**V3** paths list 中每个 pattern 的 path prefix 真存在(personalize 改 tier 名后易遗漏),并把历史 scope key/scalar scope 迁移为 YAML list;运行时 **V5** `/memory` 加载齐、**V7** hook 为 `active + verified` 或 `scaffold/inactive + reason`、**V8** 自问一句话总结栈 + 命令(4 要素全对)。任一 ❌ → 修完再进 Step 6。报告格式:`V1✅ V2✅ V3✅ V5✅ V7✅active/⚪scaffold(reason) V8✅`。

## Step 6 — Summary

```markdown
## ✅ Project personalize complete

### 做了什么
- Step 3 security.md @import:{enabled / 已是 / missing 提示}
- Hook:{active + verified / scaffold/inactive + reason}
- (A) 替换了 {N} 个 scaffold default 值:{list}
- (B) 补齐了 {M} 个 tier 的 AGENTS.md + alias:{list}
- (C) 更新了 AGENTS.md `## Project Structure` 节

### 还需手工 review
- **`## Boundaries` 节**:项目特定的 ⚠️ Ask first 项只有你知道,扫一遍补上
- AGENTS.md 全文确认 personalize 后的值都对;`wc -l` > 200 行则精简(workflow §1.3)
- 想加 framework rules:从 `$PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md` 复制,改 paths YAML list + description;`$PLUGIN_ROOT` 指当前安装的 project-workflow plugin 根目录(Claude/Codex adapter 各自解析)

### 📋 下一步
1. `git add . && git diff --cached` 后 commit:`git commit -m "P0: personalize project baseline"`
2. (retrofit 特别建议)补 ADR 捕获既有架构决策的 why(framework / ORM / DB / 前端栈 各一份,见 workflow §1.8)
3. `/project-workflow:feature-init <your-first-feature-slug>`
```

## Failure modes

| 错误 | 应对 |
|---|---|
| 空目录 | Step 0 建议 `/project-init` |
| 非空项目无 AGENTS.md | Step 4.0 bootstrap retrofit |
| AGENTS.md 缺六要素或自定义标题 | Step 4.0 in-place retrofit,不覆盖有效内容 |
| 4.A 扫不到 default 值 | 报告"未发现明显 default,跳过 Path A" |
| 4.B tier 都已有 AGENTS.md | 报告"双文件方案已齐,无需补" |
| 4.C 建议用户不满意 | 用户选 "edit",手工调整后再应用 |
| Git 工作树脏 | 警告"建议先 commit 再跑 personalize"(不强制) |
