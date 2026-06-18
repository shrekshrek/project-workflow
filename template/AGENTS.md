# AGENTS.md

This file provides project-level instructions to any AI coding agent (Claude Code, Codex, OpenCode, Cursor, etc.).
Claude Code reads `CLAUDE.md` which imports this file via `@AGENTS.md`.

<!--
本文件目标 < 100 行(Anthropic Boris Cherny 标准),最多 200 行。
长尾内容用 @imports 拉到 .claude/rules/*.md 或 docs/。
-->

## 文档索引(big picture)

<!-- 读单个文档之前先理解它在整体里的位置。Claude 拿到这段就知道去哪找信息,不用搜 -->

```
README.md                  快速上手 + 命令清单
AGENTS.md                  本文件,项目级 AI 协作约定
CLAUDE.md                  thin pointer: @AGENTS.md
.claude/                   path-scoped rules + hooks + settings
├── rules/<topic>.md       code-style / testing / security / framework-specific
├── hooks/                 PostToolUse 等机械检查
└── settings.json
docs/
├── specs/<NNN>-<slug>/    实际功能 spec(每开发任务一个目录,由 /feature-init 创建)
├── adr/                   架构决策记录
└── (其他业务文档)
<!-- Fullstack 项目追加 tier 占位:
<tier>/                    tier 级 AGENTS.md(差量于根)
└── AGENTS.md / CLAUDE.md
例:backend/ + frontend/ ── 用户 Q&A 自定义命名
-->
```

**关键依赖关系**(改 A 文件常常要同步改 B):

<!-- 项目演化中识别后补充。典型例:
     - README.md 命令清单 ↔ 根 package.json scripts
     - AGENTS.md Boundaries ↔ .claude/rules/security.md
     - <tier>/AGENTS.md ↔ <tier>/ 实际栈选择 -->
- (按需填写)

## Commands

<!-- 起服务 / 测试 / lint 的完整命令(含 flag) -->
- 起开发环境:`{{DEV_COMMAND}}`
- 跑测试:`{{TEST_COMMAND}}`
- Lint:`{{LINT_COMMAND}}`
- 部署:`{{DEPLOY_COMMAND}}`

## Testing

- 框架:`{{TEST_FRAMEWORK}}`
- 测试文件位置:`{{TEST_LOCATION}}`(如 `tests/` 镜像 `src/` 结构,或 `<name>.test.ts` 同目录)
- 覆盖率门槛:≥ {{COVERAGE_THRESHOLD}}%

## Project Structure

<!-- 目录约定:源码、测试、文档放哪儿。Claude 能从代码读出来的不写 -->
- `{{SRC_DIR}}/`  源码
- `{{TEST_DIR}}/` 测试
- `docs/specs/` 功能级 spec(每开发任务一个目录)
- `docs/adr/` 架构决策记录

<!-- 项目特异约定 -->
- (在此列出"Claude 猜不到"的目录约定)

## Code Style

<!-- 单一 source of truth = .claude/rules/code-style.md。AGENTS.md 只做指针 + 1-3 条最特殊点
     不 inline 代码 snippet —— 跟 .claude/rules/code-style.md 重复必漂移(详见 §1.3 反模式)。
     稳定后想加视觉锚,在本节末尾另起一段贴 5-15 行真实代码即可 -->

**Source of truth**:
- `.claude/rules/code-style.md` ── 详细规则(AI / 人 都读)
- `{{LINT_CONFIG_PATH}}` ── 机器强制(eslint / ruff / gofmt 等 config)

**项目特殊点**(top 1-3,快速参考,不重复 source of truth 的内容):
- {{STYLE_HIGHLIGHT_1}}
- {{STYLE_HIGHLIGHT_2}}
- {{STYLE_HIGHLIGHT_3}}

## Git Workflow

- 分支命名:`{{BRANCH_PATTERN}}`(如 `feat/<scope>` / `fix/<scope>`)
- Commit 格式:{{COMMIT_FORMAT}}(如 conventional commits)
- Proof bundle:填入 `docs/specs/<NNN>-<slug>/tasks.md` 末尾 `## Proof Bundle` 节;走 PR 时复制该节到 PR 描述

## 工程坑清单(P0 必扫)

P0 完成、第一次起服务之前,务必扫一遍工程陷阱清单 [`docs/gotchas.md`](docs/gotchas.md)。10 条覆盖 Docker / 包管理 / 测试基建 / async 跨 loop 等,**全是 AI 第一次搭项目会踩**。

## 代码修改原则(KISS + 最小合理变更)

- **优先编辑现有文件**,不主动建新文件;新文件需有清晰理由(职责无法挂入现有模块)
- **不主动写文档**(`.md` / README / NOTES),除非用户明确要求;PR 描述里写"为什么"
- **保持最小 diff**:bug fix 不顺便重构,新 feature 不顺便清旧代码;cleanup 单独 PR
- **不为不存在的场景加防御**:框架已保证的不重复校验,内部代码间互信,只在边界(用户输入 / 外部 API)做校验
- **删除即删除**:别留 `// removed in PR #123` 注释、别留未用的 `_unused` 重命名、别加"以防未来要用"的 stub

## 灾难性不变量 / 高爆破半径路径(可选)

> 列出"破一次 = 大面积作废 / 难回滚"的路径(glob)。`/feature-init` 轻车道分类(Step 4.5 第 3 问)+ `/proof-bundle` 反核读本节:**触达这些路径的 feature 一律走全道**(spec-driven.md §3.2.5)。无此类不变量的项目可删本节(轻车道第 3 问退回人工保守判)。

- (例)`**/embedding*` / `**/vector*` —— 向量 / 嵌入:破一次全量向量作废、跨源检索失效
- (例)`**/migrations/**` / `**/alembic/**` —— 数据迁移:不可逆
- (按项目实际填)

## Boundaries

- ✅ **Always**(允许且无需确认):
  - 加测试
  - 改模块内部
  - 写 schema

- ⚠️ **Ask first**(高影响,需要确认):
  - 改 API 契约
  - 加依赖
  - 改数据库迁移
  - 改权限定义

- 🚫 **Never**:
  - 提交 `.env*` / secret
  - 跳过测试
  - 用 raw SQL 绕开 ORM(如适用)

---

<!-- 路径级规则按需 @import,只在 Claude 读相关文件时加载,节省 context budget。
     纪律(workflow §1.6):
     - 有 `globs:` frontmatter 的规则 → 注释保留(globs 处理 path-scoped 加载)
     - 无 `globs:` 的全局规则(如 security)→ 取消注释,走 @import 强制加载 -->
<!-- @.claude/rules/code-style.md -->
<!-- @.claude/rules/testing.md -->
<!-- @.claude/rules/security.md -->
