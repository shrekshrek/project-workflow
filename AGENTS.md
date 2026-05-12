# AGENTS.md

> Project-level instructions for any AI coding agent (Claude Code, Codex, OpenCode, Cursor).
> Claude Code reads `CLAUDE.md` which is `@AGENTS.md`.

## 仓库性质

**project-workflow v2** —— spec-driven feature development blueprint + Claude Code plugin。

四件套:
1. `docs/` —— 方法论文档(5 阶段、4 支柱、spec 三件套、10 工程陷阱)
2. `template/` —— 纯方法论 starter(语言中立)
3. `examples/full-stack-vue-fastapi/` —— Vue 3 + FastAPI 工程参考实现
4. `.claude-plugin/` + `skills/` —— Claude Code 插件资产

**v1 → v2**:完全重写。v1 是 5 个 process-owning slash command,v2 是文档主导 + 可选辅助命令。v1 保留在 git tag `v1.1.0`。

## 文档索引

```
README.md              v2 总览 + 安装 + skill 清单
.claude-plugin/        plugin 资产
├── plugin.json        manifest
└── marketplace.json   marketplace 注册
skills/                Claude Code skills
└── spec-init/         /project-workflow:spec-init
docs/                  方法论文档
├── workflow.md        ⭐ 5 阶段 + 4 支柱(核心)
├── gotchas.md         ⭐ 10 工程陷阱
├── spec-driven.md     spec/plan/tasks 详解
├── dev-deploy.md      本地开发 + 同步部署
├── tooling.md         工具链对比
├── backlog.md         待办
└── proposals/         详细提案
template/              方法论 starter
examples/
└── full-stack-vue-fastapi/   Vue 3 + Element + FastAPI 参考实现
```

## 修改纪律

- **方法论 vs 工程化分层**:`docs/` + `template/` 是方法论(语言中立);`examples/` 是工程化(栈具体)
- **不在方法论里塞栈细节**(workflow.md / gotchas.md 通用,具体命令在 examples/ 里展示)
- **不在工程化里写方法论**(examples/ AGENTS.md 是栈约定,不是方法论本身)
- **plugin skill 简洁**:每个 SKILL.md < 200 行,职责单一
- **skill description 写好**:Claude 据此判断何时自动调用

## v1 弃用说明

v1 commands(`/project-plan` / `/module-plan` / `/module-dev` / `/module-done` / `/plan-review`)**不再支持**。若用户问起,指向 git tag `v1.1.0`。

## Boundaries

- ✅ Always:加 skill / 改文档 / 加 example
- ⚠️ Ask first:改 workflow.md §0 / §2 / §6 (核心方法论结构);改 plugin.json `name` 字段;改目录大结构
- 🚫 Never:把 v1 commands 加回来;committing secrets
