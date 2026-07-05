---
name: project-personalize
model: sonnet
description: Adapt a scaffold-cloned or v2-shaped existing project to user's specifics. Replaces scaffold defaults (project name / DB / etc.), completes tier-level AGENTS.md per 双文件 scheme, dispatches codebase-explorer sub-agent to scan existing structure. Accepts optional `$ARGUMENTS` = target directory path (defaults to current working directory) — useful for monorepos where the v2-shaped sub-project isn't the cwd. Claude Code-native. Use when you've cloned a v2 scaffold or want to retrofit an existing project; **if you want ready-to-run full stack starting from a scaffold, this is the right tool — don't use /project-init for that** (project-init is conventions-only, doesn't scaffold code). Not for greenfield empty directories — use /project-init for that.
---

**Response language**: Match the user's prompt language. File edits stay in the file's existing language.

# Project Personalize

Canonical action spec: `docs/actions/project-personalize.md`. Follow that file for methodology rules; this skill adds Claude Code execution details.

Adapt a project that **already has** v2 baseline files (AGENTS.md / `.claude/`) to your specific values, tier structure, and codebase reality.

**Use when**: clone 了 v2-shaped scaffold(如 `shrekshrek/full-stack-scaffolding-fastapi-nuxt4`)/ 既有项目 retrofit 进 v2 / v2 升级后 tier-level 文件缺失。
**Not for**: greenfield 空目录 —— 用 `/project-workflow:project-init`。

## Step 0 — 解析 target 目录(可选 `$ARGUMENTS`)

空 → target = cwd;相对路径基于 cwd 解析;绝对路径直接用。目录不存在 → 报错中止(personalize 要求已有 v2 baseline,建议改用 `/project-init`)。然后 `cd "$TARGET_DIR"`——**后续所有 Step 的 bash / Edit / Write 都对此目录操作**。

## Step 1 — Detect existing state

`ls -la` 后报告:

| 检查项 | 状态 |
|---|---|
| 根 `AGENTS.md` | 存在 / 不存在 |
| 根 `AGENTS.md` 是否 v2 六要素 | 检测 `## Commands` + `## Testing` + `## Project Structure` + `## Code Style` + `## Git Workflow` + `## Boundaries` 齐否 |
| 根 `CLAUDE.md` | 存在与否 + 是否 `@AGENTS.md` alias |
| `.claude/rules/` | 存在 / 不存在 |
| Tier 目录 | 列出找到的 tier + 每个 tier 的 `AGENTS.md` / `CLAUDE.md` 状态 |

**根 AGENTS.md 不存在或非 v2 六要素** → "这不像 v2-shaped 项目,建议先跑 `/project-init`" → 中止。否则继续。

## Step 2 — User picks paths(可多选)

报告 detect 状态后展示 4 条 path,记录选择执行对应 Step 4.x:

```
(A) 替换 scaffold default 值 —— 扫 AGENTS.md / docker-compose.yml 等找疑似 default
    (项目名 / DB 名 / container_name / domain),一一问实际值后替换
(B) 补齐 tier-level AGENTS.md(双文件方案)—— tier 有 CLAUDE.md 但无 AGENTS.md 时,
    内容移到 AGENTS.md,CLAUDE.md 改 1 行 @AGENTS.md alias
(C) 扫 codebase 推 Project Structure —— 扫实际目录 + 框架检测,更新 AGENTS.md 对应节
(D) 都不做,直接中止 → 跑 /feature-init 开始第一个 feature

要做哪些?(如 'A+B' / '全部' / 'D')
```

## Step 3 — security.md @import 启用检查(强制)

`security.md` 无 `globs:`(always-on)→ 必须 `@import` 强制加载,注释掉 = silent fail。grep 根 AGENTS.md 三态:
- `@.claude/rules/security.md` 已启用 → 跳过
- `<!-- @.claude/rules/security.md -->` 注释 → AskUserQuestion(y/n)→ y → Edit 取消注释
- 整行 missing → 报告"建议手工追加(workflow §1.5)",不自动加(可能破坏自定义结构)

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
# V1 placeholder 残留            # V2 frontmatter(description + globs;security.md 仅 description)
grep -rn '{{' --include='*.md' AGENTS.md .claude/rules/*.md 2>/dev/null
head -10 .claude/rules/*.md 2>/dev/null
```

agent 据输出对照:**V3** globs path prefix 真存在(personalize 改 tier 名后易遗漏);运行时 **V5** `/memory` 加载齐、**V8** 自问一句话总结栈 + 命令(4 要素全对)。任一 ❌ → 修完再进 Step 6。报告格式:`V1✅ V2✅ V3✅ V5✅ V8✅`(retrofit 项目命令 / hook 通常已就位,不标 deferred)。

## Step 6 — Summary

```markdown
## ✅ Project personalize complete

### 做了什么
- Step 3 security.md @import:{enabled / 已是 / missing 提示}
- (A) 替换了 {N} 个 scaffold default 值:{list}
- (B) 补齐了 {M} 个 tier 的 AGENTS.md + alias:{list}
- (C) 更新了 AGENTS.md `## Project Structure` 节

### 还需手工 review
- **`## Boundaries` 节**:项目特定的 ⚠️ Ask first 项只有你知道,扫一遍补上
- AGENTS.md 全文确认 personalize 后的值都对;`wc -l` > 200 行则精简(workflow §1.3)
- 想加 framework rules:cp `$CLAUDE_PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md` 改 globs + description

### 📋 下一步
1. `git add . && git diff --cached` 后 commit:`git commit -m "P0: personalize project baseline"`
2. (retrofit 特别建议)补 ADR 捕获既有架构决策的 why(framework / ORM / DB / 前端栈 各一份,见 workflow §1.8)
3. `/project-workflow:feature-init <your-first-feature-slug>`
```

## Failure modes

| 错误 | 应对 |
|---|---|
| 非 v2-shaped(无 AGENTS.md 或非六要素)| Step 1 报错 + 建议 `/project-init` |
| 4.A 扫不到 default 值 | 报告"未发现明显 default,跳过 Path A" |
| 4.B tier 都已有 AGENTS.md | 报告"双文件方案已齐,无需补" |
| 4.C 建议用户不满意 | 用户选 "edit",手工调整后再应用 |
| Git 工作树脏 | 警告"建议先 commit 再跑 personalize"(不强制) |
