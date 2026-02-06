# Anthropic 官方长周期 Agent 方案

> **来源**: Anthropic Engineering Blog —
> [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

---

## 1. 要解决的问题

当 AI Agent 执行需要数小时甚至数天的复杂任务时，核心挑战是：

> **每个新会话开始时没有之前的记忆。**

Agent 必须在离散的会话中工作，每个会话有独立的上下文窗口。如何让 Agent 在多个上下文窗口之间持续推进，是一个开放性问题。

---

## 2. 双 Agent 架构

Anthropic 开发了一个两阶段方案：

```
首次运行                     后续每次运行
┌──────────────────┐        ┌──────────────────────────────────┐
│  Initializer     │        │  Coding Agent                    │
│  Agent           │        │                                  │
│                  │        │  1. 读取 claude-progress.txt     │
│  创建:           │   →    │  2. 读取 git history             │
│  - init.sh       │        │  3. 读取 feature_list.json       │
│  - progress.txt  │        │  4. 重建上下文                    │
│  - feature_list  │        │  5. 实现下一个功能                │
│  - 初始 commit   │        │  6. 更新进度文件                  │
│                  │        │  7. 提交 commit                  │
└──────────────────┘        └──────────────────────────────────┘
```

两个 Agent 本质上使用**相同的系统提示、工具集和 Agent 框架**，区别仅在于初始的用户提示不同。

---

## 3. 关键文件

### claude-progress.txt — Agent 的工作日志

Agent 的跨会话记忆核心。每次会话结束时更新，记录：
- 本次完成了什么
- 下次应该从哪里继续
- 遇到了什么问题

作用：让下一个会话的 Agent 能**快速重建上下文**，而不需要从头分析整个项目。

```
示例内容:
---
Session 3 (2026-02-06):
- Completed: User authentication module (login, register, JWT)
- Status: All auth tests passing
- Next: Start order management CRUD API
- Notes: Database connection pooling configured, max 20 connections
---
```

### feature_list.json — 结构化功能清单

列出所有需要实现的功能，每个标记为 passing 或 failing：

```json
{
  "features": [
    { "name": "user-registration", "status": "passing", "tests": 5 },
    { "name": "user-login", "status": "passing", "tests": 3 },
    { "name": "order-create", "status": "failing", "tests": 0 },
    { "name": "order-list", "status": "failing", "tests": 0 },
    { "name": "payment-stripe", "status": "failing", "tests": 0 }
  ]
}
```

作用：Agent 能明确知道哪些已完成、哪些待实现，不会重复工作或遗漏。

### init.sh — 环境初始化脚本

首次运行时创建，包含项目的环境搭建命令。后续会话可以用它快速恢复开发环境。

### git history — 隐式的持久化记忆

Git 提交历史是进度文件的补充。Agent 可以通过 `git log` 了解已完成的工作。

---

## 4. Coding Agent 的工作约束

为了避免失败模式，Coding Agent 受到以下约束：

| 约束 | 原因 |
|:---|:---|
| **每次会话只做一个功能** | 防止 one-shotting（试图一次完成所有事） |
| **必须运行开发服务器** | 确保代码实际可运行 |
| **必须执行端到端验证** | 通过 Puppeteer MCP 等工具验证 Web UI |
| **必须更新 claude-progress.txt** | 为下一个会话留下交接信息 |
| **必须提交 git commit** | 持久化代码变更 |

---

## 5. 失败模式与对策

### 失败模式 1: One-shotting（一次做太多）

**症状**: Agent 试图在单次会话中完成整个项目，导致上下文耗尽，留下半成品代码。下一个会话不知道前一个做到哪了，花大量时间修复。

**对策**: 限制每次只做一个功能。在提示中明确指出这一点。

### 失败模式 2: Premature Completion（过早宣布完成）

**症状**: 后续 Agent 看到已有一些功能在运行，就宣布工作完成，而实际上还有很多功能未实现。

**对策**: 使用 `feature_list.json` 明确列出所有功能及其状态。Agent 必须检查是否还有 failing 的功能。

### 失败模式 3: Context Exhaustion（上下文耗尽）

**症状**: 在大型项目中后期，Agent 因为要读取太多文件而耗尽上下文窗口。

**对策**: `claude-progress.txt` 提供高密度的摘要信息，让 Agent 无需重新阅读所有代码文件就能了解项目状态。

---

## 6. 核心洞察

> "The key insight was finding a way for agents to quickly understand the state of work when starting with a fresh context window."

> "External artifacts become the agent's memory. Progress files, git history, and structured feature lists persist across sessions. Each agent session reconstructs context from these artifacts before doing any work."

> "Inspiration for these practices came from knowing what effective software engineers do every day."

三句话总结：
1. **外部文件就是 Agent 的记忆** — 进度文件、git 历史、功能清单跨会话持久化
2. **每个新会话先重建上下文再开始工作** — 先读后写
3. **这些实践本质上就是优秀工程师每天在做的事** — 写工作日志、更新任务板、提交代码

---

## 7. 与 CLAUDE.md 方案的对比

| 维度 | CLAUDE.md 方案 | 长周期 Agent 方案 |
|:---|:---|:---|
| **记忆载体** | 单一文件 CLAUDE.md | 多文件：progress.txt + feature_list.json + git |
| **更新频率** | 手动，会话结束时 | 自动，每次会话结束时 Agent 自行更新 |
| **粒度** | 项目级概览 | 功能级追踪（每个 feature 的 pass/fail） |
| **适用场景** | 人驱动的开发，会话间有人工判断 | 自动化 Agent 连续运行，最小人工干预 |
| **复杂度** | 低，容易上手 | 较高，需要设计提示和文件结构 |

**两种方案可以结合使用**：
- `CLAUDE.md` 保存高层架构、技术选型、约束条件（不变的信息）
- `claude-progress.txt` 保存动态进度（频繁变化的信息）
- `feature_list.json` 保存可量化的功能状态

---

## 8. 实际应用：文件结构

```
项目根目录/
├── CLAUDE.md                ← 架构、选型、约束（静态）
├── claude-progress.txt      ← 会话进度日志（动态）
├── feature_list.json        ← 功能状态追踪（动态）
├── init.sh                  ← 环境初始化脚本
├── src/
│   └── ...
└── tests/
    └── ...
```

---

## 参考链接

- [Effective Harnesses for Long-Running Agents - Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Building Agents with the Claude Agent SDK - Anthropic Engineering](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Long-Running Harness Skill - GitHub (社区实现)](https://github.com/eddiearc/long-running-harness)
- [Agent Harnesses: From DIY to Product - Paddo.dev](https://paddo.dev/blog/agent-harnesses-from-diy-to-product/)
