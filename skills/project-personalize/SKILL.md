---
name: project-personalize
description: Adapt a scaffold-cloned or v2-shaped existing project to user's specifics. Replaces scaffold defaults (project name / DB / etc.), completes tier-level AGENTS.md per 中庸 scheme, dispatches codebase-explorer sub-agent to scan existing structure. Accepts optional `$ARGUMENTS` = target directory path (defaults to current working directory) — useful for monorepos where the v2-shaped sub-project isn't the cwd. Claude Code-native. Use when you've cloned a v2 scaffold or want to retrofit an existing project; **if you want ready-to-run full stack starting from a scaffold, this is the right tool — don't use /project-init for that** (project-init is conventions-only, doesn't scaffold code). Not for greenfield empty directories — use /project-init for that.
---

**Response language**: Match the user's prompt language. File edits stay in the file's existing language.

# Project Personalize

Adapt a project that **already has** v2 baseline files (AGENTS.md / `.claude/`)—typically because you cloned a v2 scaffold or are retrofitting an existing project—to your specific values, tier structure, and codebase reality.

> `docs/specs/_template/` 不是 v2 baseline 必需项 —— 模板由 `/feature-init` 提供;本 skill 检测到本地 `_template/` 时仅作为可选 override 处理。

**Use when**:
- You cloned a v2-shaped scaffold(如 [`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4))
- 既有项目想 retrofit 进 v2(已有 AGENTS.md 但需要清理)
- v2 升级后某些 tier-level 文件缺(如中庸方案落地前的项目)

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

> **跟 `/project-init` 的区别**:project-init 允许 target 不存在(可创建);project-personalize **要求 target 已存在且有 v2 baseline**(scaffold-cloned 或既有项目)。

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
| `docs/specs/_template/`(可选)| 存在=用户 override / 不存在=用 plugin bundle 默认 |
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

(B) 补齐 tier-level AGENTS.md(中庸方案)
    检测到的 tier 里若有 CLAUDE.md 但无 AGENTS.md,按中庸方案补:
      - 把 CLAUDE.md 内容移到 AGENTS.md
      - CLAUDE.md 改成 1 行 @AGENTS.md alias

(C) 扫 codebase 推 Project Structure
    扫 src/ backend/ frontend/ 等实际目录 + 主框架检测,
    推 AGENTS.md `## Project Structure` 节实际值(替代 scaffold 的 default 描述)

(D) 都不补,直接中止 → 你跑 /feature-init 开始第一个 feature

要做哪些?(如 'A+B' / '全部' / 'D')
```

记录用户选择,执行对应 Step 3.x。

## Step 3.A — 替换 scaffold default 值

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

## Step 3.B — 补齐 tier-level AGENTS.md(中庸方案)

```bash
# 检测所有看起来是 tier 的目录(有 CLAUDE.md 或被根 AGENTS.md 引用)
for tier_dir in $(find . -maxdepth 2 -name CLAUDE.md -not -path './CLAUDE.md' \
                  -exec dirname {} \; | sort -u); do

  tier_name=$(basename "$tier_dir")

  if [ -f "$tier_dir/CLAUDE.md" ] && [ ! -f "$tier_dir/AGENTS.md" ]; then
    echo "Detected: $tier_name/ has CLAUDE.md but no AGENTS.md"

    # 检测 CLAUDE.md 是不是已经是 @AGENTS.md alias(罕见,但要 check)
    if grep -qE '^@AGENTS\.md\s*$' "$tier_dir/CLAUDE.md"; then
      echo "  CLAUDE.md is already an alias but target AGENTS.md missing — skipping"
      continue
    fi

    # 按中庸方案补:CLAUDE.md 内容 → AGENTS.md;CLAUDE.md 变 alias
    mv "$tier_dir/CLAUDE.md" "$tier_dir/AGENTS.md"
    echo '@AGENTS.md' > "$tier_dir/CLAUDE.md"
    echo "  ✅ Created $tier_name/AGENTS.md + $tier_name/CLAUDE.md alias"
  fi
done
```

报告补了哪些 tier。

## Step 3.C — 扫 codebase 推 Project Structure(委托 codebase-explorer sub-agent)

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
4. **答 no** → 跳过,继续 Step 4

**为什么 sub-agent 而不是 inline bash**:
- codebase 扫描涉及 find / grep / 读多个 manifest + 整理报告,**独立 context** 避免污染 project-personalize 主会话
- 跟 v1 `codebase-explorer` 哲学一致(独立 scan agent)
- sub-agent 有 read-only scope 保证,不会误写文件

**不做**(避免过度工程,在 codebase-explorer 内已规约):
- 完整依赖图(networkx 之类)
- 导入分析(AST 解析)
- 自动检测 bounded context 边界(列目录事实,不评判)

## Step 4 — Summary

```markdown
## ✅ Project personalize complete

### 做了什么
- (A) 替换了 {N} 个 scaffold default 值
  - {list of replacements}
- (B) 补齐了 {M} 个 tier 的 AGENTS.md + CLAUDE.md alias
  - {list of tiers}
- (C) 更新了 AGENTS.md `## Project Structure` 节

### 还需手工 review

- AGENTS.md 全文扫一遍,确认 personalize 后的值都对
- 跑 `wc -l AGENTS.md`,> 200 行的话精简([workflow.md §1.3](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#13-agentsmd-的内容标准))
- 跑测试确认 personalize 没动到代码逻辑

### 📋 下一步

1. `git add . && git diff --cached`(看 personalize 改了哪些)
2. commit:`git commit -m "P0: personalize project baseline"`
3. 开始第一个 feature:`/project-workflow:feature-init <your-first-feature-slug>`
```

## Failure modes

| 错误 | 应对 |
|---|---|
| 不是 v2-shaped 项目(无 AGENTS.md 或非六要素)| Step 1 直接报错 + 建议跑 `/project-init` |
| Step 3.A 扫不到 default 值 | 报告 "未发现明显 default,跳过 Path A" |
| Step 3.B tier 都已有 AGENTS.md | 报告 "tier-level 中庸方案已齐,无需补" |
| Step 3.C 扫描出来的 Project Structure 用户不满意 | 用户可选 "edit",手工调整建议后再应用 |
| Git 工作树脏(已有未 commit 改动) | 警告:"建议先 commit 当前 changes 再跑 personalize,避免改动混合"(不强制) |

## Notes

- **跟 `/project-init` 区别**:`/project-init` 在**空目录**起 v2 baseline; `/project-personalize` 在**已有 v2 baseline 的目录**做 personalize / retrofit。**两者不互替**。
- **跟 v1 `tech-researcher / codebase-explorer` 关系**:Path C 用 Task tool dispatch [`codebase-explorer`](../../agents/codebase-explorer.md) sub-agent(吸收 v1 思路,独立 context 扫码)。
- **Claude Code-native**:本 skill 用 Task tool dispatch sub-agent,**不再**追求 pure SKILL.md / 跨工具兼容(v2.3+ floor 收紧到 Claude Code only,见 [`feedback_tool_support_floor`](../../../memory/feedback_tool_support_floor.md))。
- **goal-driven**:本 skill 服务 [§0.1 命题 3 Drift](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#01-这本手册解决什么) —— 让 scaffold-cloned / 既有项目跟 v2 中庸方案对齐,避免 default 值漂移和 tier-level 不一致。
