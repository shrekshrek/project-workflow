# project-init reference tables

> SKILL.md 的静态查表附录(relocation,内容从旧版 SKILL 原样迁出,不是摘要替代)。
> 路径:`$PLUGIN_ROOT/skills/project-init/reference.md`
> **强制读取点**: Step 4 填 placeholder 前 Read R1-R4+R6; Step 5.1 mini-Q&A 前 Read R5; Step 8 aspirational refs 前 Read R7。不需要预读全文。

## R1 — Step 4.1:根 AGENTS.md placeholder 映射

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
| `{{STYLE_HIGHLIGHT_1/2/3}}` | 据栈推 1-3 条**真正特殊**的风格点(见 R4)|
| `{{HOOK_INDEX}}` | hook 未安装 → 删除整行;hook active + verified → 展开为实际存在的 `.claude/hooks` / `.claude/settings.json` / `.codex/hooks*` 索引行 |

**模块组织模式 default**(不问用户;写进 `.claude/rules/code-style.md` 末尾 `## 文件 / 模块` 节,不写根 AGENTS.md):
> 模块组织模式:**按 feature / domain 组织,不按 type**(避免 `controllers/` `services/` `utils/` type-based 散布)。详见 workflow §2.5。

**Git 平台 default**(写 `## Git Workflow` 节):固定 `平台:GitHub(PR + Actions + Discussions)`(GitLab/Gitea 用户 P0 后手动改)。

## R2 — Step 4.2:`.claude/rules/` placeholder 映射

| 文件 | Placeholder | 据什么填 |
|---|---|---|
| `code-style.md` | `{{CODE_STYLE_DESCRIPTION}}` | 一句话说明本文件管什么,保持简洁、具体;如 `Code style — Python (Ruff) + TypeScript/Vue (ESLint)` |
| `code-style.md` | `{{CODE_STYLE_PATHS}}` | 见 R3 paths YAML-list 推导 |
| `testing.md` | `{{TESTING_DESCRIPTION}}` | 一句话说明本文件管什么,保持简洁、具体;如 `Testing conventions — pytest (backend) + Vitest (frontend) + Playwright (E2E)` |
| `testing.md` | `{{TESTING_PATHS}}` | 见 R3 paths YAML-list 推导 |
| `testing.md` | `{{UNIT_TEST_FRAMEWORK}}` / `{{INTEGRATION_TEST_FRAMEWORK}}` | mixed-lang fullstack → mini-Q&A;single-lang / 单 tier → Q&A 轮 2 共享答案 |
| `testing.md` | `{{E2E_FRAMEWORK}}` | 询问 / 默认 Playwright |
| `testing.md` | `{{TEST_FILE_LAYOUT}}` | 推断(Python tests/ 镜像 src/ / JS `*.test.ts` 同目录) |
| `testing.md` | `{{TEST_NAME_PATTERN}}` | 据框架推 |
| `testing.md` | `{{TEST_RUN_COMMAND}}` / `{{COVERAGE_COMMAND}}` / `{{E2E_RUN_COMMAND}}` | mixed-lang → 指针;single-lang → 据 test framework + pkg mgr 推 |
| `testing.md` | `{{COVERAGE_THRESHOLD}}` | 默认 80(跟根 AGENTS.md 一致) |
| `security.md` | (无 placeholder,description 已 hardcode) | 通常不需大改 |

**`description:` 字段规则**:每个 rule frontmatter 保留简洁、具体的 `description:` 作为人类可读元数据,不设机械字符上限;`security.md`(always-on)同样应含。

## R3 — Step 4.3:paths 推导

格式:**`paths:` YAML 列表**。每个 `{{..._PATHS}}` placeholder 渲染为若干行缩进两个空格的 quoted list item,例如 `  - "src/**/*.py"`。不生成历史 scope key 或 scalar scope(workflow §1.6)。

### 单 tier 项目(轮 1 答 b/c/d)

| 主语言 | `{{CODE_STYLE_PATHS}}` patterns | `{{TESTING_PATHS}}` patterns |
|---|---|---|
| Python | `src/**/*.py`(或语言惯例 `<project>/**/*.py`)| `tests/**/*.py` |
| TypeScript / JavaScript | `src/**/*.{ts,tsx,js,jsx,vue}` | `**/*.test.{ts,tsx,js,jsx}`(JS 测试常就近)|
| Go | `**/*.go`(Go 不分 src/) | `**/*_test.go` |
| Rust | `src/**/*.rs` | `tests/**/*.rs`<br>`src/**/*.rs`(inline + integration)|

### Fullstack(轮 1 答 a;$BTIER / $FTIER = 轮 1.5 tier 名)

| 主语言组合 | `{{CODE_STYLE_PATHS}}` patterns | `{{TESTING_PATHS}}` patterns |
|---|---|---|
| Python + TS/Vue | `$BTIER/**/*.py`<br>`$FTIER/**/*.{ts,vue}` | `$BTIER/tests/**/*.py`<br>`$FTIER/**/*.test.{ts,vue}` |
| Go + TS | `$BTIER/**/*.go`<br>`$FTIER/**/*.{ts,tsx}` | `$BTIER/**/*_test.go`<br>`$FTIER/**/*.test.{ts,tsx}` |
| 全 TS | `$BTIER/**/*.ts`<br>`$FTIER/**/*.{ts,tsx,vue}` | `**/*.test.{ts,tsx}` |
| Rust + TS | `$BTIER/src/**/*.rs`<br>`$FTIER/**/*.{ts,tsx}` | `$BTIER/tests/**/*.rs`<br>`$FTIER/**/*.test.{ts,tsx}` |

示例(自定 tier `server + web`,Python+Vue):`CODE_STYLE_PATHS` 渲染为 `server/**/*.py`、`web/**/*.{ts,vue}` 两个 YAML list item;`TESTING_PATHS` 同理渲染 `server/tests/**/*.py`、`web/**/*.test.{ts,vue}`。

**多 tier(> 2)**:每个 tier 都加一个 list item,patterns 之间是 OR 关系。
**冷门栈识别不出**:保守 fallback `**/*.<ext>`,用户后续收窄。

## R4 — Step 4.4:STYLE_HIGHLIGHT 推断

**不写栈通用 default**(如"2 空格缩进"——工具 default 不算特殊),**写项目级真正会出错的**:

| 栈 | HIGHLIGHT 例 |
|---|---|
| Python | "严格 type hints,`from __future__ import annotations`" |
| TS | "TypeScript strict mode + noImplicitAny;async/await only,禁 `.then()`" |
| Vue 3 | "Composition API only;`<script setup>` 必用" |
| FastAPI | "Pydantic v2 strict mode;SQLAlchemy 2.0 select() 风格" |

只填 Q&A 信息能推出来的;没特殊点就填 1-2 个,删 `- {{STYLE_HIGHLIGHT_3}}` 行。

## R5 — Step 5.1:per-tier mini-Q&A 题库

**Q&A 规则**:✅ Required 必问,产出文件每条 project-specific 断言必 trace 到答案;⚪️ Optional 可省,省了只能用 stack default 或留 TODO,禁 agent 单方面写决策。跑前扫本 session 对话,已 hint 的题跳过。

### Service-style tier

✅ Required:
1. 框架?(FastAPI / Django / Flask / Express / Spring Boot / Gin / Rocket / 其他)
2. ORM?(SQLAlchemy 2.0 / 1.x / Django ORM / Prisma / TypeORM / 不用)
3. 数据库?(PostgreSQL / MySQL / SQLite / MongoDB / etc.)— **LLM context only**,不填 placeholder,用于推导 ORM critical rules
4. **Source 布局?**(一题钉死 Commands / Module Structure / Testing 路径,防多处独立 plant。选项据主语言渲染,✨ = default):

| 主语言 | 选项 |
|---|---|
| **Python** | ✨ (a) `app/` flat(FastAPI/Flask/Django 主流)/(b) `src/<package>/` src-layout /(c) `<package>/` 平铺(`uv init` 默认)/(d) 自定义 |
| **Node/TS**(非 Next)| ✨ (a) `src/`(Vite/NestJS/Express 主流)/(b) root-level 单文件 /(c) 自定义 |
| **Next.js** | ✨ (a) `app/` App Router /(b) `pages/` legacy /(c) 自定义 |
| **Go** | ✨ (a) `cmd/<binary>/` + `internal/<domain>/` /(b) flat `main.go` /(c) 自定义 |
| **Rust** | ✨ (a) `src/main.rs` 单 binary /(b) `src/bin/<name>.rs` 多 binary /(c) workspace `crates/<member>/` /(d) 自定义 |
| **Java/Kotlin(Spring)** | ✨ (a) `src/main/<lang>/<root.package>/` /(b) multi-module /(c) 自定义 |
| **Elixir** | ✨ (a) `lib/<app_name>/` Mix 标准 /(b) umbrella /(c) 自定义 |
| **Ruby(Rails)** | ✨ (a) `app/{controllers,models,...}`(Rails 强制)/(b) 自定义(罕见) |
| **C#/.NET** | ✨ (a) `src/<Project.Name>/` 现代 /(b) 老式根目录 /(c) 自定义 |
| **其他** | 用户输入 `<src 包根>` + `<入口文件>` |

5-7. **(mixed-lang fullstack only)** 测试框架 / Lint 工具 / 包管理器(single-lang 已在轮 2 共享答过,跳过)

⚪️ Optional:8. 任务队列(Celery / RQ / BullMQ / 不用;tier 本身是 worker 则在此问 broker) 9. Migration 工具(Alembic / Atlas / 框架自带 / 纯 SQL)

### UI-style tier

✅ Required:
1. 框架?(Vue/Nuxt / React/Next / Svelte/SvelteKit / Solid / Astro / React Native / Flutter / 其他)
2. UI 库?(Nuxt UI / shadcn / MUI / Element Plus / Ant Design / Tailwind only / 自造)
3. State 管理?(Pinia / Vuex / Redux Toolkit / Zustand / Jotai / 不用)
4. **(Nuxt/Next/SvelteKit only)** 渲染模式?(SSR / SSG / hybrid;SPA/native 默认不问)— LLM context only,推导 `{{TIER_BUILD_COMMAND}}` + critical rules
5-7. **(mixed-lang fullstack only)** 组件测试框架 / Lint 工具 / 包管理器

⚪️ Optional:8. 样式方案(Tailwind / UnoCSS / CSS Modules / scoped only) 9. E2E 框架(Playwright / Cypress / 不用)

> 起服务 / build / test / lint / migration 命令一律**推导**不问(SKILL.md Step 2 末尾主声明);`{{TIER_SRC_DIR}}` / `{{TIER_ENTRY_POINT}}` / `{{TIER_TEST_DIR}}` 据题 4 答案渲染。

## R6 — Step 4.5b:plugin_hardcoded_defaults 清单

```
- {value: "feat/<NNN>-<slug>", source: "workflow.md §1.10", rationale: "跟 /feature-init 工具行为对齐"}
- {value: "fix/<scope>", source: "workflow.md §1.10", rationale: "对齐 branch naming"}
- {value: "GitHub", source: "workflow.md §1.10", rationale: "plugin 默认 GitHub 词汇 / .github/"}
- {value: "conventional commits", source: "workflow.md §1.10", rationale: "default 99% 项目接受"}
- {value: "≥ 80%", source: "workflow.md §1.10", rationale: "测试覆盖率门槛 default"}
- {value: "按 feature / domain 组织", source: "workflow.md §1.10 + §2.5", rationale: "模块组织 default"}
- {value: "(B 层未定 — 部署时补,见 docs/adr/000N-deploy.md)", source: "workflow.md §1.10", rationale: "P0 不预测部署"}
- {value: "Playwright", source: "testing.md {{E2E_FRAMEWORK}} default", rationale: "P0 cross-tier E2E default, refinable via ADR"}
```

## R7 — Step 8:Aspirational refs 表(P0 不创建的文件)

> ⚠️ Python/Node 命令产出不对称:`uv init` / `poetry init` 只产包骨架(`pyproject.toml`)不产 app 主入口;`pnpm create vite` 例外产完整 SPA。

| 文件 | 怎么获得 |
|---|---|
| `docker-compose.yml` / `docker-compose.prod.yml`(若用 Docker) | 自己写,或 fork 现成 scaffold |
| `<tier>/pyproject.toml`(Python 包骨架) | `cd <tier> && uv init`(或 poetry/pdm init)—— 仅包骨架,**不含 app 主入口** |
| `<tier>/app/main.py` 等后端 app 主入口 | **自己写**,或 fork starter(如 zhanymkanov/fastapi-best-practices)|
| `<tier>/package.json` / `vite.config.ts` / `src/main.ts` 等前端入口 | `cd <tier> && pnpm create vite`(或 `pnpm create next-app` / `pnpm dlx nuxi init`)—— 产完整 app 含入口 |
| `.github/workflows/*.yml`(CI) | 自己写或参考栈社区模板 |
