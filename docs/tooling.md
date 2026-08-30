# 工具链对比与使用经验

> [README](../README.md) 里工具链主题的展开。聚焦 **AI 辅助编码**(Concern A)的工具栈,不涉及构建 LLM 产品的工具(LangChain / DSPy / agent 框架等 —— Concern B)。
>
> **强意见,不假装中立**:本文档反映本项目的实际取舍,不是综述。
>
> **能力信息最后核对:2026-07-15**。产品能力会变化;安装与配置以各工具当前官方文档为准,本文只维护影响 project-workflow 边界的稳定差异。

---

## 0. 这本文档不是什么

- **不是穷举评测**:只评本项目用过或认真评估过的工具
- **不是教程**:不教怎么装,假设你能查官方文档
- **不是市场分析**:不预测哪个会赢,只看哪个**对当前工作流有用**

---

## 1. 三层工具栈

```
┌─ 上层:协作约定 ───────────────── workflow.md / AGENTS.md / specs/
│   你和 AI 之间的"契约",项目内自定义
│
├─ 中层:Skill / Plugin 框架 ────── Matt Pocock / Superpowers / ECC / Spec Kit / 原生
│   在 AI 编码助手之上的能力扩展(slash command / agent / hook)
│
└─ 底层:IDE / CLI / App ──────── Claude Code / Codex / Cursor
    跟 AI 对话的入口,提供文件读写、bash、LSP 集成等基础能力
```

**关键洞察**:**底层和中层都不是你的核心资产,上层才是**。底层换工具(Claude Code → Codex / Cursor)、中层换框架(ECC → Codex skills / Claude plugin)都是 weeks-级别迁移;上层(你写的 `docs/actions/`、spec、AGENTS.md、ADR、proof bundle)是 months-级别投入。

逻辑推论:**底层和中层选择应该最优先服务上层**,反过来就本末倒置。

---

## 2. 底层:IDE / CLI 层

### 2.1 横向对比

| 维度 | Claude Code | Codex | Cursor |
|---|---|---|---|
| 形态 | CLI + IDE 扩展 | CLI + IDE extension + Codex app/cloud | 独立 IDE(VS Code fork) |
| 模型 | Claude(Anthropic) | GPT(OpenAI) | 多模型(GPT/Claude/Gemini) |
| 主交互 | 对话式 + 工具调用 | 对话式 + app/CLI/IDE 多入口 | 编辑器内 inline + chat |
| Persistent guidance | `CLAUDE.md` / `AGENTS.md` alias | `AGENTS.md` discovery | `AGENTS.md` 或 `.cursor/rules/*.mdc` |
| Reusable workflow | ✅ Claude Code plugin / skills | ✅ Codex plugin + bundled skills | project rules / commands / extensions;不作为本仓库正式 adapter |
| Parallel work | ✅ 原生支持 | ✅ worktrees / subagents / cloud threads | 不纳入本仓库稳定能力假设 |

### 2.2 选择理由

**本项目正式维护 Claude Code 与 Codex 两个 adapter**:
- `adapters/claude/` 保留 Claude-native skills、named agents、manifest 与可选 rules
- `adapters/codex/` 保留 Codex-native skills、manifest 与“可调度时强制 general subagent、否则有据 main-session fallback”的执行语义,不复制 Claude runtime skill
- 两端差异只留在配置、触发、plugin-root 和 subagent dispatch;methodology core 统一由 `docs/actions/` 与 `docs/reviewers/` 定义
- 构建脚本生成两个独立安装包并发布到 `plugin-dist`;使用者只需选择自己正在使用的宿主

**Cursor 的优势**(本项目不主用):
- 编辑器内 inline 编辑体感更快,适合**单文件小修改**
- 多模型切换适合不同任务用不同模型
- 适合人为本(你主导,AI 辅助)风格

### 2.3 关键判定

| 问题 | 答案 |
|---|---|
| 装多个 IDE 工具会冲突吗? | 不会(它们读同一份代码) |
| 该选一个主 adapter 吗? | 单个项目按实际宿主选择即可;本仓库同时维护两端,但流程只在 core 定义一次 |
| Claude/Codex 能共用什么? | `AGENTS.md`, `docs/actions/`, `docs/reviewers/`, `docs/specs/`, `docs/specs/changes/`, ADR, proof bundle, L1/L2/L3 语义 |
| Claude/Codex 不能共用什么? | plugin manifest、skill 安装路径、sub-agent 配置格式 |
| 切换工具的成本? | 低到中(weeks),前提是上层资产保持工具无关 |

两端不能共用的还包括 **SKILL.md runtime body**:action 语义共用,但交互、命令名、subagent dispatch、plugin-root 解析必须 host-native。源仓库 CI 用 [`scripts/check-adapter-parity.js`](../scripts/check-adapter-parity.js) 保证 action 集合相同而不是文件内容相同。

### 2.4 Codex native adapter surface

Codex/Claude/manual 的完整 capability mapping 与不可变边界由 [`cross-tool-methodology.md §3`](cross-tool-methodology.md#3-adapter-mapping) 统一维护。本文件只保留工具选择结论:共享 methodology core,分别维护 host-native skills、manifest 和 subagent 调度,不要复制第二套 action/reviewer 定义。

---

## 3. 中层:Skill / Plugin 框架

这一层变化快,也最容易过度投资。只安装职责明确、实际会用且不与现有 workflow 冲突的少量框架。

### 3.1 主流框架横向对比

| 框架 | 哲学 | 适合谁 | 风险 | 本项目决定 |
|---|---|---|---|---|
| **Matt Pocock skills** | small composable,你拥有工具 | 实战工程师,要灵活 | 覆盖窄,自己得有判断力 | 精神最近;只按已出现的真实痛点选少量独立 skill,不绑定固定清单 |
| **Superpowers**(Jesse Vincent) | 方法论先行,六步法完整 | 团队要严格流程 | process-owning,出问题黑盒 | 不装。[workflow.md](workflow.md) 是"轻量版 Superpowers",借哲学不要束缚;留作重型框架的对照样本 |
| **Everything Claude Code (ECC)** | kitchen-sink,跨 harness 能力包 | 多语言、覆盖广 | 大部分跟你栈无关,且本身 process-owning | 不设为依赖;需要专项能力时单独评估并装最小集合 |
| **GitHub Spec Kit** | 把 spec-driven 落到 slash commands | 流程纪律强的团队 | `.specify/` 工具链对小项目偏重 | 不装;只借鉴结构化澄清,由 [`spec-quality-check`](actions/spec-quality-check.md) 和 [`agents-md-revise`](actions/agents-md-revise.md) 承接 |
| **OpenSpec** | spec delta / change lifecycle | 想显式规格化每个 change | 只覆盖 change 层,不管项目基线与规则长期治理 | 借鉴 change lifecycle,不复制 CLI 或目录结构;本项目边界从 P0 一直到 P4 |
| **OpenAI Symphony** | manage work, not agents | 高自动化场景 | engineering preview,生产实证有限 | 借哲学不装工具;[§3.3 delivery receipt](workflow.md#33-交付阶段delivery-receipt) 受其交接思想启发 |

### 3.2 决策原则

> **Matt-派核心警告**:不要在没有真实痛点反馈前抽象成框架。先在对话/手动流程里跑顺,再固化。

加入任何新工具前的完整判定见 [§5 决策清单](#5-加新工具前的决策清单);中层框架尤其要看它是否 process-owning。

---

## 4. Runtime 原生能力

### 4.1 Claude Code 内建能力与可选扩展

Claude Code adapter 依赖官方内建能力;第三方 MCP / plugins 只是可选补充,不能因为出现在同一 marketplace 或配置层就视为 Anthropic 维护:

| 能力 / 扩展 | 来源 | 本项目用法 |
|---|---|---|
| `context7` | 第三方 MCP | 外部库版本相关问题可用;不是 workflow 必需依赖 |
| `pr-review-toolkit` | 可选 plugin | Claude adapter 可用;proof bundle 只要求等价 reviewer,不绑定该插件 |
| `commit-commands` | 可选 plugin | 可标准化 git 流程,不属于 methodology core |
| `rust-analyzer-lsp` | 可选 LSP 集成 | Rust 项目实时类型检查 |
| `/init` | Claude Code 内建 | 可辅助生成初始 CLAUDE.md;project-workflow 输出仍以 `AGENTS.md` 为 source of truth |
| `/security-review` | Claude Code 内建 | 涉及认证/输入/密钥时可运行 |
| `/review` | Claude Code 内建 | 通用代码审查备用入口 |

**选择纪律**:内建能力可直接纳入 adapter 假设;第三方扩展需单独核对维护者、权限和版本,且必须保留无该扩展时的主会话 fallback。

### 4.2 Codex / OpenAI 原生能力

Codex adapter 复用 methodology core,但用 Codex 原生的 `AGENTS.md` discovery、plugin skills、general subagent 与 App/CLI 分发。具体映射只在 [`cross-tool-methodology.md`](cross-tool-methodology.md) 和 plugin package 中维护;迁移时只翻译入口、安装与 reviewer 调用方式,不要 fork `workflow.md`、`spec-driven.md`、actions 或 reviewers。

---

## 5. 加新工具前的决策清单

每次想装新东西,过一遍:

```
1. 它解决的痛点你最近遇到几次?
   - 没有实际发生:不装
   - 偶发且可手动处理:先记录
   - 持续重复并产生明显成本:进入后续评估

2. 现有工具能解决吗?没有它你会怎么做?
   - 现有工具用对了就够 → 不装
   - 手动 5 分钟能搞定 → 可能不需要框架化

3. 它属于哪一层?
   - 上层(协作约定):优先,自己写
   - 中层(skill / plugin):谨慎,重点看下一条
   - 底层(IDE):非核心,稳定即可

4. 它是 process-owning 吗?
   - 是 → 跟我们 workflow.md 冲突,不装
   - 否 → 继续评估

5. 跟你已装的冲突吗?
   - 同名 skill / hook 互覆盖 → 不装,先卸老的
   - 命名空间不同 → 可装

6. 你能在合理时间内读懂它的核心边界和失败模式吗?
   - 不能 → 不装(Matt-派精神)
   - 能 → 可考虑

7. 它依赖具体某个 IDE / 模型吗?
   - 是 → 你的"上层资产"就被锁定了,慎重
   - 否 → 加分项
```

---

## 6. 反模式

### 6.1 叠加两个 process-owning 框架
在工具层的典型形态是同时装 Superpowers + ECC,或 Superpowers + 自建 project-workflow;症状与修正见 [`workflow.md §7.2`](workflow.md#72-不要叠加两个-process-owning-框架)。

### 6.2 装一堆从不调用的 skill
**症状**:安装了大量 skill,长期实际使用的只有少数
**后果**:skill list 过长,Claude 启动加载慢、context 浪费、找不着该用哪个
**修正**:定期审查；没有明确使用场景且长期未调用的归档

### 6.3 把上层投资沉在底层工具
在工具层的典型形态是项目规则只写进 `.cursor/rules/` 或 `CLAUDE.md` 而非根 `AGENTS.md`;症状与修正见 [`workflow.md §7.6`](workflow.md#76-不要把上层投资沉到底层工具)。

### 6.4 给框架开 admin 权限
**症状**:把 process-owning 框架的所有 hook 都启用,所有命令都允许
**后果**:框架"接管"了你的工作流,出 bug 你根本不知道是它做的
**修正**:opt-in 启用,只开你真懂的部分

### 6.5 只看 stars 不看适用性
**症状**:看到高 star 数或社区热度就装
**后果**:流行度不等于适配你的项目和权限边界
**修正**:看哲学是否对,看 §3.2 五条是否过

---

## 7. 参考与延伸

- 当前能力边界:[Claude rules](https://code.claude.com/docs/en/memory#organize-rules-with-clauderules) / [Claude hooks](https://code.claude.com/docs/en/hooks) / [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) / [Codex hooks](https://learn.chatgpt.com/docs/hooks) / [Codex command rules](https://learn.chatgpt.com/docs/agent-configuration/rules) / [Cursor rules](https://docs.cursor.com/context/rules-for-ai)
- [OpenAI Symphony](https://github.com/openai/symphony) 当前定位为 engineering preview,含 spec 与实验性 reference implementation
- 各框架官网 / README 链接见 [`workflow.md §参考与延伸`](workflow.md#参考与延伸),本文档的"对比"基于那些 README + 本项目实际跑过的经验
- Matt Pocock 哲学的展开:[`docs/spec-driven.md`](spec-driven.md) 用同样的"小、可读、可拥有"精神
- 工具链方法论(怎么投资上层、怎么对待中层):[`workflow.md §6 方法论支柱`](workflow.md#6-方法论支柱4-条) 4 条原则
