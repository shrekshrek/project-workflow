---
name: project-init
description: Initialize a project's v2 starter kit (AGENTS.md + .claude/ + docs/specs/_template/ + tier-level AGENTS.md if fullstack). Q&A driven, language/stack agnostic. Dispatches tech-researcher sub-agent for "不确定" answers. Claude Code-native. Use at P0 (project's first day). Not for adding features mid-project — use /feature-init for that.
---

**Response language**: Match the user's prompt language (中文 / English / etc.) for all natural-language output. Generated file content stays in the language of the source template (Chinese for v2).

# Project Init

Initialize a new (or existing-but-no-AGENTS.md) project's v2 baseline. Q&A walks the user through stack and conventions, then writes 10+ files in one pass.

> **Phase 名 vs skill 名**:[`workflow.md §1`](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#1-p0project-setup项目第一天) 的 phase 仍叫 "**P0 Project Setup**"(方法论命名);本 skill 叫 `**project-init**`(动词 init,跟 [`feature-init`](../feature-init/SKILL.md) 对齐)。两者有意分离。

**Use when**: P0 — project's first day, no AGENTS.md yet.
**Not for**: starting a new feature (use `/feature-init <slug>`) or refreshing existing AGENTS.md (use `/refresh-agents-md` — planned, not implemented).

**Output structure**(written to current working directory):

```
.
├── AGENTS.md                                  # 根 AGENTS.md(填齐 placeholder)
├── CLAUDE.md                                  # 1 行:@AGENTS.md
├── .claude/
│   ├── rules/{code-style,testing,security}.md  # 填齐
│   ├── hooks/lint-on-edit.js                  # 按 lint 工具裁剪
│   └── settings.json
├── docs/
│   ├── specs/_template/{spec,plan,tasks}.md
│   ├── adr/{README,0000-template}.md
│   └── gotchas.md                             # 从 project-workflow repo 复制
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/{bug_report,feature_request,proposal}.md
├── .gitignore
└── <tier>/                                    # 仅 fullstack
    ├── AGENTS.md                              # 差量于根
    └── CLAUDE.md                              # @AGENTS.md
```

## Step 1 — 检测当前状态

```bash
ls -la
```

判断:

| 当前状态 | 处理 |
|---|---|
| 空目录 / 几乎空 | 直接进 Step 2(greenfield 流程) |
| 已有 `AGENTS.md` | **`/project-init` 不适合**——跑 `/project-workflow:project-personalize` 替代(见下) |
| 已有 `.claude/` 但无 AGENTS.md | 问: "已有 .claude/。要 (a) 全部覆盖 / (b) 中止?" |
| 已有 `docs/specs/_template/` | 类似 |

若用户选中止 → 直接停。否则继续。

> **关于 scaffold-cloned 或既有项目**:`/project-init` 专做 **greenfield**(从零起项目)。
> 若你 clone 了已有 `AGENTS.md` 的 scaffold,或想 retrofit 既有大项目,**应该跑 `/project-workflow:project-personalize`**——它处理替换 scaffold default 值、补 tier-level AGENTS.md、扫已有代码推导 Project Structure 等。

**安全检查**:若当前目录看起来是 `project-workflow` 仓库本身(检测到 `docs/workflow.md` + `skills/feature-init/`)→ 警告: "你似乎在 project-workflow 仓库内运行 project-init。这通常是误用 —— project-init 应该在**新项目**目录跑。要继续吗?"

## Step 2 — Q&A:栈 + 约定

**一问一答,等用户回答再问下一个**。每轮把答案存到本地变量等 Step 5 用。

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

sub-agent 返回结构化报告(2-3 candidates + recommendation + 理由)→ project-init 把 recommendation 回填进 Q&A 答案,跟用户确认后继续下一问。

**为什么 sub-agent 而不是 inline 处理**:
- 调研涉及 WebSearch / WebFetch / context7 MCP 等可能多轮工具调用,**独立 context** 避免污染 project-init 主会话
- 跟 v1 `tech-researcher` 哲学一致(独立调研 agent),但只在用户**主动求建议**时触发(opt-in)

**例(用户视角)**:

> 用户: "ORM 用什么不确定"
> project-init: (dispatch tech-researcher) ...
> tech-researcher 返回报告 → project-init 给用户看:
>   "✅ tech-researcher 调研结果:
>    - SQLAlchemy 2.0: 成熟 strict types,生态最深 / 学习曲线陡
>    - Tortoise ORM: async-native API 像 Django / 生态小
>    - Prisma: 类型生成强 / Python 支持远不如 TS
>    推荐 **SQLAlchemy 2.0** —— 跟 Pydantic v2 + FastAPI 生态契合最深。OK?"
> 用户: "OK"
> → 填进 Q&A 答案,继续下一问

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

### 轮 2:语言

- 主语言?(若多语言列 2-3 个)

**Fullstack 项目本轮只问跨 tier 共性**(如全栈都用 TS / 后端 Python + 前端 TS)。**具体框架(FastAPI / Vue / React 等)在 Step 7.1 per-tier mini-Q&A 问**,本轮不重复。

### 轮 3:测试 + Lint + 包管理

- 测试框架?(给栈 default 建议)
- Lint 工具?(给栈 default)
- 包管理器?(pnpm / npm / yarn / pip / poetry / cargo / go mod / 等)

### 轮 4:命令

- 起服务命令?(`pnpm dev` / `python -m uvicorn ...` / etc.)
- 跑测试命令?
- Lint 命令?
- 部署命令?(可选)

### 轮 5:部署 + 团队

- 部署目标?(单机+Docker / Kubernetes / Serverless / 不部署)
- 团队规模?(solo / small / large)
- 分支命名?(default: `feat/<scope>` + `fix/<scope>`,接受 default 答 "ok")

## Step 3 — Clone v2 template

```bash
TEMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/shrekshrek/project-workflow "$TEMP_DIR/pw" 2>/dev/null
```

**失败处理**:若 clone 失败(网络 / 防火墙)→ 告诉用户:

> Git clone 失败。手工 fallback:
> 1. 从 https://github.com/shrekshrek/project-workflow 下载 zip
> 2. 解压后把 `template/*` 复制到当前目录
> 3. 把 `docs/gotchas.md` 复制到 `./docs/gotchas.md`
> 4. 重新跑 project-init,跳过 Step 3-4(我会从这里 detect 已有文件)

成功后继续。

## Step 4 — 复制 template + gotchas.md

```bash
# template/ 整个复制(starter kit shape)
cp -r "$TEMP_DIR/pw/template/." .

# gotchas.md 在 docs/ 不在 template/
mkdir -p docs
cp "$TEMP_DIR/pw/docs/gotchas.md" docs/gotchas.md

# 多 tier example 暂留在 _multi_tier_examples/,Step 7 处理
# 单 tier 项目可以删:
# rm -rf _multi_tier_examples/

# 清理临时目录
rm -rf "$TEMP_DIR"
```

复制后 ls 验证关键文件存在:
- `AGENTS.md`, `CLAUDE.md`
- `.claude/rules/{code-style,testing,security}.md`
- `.claude/hooks/lint-on-edit.js`, `.claude/settings.json`
- `docs/specs/_template/{spec,plan,tasks}.md`
- `docs/adr/{README,0000-template}.md`
- `docs/gotchas.md`
- `.github/...`
- `.gitignore`
- `_multi_tier_examples/`(仅 fullstack 用,见 Step 7)

## Step 5 — 填根 `AGENTS.md` placeholder

用 Edit 工具逐个替换:

| Placeholder | 据什么填 |
|---|---|
| `{{DEV_COMMAND}}` | Q&A 轮 4 起服务 |
| `{{TEST_COMMAND}}` | Q&A 轮 4 跑测试 |
| `{{LINT_COMMAND}}` | Q&A 轮 4 lint |
| `{{DEPLOY_COMMAND}}` | Q&A 轮 4 部署(若没有写 "(项目演化中补)") |
| `{{TEST_FRAMEWORK}}` | Q&A 轮 3 测试框架 |
| `{{TEST_LOCATION}}` | 默认 `tests/`(可改) |
| `{{COVERAGE_THRESHOLD}}` | 默认 80,可改 |
| `{{SRC_DIR}}` | **单 tier**:`src`(或对应语言惯例,如 Python: `<project>/`,Go: `cmd/` + `internal/`)<br>**多 tier**:**根 AGENTS.md 不填具体路径**,改成指针 `(见各 <tier>/AGENTS.md)`,避免跟 tier-level 重复 |
| `{{TEST_DIR}}` | 同上规则:单 tier 直接填,多 tier 改指针 |
| `{{BRANCH_PATTERN}}` | Q&A 轮 5 |
| `{{COMMIT_FORMAT}}` | 默认 conventional commits |
| `{{LINT_CONFIG_PATH}}` | 据 Q&A 轮 3 lint 工具推断(如 `.eslintrc.cjs` / `pyproject.toml`)|
| `{{STYLE_HIGHLIGHT_1/2/3}}` | 据栈推 1-3 条**真正特殊**的风格点(见下) |

### STYLE_HIGHLIGHT 推断规则

不要写栈通用 default(如"2 空格缩进"——这是工具 default,不算特殊)。要写**项目级别真正会出错的**:

| 栈 | HIGHLIGHT 例 |
|---|---|
| Python | "严格 type hints,`from __future__ import annotations`" |
| TS | "TypeScript strict mode + noImplicitAny;async/await only,禁 `.then()`" |
| Vue 3 | "Composition API only;`<script setup>` 必用" |
| FastAPI | "Pydantic v2 strict mode;SQLAlchemy 2.0 select() 风格" |

只填 Q&A 信息能推出来的;栈没特殊点就只填 1-2 个,留第三个为空(把 `- {{STYLE_HIGHLIGHT_3}}` 那行删掉)。

**不允许留 placeholder**——填齐或删行(符合 Addy Osmani "no aspirational" 原则)。

## Step 6 — 填 `.claude/rules/` placeholder

类似 Step 5,逐文件填:

### `.claude/rules/code-style.md`

| Placeholder | 据什么填 |
|---|---|
| `{{NAMING_CONVENTION}}` | 据语言推(Python: snake_case;JS/TS: camelCase + PascalCase classes) |
| `{{INDENT}}` | 据语言推(Python: 4;JS/TS/Go: 2;Rust: 4) |
| `{{LINE_LIMIT}}` | 默认 100(Python 可 88,Rust 可 100) |

### `.claude/rules/testing.md`

| Placeholder | 据什么填 |
|---|---|
| `{{UNIT_TEST_FRAMEWORK}}` | Q&A 轮 3 |
| `{{INTEGRATION_TEST_FRAMEWORK}}` | 同上(可同) |
| `{{E2E_FRAMEWORK}}` | 询问用户(可默认 Playwright)|
| `{{TEST_FILE_LAYOUT}}` | 推断(Python: tests/ 镜像 src/;JS: \*.test.ts 同目录) |
| `{{TEST_NAME_PATTERN}}` | 据框架推 |
| `{{TEST_RUN_COMMAND}}` | Q&A 轮 4 |
| `{{COVERAGE_COMMAND}}` | 据测试框架推 |
| `{{E2E_RUN_COMMAND}}` | 推断 / 询问 |
| `{{COVERAGE_THRESHOLD}}` | 默认 80(跟根 AGENTS.md 一致) |

### `.claude/rules/security.md`

主要是固定文本,placeholder 少 / 无 —— 不需要大改。

## Step 7 — Fullstack:per-tier AGENTS.md + CLAUDE.md

**仅当 Q&A 轮 1 答 (a) Fullstack 时执行**。其他项目类型跳过本 Step。

### Step 7.0:清理 `_multi_tier_examples/`(非 fullstack 即删)

- **非 fullstack 项目**:`rm -rf _multi_tier_examples/`(用不到,删干净)
- **Fullstack 项目**:暂保留,Step 7.4 用完后删

### Step 7.1:对每个 tier 分类 + 跑 per-tier mini-Q&A

For each tier in [Q&A 轮 1.5 tier list]:

**先分类**(本 tier 属于 service-style 还是 UI-style?):

| 类别 | 特征 | 例 |
|---|---|---|
| **Service-style**(无 UI 的服务) | 跑后台逻辑 / 提供 API / 处理任务 | `backend` / `api` / `server` / `worker` / `microservice` / `inference-server` / `training` |
| **UI-style**(有用户界面) | 给最终用户看的界面 | `frontend` / `web` / `app` / `admin` / `dashboard` / `mobile-web` / `mobile` |

不确定时问用户:"这个 tier 主要是后台服务,还是有用户界面?"

#### Service-style tier mini-Q&A(5-7 个问题)

```
1. 框架? (FastAPI / Django / Flask / Express / Spring Boot / Gin / Rocket / 其他)
2. ORM? (SQLAlchemy 2.0 / 1.x / Django ORM / Prisma / TypeORM / 不用)
3. 主要库? (Pydantic / Celery / Redis / Kafka / 等,列 3-5 个)
4. 任务队列? (Celery / RQ / BullMQ / Sidekiq / 不用 ── 若 tier 本身就是 worker,在此问 broker)
5. 数据库? (PostgreSQL / MySQL / SQLite / MongoDB / etc.)
6. 测试框架(本 tier 特有,可跟根不同)?
7. 起服务 / 跑测试 / lint / migration / 任务运行 命令?
```

#### UI-style tier mini-Q&A(5-7 个问题)

```
1. 框架? (Vue/Nuxt / React/Next / Svelte/SvelteKit / Solid / Astro / React Native / Flutter / 其他)
2. UI 库? (Nuxt UI / shadcn / MUI / Element Plus / Ant Design / Tailwind only / 自造)
3. 样式方案? (Tailwind / CSS Modules / styled-components / UnoCSS / 其他)
4. State 管理? (Pinia / Vuex / Redux Toolkit / Zustand / Jotai / 不用)
5. 组件 / E2E 测试框架?
6. 渲染模式 / 平台目标? (SSR / SSG / SPA / hybrid / iOS+Android / etc.)
7. 起开发 / build / test / lint 命令?
```

### Step 7.2:据类别选模板,复制到 `<tier>/`

模板按**类别**(不是 tier 名),覆盖任意 tier 名:

```bash
TIER_NAME=<from Q&A 轮 1.5>     # 用户自定的 tier 名(如 backend / worker / api / mobile / web ...)
TIER_CATEGORY=<service-tier 或 ui-tier>  # 据 Step 7.1 分类

mkdir -p "$TIER_NAME"
cp "_multi_tier_examples/${TIER_CATEGORY}.AGENTS.md.example" "$TIER_NAME/AGENTS.md"
cp "_multi_tier_examples/${TIER_CATEGORY}.CLAUDE.md.example" "$TIER_NAME/CLAUDE.md"
```

例:
- 用户的 `backend/` tier(service) → `service-tier.example` → `backend/AGENTS.md`
- 用户的 `worker/` tier(service) → `service-tier.example` → `worker/AGENTS.md`
- 用户的 `frontend/` tier(UI) → `ui-tier.example` → `frontend/AGENTS.md`
- 用户的 `mobile/` tier(UI) → `ui-tier.example` → `mobile/AGENTS.md`

### Step 7.3:填 tier-level AGENTS.md placeholder

逐个替换 `{{TIER_NAME}}` / `{{TIER_DEV_COMMAND}}` / `{{TIER_FRAMEWORK}}` 等(详见 [_multi_tier_examples/README.md](../template/_multi_tier_examples/README.md))。

**关键 1**:`{{TIER_FRAMEWORK_RULES}}` / `{{TIER_ORM_RULES}}` / `{{TIER_UI_USAGE_RULES}}` 等内容**根据 Q&A 答案动态填**——不留 placeholder。

**关键 2:连同 `<!-- 例 -->` 一起替换**:template 里每个 placeholder 下方有 `<!-- 例(FastAPI): ... -->` 这种参考注释,**给 skill writer 看的**,**不该留在用户项目里**。填具体内容时,**连同上方/下方的 `<!-- 例 -->` 注释一起替换**——否则用户的 tier-level AGENTS.md 会同时有"具体规则 + stale FastAPI 示例",看起来矛盾。

**关键 3:删除不适用的整个章节**:某 tier 用不到的章节(如 service-tier 不用 ORM 时 `### {{TIER_ORM}}` 整节删)直接整段删,**不留空章节**。

### Step 7.4:删除残留 example

所有 tier 处理完后:

```bash
rm -rf _multi_tier_examples/
```

## Step 8 — 裁剪 `.claude/hooks/lint-on-edit.js`

template 的 lint-on-edit.js 是骨架(if-else by extension)。

根据 Q&A 答案:
- **单语言项目**: 只保留对应 case branch
- **多语言**(如 fullstack 有 Python + TS): 保留对应多个 case branch
- 其他语言 case 删除

用 Edit 工具裁剪。

## Step 9 — 总结 + 下一步建议

报告生成的文件 + 提示下一步:

```markdown
## ✅ Project setup complete

### 生成的文件

- AGENTS.md(根, {{N}} 个 placeholder 已填)
- CLAUDE.md(1 行 @AGENTS.md)
- .claude/{rules,hooks,settings.json}
- docs/{specs/_template,adr,gotchas.md}
- .github/{PULL_REQUEST_TEMPLATE,ISSUE_TEMPLATE/*}
- .gitignore
- (多 tier 时,per tier 一对) `<tier>/AGENTS.md` + `<tier>/CLAUDE.md` —— 据类别(service-style / UI-style)选模板,据 mini-Q&A 填具体栈细节

### 还需手工 review

- 部分 placeholder 若 Q&A 没覆盖到,可能留在文件里 —— 搜 "{{" 看是否有残留
- `.claude/rules/code-style.md` 各章节("函数/类"、"文件/模块"、"错误处理")可按项目实践补充
- `docs/specs/_template/` 是模板,**不要直接改这里**;新功能用 `/feature-init <slug>` 起 spec

### AGENTS.md 行数检查

跑 `wc -l AGENTS.md`:
- < 100 行:理想(Anthropic Boris Cherny 标杆)
- 100-200 行:可接受
- **> 200 行**:**警告**——Anthropic best-practices 显示 > 200 行依从度下降。建议:
  - 长尾搬 `.claude/rules/*.md`(用 `@imports` 在 AGENTS.md 末尾按需拉)
  - 或拆到 `docs/architecture.md` / ADR
  - tier-level AGENTS.md 同样原则,各 < 100 行

### 📋 下一步

1. `git init && git add . && git commit -m "P0: initial project setup"`
2. **扫一遍 `docs/gotchas.md`** —— 10 条工程坑,P0 前必读
3. 开始第一个 feature:
   ```
   /project-workflow:feature-init <your-first-feature-slug>
   ```

参考文档:
- 完整方法论:[`docs/workflow.md`](docs/workflow.md)
- 快速操作版:[`docs/quickstart.md`](docs/quickstart.md)
- spec/plan/tasks 写法:[`docs/spec-driven.md`](docs/spec-driven.md)
```

## Failure modes

| 错误 | 应对 |
|---|---|
| `git clone` 失败(无网络 / 防火墙) | 告诉用户手工 fallback(见 Step 3) |
| 当前目录非空且有冲突文件 | 询问 overwrite / augment / abort(Step 1) |
| 用户在 project-workflow 仓库本身跑 | Step 1 警告 + 询问是否继续 |
| Q&A 中用户中途退出 | 保存已答的部分,告诉用户跑 project-init 时已答的不再问 |
| Fullstack 但某 tier 不存在(如纯 backend + DB migrations) | 询问用户是否实际是 (b) Web Backend |
| Q&A 推不出 STYLE_HIGHLIGHT(冷门栈) | 填 1-2 条,删第 3 行 |

## Notes

- **跟 feature-init 区别**:feature-init 在 P2 启动 feature(每个 feature 跑一次);project-init 在 P0 起整个项目骨架(once)。
- **Claude Code-native**:本 skill 用 Task tool dispatch `tech-researcher` sub-agent 做"不确定"答案的研究——独立 context、可调 WebSearch/WebFetch/context7 MCP,不污染 project-init 主会话。
- **不覆盖既有 P0 SOP**:[`docs/workflow.md §1 P0`](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#1-p0project-setup项目第一天) 是方法论本体,本 skill 是自动化辅助。**不装 plugin 也能纯手工跑 P0**。
- **goal-driven**:本 skill 服务 [§0.1 命题 3 Drift](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md#01-这本手册解决什么) —— P0 锚定基线,统一项目标准。
- **phase 名 vs skill 名**:§1 phase 仍叫 "P0 Project Setup"(workflow.md 的 phase 命名);本 skill 叫 `project-init`(动词 init 跟 feature-init 对齐)。两者**有意分离**,不要在 docs 里混用。
