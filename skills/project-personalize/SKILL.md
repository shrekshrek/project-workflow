---
name: project-personalize
model: sonnet
description: Adapt a scaffold-cloned or v2-shaped existing project to user's specifics. Replaces scaffold defaults (project name / DB / etc.), completes tier-level AGENTS.md per 双文件 scheme, dispatches codebase-explorer sub-agent to scan existing structure. Accepts optional `$ARGUMENTS` = target directory path (defaults to current working directory) — useful for monorepos where the v2-shaped sub-project isn't the cwd. Claude Code-native. Use when you've cloned a v2 scaffold or want to retrofit an existing project; **if you want ready-to-run full stack starting from a scaffold, this is the right tool — don't use /project-init for that** (project-init is conventions-only, doesn't scaffold code). Not for greenfield empty directories — use /project-init for that.
---

**Response language**: Match the user's prompt language. File edits stay in the file's existing language.

# Project Personalize

Canonical action spec: `docs/actions/project-personalize.md`. Follow that file for methodology rules; this skill adds Claude Code execution details.

Adapt a project that **already has** v2 baseline files (AGENTS.md / `.claude/`)—typically because you cloned a v2 scaffold or are retrofitting an existing project—to your specific values, tier structure, and codebase reality.

**Use when**:
- You cloned a v2-shaped scaffold(如 [`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4))
- 既有项目想 retrofit 进 v2(已有 AGENTS.md 但需要清理)
- v2 升级后某些 tier-level 文件缺(如双文件方案落地前的项目)

**Not for**: greenfield(空目录从零起)—— 用 `/project-workflow:project-init` 替代。

## Step 0 — 解析 target 目录(可选 `$ARGUMENTS`)

User input: `$ARGUMENTS` — optional target directory path. Empty → 用当前工作目录(cwd)。

| 输入 | 处理 |
|---|---|
| 空 | target = `pwd`,跳过 cd,继续 Step 1 |
| 相对路径(如 `apps/web-portal`) | 基于 cwd 解析为绝对路径 |
| 绝对路径(如 `/Users/foo/cloned-scaffold`) | 直接用 |

解析后:

```bash
TARGET_DIR="<resolved absolute path>"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Target $TARGET_DIR 不存在 —— project-personalize 要求目录已有 v2 baseline 文件,无法初始化空目录。"
  # 中止;建议用 /project-init
fi

cd "$TARGET_DIR"
```

**后续所有 Step 的 `ls -la` / `find` / Edit / Write 都对此 target 目录操作**。省略 `$ARGUMENTS` 完全 backward-compatible(沿用原 cwd 行为)。

## Step 1 — Detect existing state

```bash
ls -la       # 此时 cwd 已是 target
```

报告检测到的状态:

| 检查项 | 状态 |
|---|---|
| 根 `AGENTS.md` | 存在 / 不存在 |
| 根 `AGENTS.md` 是否 v2 六要素结构 | 检测 `## Commands` + `## Testing` + `## Project Structure` + `## Code Style` + `## Git Workflow` + `## Boundaries` 是否齐 |
| 根 `CLAUDE.md` | 存在 / 不存在 + 是否 `@AGENTS.md` alias |
| `.claude/rules/` | 存在 / 不存在 |
| Tier 目录(`backend/` / `frontend/` / `server/` / etc.) | 列出找到的 tier + 每个 tier 的 `AGENTS.md` / `CLAUDE.md` 状态 |

**若根 `AGENTS.md` 不存在或非 v2 六要素结构** → 告诉用户:"这不像 v2-shaped 项目。建议先跑 `/project-init` 从零起 v2 baseline。" → 中止。

**否则**继续 Step 2。

## Step 2 — User picks paths (可多选)

报告 Step 1 detect 的状态,然后展示 4 条 path:

```
检测到 v2-shaped 项目。我可以帮你做以下事(可多选):

(A) 替换 scaffold default 值
    扫 AGENTS.md / docker-compose.yml / 等找疑似 default(项目名 / DB 名 /
    container_name / domain),一一问你的实际值后替换

(B) 补齐 tier-level AGENTS.md(双文件方案)
    检测到的 tier 里若有 CLAUDE.md 但无 AGENTS.md,按双文件方案补:
      - 把 CLAUDE.md 内容移到 AGENTS.md
      - CLAUDE.md 改成 1 行 @AGENTS.md alias

(C) 扫 codebase 推 Project Structure
    扫 src/ backend/ frontend/ 等实际目录 + 主框架检测,
    推 AGENTS.md `## Project Structure` 节实际值(替代 scaffold 的 default 描述)

(D) 都不补,直接中止 → 你跑 /feature-init 开始第一个 feature

要做哪些?(如 'A+B' / '全部' / 'D')
```

记录用户选择,执行对应 Step 4.x。

## Step 3 — security.md @import 启用检查(强制)

`security.md` 无 `globs:`(always-on 全局规则)→ 必须用 `@import` 强制加载,scaffold / 老项目若注释这行 = **silent fail**。grep 根 AGENTS.md 三态处理:

- **`@.claude/rules/security.md`** 已启用 → 跳过
- **`<!-- @.claude/rules/security.md -->`** 注释 → AskUserQuestion(y/n)→ y → Edit 取消注释
- **整行 missing** → 报告"建议手工追加 `@.claude/rules/security.md`(workflow §1.5)",不自动加(可能破坏 AGENTS.md 自定义结构)

## Step 4.A — 替换 scaffold default 值

**扫描范围**(典型 scaffold 容易留 default 值的文件):

```bash
# 主要扫:
grep -lE '(scaffold|template|example|my-?app|sample|placeholder|TBD)' \
  AGENTS.md \
  docker-compose*.yml \
  package.json \
  pyproject.toml \
  .env.example 2>/dev/null
```

对每个 hit 检查上下文,跟用户确认是不是 default:

```
AGENTS.md 第 N 行: `数据库名:fastapi_nuxt_scaffold_db`
  → 这看起来是 scaffold default。你项目的 DB 叫什么?(答 "保留不改" / "改成 X")

docker-compose.yml: container_name: scaffold_postgres
  → 同上,要改吗?
```

收齐回答后,用 Edit 工具批量替换。

**典型可能要替换的位置**:

- 项目名(README title / package.json `name` / pyproject.toml `name`)
- 数据库名(env files / docker-compose / connection strings)
- container_name(docker-compose)
- domain / URL(env / nginx config)
- Auth secret 占位符(env.example)

**不要替换**(scaffold 通用的):

- 框架版本号(除非用户主动要求升级)
- License 字段(除非用户改 license)
- Author 信息(用户的 git config 已经决定 commit author,无需在 metadata 里硬编码)

## Step 4.B — 补齐 tier-level AGENTS.md(双文件方案)

先扫描列 plan,AskUserQuestion 确认后才执行(不直接改文件)。

```bash
# 扫描(只读),collect plan lines
find . -maxdepth 2 -name CLAUDE.md -not -path './CLAUDE.md' -exec dirname {} \; | sort -u | \
while read tier_dir; do
  [ -f "$tier_dir/CLAUDE.md" ] && [ ! -f "$tier_dir/AGENTS.md" ] && \
    ! grep -qE '^@AGENTS\.md\s*$' "$tier_dir/CLAUDE.md" && \
    echo "  📝 $(basename "$tier_dir")/ — mv CLAUDE.md ($(wc -l < "$tier_dir/CLAUDE.md") 行) → AGENTS.md + CLAUDE.md 变 @alias"
done
```

输出 plan 后 AskUserQuestion:`(y)` 全做 / `(n)` 取消 Path B / `(s)` 列号多选。确认后对每个 tier 执行 `mv CLAUDE.md AGENTS.md && echo '@AGENTS.md' > CLAUDE.md`,报告补了哪些。

## Step 4.C — 扫 codebase 推 Project Structure(委托 codebase-explorer sub-agent)

**dispatch [`codebase-explorer`](../../agents/codebase-explorer.md) sub-agent** 做结构调查:

```
Task tool 调用:
  subagent_type: codebase-explorer
  prompt: """
    Project root: . (current working directory)
    Tier context: {{从 Step 1 detect 到的 tier dirs, 如 'backend + frontend'}}
    Existing AGENTS.md: ./AGENTS.md(用于对比已声明 vs 实际)

    扫顶层结构 + framework manifest + module structure + 规模,
    返回结构化报告 + AGENTS.md `## Project Structure` 节的更新建议。
  """
```

sub-agent 返回结构化报告(detected scale / tier breakdown / frameworks / module structure / recommended `## Project Structure` 节内容)。

**project-personalize 拿到报告后**:

1. **完整展示给用户**(不重写,sub-agent 报告本身就是 deliverable)
2. **问用户**:"要把 sub-agent 的 `Recommended Project Structure` 写入 AGENTS.md `## Project Structure` 节吗?(yes / no / edit 后写入)"
3. **用户答 yes / edit 后** → 用 Edit 工具替换 AGENTS.md 对应节
4. **答 no** → 跳过,继续 Step 4.D

## Step 4.D — 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

落盘前 dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md)(input/output 详见 agent doc)审 Step 4.A/B/C 累积修改:

- `files_to_audit`: 本次 personalize 涉及的所有文件(根 `AGENTS.md` + tier-level + `.claude/rules/*`)inline content
- `qa_answers`: Step 2 用户选的 paths + Step 4.A scaffold 替换答案 + Step 4.B tier 答案 + Step 4.C 接受/拒绝 Project Structure 决定
- `language_conventions`: null
- `plugin_hardcoded_defaults`: 同 `/project-init` §4.5b 列表
- **Retrofit 模式标注**:`files_to_audit` 中已存在代码的决策(从 codebase 扫出的 framework / tier 命名)→ agent 标 `(retrofit: from existing code)`,视同 ✅

**Block 规则**:🚫 > 0 不进 Step 5,按 agent 修正选项处理(deferred / 追问 / template-default 标注)后**重跑本 step**;⚠️ 不 block,Step 6 Summary 同时展示给用户。

## Step 5 — Self-verify(强制)

跑下面静态检查,贴报告。任一 ❌ → 回头修后再走 Step 6。

```bash
# V1 placeholder 残留(personalize 漏填的征兆)
grep -rn '{{' --include='*.md' AGENTS.md .claude/rules/*.md 2>/dev/null

# V2 frontmatter(path-scoped rule 含 description + globs;security.md 仅 description)
head -10 .claude/rules/*.md 2>/dev/null

# V3 globs path prefix 真存在(personalize 改了 tier 名 / 路径时容易遗漏)
# agent 据 V2 输出 + 实际目录对照判断
```

加 2 项运行时校验:

| 项 | 此刻 | 说明 |
|---|---|---|
| V5 `/memory` 加载 | ✅ 必过 | 输出含根 + 各 tier AGENTS.md / CLAUDE.md;缺则嵌套层次错 |
| V8 AI 读 AGENTS.md 总结 | ✅ 必过 | 自问 "1 句话总结栈 + 命令",4 要素(类型 / 主栈 / 起服务 / 跑测试)全对 |

报告格式:`V1✅ V2✅ V3✅ V5✅ V8✅`(retrofit 项目命令 / hook 通常已就位,不像 P0 那样标 deferred)

## Step 6 — Summary

```markdown
## ✅ Project personalize complete

### 做了什么
- Step 3 security.md @import:{enabled / 已是 / missing 提示}
- (A) 替换了 {N} 个 scaffold default 值
  - {list of replacements}
- (B) 补齐了 {M} 个 tier 的 AGENTS.md + CLAUDE.md alias
  - {list of tiers}
- (C) 更新了 AGENTS.md `## Project Structure` 节

### 还需手工 review

- **AGENTS.md `## Boundaries` 节**:scaffold default 是合理 baseline;项目特定的 ⚠️ Ask first 项(如"改 prompt template 必问 LLM ops team")只有你知道,扫一遍补上
- AGENTS.md 全文扫一遍,确认 personalize 后的值都对
- 跑 `wc -l AGENTS.md`,> 200 行的话精简([workflow.md §1.3](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#13-agentsmd-的内容标准))
- 想加 framework-specific rules(FastAPI / Vue / etc.):`cp "$CLAUDE_PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md" .claude/rules/<framework>.md`,然后改 frontmatter `globs:` + `description:`(说明见同目录 README.md)

### 📋 下一步

1. `git add . && git diff --cached`(看 personalize 改了哪些)
2. commit:`git commit -m "P0: personalize project baseline"`
3. **(retrofit 项目特别建议)补 ADR 捕获已做的架构决策**:framework / ORM / DB / 前端栈 / pkg-mgr 等老决策的 why 通常没记录,挨个写 `docs/adr/000N-<topic>.md`(模板与写法见 [workflow §1.8](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#18-adr-目录初始化) + `docs/adr/0000-template.md`)
4. 开始第一个 feature:`/project-workflow:feature-init <your-first-feature-slug>`
```

## Failure modes

| 错误 | 应对 |
|---|---|
| 不是 v2-shaped 项目(无 AGENTS.md 或非六要素)| Step 1 直接报错 + 建议跑 `/project-init` |
| Step 4.A 扫不到 default 值 | 报告 "未发现明显 default,跳过 Path A" |
| Step 4.B tier 都已有 AGENTS.md | 报告 "tier-level 双文件方案已齐,无需补" |
| Step 4.C 扫描出来的 Project Structure 用户不满意 | 用户可选 "edit",手工调整建议后再应用 |
| Git 工作树脏(已有未 commit 改动) | 警告:"建议先 commit 当前 changes 再跑 personalize,避免改动混合"(不强制) |
