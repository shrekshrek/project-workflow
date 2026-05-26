# 工具链对比与使用经验

> [README 议题 5](../README.md#5-工具链对比与使用经验) 的展开。聚焦 **AI 辅助编码**(Concern A)的工具栈,不涉及构建 LLM 产品的工具(LangChain / DSPy / agent 框架等 —— Concern B)。
>
> **强意见,不假装中立**:本文档反映本项目的实际取舍,不是综述。

---

## 0. 这本文档不是什么

- **不是穷举评测**:只评本项目用过或认真评估过的工具
- **不是教程**:不教怎么装,假设你能查官方文档
- **不是市场分析**:不预测哪个会赢,只看哪个**对当前工作流有用**

---

## 1. 三层工具栈

```
┌─ 上层:协作约定 ───────────────── workflow.md / CLAUDE.md / specs/
│   你和 AI 之间的"契约",项目内自定义
│
├─ 中层:Skill / Plugin 框架 ────── Matt Pocock / Superpowers / ECC / Spec Kit / 原生
│   在 AI 编码助手之上的能力扩展(slash command / agent / hook)
│
└─ 底层:IDE / CLI ────────────── Claude Code / Cursor / Codex
    跟 AI 对话的入口,提供文件读写、bash、LSP 集成等基础能力
```

**关键洞察**:**底层和中层都不是你的核心资产,上层才是**。底层换工具(Claude Code → Cursor)、中层换框架(ECC → Matt)都是 weeks-级别迁移;上层(你写的 spec、CLAUDE.md、规则)是 months-级别投入。

逻辑推论:**底层和中层选择应该最优先服务上层**,反过来就本末倒置。

---

## 2. 底层:IDE / CLI 层

### 2.1 横向对比

| 维度 | Claude Code | Cursor | Codex(OpenAI CLI) |
|---|---|---|---|
| 形态 | CLI + IDE 扩展(VS Code / JetBrains) | 独立 IDE(VS Code fork) | 纯 CLI |
| 模型 | Claude(Anthropic) | 多模型(GPT/Claude/Gemini) | GPT |
| 主交互 | 对话式 + 工具调用 | 编辑器内 inline + chat | 对话式 |
| Hook 系统 | ✅ 完整(PreToolUse/PostToolUse/Stop) | ❌ 无原生 hook | ⚠️ 有限 |
| Plugin 生态 | ✅ 增长快(2026 年大量第三方) | ⚠️ 主要靠 IDE 扩展 | ⚠️ 较少 |
| Worktree 隔离 | ✅ 原生支持 | ❌ 需手动 | ⚠️ 可脚本 |
| Skill / Memory 持久化 | ✅ `~/.claude/skills`、`memory/` | ⚠️ 靠 .cursorrules | ⚠️ 靠 prompt |

### 2.2 选择理由

**本项目主用 Claude Code**:
- Hook 系统是 [workflow §6.3 规则由环境强制](workflow.md#63-规则由环境强制environment-enforced-rules) 的关键基础设施,Cursor / Codex 没有等价物
- Worktree 原生支持是探索性 spike / 架构变更隔离的关键(见 [workflow §9 何时偏离](workflow.md#9-何时偏离手册))
- skill / memory 文件系统让"上层资产"显式化,容易迁移

**Cursor 的优势**(本项目不主用):
- 编辑器内 inline 编辑体感更快,适合**单文件小修改**
- 多模型切换适合不同任务用不同模型
- 适合人为本(你主导,AI 辅助)风格

**何时用 Codex**(纯 CLI):
- CI 环境,无 IDE
- 简单脚本生成,不需要 hook / worktree

### 2.3 关键判定

| 问题 | 答案 |
|---|---|
| 装多个 IDE 工具会冲突吗? | 不会(它们读同一份代码) |
| 该选一个主用吗? | 是。`~/.claude/rules/`、CLAUDE.md 等约定**只跟主工具打通**,多入口会稀释投资 |
| 切换工具的成本? | 低(weeks),前提是上层资产保持工具无关 |

---

## 3. 中层:Skill / Plugin 框架

这一层 2026 年最热闹,也最容易过度投资。**不要装超过 3 个 skill 框架**,否则相互覆盖、命名冲突、心智负担。

### 3.1 主流框架横向对比

| 框架 | 哲学 | Skill 数量 | 适合谁 | 风险 |
|---|---|---|---|---|
| **Matt Pocock skills** | small composable,你拥有工具 | 17 | 实战工程师,要灵活 | 自己得有判断力 |
| **Superpowers**(Jesse Vincent) | 方法论先行,六步法 | 数十 | 团队要严格流程 | process-owning,出问题难排查 |
| **Everything Claude Code (ECC)** | kitchen-sink,什么都给 | 182 | 多语言、覆盖广 | 大部分用不到,膨胀 |
| **GitHub Spec Kit** | spec/plan/tasks 工具链 | 6 个 slash | 流程纪律强的团队 | 工具链开销大 |
| **OpenSpec** | spec delta / change lifecycle | CLI / slash | 想把每个 change 显式规格化的项目 | 主要解决 change 层,不覆盖项目规则长期治理 |
| **OpenAI Symphony** | manage work, not agents | (规范) | 高自动化场景 | 早期,实证少 |

详细对比与适用场景判断:

#### Matt Pocock skills(本项目精神最近)

- **核心**:小、独立、可 hack
- **优点**:每个 skill 几十行,你能完全读懂、改、删
- **缺点**:覆盖窄;需要你自己决定怎么用
- **本项目用法**:精挑 3-5 个(`zoom-out`、`improve-codebase-architecture` 等),作为日常思考工具

#### Superpowers(反向参考)

- **核心**:六步法(brainstorm → worktree → plan → subagent → TDD → review)
- **优点**:方法论完整、有理论根基(Jesse Vincent ex-Anthropic)
- **缺点**:**process-owning** —— 它管你怎么干活,出问题黑盒
- **本项目决定**:不装。我们的 [workflow.md](workflow.md) 是"轻量版的 Superpowers",借它的哲学,不要它的束缚
- **价值**:作为对照样本,理解"重型方法论框架长什么样"

#### Everything Claude Code (ECC)

- **核心**:大而全,182 skills + 48 agents
- **优点**:Go / Python / Java / Django / Spring Boot 等多语言专项,覆盖广
- **缺点**:大部分跟你栈无关,装着膨胀,且本身是 process-owning
- **本项目决定**:**外科手术保留** —— 仅 Go 相关 5 个 skill(`golang-patterns` / `golang-testing` / `go-build` / `go-test` / `go-review`)+ 可选 `python-testing` / `strategic-compact` / `iterative-retrieval`,其余淘汰

#### GitHub Spec Kit

- **核心**:把 spec-driven 落到 slash commands(`/speckit.specify` / `.plan` / `.tasks` / `.clarify` / 等)
- **优点**:跟 [spec-driven.md](spec-driven.md) 三文件结构原生对齐
- **缺点**:`.specify/` 目录工具链,小项目偏重
- **本项目决定**:不装工具链,**借结构和 `/speckit.clarify` 的 Q&A 概念**(已落地在 [`/spec-quality-check`](../skills/spec-quality-check/SKILL.md) + [`/agents-md-revise`](../skills/agents-md-revise/SKILL.md) 的 Q&A 形态)

#### Fission-AI OpenSpec

- **核心**:把每个 change 的意图、设计、任务显式化,避免需求只留在聊天记录里
- **优点**:轻量、偏 brownfield、原生关注 AGENTS.md,跟 v2 的 per-feature `docs/specs/<NNN>-<slug>/` 思路相近
- **缺点**:主要覆盖 change/spec lifecycle;项目启动、项目约定长期漂移、端点三层 review、proof bundle 这几块不是它的主战场
- **本项目决定**:借鉴 spec delta / change lifecycle 思想,但不复制 CLI 或目录结构。project-workflow 的边界更宽:从 P0 项目基线到 P2 feature spec,再到 P3 交付验证和 P4 规则刷新

#### OpenAI Symphony

- **核心**:managed work item / handoff state / isolated autonomous runs
- **优点**:"manage work, not agents" 哲学影响深远(本项目 [workflow §3.3 proof bundle](workflow.md#33-交付阶段proof-bundle) 受其工作交接思想启发)
- **缺点**:目前是 spec 而非可装即用工具,实证少
- **本项目决定**:借哲学(end-of-task gate / handoff artifacts),不装工具

### 3.2 决策原则

> **Matt-派核心警告**:不要在没有真实痛点反馈前抽象成框架。先在对话/手动流程里跑顺,再固化。

加入新 skill 框架前问自己:

```
1. 现有工具能解决吗?(可能只是没用对)
2. 我能完整读懂这个框架吗?能则可考虑
3. 它是否 process-owning?是则要警惕
4. 与我已装的有冲突吗?(同名 skill / hook 互覆盖)
5. 没有它我会怎么做?如果手动 5 分钟搞定,可能不需要框架化
```

---

## 4. Anthropic 原生 plugin

这一层 Anthropic 直接维护,质量稳定,本项目主要依赖:

| 插件 | 作用 | 本项目用法 |
|---|---|---|
| `context7` | 拉取库文档(MCP) | 任何外部库版本相关问题先问它 |
| `pr-review-toolkit` | 5+ 种 reviewer agent(code / type / silent-failure / 等) | proof bundle 阶段必跑 |
| `commit-commands` | `/commit`、`/commit-push-pr` 等 | 标准化 git 流程 |
| `rust-analyzer-lsp` | Rust LSP 集成 | Rust 项目实时类型检查 |
| `/init`(原生) | 扫描代码库生成初始 CLAUDE.md | 新项目第一步;后续维护用 [`/project-workflow:agents-md-revise`](../skills/agents-md-revise/SKILL.md) |
| `/security-review`(原生) | 安全审查 | 涉及认证/输入/密钥时跑 |
| `/review`(原生) | 通用代码审查 | 备用 |

**为什么优先原生**:
- 维护可信(Anthropic 自己升级,不会突然废弃)
- 跟模型版本协调(新模型出来 plugin 同步优化)
- 命名空间独立,不容易冲突

---

## 5. 加新工具前的决策清单

每次想装新东西,过一遍:

```
1. 它解决的痛点你最近遇到几次?
   - 0 次:不装
   - 1-2 次:可手动应对,先记录
   - 3+ 次:可考虑

2. 它属于哪一层?
   - 上层(协作约定):优先,自己写
   - 中层(skill / plugin):谨慎,看 §3.2 五条
   - 底层(IDE):非核心,稳定即可

3. 它是 process-owning 吗?
   - 是 → 跟我们 workflow.md 冲突,不装
   - 否 → 进 §3.2 评估

4. 跟你已装的冲突吗?
   - 同名 skill / hook 互覆盖 → 不装,先卸老的
   - 命名空间不同 → 可装

5. 你能在 30 分钟内读懂它的核心代码吗?
   - 不能 → 不装(Matt-派精神)
   - 能 → 可考虑

6. 它依赖具体某个 IDE / 模型吗?
   - 是 → 你的"上层资产"就被锁定了,慎重
   - 否 → 加分项
```

---

## 6. 反模式

### 6.1 叠加两个 process-owning 框架
**症状**:同时装 Superpowers + ECC,或 Superpowers + 自建 project-workflow
**后果**:skill 命名冲突 / hook 互覆盖 / 心智负担,出问题难排查
**修正**:挑一个 process-owning 工具(或自己写),其他用 Matt-派 small composable 补

### 6.2 装一堆从不调用的 skill
**症状**:`~/.claude/skills/` 下 50+ skill,实际每月用到不超过 5 个
**后果**:skill list 过长,Claude 启动加载慢、context 浪费、找不着该用哪个
**修正**:每月一次审查,3 个月没用的归档

### 6.3 把上层投资沉在底层工具
**症状**:把项目规则写进 Cursor 的 `.cursorrules`,而不是项目根 `CLAUDE.md`
**后果**:换工具就丢,失去工具无关性
**修正**:**协作约定写在工具无关位置**(`CLAUDE.md` / `docs/`),工具特定位置只放工具特异配置

### 6.4 给框架开 admin 权限
**症状**:把 process-owning 框架的所有 hook 都启用,所有命令都允许
**后果**:框架"接管"了你的工作流,出 bug 你根本不知道是它做的
**修正**:opt-in 启用,只开你真懂的部分

### 6.5 只看 stars 不看适用性
**症状**:看到 Superpowers 18 万 stars 就装
**后果**:18 万人不是你,他们的痛点不一定是你的
**修正**:看哲学是否对,看 §3.2 五条是否过

---

## 7. 参考与延伸

- 各框架官网 / README 链接见 [`workflow.md §参考与延伸`](workflow.md#参考与延伸),本文档的"对比"基于那些 README + 本项目实际跑过的经验
- Matt Pocock 哲学的展开:[`docs/spec-driven.md`](spec-driven.md) 用同样的"小、可读、可拥有"精神
- 工具链方法论(怎么投资上层、怎么对待中层):[`workflow.md §6 方法论支柱`](workflow.md#6-方法论支柱4-条) 4 条原则
