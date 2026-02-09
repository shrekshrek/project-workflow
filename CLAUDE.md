# project-workflow

## 项目简介
Claude Code 插件，提供按模块推进的项目工作流管理。三个命令覆盖项目生命周期：`/project-plan` → `/module-plan` → `/module-done`。

## 插件结构

| 目录/文件 | 性质 | 内容 |
|:---|:---|:---|
| `.claude-plugin/plugin.json` | 插件清单 | 名称、版本、组件声明 |
| `commands/` | 命令 | `/project-plan`、`/module-plan`、`/module-done` |
| `agents/` | 专项 Agent | system-architect、tech-researcher、codebase-explorer |
| `rules/` | 规则 | 状态生命周期、文件职责约定（自动加载） |
| `README.md` | 用户文档 | 安装指南、技能矩阵、工作流速查 |
| `WORKFLOW.md` | 方法论详解 | 项目生命周期、模块开发流程、会话管理 |

## 编辑约定

### 写作规范
- 语言：中文为主，技术术语保留英文（如 CLAUDE.md、Plan Mode、/commit）
- 交叉引用使用"见 X.Y 节"格式，确保 section 编号准确
- Mermaid 流程图不在 subgraph 内使用 `direction TB`（GitHub 渲染兼容）
- 表格使用左对齐 `:---`

### 状态生命周期（三值约束）
```
未开始 → 方案已确认 → 已完成
```
所有涉及状态的文件（commands、rules、WORKFLOW.md、README.md）必须保持一致。

### CLAUDE.md 策略（本插件核心观点）
- CLAUDE.md = 静态配置（技术选型、编码约定、常见错误），< 300 行
- PROGRESS.md = 动态进度（模块状态、下次入口），每次会话更新
- docs/architecture.md = 全局设计详情
- docs/plan.md = 当前模块的实施方案（临时，每模块覆盖更新）

## 注意事项
- 修改 WORKFLOW.md 后须检查内部一致性（flowchart、表格、正文、交叉引用）
- 修改 commands/ 后须检查 WORKFLOW.md 和 README.md 中的对应描述
- plugin.json 中 agents 必须使用显式文件路径（不能用目录），修改后跑 `claude plugin validate`
- 所有 flowchart 修改后应在 GitHub 上验证 Mermaid 渲染
