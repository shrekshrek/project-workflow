---
name: project-init
description: Initialize a project's v2 starter kit (AGENTS.md + .claude/ + tier-level AGENTS.md if fullstack). Q&A driven, language/stack agnostic. Dispatches tech-researcher sub-agent for "不确定" answers. Accepts optional `$ARGUMENTS` = target directory path (defaults to current working directory). Claude Code-native. Use at P0 (project's first day). Not for adding features mid-project — use /feature-init for that.
---

**Response language**: Match the user's prompt language (中文 / English / etc.) for all natural-language output. Generated file content stays in the language of the source template (Chinese for v2).

# Project Init

Canonical action spec: `docs/actions/project-init.md`. Follow that file for methodology rules; this skill adds Claude Code execution details.

Initialize a new (or existing-but-no-AGENTS.md) project's v2 baseline. Q&A walks the user through stack and conventions, then writes 10+ files in one pass.

**Use when**: P0 — project's first day, no AGENTS.md yet.
**Not for**: starting a new feature (use `/feature-init <slug>`) or refreshing existing A 类约定 (use `/project-workflow:agents-md-revise`).

**Output structure**(written to target directory — see Step 0):

```
.
├── AGENTS.md                                  # 根 AGENTS.md(填齐 placeholder)
├── CLAUDE.md                                  # 1 行:@AGENTS.md
├── .claude/
│   ├── rules/{code-style,testing,security}.md  # 填齐
│   ├── hooks/lint-on-edit.js                  # 按 lint 工具裁剪
│   └── settings.json
├── docs/
│   ├── adr/{README,0000-template}.md
│   └── gotchas.md
├── .gitignore
└── <tier>/                                    # 仅 fullstack
    ├── AGENTS.md                              # 差量于根
    └── CLAUDE.md                              # @AGENTS.md
```

## Step 0 — 解析 target 目录(可选 `$ARGUMENTS`)

User input: `$ARGUMENTS` — optional target directory path. Empty → 用当前工作目录(cwd)。

| 输入 | 处理 |
|---|---|
| 空 | target = `pwd`,跳过 cd,继续 Step 1 |
| 相对路径(如 `validation-runs/p0-greenfield-001`) | 基于 cwd 解析为绝对路径 |
| 绝对路径(如 `/Users/foo/new-proj`) | 直接用 |

解析后:

```bash
TARGET_DIR="<resolved absolute path>"

# 目录不存在 → 问用户是否 mkdir
if [ ! -d "$TARGET_DIR" ]; then
  echo "Target $TARGET_DIR 不存在,要创建吗?(y/n)"
  # y → mkdir -p "$TARGET_DIR";n → 中止
fi

cd "$TARGET_DIR"
```

**后续所有 Step 的 `ls -la` / `cp` / Edit / Write 都对此 target 目录操作**(Bash cwd 已切换;Edit/Write 用绝对路径或相对此 cwd)。

## Step 1 — 检测 target 状态

```bash
ls -la       # 此时 cwd 已是 target
```

判断:

| 当前状态 | 处理 |
|---|---|
| 空目录 / 几乎空 | 直接进 Step 2(greenfield 流程) |
| 已有 `AGENTS.md` | **`/project-init` 不适合**——跑 `/project-workflow:project-personalize` 替代(见下) |
| 已有 `.claude/` 但无 AGENTS.md | 问: "已有 .claude/。要 (a) 全部覆盖 / (b) 中止?" |

若用户选中止 → 直接停。否则继续。

> **关于 scaffold-cloned 或既有项目**:`/project-init` 专做 **greenfield**(从零起项目)。
> 若你 clone 了已有 `AGENTS.md` 的 scaffold,或想 retrofit 既有大项目,**应该跑 `/project-workflow:project-personalize`**——它处理替换 scaffold default 值、补 tier-level AGENTS.md、扫已有代码推导 Project Structure 等。

**安全检查**:若当前目录看起来是 `project-workflow` 仓库本身(检测到 `docs/workflow.md` + `skills/feature-init/`)→ 警告: "你似乎在 project-workflow 仓库内运行 project-init。这通常是误用 —— project-init 应该在**新项目**目录跑。要继续吗?"

## Step 2 — Q&A:栈 + 约定

**一问一答,等用户回答再问下一个**。每轮把答案存到本地变量等 Step 4 用。

### ⚠️ Greenfield 隔离原则(critical)

`/project-init` 的语义是"给一个 **干净的新项目** 起骨架"。**Q&A 选项 + 默认值必须语言/栈中立**,不引用任何具体已存在项目。

具体要求:
- 选项的 label / description / 副标题里**不要写**类似 "跟 X 项目一致"、"如 X 那样" 这种 cross-reference,即使 target 父目录有 CLAUDE.md / AGENTS.md 提及那些项目
- 默认值基于:**(a) 本会话已答的 Q&A 答案** + **(b) 该栈的社群通用 default**;**不基于** target 的父级 / 兄弟级项目偏好
- 一旦发现自己想说 "跟 ... 一致"(无论是 monorepo 兄弟项目、lab 测试场、父仓库 reference 实现)→ **改用栈通用描述**(如 "Python async 主流"、"轻量 sync 框架"、"Vue 3 生态契合最深"等)

### Q&A 引导原则(委托 tech-researcher sub-agent)

用户答 "不确定" / "帮我选" / "推荐一个" 时,**dispatch [`tech-researcher`](../../agents/tech-researcher.md) sub-agent** 做研究并返回结构化报告:

```
Task tool 调用:
  subagent_type: tech-researcher
  prompt: """
    Choice context: {{用户在选什么,如 'ORM for FastAPI backend'}}
    Project context: {{从 Q&A 已答部分推断: 项目类型 / 主语言 / 主框架}}
    Constraints: {{用户已知约束,如 'team has Python only'}}

    Return 2-3 candidates + recommendation per your output format.
  """
```

sub-agent 返回结构化报告(2-3 candidates + recommendation + 理由)→ project-init 把 recommendation 展示给 user 确认后回填进 Q&A 答案,继续下一问。

**何时不 dispatch tech-researcher**:
- 用户直接给答案(不问"推荐")
- 用户答的是命令 / 路径 / 数值等事实性问题(不需研究)

### 轮 1:项目类型?

```
(a) Fullstack(前 + 后端 + DB,多 tier)
(b) Web Backend(API + DB,无前端)
(c) Web Frontend(纯客户端,无后端)
(d) CLI / Library(单一栈)
(e) Mobile(iOS / Android / React Native / Flutter)
(f) 其他 / 混合 —— 用户描述
```

若选 (a) Fullstack,**追加轮 1.5**:

```
轮 1.5: tier 命名 + 目录
  (1) 默认: backend + frontend (./backend/ + ./frontend/)
  (2) 自定义:输入 tier 名 + 路径(如 server + web / api + app)
```

### 轮 2:语言 + 跨 tier 共性(auto-derive)

- 主语言?(若多语言列 2-3 个)
- **(Fullstack only)** 据主语言 auto-derive 跨 tier 共性,**不预问**:
  - mixed-lang(Python + TS / Go + TS / etc.)→ **per-tier**(test / lint / pkg-mgr 进 Step 5.1 mini-Q&A 各 tier 单独问)
  - single-lang(全 TS / 全 Python / etc.)→ **shared**(本轮追加问 test framework / lint / pkg-mgr,所有 tier 共享)
  
  告知 user:"📌 据主语言 `<X>` 推断为 **<shared/per-tier>**"。User 可回 `'per-tier'` override。

> Round 3 已废:test framework / lint / pkg-mgr **per-tier** 时全挪进 mini-Q&A。**只有 single-lang fullstack 或单 tier 项目本轮问这 3 项**。

### 命令推导主声明

**起服务 / 跑测试 / lint / migration / E2E 命令**:**不单独问** —— 据 framework + pkg mgr + 轮 1.5 tier 名 + Step 5.1 mini-Q&A 推导。Step 4 / Step 5.3 填文件时 agent 内部生成具体命令字符串。**若推导歧义,问用户确认,不单方面写**。部署命令 P0 不收集(B 层,见 [workflow §1.2](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#12-产出物完整-starter-kit)),`{{DEPLOY_COMMAND}}` 填 deferred 占位。

## Step 3 — 复制 template + gotchas.md(从本地 plugin)

Plugin 已装在本地(用户能跑 `/project-workflow:project-init` 即证明),`template/` + `docs/gotchas.md` 都在本地;**不**走 network clone。

```bash
# Claude Code 调用 skill 时注入 CLAUDE_PLUGIN_ROOT;defensive fallback 走 cache 目录最新版
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(ls -d ~/.claude/plugins/cache/project-workflow/project-workflow/*/ 2>/dev/null | sort -V | tail -1)}"

# template/ 复制,排除 _multi_tier_examples/(plugin asset,Step 5 直接从 $PLUGIN_ROOT 读)
find "$PLUGIN_ROOT/template" -mindepth 1 -maxdepth 1 ! -name '_multi_tier_examples' \
  -exec cp -r {} . \;

# docs/specs/_template/ + .claude/rules/_examples/ 都是 plugin asset(skill 直接从 $PLUGIN_ROOT 读)
# —— 上面 cp 顺手带进来了,清掉
find ./docs/specs -type f -delete 2>/dev/null
rmdir ./docs/specs/_template ./docs/specs 2>/dev/null
find ./.claude/rules/_examples -type f -delete 2>/dev/null
rmdir ./.claude/rules/_examples 2>/dev/null

# gotchas.md 在 docs/ 不在 template/
mkdir -p docs
cp "$PLUGIN_ROOT/docs/gotchas.md" docs/gotchas.md
```

复制后 ls 验证关键文件存在:
- `AGENTS.md`, `CLAUDE.md`
- `.claude/rules/{code-style,testing,security}.md`
- `.claude/hooks/lint-on-edit.js`, `.claude/settings.json`
- `docs/adr/{README,0000-template}.md`
- `docs/gotchas.md`
- `.gitignore`
- **不**该出现 `_multi_tier_examples/`(plugin asset,Step 5 按需读)

## Step 4 — 填 placeholder(根 AGENTS.md + `.claude/rules/`)

用 Edit 工具逐文件填齐 placeholder。**填齐或删行,不允许留** `{{...}}`(no aspirational)。

### 4.1 根 `AGENTS.md`

| Placeholder | 据什么填 |
|---|---|
| `{{DEV_COMMAND}}` / `{{TEST_COMMAND}}` / `{{LINT_COMMAND}}` | mixed-lang fullstack → 改成指针 `(见各 <tier>/AGENTS.md)`(per-tier 推导);single-lang / 单 tier → 据 pkg-mgr + framework 直填 |
| `{{DEPLOY_COMMAND}}` | 固定填 `(B 层未定 — 部署时补,见 docs/adr/000N-deploy.md)`(P0 不预测部署) |
| `{{TEST_FRAMEWORK}}` | mixed-lang → 指针;single-lang → Q&A 轮 2 共享答案 / mini-Q&A test framework |
| `{{TEST_LOCATION}}` | 默认 `tests/`(可改) |
| `{{COVERAGE_THRESHOLD}}` | 默认 80 |
| `{{SRC_DIR}}` | **单 tier**:`src`(语言惯例:Python `<project>/`,Go `cmd/`+`internal/`)<br>**多 tier**:根 AGENTS.md **不填具体路径**,改成指针 `(见各 <tier>/AGENTS.md)`——避免跟 tier-level 重复 |
| `{{TEST_DIR}}` | 同上 SRC_DIR 规则 |
| `{{BRANCH_PATTERN}}` | 固定填 `feat/<NNN>-<slug>` + `fix/<scope>`(跟 /feature-init 硬编码对齐;要 GitFlow / 票据流的用户 P0 后改 AGENTS.md) |
| `{{COMMIT_FORMAT}}` | 默认 conventional commits |
| `{{LINT_CONFIG_PATH}}` | mixed-lang → 指针 `(见各 <tier>/AGENTS.md)`;single-lang → 据 lint 工具推(`.eslintrc.cjs` / `pyproject.toml`)|
| `{{STYLE_HIGHLIGHT_1/2/3}}` | 据栈推 1-3 条**真正特殊**的风格点(见 4.4)|

**模块组织模式 default**(**不问用户**;写进 `.claude/rules/code-style.md` 末尾 `## 文件 / 模块` 节,**不**写进根 AGENTS.md ── 减少根 AGENTS.md 行数,跟模块/文件相关规则归在一处):
> 模块组织模式:**按 feature / domain 组织,不按 type**(避免 `controllers/` `services/` `utils/` 这种 type-based 散布)。详见 [workflow §2.5](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#25-模块组织建议领域优先不要技术分层)。

**Git 平台 default**(写进 `## Git Workflow` 节):固定填 `平台:GitHub(PR + Actions + Discussions)`(系统其他地方都默认 GitHub 词汇 / `.github/`;GitLab/Gitea 用户 P0 后手动改)。

### 4.2 `.claude/rules/`

| 文件 | Placeholder | 据什么填 |
|---|---|---|
| `code-style.md` | `{{CODE_STYLE_DESCRIPTION}}` | 一句话(< 80 字符)说本文件管什么,如 `Code style — Python (Ruff) + TypeScript/Vue (ESLint)` |
| `code-style.md` | `{{CODE_STYLE_GLOBS}}` | 据 Q&A 1.5 tier 命名 + 轮 2 语言推导,见下方"globs 推导" |
| `testing.md` | `{{TESTING_DESCRIPTION}}` | 一句话(< 80 字符),如 `Testing conventions — pytest (backend) + Vitest (frontend) + Playwright (E2E)` |
| `testing.md` | `{{TESTING_GLOBS}}` | 据 Q&A 1.5 tier 命名 + 轮 2 语言推导,见下方"globs 推导" |
| `testing.md` | `{{UNIT_TEST_FRAMEWORK}}` / `{{INTEGRATION_TEST_FRAMEWORK}}` | mixed-lang fullstack → mini-Q&A;single-lang / 单 tier → Q&A 轮 2 共享答案 |
| `testing.md` | `{{E2E_FRAMEWORK}}` | 询问 / 默认 Playwright |
| `testing.md` | `{{TEST_FILE_LAYOUT}}` | 推断(Python tests/ 镜像 src/ / JS `*.test.ts` 同目录) |
| `testing.md` | `{{TEST_NAME_PATTERN}}` | 据框架推 |
| `testing.md` | `{{TEST_RUN_COMMAND}}` / `{{COVERAGE_COMMAND}}` / `{{E2E_RUN_COMMAND}}` | mixed-lang → 指针;single-lang → 据 test framework + pkg mgr 推 |
| `testing.md` | `{{COVERAGE_THRESHOLD}}` | 默认 80(跟根 AGENTS.md 一致) |
| `security.md` | `description:` 字段已 hardcode 在 template;**无** placeholder。固定文本节内极少 placeholder | 通常不需大改 |

**`description:` 字段强制规则**:
- 每个 path-scoped rule(`code-style.md` / `testing.md` / 复制出的 framework starter)frontmatter **必须**含 `description:` 一行,< 80 字符,Claude Code `/rules` 列表展示用
- `security.md`(always-on 全局规则)同样应含,描述 "Security baseline (always-loaded)"
- 缺 `description:` 不算 silent fail(规则照常加载),但 hurt scalability / discoverability —— 多 path-scoped rule 时看不出每条管什么


### 4.3 globs 推导(`{{CODE_STYLE_GLOBS}}` / `{{TESTING_GLOBS}}`)

格式:**comma-separated 字符串**(`globs: pattern1, pattern2`)—— 不要用 `paths:` YAML 列表,silently fails(见 workflow.md §1.6)。

#### 单 tier 项目(轮 1 答 b/c/d)

| 主语言 | `{{CODE_STYLE_GLOBS}}` | `{{TESTING_GLOBS}}` |
|---|---|---|
| Python | `src/**/*.py`(或语言惯例 `<project>/**/*.py`)| `tests/**/*.py` |
| TypeScript / JavaScript | `src/**/*.{ts,tsx,js,jsx,vue}` | `**/*.test.{ts,tsx,js,jsx}`(JS 测试常就近)|
| Go | `**/*.go`(Go 不分 src/) | `**/*_test.go` |
| Rust | `src/**/*.rs` | `tests/**/*.rs, src/**/*.rs`(Rust 测试 inline + integration)|

#### Fullstack(轮 1 答 a,轮 1.5 给 tier 命名)

记 backend tier 名 = `$BTIER`(default `backend`)、frontend tier 名 = `$FTIER`(default `frontend`):

| 主语言组合 | `{{CODE_STYLE_GLOBS}}` | `{{TESTING_GLOBS}}` |
|---|---|---|
| Python + TS/Vue | `$BTIER/**/*.py, $FTIER/**/*.{ts,vue}` | `$BTIER/tests/**/*.py, $FTIER/**/*.test.{ts,vue}` |
| Go + TS | `$BTIER/**/*.go, $FTIER/**/*.{ts,tsx}` | `$BTIER/**/*_test.go, $FTIER/**/*.test.{ts,tsx}` |
| 全 TS(node + react / vue)| `$BTIER/**/*.ts, $FTIER/**/*.{ts,tsx,vue}` | `**/*.test.{ts,tsx}` |
| Rust + TS | `$BTIER/src/**/*.rs, $FTIER/**/*.{ts,tsx}` | `$BTIER/tests/**/*.rs, $FTIER/**/*.test.{ts,tsx}` |

替换示例(Q&A 轮 1.5 自定 tier `server + web`,Python+Vue 栈):

```
CODE_STYLE_GLOBS = "server/**/*.py, web/**/*.{ts,vue}"
TESTING_GLOBS    = "server/tests/**/*.py, web/**/*.test.{ts,vue}"
```

#### 多 tier(> 2,如 backend + worker + frontend)

把每个 tier 都加进去:`backend/**/*.py, worker/**/*.py, frontend/**/*.{ts,vue}`。OR 关系。

#### 边缘 / 冷门栈

栈识别不出 → 填一个保守 fallback:`**/*.<ext>`(全仓 ext 匹配),用户后续按需收窄。

### 4.4 STYLE_HIGHLIGHT 推断规则

**不要写栈通用 default**(如"2 空格缩进"——工具 default,不算特殊)。**要写项目级别真正会出错的**:

| 栈 | HIGHLIGHT 例 |
|---|---|
| Python | "严格 type hints,`from __future__ import annotations`" |
| TS | "TypeScript strict mode + noImplicitAny;async/await only,禁 `.then()`" |
| Vue 3 | "Composition API only;`<script setup>` 必用" |
| FastAPI | "Pydantic v2 strict mode;SQLAlchemy 2.0 select() 风格" |

只填 Q&A 信息能推出来的;栈没特殊点就只填 1-2 个,把 `- {{STYLE_HIGHLIGHT_3}}` 那行删掉。

### 4.5 `@imports` 启用判断(强制)

根 `AGENTS.md` 末尾 3 行 `@import` 注释,据 `.claude/rules/*.md` 是否有 `globs:` 自动判断:

- **有 `globs:`**(`code-style.md` / `testing.md` / framework starter) → **保留注释**(globs 已处理 path-scoped 加载)
- **无 `globs:`**(`security.md` always-on 全局规则)→ **取消注释**,改 `@.claude/rules/security.md`(走 @import 强制加载,避开 `globs:` 不触发 Write 的 limitation 见 workflow §1.6)

在 agent 内存中改根 AGENTS.md 末尾,**不立即 Write**(等 4.6 preview 通过)。

### 4.5b 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

Preview Gate 之前,dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md) sub-agent(input/output 详见 agent doc)审本 Step 累积内容:

- `files_to_audit`: 根 `AGENTS.md` + `.claude/rules/{code-style,testing,security}.md`(inline content,未落盘)
- `qa_answers`: Step 2 Q&A 所有答案,dot-path keyed(如 `project_type` / `tiers` / `main_language` / etc.)
- `language_conventions`: null(agent 自推)
- `plugin_hardcoded_defaults`(per [workflow §1.10 "不问什么"](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#110-qa-设计project-setup-skill-问什么) 表):
  ```
  - {value: "feat/<NNN>-<slug>", source: "workflow.md §1.10", rationale: "跟 /feature-init 工具行为对齐"}
  - {value: "fix/<scope>", source: "workflow.md §1.10", rationale: "对齐 branch naming"}
  - {value: "GitHub", source: "workflow.md §1.10", rationale: "plugin 默认 GitHub 词汇 / .github/"}
  - {value: "conventional commits", source: "workflow.md §1.10", rationale: "default 99% 项目接受"}
  - {value: "≥ 80%", source: "workflow.md §1.10", rationale: "测试覆盖率门槛 default"}
  - {value: "按 feature / domain 组织", source: "workflow.md §1.10 + §2.5", rationale: "模块组织 default"}
  - {value: "(B 层未定 — 部署时补,见 docs/adr/000N-deploy.md)", source: "workflow.md §1.10", rationale: "P0 不预测部署"}
  - {value: "Playwright", source: "本 skill testing.md {{E2E_FRAMEWORK}} default", rationale: "P0 cross-tier E2E default, refinable via ADR"}
  ```
**Block 规则**(per [workflow §1.12](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#112-生成纪律generation-discipline)):🚫 > 0 不进 4.6 Preview,按 agent 修正选项处理后**重跑本 step**;⚠️ 不 block,4.6 Preview Gate 同时展示给用户处置。

> ⚠️ **vendor docs 钉死的 idiom**(如 Vue 3 `PascalCase.vue` / `defineProps<{...}>()` / EP `unplugin-vue-components` / UnoCSS `uno.config.ts` 等)auditor 据训练自识别归 ⚠️ language/vendor idiom,**不**归 🚫 must-fix。详见 `decision-completeness-auditor.md` Phase 2 反例。

### 4.6 落盘前 Preview Gate(强制,workflow §1.10 关键纪律)

Step 4.1-4.5 全部改动**累积在 agent 内存**,**未落盘**;4.5b audit 已通过(🚫 = 0)。本步一次性 stdout preview 全部最终状态(每个文件代码块包,带文件名标题):
- 根 `AGENTS.md`(含 4.5 取消注释后的 `@import` 行)
- `.claude/rules/code-style.md`
- `.claude/rules/testing.md`
- `.claude/rules/security.md`(若 4.5 改了 description)

**同时附上 4.5b audit 报告摘要**(`✅ Verified: N / ⚠️ Warnings: M / 🚫 Must-fix: 0`)+ ⚠️ 项明细让用户选择处置。

打完后 AskUserQuestion:
- **接受所有(含 ⚠️ 项)→ 落盘**
- **某 ⚠️ 项要 fix → 改完重新 4.5b audit + 重 preview**
- **第 N 个文件要改 → 让用户指,改完重 audit + 重 preview**
- **全 revert → 回 Step 4.1 重填**

用户 confirm 才走 Edit/Write 落盘。

## Step 5 — Fullstack:per-tier AGENTS.md + CLAUDE.md

**仅当 Q&A 轮 1 答 (a) Fullstack 时执行**。其他项目类型跳过本 Step。

### Step 5.1:对每个 tier 分类 + 跑 per-tier mini-Q&A

For each tier in [Q&A 轮 1.5 tier list]:

**先分类**(本 tier 属于 service-style 还是 UI-style?):

| 类别 | 特征 | 例 |
|---|---|---|
| **Service-style**(无 UI 的服务) | 跑后台逻辑 / 提供 API / 处理任务 | `backend` / `api` / `server` / `worker` / `microservice` / `inference-server` / `training` |
| **UI-style**(有用户界面) | 给最终用户看的界面 | `frontend` / `web` / `app` / `admin` / `dashboard` / `mobile-web` / `mobile` |

不确定时问用户:"这个 tier 主要是后台服务,还是有用户界面?"

**Q&A 规则(适用所有 tier 类别)**:
- ✅ **Required**:必问。产出文件每条 project-specific 断言必 trace 到这些答案
- ⚪️ **Optional**:可省;若省,生成文件**只能用 stack default 或留 TODO**,**禁** agent 单方面写决策塞进 AGENTS.md

> **Chat-context pre-check**:跑 mini-Q&A 前扫本 session 对话 ── user 已明确 hint 出的题跳过,只问未 hint 的。

#### Service-style tier mini-Q&A

✅ Required:
1. 框架?(FastAPI / Django / Flask / Express / Spring Boot / Gin / Rocket / 其他)
2. ORM?(SQLAlchemy 2.0 / 1.x / Django ORM / Prisma / TypeORM / 不用)
3. 数据库?(PostgreSQL / MySQL / SQLite / MongoDB / etc.) — **LLM context only**,不填 placeholder,用于推导 ORM critical rules(async driver / dialect / pool)
4. **Source 布局?**(Python / Node / Go 真有歧义,Rust / Java / C# 中等歧义,Rails / Elixir 单 app 几乎无歧义但仍 default-confirm。**问一题就把后续 Commands / Module Structure / Testing 路径决策钉死,避免多处独立 plant 漂移**)。**选项据 Q&A 轮 2 主语言渲染,default 高亮**:

   | 主语言 | 选项(✨ = default) |
   |---|---|
   | **Python** | ✨ (a) `app/` flat(FastAPI / Flask / Django 主流)<br>(b) `src/<package>/` PEP 518 src-layout<br>(c) `<package>/` 平铺(`uv init` 默认)<br>(d) 自定义 |
   | **Node/TS**(非 Next.js)| ✨ (a) `src/`(Vite / NestJS / 多数 Express 项目)<br>(b) root-level `app.{ts,js}` / `server.{ts,js}` 单文件<br>(c) 自定义 |
   | **Next.js** | ✨ (a) `app/` App Router(2026 主流)<br>(b) `pages/` Pages Router(legacy)<br>(c) 自定义 |
   | **Go** | ✨ (a) `cmd/<binary>/` + `internal/<domain>/`(golang-standards layout)<br>(b) flat — `main.go` 在根目录(小 CLI / 单 binary)<br>(c) 自定义 |
   | **Rust** | ✨ (a) `src/main.rs` 单 binary(`cargo init` 默认)<br>(b) `src/bin/<name>.rs` 多 binary<br>(c) workspace `crates/<member>/`<br>(d) 自定义 |
   | **Java/Kotlin(Spring Boot)** | ✨ (a) `src/main/<lang>/<root.package>/`(Maven/Gradle 标准)<br>(b) Multi-module — `<module>/src/main/<lang>/...`<br>(c) 自定义 |
   | **Elixir** | ✨ (a) `lib/<app_name>/`(Mix 标准)<br>(b) umbrella — `apps/<app>/lib/<app>/`<br>(c) 自定义 |
   | **Ruby(Rails)** | ✨ (a) `app/{controllers,models,views,...}`(Rails 强制,无 user choice)<br>(b) 自定义(罕见) |
   | **C#/.NET** | ✨ (a) `src/<Project.Name>/`(`dotnet new` 现代)<br>(b) `<Project.Name>/` 老式根目录<br>(c) 自定义 |
   | **其他 / 冷门栈** | 用户输入 `<src 包根>` + `<入口文件>` |

5. **(mixed-lang fullstack only)** 测试框架?(pytest / Jest / 等;single-lang 已在 Q&A 轮 2 共享答过,跳过)
6. **(mixed-lang fullstack only)** Lint 工具?(Ruff / Black + Flake8 / ESLint / 等)
7. **(mixed-lang fullstack only)** 包管理器?(uv / poetry / pdm / pip / pnpm / npm / cargo / go mod / 等)

⚪️ Optional:
8. 任务队列?(Celery / RQ / BullMQ / Sidekiq / 不用 ── 若 tier 本身就是 worker,在此问 broker)
9. Migration 工具?(Alembic / Atlas / sqlx-cli / 框架自带 / 纯 SQL)

> 起服务 / 测试 / lint / migration 命令**推导**(见 Step 2 末尾主声明)。
> `{{TIER_SRC_DIR}}` / `{{TIER_ENTRY_POINT}}` / `{{TIER_TEST_DIR}}` 据题 4 答案渲染(若用户接受 default,渲染对应 ✨ 行)。

#### UI-style tier mini-Q&A

✅ Required:
1. 框架?(Vue/Nuxt / React/Next / Svelte/SvelteKit / Solid / Astro / React Native / Flutter / 其他)
2. UI 库?(Nuxt UI / shadcn / MUI / Element Plus / Ant Design / Tailwind only / 自造)
3. State 管理?(Pinia / Vuex / Redux Toolkit / Zustand / Jotai / 不用)
4. **(Nuxt/Next/SvelteKit only)** 渲染模式?(SSR / SSG / hybrid;Vite-based SPA / native 默认推 SPA,不问) — **LLM context only**,不填 placeholder,用于推导 `{{TIER_BUILD_COMMAND}}`(`nuxt build` vs `nuxt generate`)+ critical rules
5. **(mixed-lang fullstack only)** 组件测试框架?(Vitest + @vue/test-utils / Jest + RTL / 其他)
6. **(mixed-lang fullstack only)** Lint 工具?(ESLint / Biome / 等)
7. **(mixed-lang fullstack only)** 包管理器?(pnpm / npm / yarn / bun / 等)

⚪️ Optional:
8. 样式方案?(Tailwind / UnoCSS / CSS Modules / styled-components / scoped CSS only)
9. E2E 框架?(Playwright / Cypress / 不用)

> 起开发 / build / test / lint 命令**推导**(见 Step 2 末尾主声明)。

### Step 5.2:据类别选模板,复制到 `<tier>/`

模板按**类别**(不是 tier 名),覆盖任意 tier 名:

```bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(ls -d ~/.claude/plugins/cache/project-workflow/project-workflow/*/ 2>/dev/null | sort -V | tail -1)}"
TIER_NAME=<from Q&A 轮 1.5>     # 用户自定的 tier 名(如 backend / worker / api / mobile / web ...)
TIER_CATEGORY=<service-tier 或 ui-tier>  # 据 Step 5.1 分类

mkdir -p "$TIER_NAME"
cp "$PLUGIN_ROOT/template/_multi_tier_examples/${TIER_CATEGORY}.AGENTS.md.example" "$TIER_NAME/AGENTS.md"
cp "$PLUGIN_ROOT/template/_multi_tier_examples/${TIER_CATEGORY}.CLAUDE.md.example" "$TIER_NAME/CLAUDE.md"
```

例:
- 用户的 `backend/` tier(service) → `service-tier.example` → `backend/AGENTS.md`
- 用户的 `worker/` tier(service) → `service-tier.example` → `worker/AGENTS.md`
- 用户的 `frontend/` tier(UI) → `ui-tier.example` → `frontend/AGENTS.md`
- 用户的 `mobile/` tier(UI) → `ui-tier.example` → `mobile/AGENTS.md`

### Step 5.3:填 tier-level AGENTS.md placeholder + framework split

逐个替换 `{{TIER_NAME}}` / `{{TIER_DEV_COMMAND}}` / `{{TIER_FRAMEWORK}}` 等(详见 [_multi_tier_examples/README.md](../../template/_multi_tier_examples/README.md))。

**Source Layout 渲染**:
- `{{TIER_SRC_DIR}}` / `{{TIER_ENTRY_POINT}}` / `{{TIER_TEST_DIR}}` 据 Step 5.1 题 4 答案渲染(每语言 ✨ default 或用户自定)
- service-tier template 的 `## Source Layout` 节是 SOT,其他节(Commands / Testing / Module Structure)统一引用 `{{TIER_SRC_DIR}}`,渲染时只替换一处指针 — **防止多处独立 plant 出不自洽路径**(workflow §1.12 Cross-file consistency)

**关键 1:framework 规则强制 split**(workflow §1.3 决策口诀 + 反模式防御):

- `{{TIER_FRAMEWORK_CRITICAL_LABELS}}` / `{{TIER_ORM_CRITICAL_LABELS}}` / `{{TIER_QUEUE_CRITICAL_LABELS}}` 只填 **≤ 5 个短标签**(label-only,单行 ≤ 80 字符),例:
  - FastAPI:`APIRouter 分组 / Depends DI / HTTPException 集中处理 / async 内禁 sync I/O / 输出返 Pydantic schema`
  - Vue 3 + Vite:`Composition API + <script setup> / defineProps generic / ref vs reactive / useXxx 命名 / 路由 lazy + guard 走 router 配置`
- **完整 detail 严格禁止复制进 tier AGENTS.md**,必走 `.claude/rules/<framework>.md`:
  1. 检测 `$PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md` 是否存在(`fastapi` / `vue` / `react` / `gin` / 等)
  2. 若有 → `cp "$PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md" .claude/rules/<framework>.md`,改 frontmatter `globs:` 适配 tier(如 `globs: backend/**/*.py`),`description:` 适配
  3. 若无 starter → tier-level labels 段填 ≤ 5 个标签;`.claude/rules/<framework>.md` 先建空壳带 frontmatter + TODO comment
- **防漂移**:tier critical 段 verbatim 重复 `.claude/rules/<fw>.md` 内容 = 违反 tier 文件自己头部"差量于根"原则。**禁** 在 tier critical 段写整句 rule(只标签);整句 detail 永远在 rules 文件里

**关键 2:删除不适用的整个章节**:某 tier 用不到的章节(如 service-tier 不用 ORM 时 `### {{TIER_ORM}}` 整节删)直接整段删,不留空章节。

**关键 3:Module Structure 节按主语言渲染**:template `## Module Structure` 节列了**多语言示例**(Python `.py` / Go `.go` / Java `*.java` / etc.)。Step 5.3 渲染时:
- **保留**:对应主语言的那行文件名
- **删掉**:其他语言示例(避免产物含不适用的语言)
- 示例:Q&A 主语言 == Go → `router.py / service.py / repository.py / ...` 全删,保留 `handler.go / service.go / repository.go / dto.go / models.go`
- 不强制保留所有 5 层 — 若 Q&A 答没有 ORM(如 backend.orm: 不用)或 repository 模式不需要,删对应层
- 跨 tier 时(`internal/<domain>/`)按该语言惯例确定子目录结构

### Step 5.3b 决策完整性 audit(强制,workflow §1.12 Generation Discipline)

每填完一个 tier(Step 5.3),**单 tier 一组** dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md)(input/output 详见 agent doc):

- `files_to_audit`: `<tier>/AGENTS.md` + `.claude/rules/<framework>.md`(若 Step 5.3 cp 出来)
- `qa_answers`: Step 2 + 本 tier Step 5.1 mini-Q&A 答案,dot-path keyed
- `language_conventions`: null
- `plugin_hardcoded_defaults`: 同 4.5b 列表(workflow §1.10 "不问什么" 表)

**Block 规则**:同 4.5b — 🚫 > 0 不进 5.4 Preview,修完**重跑本 step**;⚠️ 不 block,5.4 同时展示。

### Step 5.4:Tier-level Preview Gate(强制)

每填完一个 tier-level AGENTS.md(Step 5.3 + 5.3b audit 通过),**stdout preview 一组文件**:
- tier-level `<tier>/AGENTS.md`
- 该 tier 自动 cp 出来的 `.claude/rules/<framework>.md`(若 Step 5.3 关键 1 第 2 步触发)

AskUserQuestion 接受 / 改 / revert。Fullstack 2 tier = 2 次 preview confirm。CLAUDE.md 单行 @AGENTS.md 无 preview 价值,自动落盘。

## Step 6 — 裁剪 `.claude/hooks/lint-on-edit.js`

template 的 lint-on-edit.js 是骨架(if-else by extension)。

根据 Q&A 答案:
- **单语言项目**: 只保留对应 case branch
- **多语言**(如 fullstack 有 Python + TS): 保留对应多个 case branch
- 其他语言 case 删除

用 Edit 工具裁剪。

## Step 7 — 生成文件清单 + 行数检查

### 生成的文件

- AGENTS.md(根)+ CLAUDE.md(1 行 @AGENTS.md)
- .claude/{rules,hooks,settings.json}
- docs/{adr,gotchas.md} + .gitignore
- (多 tier)`<tier>/AGENTS.md` + `<tier>/CLAUDE.md` × N tier

### AGENTS.md 行数检查(强制)

```bash
wc -l AGENTS.md $(find . -maxdepth 2 -name 'AGENTS.md' -not -path './AGENTS.md' 2>/dev/null) 2>/dev/null
```

每文件行数 + 状态:< 100 ✅ 理想 / 100-200 ⚠️ 可接受 / > 200 🚫 警告(长尾搬 `.claude/rules/*.md` 或 ADR;tier-level 同样 < 100)。

**不允许** agent 跳过 / 凭印象描述。每个 AGENTS.md 都必须有具体行数 + 状态。

## Step 7.5 — Self-verify(强制,对应 [workflow §1.11](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#111-校验))

跑下面这段 bash,结合已知 Q&A 答案做 V1-V4.5 静态判断;再补 4 项 §1.11 运行时校验。任一 ❌(V6/V7 deferred 例外)→ 回头改,不能 self-report done。

```bash
# V1 placeholder 残留(唯一允许命中:README.md instruction 文本 `把 {{PLACEHOLDER}} 替换...`)
grep -rn '{{' --include='*.md' --include='*.js' --include='*.json' .
# V2 frontmatter(path-scoped rule 含 description + globs;security.md 仅 description)
head -10 .claude/rules/*.md
```

agent 看上面输出 + Q&A 答案对照 3 项:
- **V3 globs 路径**:每段 globs 的 path prefix(`backend/` / `frontend/` 等)真存在(P0 时仅含 AGENTS.md/CLAUDE.md 也算)
- **V4 命令一致**:根 AGENTS.md `(见各 <tier>/AGENTS.md)` 指针 ↔ tier-level `Commands` 节存在;命令 verb 跟 Q&A pkg-mgr / test framework 对齐(`uv` → `uv run X` / `pnpm` → `pnpm X`)
- **V4.5 framework split**:tier-level `<framework>` / `<orm>` / `<queue>` 各节 ≤ 5 条,深度 topic split 到 `.claude/rules/<framework>.md`

| 运行时(§1.11) | 此刻 | 说明 |
|---|---|---|
| V5 `/memory` 加载 | ✅ 必过 | 输出含根 + 各 tier AGENTS.md / CLAUDE.md;缺 → 嵌套层次错(§1.4) |
| V6 命令真能跑 | 🟡 deferred | B 层未起,Step 8 提示 `/feature-init` 前 `<pkg-mgr> --version` 兜底 |
| V7 hook 触发 | 🟡 deferred | lint binary 未装,`pnpm install` / `uv sync` 后改文件验 |
| V8 AI 读 AGENTS.md 总结 | ✅ 必过 | 自问 "1 句话总结栈 + 命令",4 要素(类型/主栈/起服务/跑测试)全对 |

报告格式:`V1✅ V2✅ V3✅ V4✅ V4.5✅ V5✅ V6🟡def V7🟡def V8✅`

## Step 8 — 用户报告(还需手工 review + 下一步)

### 还需手工 review

- **AGENTS.md `## Boundaries` 节**:template default 是合理 baseline(改 API / 加依赖 / 改迁移 / 改权限 → ⚠️ Ask first);**项目特定**的 ⚠️ Ask first 项(如"改 prompt template 必问 LLM ops team" / "改 billing rate 必问 finance")只有你知道,P0 后扫一遍补上(workflow §1.10 不收集这部分,见同节"不问什么"表)
- `.claude/rules/code-style.md` 各章节("函数/类"、"文件/模块"、"错误处理")可按项目实践补充
- 想加 framework-specific rules(FastAPI / Vue / etc.):`cp "$CLAUDE_PLUGIN_ROOT/template/.claude/rules/_examples/<framework>.example.md" .claude/rules/<framework>.md`,然后改 frontmatter `globs:` + `description:`(说明见同目录 README.md)

### ⚠️ Aspirational refs(本 P0 不创建)

生成的 AGENTS.md 引用了下列文件,**但 P0 不生成 code scaffold**。用户照根 AGENTS.md 命令(`docker compose up -d` / `pnpm test` / 等)跑前**必须先就位**,否则报错。

按 Q&A 答案动态列举(示例,fullstack Python + TS):

> ⚠️ **Python/Node 命令产出不对称**:`uv init` / `poetry init` 只产包骨架(`pyproject.toml`),不产 app 主入口;`pnpm create vite` 例外产完整 SPA。下表已拆"包骨架"vs"app 主入口"。

| 文件 | 怎么获得 |
|---|---|
| `docker-compose.yml` / `docker-compose.prod.yml`(若用 Docker) | 自己写,或 fork 现成 scaffold |
| `<tier>/pyproject.toml`(Python 包骨架) | `cd <tier> && uv init`(或 `poetry init` / `pdm init`)—— 仅起包,**不含 app 主入口** |
| `<tier>/app/main.py` + `<tier>/app/__init__.py` 等 FastAPI / Django / Flask app 主入口 | **自己写**,或 fork starter(如 [zhanymkanov/fastapi-best-practices](https://github.com/zhanymkanov/fastapi-best-practices))|
| `<tier>/package.json` / `<tier>/vite.config.ts` / `<tier>/eslint.config.js` + `<tier>/src/main.ts` 等前端入口(TS/JS tier) | `cd <tier> && pnpm create vite`(或框架对应 init,如 `pnpm create next-app` / `pnpm dlx nuxi init`)—— **此命令产完整 app 含入口** |
| `.github/workflows/*.yml`(CI) | 自己写或参考栈社区模板 |

> 想要 ready-to-run 全栈起步 → clone scaffold 后跑 `/project-workflow:project-personalize`,不用 `/project-init`。
> `/project-init` 的定位是**约定层 init**,不是 code scaffolder。

### 📋 下一步

1. `git init && git add . && git commit -m "P0: initial project setup"`
2. **写 ADR 捕获 P0 重大决策**:把 Q&A 选的 framework / ORM / DB / 前端栈 / pkg-mgr 等 5+ 项**各写一份独立 ADR**(`docs/adr/000N-<topic>.md`),模板与写法见 [workflow §1.8](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#18-adr-目录初始化) + `docs/adr/0000-template.md`。Context 节可引用 tech-researcher 报告(若 Q&A dispatched)
3. **扫一遍 `docs/gotchas.md`** —— 10 条工程坑,第一个 feature 实施前必读
4. 开始第一个 feature:
   ```
   /project-workflow:feature-init <your-first-feature-slug>
   ```

参考文档(plugin 仓):
- 完整方法论:https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md
- 快速操作版:https://github.com/shrekshrek/project-workflow/blob/main/docs/quickstart.md
- spec/plan/tasks 写法:https://github.com/shrekshrek/project-workflow/blob/main/docs/spec-driven.md

## Failure modes

| 错误 | 应对 |
|---|---|
| `PLUGIN_ROOT` 解析为空(`CLAUDE_PLUGIN_ROOT` 未注入 + cache 目录不存在)| plugin 安装异常。让用户跑 `/plugin uninstall project-workflow && /plugin install project-workflow` 重装后重试 |
| 当前目录非空且有冲突文件 | 按 Step 1 处理:已有 AGENTS.md → 重定向到 /project-personalize;已有 .claude/ 但无 AGENTS.md → 询问 (a) 全部覆盖 / (b) 中止 |
| 用户在 project-workflow 仓库本身跑 | Step 1 警告 + 询问是否继续 |
| Q&A 中用户中途退出 | 保存已答的部分,告诉用户跑 project-init 时已答的不再问 |
| Fullstack 但某 tier 不存在(如纯 backend + DB migrations) | 询问用户是否实际是 (b) Web Backend |
| Q&A 推不出 STYLE_HIGHLIGHT(冷门栈) | 填 1-2 条,删第 3 行 |
| `find -delete` / `rmdir` 仍被 sandbox 拦 | 改 `rm <file>` 单文件循环 + `rmdir <dir>`(避所有递归删除调用) |

## Notes

- **跟 feature-init 区别**:feature-init 在 P2 启动 feature(每个 feature 跑一次);project-init 在 P0 起整个项目骨架(once)。
- **方法论本体**:[`docs/workflow.md §1 P0`](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#1-p0project-setup项目第一天) —— 不装 plugin 也能纯手工跑 P0。
