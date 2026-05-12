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
└── docs/
    ├── specs/_template/   功能 spec 三文件模板
    ├── specs/<NNN>-<slug>/ 实际功能 spec(每开发任务一个目录)
    ├── adr/               架构决策记录
    └── (其他业务文档)
```

**关键依赖关系**(改 A 文件常常要同步改 B):

- `{{KEY_DEP_1}}`(例:`README.md` 命令清单 ↔ 根 `package.json` scripts)
- `{{KEY_DEP_2}}`(例:`AGENTS.md` Boundaries ↔ `.claude/rules/security.md`)

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

<!-- 一段真实代码胜过三段描述。粘一段你想要的风格 -->

```{{LANGUAGE}}
{{REAL_CODE_SNIPPET}}
```

## Git Workflow

- 分支命名:`{{BRANCH_PATTERN}}`(如 `feat/<scope>` / `fix/<scope>`)
- Commit 格式:{{COMMIT_FORMAT}}(如 conventional commits)
- PR 描述用 `.github/PULL_REQUEST_TEMPLATE.md`(含 proof bundle 检查项)

## 工程坑清单(P0 必扫)

P0 完成、第一次 `pnpm dev` 之前,务必扫一遍工程陷阱清单 `docs/gotchas.md`(从 [project-workflow v2 仓库](https://github.com/shrekshrek/project-workflow) 复制进项目,或直接读在线版)。10 条覆盖 Docker / pnpm script 命名 / Pydantic extras / 测试基建 / asyncpg 跨 loop 等,**全是 AI 第一次搭项目会踩**。

工程化样例(Vue + FastAPI 全栈、Docker、Alembic、统一 CLI、18 个测试):参考 `scaffold-v2/`(blueprint 仓库内的实例化版本)。

## 代码修改原则(KISS + 最小变更)

- **优先编辑现有文件**,不主动建新文件;新文件需有清晰理由(职责无法挂入现有模块)
- **不主动写文档**(`.md` / README / NOTES),除非用户明确要求;PR 描述里写"为什么"
- **保持最小 diff**:bug fix 不顺便重构,新 feature 不顺便清旧代码;cleanup 单独 PR
- **不为不存在的场景加防御**:框架已保证的不重复校验,内部代码间互信,只在边界(用户输入 / 外部 API)做校验
- **删除即删除**:别留 `// removed in PR #123` 注释、别留未用的 `_unused` 重命名、别加"以防未来要用"的 stub

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

<!-- 路径级规则按需 @import,只在 Claude 读相关文件时加载,节省 context budget -->
<!-- @.claude/rules/code-style.md -->
<!-- @.claude/rules/testing.md -->
<!-- @.claude/rules/security.md -->
