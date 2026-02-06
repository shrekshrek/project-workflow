# everything-claude-code (ECC) 推荐工作流

> **来源**: [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)
> 由 Anthropic 黑客马拉松获奖者维护，经 10+ 个月日常使用打磨的实战配置集。
> 本文档基于仓库源码 + 本地安装文件（`~/.claude/rules/`、`~/.claude/agents/`）整理。

---

## 1. 核心工作流：Plan → TDD → Review → Commit

ECC 在 `~/.claude/rules/git-workflow.md` 中定义了标准的功能实现流程：

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   /plan      │ →   │   /tdd       │ →   │ /code-review │ →   │   /commit    │
│  规划实施步骤 │     │ 红-绿-重构    │     │  质量审查     │     │  提交代码    │
│  (不写代码)   │     │ (先测试后实现) │     │ (写完立即查)  │     │ (规范消息)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### 第 1 步：Plan First（`/plan`）

调用 **planner** agent，生成实施计划：

```
/plan "实现用户订单管理模块"
```

Planner 会：
- 重述需求，确认理解一致
- 识别依赖和风险
- 拆解为多个阶段的实施步骤
- **不写任何代码**，等待你确认计划

> 规则原文：Use **planner** agent to create implementation plan. Identify dependencies and risks. Break down into phases.

### 第 2 步：TDD Approach（`/tdd`）

调用 **tdd-guide** agent，进入测试驱动开发：

```
/tdd "订单创建 API"
```

强制执行的 TDD 流程（定义在 `~/.claude/rules/testing.md`）：

| 步骤 | 动作 | 验证 |
|:---|:---|:---|
| RED | 先写测试 | 运行测试 → 应该**失败** |
| GREEN | 写最少的实现代码 | 运行测试 → 应该**通过** |
| IMPROVE | 重构代码 | 运行测试 → 仍然通过 |
| COVERAGE | 检查覆盖率 | 必须 **80%+** |

测试类型要求（全部必须）：
1. **Unit Tests** — 函数、工具、组件
2. **Integration Tests** — API 端点、数据库操作
3. **E2E Tests** — 关键用户流程（Playwright）

> 测试失败时的原则：**修实现，不改测试**（除非测试本身有误）。

### 第 3 步：Code Review（`/code-review`）

调用 **code-reviewer** agent，执行质量审查：

```
/code-review
```

审查优先级：
1. **CRITICAL** — 必须修复（安全漏洞、硬编码密钥）
2. **HIGH** — 必须修复（逻辑错误、缺失错误处理）
3. **MEDIUM** — 尽可能修复（代码风格、命名规范）

> 规则原文：Use **code-reviewer** agent **immediately** after writing code.

### 第 4 步：Commit & Push（`/commit`）

```
/commit
```

自动分析变更，生成符合 conventional commits 格式的提交信息：

```
<type>: <description>

<optional body>
```

类型：`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

---

## 2. Agent 体系

### 2.1 命令触发的 Agent（10 个）

通过斜杠命令显式调用：

| 命令 | Agent | 职责 |
|:---|:---|:---|
| `/plan` | Planner | 拆解任务、评估风险、生成实施计划 |
| `/tdd` | TDD Guide | 引导红-绿-重构开发流程 |
| `/code-review` | Code Reviewer | 代码质量、安全、可维护性检查 |
| `/refactor-clean` | Refactor Cleaner | 分析死代码、安全删除 |
| `/build-fix` | Build Error Resolver | 构建失败、TypeScript 类型错误的最小化修复 |
| `/e2e` | E2E Runner | Playwright 测试生成、运行、截图 |
| `/update-docs` | Doc Updater | 更新代码地图、README |
| `/go-build` | Go Build Resolver | Go 构建错误、go vet 修复 |
| `/go-review` | Go Reviewer | Go 代码审查 |
| `/python-review` | Python Reviewer | Python 代码审查 |

### 2.2 自动触发的 Agent（3 个）

AI 检测到相关上下文时主动介入，不需要用户调用：

| Agent | 触发条件 | 职责 |
|:---|:---|:---|
| Architect | 涉及架构决策时 | 系统设计、技术选型 |
| Security Reviewer | 代码涉及认证、用户输入、API、敏感数据时 | OWASP Top 10 检测 |
| Database Reviewer | 编写 SQL、设计 Schema 时 | 查询优化、索引设计 |

### 2.3 主动使用规则

定义在 `~/.claude/rules/agents.md`，以下场景**不需要用户提示**就应启用：

| 检测到的情况 | 应启用的 Agent |
|:---|:---|
| 复杂功能请求 | planner |
| 刚写完/改完代码 | code-reviewer |
| Bug 修复或新功能 | tdd-guide |
| 架构决策 | architect |

### 2.4 并行执行原则

独立操作**必须并行**，不能串行：

```
正确: 同时启动 3 个 Agent
  Agent 1: 安全分析 auth.ts
  Agent 2: 性能审查 cache 系统
  Agent 3: 类型检查 utils.ts

错误: 先 Agent 1，再 Agent 2，再 Agent 3
```

### 2.5 多视角分析

复杂问题使用多角色 sub-agent 分析：
- Factual reviewer（事实审查）
- Senior engineer（资深工程师视角）
- Security expert（安全专家视角）
- Consistency reviewer（一致性审查）
- Redundancy checker（冗余检查）

---

## 3. Rules 体系

ECC 通过 `~/.claude/rules/` 下的规则文件定义 AI 行为规范：

| 规则文件 | 内容 |
|:---|:---|
| `git-workflow.md` | 核心工作流：Plan → TDD → Review → Commit |
| `testing.md` | TDD 强制流程、80% 覆盖率、三种测试类型 |
| `agents.md` | Agent 清单、主动触发规则、并行执行要求 |
| `coding-style.md` | 不可变性、小文件、错误处理、输入校验 |
| `security.md` | 安全检查清单、密钥管理、安全响应协议 |
| `performance.md` | 模型选择策略、上下文窗口管理 |
| `patterns.md` | API 响应格式、自定义 Hooks、Repository 模式 |
| `hooks.md` | Hook 类型、自动格式化、TypeScript 检查 |

### 关键规则摘要

**不可变性（CRITICAL）**：
```javascript
// 错误: 直接修改
user.name = name

// 正确: 创建新对象
return { ...user, name }
```

**安全检查清单（每次 commit 前）**：
- 无硬编码密钥
- 所有用户输入已校验
- SQL 注入防护（参数化查询）
- XSS 防护
- CSRF 保护
- 认证/授权验证
- 速率限制
- 错误信息不泄露敏感数据

**模型选择策略**：

| 模型 | 适用场景 |
|:---|:---|
| Haiku 4.5 | 轻量 Agent、高频调用、辅助工作 |
| Sonnet 4.5 | 主要开发工作、编排多 Agent |
| Opus 4.5 | 复杂架构决策、深度推理 |

---

## 4. Hooks 自动化

ECC 通过 Hooks 实现编辑后的自动检查：

### PreToolUse（工具执行前）
- 长时间命令（npm, cargo 等）提醒使用 tmux
- git push 前打开编辑器审查
- 阻止创建不必要的 .md/.txt 文件

### PostToolUse（工具执行后）
- 编辑 JS/TS 文件后自动运行 Prettier
- 编辑 .ts/.tsx 后自动运行 TypeScript 类型检查
- 编辑文件后检查是否有 console.log 残留
- 创建 PR 后记录 URL 和 GitHub Actions 状态

### Stop（会话结束时）
- 审计所有修改文件中的 console.log

---

## 5. Skills 体系

Skills 是可复用的工作流定义和领域知识，位于 `~/.claude/skills/`：

### 核心 Skills

| Skill | 内容 |
|:---|:---|
| coding-standards | 通用编码标准（TypeScript、React、Node.js） |
| backend-patterns | API 设计、数据库优化、缓存模式 |
| frontend-patterns | React、Next.js、状态管理、性能优化 |
| tdd-workflow | TDD 完整流程定义（接口 → 测试 → 实现 → 重构 → 覆盖率） |
| security-review | 安全审查清单 |

### 语言/框架专用 Skills

Python、Go、Django、Spring Boot、Postgres 等各有专用 skill，包含对应语言的惯用模式和最佳实践。

### 持续学习 Skills

| Skill | 作用 |
|:---|:---|
| continuous-learning | 从会话中自动提取可复用模式 |
| continuous-learning-v2 | 基于 Instinct 的学习系统，观察会话、创建原子经验、自动演化 |
| strategic-compact | 在逻辑间断点建议手动压缩上下文，避免自动压缩丢失关键信息 |

---

## 6. 完整工作流示例

### 场景：实现一个新的用户认证模块

```
第 1 步: 规划
─────────────
/plan "实现 JWT 用户认证，包括注册、登录、Token 刷新、密码重置"

  → Planner agent 输出：
    - Phase 1: 数据库 Schema（users 表、refresh_tokens 表）
    - Phase 2: 注册 API
    - Phase 3: 登录 API + JWT 签发
    - Phase 4: Token 刷新机制
    - Phase 5: 密码重置流程

  → 你确认计划

第 2 步: 按阶段 TDD 开发
─────────────────────────
/tdd "用户注册 API"
  → 写注册测试（RED）→ 实现注册（GREEN）→ 重构（IMPROVE）

/tdd "用户登录 API + JWT"
  → 写登录测试（RED）→ 实现登录（GREEN）→ 重构（IMPROVE）

/tdd "Token 刷新"
  → ...

/tdd "密码重置"
  → ...

  （每轮 TDD 后，code-reviewer 自动触发检查）
  （涉及认证代码时，security-reviewer 自动触发检查）
  （涉及数据库时，database-reviewer 自动触发检查）

第 3 步: 最终审查
─────────────────
/code-review        ← 全模块审查

第 4 步: 提交
─────────────
/commit             ← 自动生成 commit message

构建失败时:
──────────
/fix                ← 自动诊断修复
```

---

## 7. 注意事项

### 上下文窗口管理

> **Critical: 不要同时启用所有 MCP。** 200k 的上下文窗口启用过多工具后可能缩减到 70k。
> 在项目配置中用 `disabledMcpServers` 禁用不需要的 MCP。

### ECC 未覆盖的领域

ECC 主要关注**单会话内的开发流程**，以下方面需要结合其他方案补充：

| 领域 | ECC 现状 | 补充方案 |
|:---|:---|:---|
| 跨会话持续性 | 未明确规定 | CLAUDE.md + claude-progress.txt（Anthropic 方案） |
| 多会话并行 | Agent 级并行（同一会话内） | git worktree + 多终端（Boris 方案） |
| 会话开始/结束仪式 | 未定义 | 自定义 SOP |
| 项目级进度跟踪 | 未定义 | CLAUDE.md + feature_list.json |

---

## 参考链接

- [everything-claude-code - GitHub](https://github.com/affaan-m/everything-claude-code)
- [ECC README.md](https://github.com/affaan-m/everything-claude-code/blob/main/README.md)
- [ECC git-workflow.md](https://github.com/affaan-m/everything-claude-code/blob/main/rules/git-workflow.md)
- [ECC agents.md](https://github.com/affaan-m/everything-claude-code/blob/main/rules/agents.md)
- [ECC testing.md](https://github.com/affaan-m/everything-claude-code/blob/main/rules/testing.md)
- [ECC planner command](https://github.com/affaan-m/everything-claude-code/blob/main/commands/plan.md)
- [ECC tdd-guide agent](https://github.com/affaan-m/everything-claude-code/blob/main/agents/tdd-guide.md)
- [ECC code-reviewer agent](https://github.com/affaan-m/everything-claude-code/blob/main/agents/code-reviewer.md)
- [ECC tdd-workflow skill](https://github.com/affaan-m/everything-claude-code/blob/main/skills/tdd-workflow/SKILL.md)
