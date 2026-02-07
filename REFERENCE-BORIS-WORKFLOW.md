# Claude Code 创始人 Boris Cherny 的工作流

> **来源**: Boris Cherny 于 2026 年 1 月公开分享的个人工作流。
> 他在 30 天内提交了 259 个 PR、497 次 commit、40k 行新增、38k 行删除。

---

## 1. 核心理念

> "Most people ask: 'How do I get better outputs from AI?' I ask: 'How do I build a system where AI reliably produces what I need?'"

不是追求单次更好的输出，而是构建一个**系统**，让 AI 稳定地产出你需要的东西。

---

## 2. Plan 模式：一切的起点

几乎所有非平凡任务都从 Plan 模式开始（`Shift+Tab` 两次进入）。

**流程**：
1. 进入 Plan 模式
2. 和 Claude 反复讨论计划，直到满意
3. 切换到 auto-accept 模式
4. Claude 通常可以一次完成实现

> "If my goal is to write a Pull Request, I will use Plan mode, and go back and forth with Claude until I like its plan. From there, I switch into auto-accept edits mode and Claude can usually 1-shot it."

> "A good plan is really important!"

**出错时的原则**：

> "Plan Mode discipline: when something goes sideways, **re-plan**. Don't keep pushing."

团队中有人的做法：让 Claude 写完计划后，开第二个 Claude 以 "Staff Engineer" 身份审查该计划。

---

## 3. 并行会话

这是 Boris 认为的**最大生产力提升点**。

### 会话布局

| 位置 | 数量 | 用途 |
|:---|:---|:---|
| 本地终端 | 5 个 | 标签编号 1-5，用系统通知提醒需要输入 |
| claude.ai/code 网页 | 5-10 个 | 与本地并行，可用 `--teleport` 互传 |
| 手机 (Claude iOS) | 若干 | 每天早上启动几个，稍后检查 |

约 10-20% 的会话因意外情况被放弃，这是正常的。

### 隔离策略

每个本地会话使用**独立的 git checkout**，避免文件冲突。

团队更倾向于使用 **git worktree**：
- 同时开 3-5 个 worktree，每个跑独立的 Claude 会话
- 用 shell alias 命名（`za`, `zb`, `zc`），一键跳转
- 有人专门留一个"分析"worktree，只读日志和跑查询

> 机制不重要，重要的是模式：**独立工作目录 = 独立 Claude 上下文**。

### Agent Teams（2026.02.05 新功能）

Anthropic 在 Opus 4.6 发布同期推出了 **Agent Teams**（研究预览），是 worktree 手动并行的官方升级方案：

- 一个 **lead session** 协调工作、分配任务、汇总结果
- 多个 **teammate** 在独立上下文窗口中并行工作，可直接互相通信
- 与 subagent 的区别：subagent 只能向主 agent 汇报；teammate 之间可以共享发现、互相挑战、自主协调
- 共享 task list，支持 Shift+Up/Down 或 tmux 直接接管任何 teammate

启用方式：设置环境变量 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

最适合的场景：
- 研究与审查（多个 teammate 同时调查不同方面）
- 新模块开发（每个 teammate 负责不同文件集）
- 竞争性调试（多个假设并行验证）

> **注意**：仍为实验阶段，已知限制包括不支持会话恢复、不支持嵌套 team。两个 teammate 编辑同一文件会导致覆盖，需要提前规划文件分工。

---

## 4. CLAUDE.md 的使用方式

### 团队共享

- 整个团队共用**一份** CLAUDE.md，提交到 git
- 全员每周多次贡献内容
- 当前大小约 **2.5k tokens**（非常精简）

### 内容策略

- 每次看到 Claude 做错事 → 加到 CLAUDE.md
- 定期裁剪，直到错误率可测量地下降
- 用 `@.claude` 标注同事 PR 中的经验教训，统一汇入 CLAUDE.md

### 跨项目共享

使用软链接的 `thoughts` 目录，在多个仓库间共享文档，让团队和组织都能访问 Claude 正在编辑和构建的文档。

---

## 5. Slash Commands 与 Subagents

### Slash Commands

每天高频的操作都做成 slash command：
- 存放路径：`.claude/commands/`
- 提交到 git，团队共享
- `/commit-push-pr` 每天使用数十次

### Subagents（子 Agent）

部署专用 Agent 处理特定阶段：
- **code-simplifier**: 主要工作完成后清理架构
- **verify-app**: 发布前运行端到端测试

---

## 6. 验证：最重要的实践

> "The most important thing to get great results out of Claude Code: give Claude a way to verify its work. If Claude has that feedback loop, it will 2-3x the quality of the final result."

具体做法：
- Claude 使用 Chrome 扩展测试每个变更
- 打开浏览器 → 测试 UI → 迭代直到功能正常、体验良好
- 任何变更都必须经过验证才算完成

**"Prove it"是 Definition of Done 的一部分。**

---

## 7. 模型选择

使用 **Opus + thinking** 做所有事情（Boris 分享时为 Opus 4.5，2026.02.05 已发布 Opus 4.6）。

> 虽然比 Sonnet 更大更慢，但需要的引导更少、工具调用更准确，最终反而更快。
> Opus 4.6 新增 1M token 上下文窗口（beta）和 Agent Teams 支持。

---

## 8. 权限与格式化

### 权限管理

不使用 `--dangerously-skip-permissions`。

替代方案：
- 用 `/permissions` 预先允许安全的 bash 命令
- 配置存在 `.claude/settings.json`，提交到 git 团队共享

### 代码格式化

使用 **PostToolUse hook** 自动格式化：
- 每次编辑文件后自动运行 Prettier
- 防止格式不一致导致 CI 失败

---

## 9. 工作流总结

```
┌─────────────────────────────────────────────────────┐
│  1. Plan 模式：反复讨论直到计划满意                     │
│       ↓                                             │
│  2. Auto-accept 模式：Claude 一次完成实现              │
│       ↓                                             │
│  3. 验证：自动化测试确认功能正确                        │
│       ↓                                             │
│  4. /commit-push-pr：提交并创建 PR                    │
│       ↓                                             │
│  5. 更新 CLAUDE.md：记录新发现的问题（如有）             │
└─────────────────────────────────────────────────────┘

× 5-15 个并行会话同时进行
```

---

## 参考链接

- [Inside the Development Workflow of Claude Code's Creator - InfoQ](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)
- [Boris Cherny Claude Code Creator 22 Tips - Medium](https://medium.com/@joe.njenga/boris-cherny-claude-code-creator-shares-these-22-tips-youre-probably-using-it-wrong-1b570aedefbe)
- [10 Tips from Inside the Claude Code Team - Paddo.dev](https://paddo.dev/blog/claude-code-team-tips/)
- [How Boris Cherny Uses Claude Code - Substack](https://karozieminski.substack.com/p/boris-cherny-claude-code-workflow)
- [The Claude Code Team Revealed Their Setup - Dev Genius](https://blog.devgenius.io/the-claude-code-team-just-revealed-their-setup-pay-attention-4e5d90208813)
