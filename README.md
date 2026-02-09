# project-workflow

> Claude Code 插件：按模块推进的项目工作流管理。

四个命令覆盖项目生命周期：`/project-plan` → `/module-plan` → `/module-dev` → `/module-done`。

---

## 安装

```bash
claude plugin install /path/to/project-workflow
```

安装后可用 `/project-plan`、`/module-plan`、`/module-dev`、`/module-done` 四个斜杠命令。

---

## 插件组成

| 组件 | 内容 |
|:---|:---|
| **Commands** (4) | `/project-plan`、`/module-plan`、`/module-dev`、`/module-done` |
| **Agents** (3) | system-architect、tech-researcher、codebase-explorer |
| **Rules** (1) | 状态生命周期、文件职责约定（自动加载） |

---

## 命令详解

### `/project-plan "项目描述"`

项目级规划，适用于新项目启动或重大重构。

**流程**: 需求梳理 → 技术调研 → 澄清歧义 → 架构设计 → 持久化

**产出文件**:
- `CLAUDE.md` — 项目概览、技术选型、模块列表、编码约定
- `PROGRESS.md` — 模块状态表、下次入口
- `docs/architecture.md` — 系统架构、数据模型、模块边界

**调用的 Agent**:
- **tech-researcher** — 并行调研技术方案（新项目）
- **codebase-explorer** — 并行探索现有代码（已有项目）
- **system-architect** — 并行设计架构方案

### `/module-plan "模块名"`

模块级规划，适用于开始一个具体模块的开发。

**前置条件**: 已运行 `/project-plan`，CLAUDE.md、PROGRESS.md、docs/architecture.md 存在。

**流程**: 加载项目上下文 → 探索现有代码（1-3 个 agent）→ 讨论设计方案 → 持久化

**产出文件**:
- `docs/plan.md` — 当前模块的实施方案（每模块覆盖更新）

**调用的 Agent**:
- **codebase-explorer** (1-3 个) — 按复杂度伸缩：追踪依赖接口、识别代码模式、分析相似功能

### `/module-dev "模块名"`

按 `docs/plan.md` 实施模块开发，带上下文加载和验收关卡。

**前置条件**: 已运行 `/module-plan`，docs/plan.md 存在，模块状态为"方案已确认"。

**流程**: 加载上下文 → 确认实现步骤 → 逐步实现（代码 + 关键行为测试）→ 验收关卡

**特点**:
- 自动加载 CLAUDE.md、docs/plan.md、docs/architecture.md 全量上下文
- 从 plan 中提取步骤清单，标注哪些需要测试
- 关键行为先写测试再实现，trivial 代码直接实现
- Phase 4 验收：build 检查 + 测试通过 + 对照 plan 逐项核对
- 支持跨会话续接（Resume Mode）

**不调用 Agent** — 直接使用 Claude 的编码能力。

### `/module-done "模块名"`

标记模块完成，更新进度并准备下一个模块。

**操作**:
- 更新 `PROGRESS.md` 中该模块状态为 `已完成`
- 设置下一个模块为入口
- 按需创建模块级 `CLAUDE.md`（记录该模块的约定与常见错误）

---

## 状态生命周期

模块状态严格使用三个值：

```
未开始 → 方案已确认 → 已完成
```

| 状态 | 含义 | 触发时机 |
|:---|:---|:---|
| **未开始** | 尚未规划 | `/project-plan` 创建模块列表时 |
| **方案已确认** | 方案已写入 docs/plan.md 并确认 | `/module-plan` 完成时 |
| **已完成** | 已实现、已测试、已提交 | `/module-done` 执行时 |

---

## 文件职责

| 文件 | 性质 | 内容 | 更新频率 |
|:---|:---|:---|:---|
| `CLAUDE.md` | 静态配置 | 项目概览、技术选型、模块列表、编码约定 | 极少（新增约定或常见错误时） |
| `PROGRESS.md` | 动态进度 | 模块状态表、下次入口、里程碑 | 每次会话结束 |
| `docs/architecture.md` | 持久设计 | 系统架构图、数据模型、模块边界 | 架构变更时 |
| `docs/plan.md` | 临时方案 | 当前模块的实施计划 | 每次 `/module-plan` |

**核心原则**: 静态与动态分离 — 不要在 CLAUDE.md 中放进度信息，不要在 PROGRESS.md 中放编码约定。

---

## 标准工作流 (SOP)

根据任务复杂度选择三种模式之一。模式 C 使用本插件的 `/module-dev` 完成实现，模式 A/B 可搭配 ECC 命令（如 `/code-review`、`/commit`）。

### 模式 A：直接编码

**适用**: 单文件修改、拼写修正、样式微调。

```
直接写代码 → /code-review → /commit
```

### 模式 B：轻量迭代

**适用**: Bug 修复、小功能开发、已有模块的维护。

```
/plan → /tdd → /code-review → /commit
```

### 模式 C：模块化开发

**适用**: 全新功能、复杂模块重构、涉及多文件的大任务。

```
/module-plan → /module-dev → /commit → /module-done
```

### 选择速查

| 改动规模 | 推荐模式 | 关键命令 |
|:---|:---|:---|
| 1-2 个文件，逻辑简单 | **A** 直接编码 | `/commit` |
| 3-5 个文件，已知方案 | **B** 轻量迭代 | `/plan` → `/tdd` → `/commit` |
| 5+ 个文件，需要设计 | **C** 模块化开发 | `/module-plan` → `/module-dev` → `/module-done` |

---

## 配套工具速查

本插件专注于**项目规划与进度管理**，执行阶段依赖 Claude Code 生态的已有工具：

| 阶段 | 推荐工具 | 说明 |
|:---|:---|:---|
| 规划 | `/project-plan`, `/module-plan` | 本插件提供 |
| 实现 | `/module-dev` | 本插件提供（含测试 + 验收） |
| 代码审查 | `/code-review`, `/review-pr` | ECC / PR Review Toolkit（可选） |
| 提交 | `/commit`, `/commit-push-pr` | Commit Commands 插件 |
| 构建修复 | `/fix` | ECC 内置 |
| 完成模块 | `/module-done` | 本插件提供 |

> ECC = [everything-claude-code](https://github.com/anthropic/everything-claude-code)，Claude Code 工作流引擎。

---

## 详细文档

- **[WORKFLOW.md](./WORKFLOW.md)** — 完整方法论：项目生命周期、模块开发流程、会话管理策略
