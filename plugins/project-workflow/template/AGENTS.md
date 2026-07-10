# AGENTS.md

This file provides project-level instructions to any AI coding agent (Claude Code, Codex, OpenCode, Cursor, etc.).
Claude Code reads `CLAUDE.md` which imports this file via `@AGENTS.md`.

<!--
本文件目标 < 100 行,最多 200 行；长文件会增加上下文并降低指令遵循度。
长尾背景放 docs/ 并在此留短指针；路径约定放 .claude/rules/*.md,由 Claude 自动发现。
-->

## 文档索引(big picture)

<!-- 读单个文档之前先理解它在整体里的位置。Claude 拿到这段就知道去哪找信息,不用搜 -->

```
AGENTS.md                  本文件,项目级 AI 协作约定
CLAUDE.md                  thin pointer: @AGENTS.md
.claude/rules/<topic>.md   code-style / testing / security / framework-specific
{{HOOK_INDEX}}
docs/
├── specs/index.md           产品域索引(E 类;P0 创建)
├── specs/<area>.md          产品域现状(E 类;按需创建;是该域唯一权威)
├── specs/changes/<NNN>-<slug>/  进行中的变更 artifact(B 类;由 /feature-init 创建)
├── specs/changes/archive/       已交付变更归档(检索现状时排除)
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
- `docs/specs/index.md` 域索引(E); `docs/specs/<area>.md` 域现状(E,按需); `docs/specs/changes/` 变更(B); **勿读 archive 当现状**
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
- Delivery receipt:填入 `docs/specs/changes/<NNN>-<slug>/tasks.md` 末尾兼容命名的 `## Proof Bundle` 节;走 PR 时原样复制到 PR 描述

## 项目工程坑

[`docs/gotchas.md`](docs/gotchas.md) 只记录本项目已经验证过、可能复发的工程陷阱。新项目可以为空;遇到真实故障后再沉淀,不要复制与当前技术栈无关的经验。

## 代码修改原则(KISS + 最小合理变更)

- **优先编辑现有文件**,不主动建新文件;新文件需有清晰理由(职责无法挂入现有模块)
- **不主动写文档**(`.md` / README / NOTES),除非用户明确要求;PR 描述里写"为什么"
- **保持最小 diff**:bug fix 不顺便重构,新 feature 不顺便清旧代码;cleanup 单独 PR
- **行为变更下限**:改变 `docs/specs/<area>.md` 已声明的用户可见行为或持久规则(默认值 / 校验 / 状态流转)时,无论 diff 多小**至少走轻车道**(`/feature-init`)—— domain doc 只经 `feature-done` → `feature-archive` 更新,绕过即腐化;未声明的局部小改可直接做
- **不为不存在的场景加防御**:框架已保证的不重复校验,内部代码间互信,只在边界(用户输入 / 外部 API)做校验
- **删除即删除**:别留 `// removed in PR #123` 注释、别留未用的 `_unused` 重命名、别加"以防未来要用"的 stub

## 灾难性不变量 / 高爆破半径路径(可选)

> 列出"破一次 = 大面积作废 / 难回滚"的路径(glob)。`feature-init` 轻车道分类 + `feature-done` delivery-receipt step 反核读本节:**触达这些路径的 feature 一律走全道**(spec-driven.md §3.2.5)。无此类不变量的项目可删本节(轻车道第 3 问退回人工保守判)。

- (例)`**/embedding*` / `**/vector*` —— 向量 / 嵌入:破一次全量向量作废、跨源检索失效
- (例)`**/migrations/**` / `**/alembic/**` —— 数据迁移:不可逆
- (按项目实际填)

## Boundaries

- ✅ **Always**(允许且无需确认):
  - 加测试
  - 在已确认范围内修改模块内部实现
  - 运行项目已声明的检查命令

- ⚠️ **Ask first**(高影响,需要确认):
  - 改 API 契约
  - 加依赖
  - 做不可逆的数据或状态迁移
  - 改认证、授权或安全边界
  - 触发仓库外部写操作

- 🚫 **Never**:
  - 提交 `.env*` / secret
  - 跳过测试
  - 在未获授权时执行破坏性操作或扩大任务范围

---

<!-- `.claude/rules/**/*.md` 由 Claude Code 自动递归发现。
     有 `paths:` YAML 列表的规则按路径加载；无 `paths:` 的规则全局加载。
     不要在 AGENTS.md / CLAUDE.md 中重复 @import 这些规则。 -->
