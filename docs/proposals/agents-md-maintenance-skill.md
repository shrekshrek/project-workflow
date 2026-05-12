# 提案:AGENTS.md 维护机制(3 阶段渐进推进)

> **状态**:推迟实施,等真实使用数据驱动
> **提出**:2026-05-08
> **大幅修订**:2026-05-11(从"4 模式 A/B/C/D" → "3 阶段 Stage 0/1/2";模式 A 废弃;命名从 CLAUDE.md → AGENTS.md)
> **分类**:工具设计 / skill 提案

---

## 1. 问题陈述

AGENTS.md(项目级 spec,见 workflow.md §1.3)需要在项目演化中保持跟实际状态一致。但现有工具的覆盖:

| 工具 | 覆盖 | 缺口 |
|---|---|---|
| `/init`(原生)+ `CLAUDE_CODE_NEW_INIT=1` | ✅ **初始建立**(Q&A 流程,已实验性发布) | ❌ 不管后续维护 |
| `everything-claude-code:doc-updater` | ✅ 通用文档维护 | ❌ 对 AGENTS.md 不专门优化 |
| `everything-claude-code:continuous-learning-v2` | ✅ session 模式抽取 | ❌ 目标是新 skill,不是 AGENTS.md |
| `Anthropic auto memory` | ✅ AI 跨 session 自动累积 learning | ❌ **写到个人级 MEMORY.md,不进 git**;不管项目级 AGENTS.md |
| `Drift Detection`(mcpmarket / Cavekit) | ✅ spec-vs-代码 drift(L3) | ❌ 不管 AGENTS.md drift(L2) |
| `Addy Osmani agents.md` 框架 | ✅ 主张"living document" | ❌ 没具体演化机制 |

**结论**:**L2 项目约定层(AGENTS.md)的 drift 维护是真实空白**。我们要填的是这个。

---

## 2. 前置:AGENTS.md 的标准结构与边界

本项目采用 Addy Osmani [agents.md 框架](https://addyosmani.com/blog/good-spec/) —— AGENTS.md 由 6 个固定 H2 章节组成,**对所有项目通用,内容随栈适配**:

| 章节(H2) | 内容 |
|---|---|
| `## Commands` | 起服务 / 测试 / lint 的完整命令(含 flag) |
| `## Testing` | 测试框架、文件位置、覆盖率门槛 |
| `## Project Structure` | 目录约定 |
| `## Code Style` | 一段真实代码 |
| `## Git Workflow` | 分支命名、commit 格式、PR 要求 |
| `## Boundaries` | ✅ Always / ⚠️ Ask first / 🚫 Never |

**嵌套层次**(子级覆盖父级,详见 [workflow.md §1.4](../workflow.md#14-claudemd-嵌套层次子级覆盖父级)):
1. 用户级 `~/.claude/CLAUDE.md`
2. 项目级 `./AGENTS.md` + `./CLAUDE.md`(**本提案重点**)
3. Tier 级 `./<tier>/CLAUDE.md`(仅多 tier 项目)
4. 模块级 `./<module>/CLAUDE.md`(仅模块反常时,见 workflow.md §2)
5. 私有 `./CLAUDE.local.md`(gitignored,可选)

### 2.1 AGENTS.md vs auto memory 的边界划分

这是重要的关注点分离:

| 维度 | AGENTS.md | auto memory(`~/.claude/projects/.../memory/`) |
|---|---|---|
| 谁写 | 人(本提案的 skill 辅助) | AI 自己(无需用户 Q&A) |
| 内容 | 团队约定、项目契约、协作规范 | AI 个人 learnings(build 命令、debug 经验、风格观察) |
| 位置 | repo 内,进 git | 用户 home,不进 git |
| 跨机器 | ✅ | ❌ |
| 跨人 | ✅ | ❌ |
| 跨工具(Codex/OpenCode/Cursor) | ✅ | ❌(Anthropic 私有) |

**本提案聚焦 AGENTS.md**,不动 auto memory(那是 Anthropic 自己跑的另一套系统,平行不冲突)。

---

## 3. 核心思路

```
┌─────────────────────┐
│ 用户:出"主张"      │   高 curation 质量
│ (yes/no, 选项, 偏好) │   ↓ 1 句话答案
└─────────────────────┘
          ↓
┌─────────────────────┐
│ AI:出结构和完整性    │   低出错风险
│ (扫码、提问、综合)   │   ↑ 用户审核
└─────────────────────┘
          ↓
   AGENTS.md diff 提议
          ↓
   用户审核 → git commit
```

三个信条:

1. **AI 是 detector,人是 curator**:AI 扫描/检测/提议,人决定改不改
2. **由实际场景反馈驱动**:不是 AI 拍脑袋觉得规范不够好,是开发中**真的撞墙了**才优化
3. **不增加新的提醒源**:工具本身不能变成"反复打扰你"的源 —— 跟 workflow.md §0.5 第 1 条信念("消除对齐劳动")一致

---

## 4. 三阶段渐进推进

**Matt 派核心警告**:不要在没有真实痛点反馈前抽象成框架。3 阶段对应"先验证 → 再固化 → 视需求扩"。

### 4.1 Stage 0:零代码,proof bundle 顺手(**已实现**)

**触发**:每个 feature 完成时(P3 端点 review)

**机制**:workflow.md §3.3 proof bundle 第 4 项已写明:

> "4. AGENTS.md drift —— 本次工作产生了哪些可能值得沉淀的项目级约定?(列建议项,不直接改 AGENTS.md)"

AI 主动按这条列建议,**不需要新工具**。

**用户做的事**:
- 顺手看 proof bundle 列的 drift 建议
- 决定接受/拒绝/记下
- **关键:私下记录**哪些建议是真有用、哪些是噪音(为 Stage 1 决策提供数据)

**积累目标**:1-3 个月内,经过 5-10 个真实 feature。

### 4.2 Stage 1:Critical 单档 `/refresh-agents-md`(**若 Stage 0 数据支持**)

**前置条件**:Stage 0 数据表明
- proof bundle 模式 C 漏检了某些重要 drift
- 漏检的 drift 类型**可枚举且客观可验证**(命令变了、依赖变了、版本变了)
- 你想主动 review 项目规范状态

**功能**:用户主动调用 `/refresh-agents-md`,扫描客观可验证的 drift,输出 diff。

**只做 Critical 一档** —— 客观可验证、几乎零误报。

#### Skill 设计草图

```yaml
---
name: refresh-agents-md
description: 扫描 AGENTS.md 跟项目实际状态的客观 drift,生成 diff 提议
---

# 步骤

1. 读 AGENTS.md(项目根 + 子目录 CLAUDE.md 嵌套)

2. 扫描客观状态:
   - package.json / pyproject.toml / Cargo.toml / go.mod(依赖、命令)
   - .env.example(配置项)
   - 近 30 天 git log 主题摘要(显著变化模式)
   - 项目主要工具版本(用 .tool-versions / .nvmrc / .python-version)

3. 对比 → 找客观 drift:
   - AGENTS.md 写的命令 vs package.json scripts 是否一致
   - AGENTS.md 写的依赖版本 vs 实际版本是否一致
   - AGENTS.md 提到的端口/服务 vs .env.example 是否一致
   - AGENTS.md 提到的目录结构 vs 实际目录是否还存在

4. 生成 diff(仅 Critical 一档):
   - 显示每条 drift:旧值 / 新值 / 建议 patch
   - 用户逐条 yes/no

5. 接受的 patches 合并 → 输出 final AGENTS.md diff

6. 走 git commit(PR 形式),不直接 overwrite
```

**明确不做的**:
- ❌ Suggested 档(模式信号,如"你反复提醒 useApi")
- ❌ Observation 档(弱信号背景累积)
- ❌ hook 信号自动触发
- ❌ 改 CLAUDE.md(它就是 1 行 `@AGENTS.md`)
- ❌ 改 ADR(那是历史记录,只追加不修改)

### 4.3 Stage 2:可选扩展(**可能永远不做**)

**前置条件**:Stage 1 跑 3-6 个月后,且数据表明 Critical 单档**漏检了重要 drift 类型**。

**候选扩展**(逐项视实证):

| 扩展 | 何时考虑 | 风险 |
|---|---|---|
| Suggested 档(模式信号) | 反复出现的人工提醒模式(reminder ≥ N 次)可枚举 | 误报率高,变成新的"反复打扰"源,**违反 §0.5 第 1 条信念** |
| Observation 档(弱信号背景累积) | 真有累积 -> 有用的链路 | 维护成本高,价值低 |
| hook 信号触发(原模式 D) | 模式 D 真比手动调 `/refresh-agents-md` 强 | 跨工具桥接复杂(Claude/OpenCode/Codex 各异) |

**判断标准**:如果 Stage 1 已能解决 90% 痛点,**这阶段不做**。

---

## 5. 设计原则(适用于 Stage 1)

错的版本会变骚扰,要做就做对:

| 原则 | 反例 | 正例 |
|---|---|---|
| 用户主动触发,不后台跑 | 每次 session 弹提示 | `/refresh-agents-md` 用户决定何时跑 |
| 每轮 ≤ 5 条建议 | 一次列 20 条 | 多就分批,大类合并 |
| 仅显示可验证的客观 drift | 推测式建议("你可能要加...") | "package.json 写 `pnpm test:unit`,AGENTS.md 写 `pnpm test`,改吗?" |
| 拒答要记忆 | 一周后再问同一条 | 写入 `.claude/refresh-ignore`,不再触发 |
| diff 预览先过 | 直接 overwrite | 生成 patch,展示 → 用户接受 → git commit |
| 必须基于实际证据 | 凭空猜 | 必引用具体文件路径 / 行号 / git commit hash |

---

## 6. 推荐进度路径

```
[现在 ──── 1-3 月 ──── 决定 ──── 2-3 月 ──── 决定 ──── 永远?]
              │            │           │            │
            Stage 0       Go?         Stage 1    Go to 2?
          (零代码)         │       (Critical)        │
            ↓             成功           ↓          成功
          积累数据 ────────┘           跑稳数据 ─────┘
                                                      ↓
                                                  Stage 2
                                                  (可能永不做)
```

**Stage 0 决策点**:1-3 月后回看,问:
- 累积了多少真实 drift 案例?(< 5 个 → 可能不需要 Stage 1)
- proof bundle 漏检了什么类型?(若大部分是主观的 → Stage 1 没必要)
- 跑 Stage 1 能省你多少时间?(< 1 小时/月 → 维护成本不值)

**Stage 1 → 2 决策点**:类似 logic,看 Critical 单档是否够。

---

## 7. 跟现有 workflow 的接口

| 阶段 | 接口 |
|---|---|
| Stage 0(已实现) | 集成在 workflow.md §3.3 proof bundle 第 4 项 |
| Stage 1(规划) | 独立 slash command `/refresh-agents-md`,通过 SKILL.md + Node 脚本实现,跨工具(Claude/OpenCode/Codex) |
| Stage 2(可能不做) | 如做,Suggested 走 `/refresh-agents-md --suggested`(同 skill 加 flag);hook 信号走 settings.json + 共享脚本 |

---

## 8. 评估时要回答的问题

每个 Stage 决策点回看时,问自己:

**Stage 0 → Stage 1 决策**:
1. 真实 drift 案例数量足吗?(target ≥ 5)
2. 漏检案例的类型可枚举吗?(都是主观的 → 不做)
3. 跑 Stage 1 能省多少时间?(< 1 小时/月 → 不做)
4. proof bundle 模式 C 漏检率多少?(< 20% → 可能够了)

**Stage 1 → Stage 2 决策**:
1. Critical 单档跑稳后,还有什么 drift 没覆盖?
2. 加 Suggested 档的误报率能控制到多少?(实测,不靠估计)
3. 加 hook 信号触发的跨工具维护成本?(Claude/OpenCode/Codex 各家实现差异有多大)
4. Stage 1 真的省时间吗?(看每月跑几次、每次接受几条)

---

## 9. 相关工作(借鉴 + 边界)

### 9.1 直接借鉴的机制

| 来源 | 借鉴什么 | 落地到哪 |
|---|---|---|
| **Anthropic auto memory** | "AI 主动检测可沉淀 pattern + 持久化文件" 思路 | Stage 1 扫描机制(但目标是 AGENTS.md 不是 MEMORY.md) |
| **ECC continuous-learning-v2** | confidence 累积 + 演化路径分级思想 | Stage 2 Suggested 档(若做) |
| **Drift Detection skills**(mcpmarket / fastmcp / Cavekit) | 多源扫描 + 只检测不修改 | Stage 1 设计哲学(detector,not curator) |
| **GitHub Spec Kit `/speckit.clarify`** | Q&A 引导补全模式 | Stage 1 交互形态 |

### 9.2 边界(为什么不直接抄)

| 工具 | 不能直接抄的理由 |
|---|---|
| auto memory | 目标是个人级 learnings,我们是团队级 AGENTS.md;它全自动,我们 Q&A 半自动 |
| continuous-learning | 演化产出是 skill,我们是 AGENTS.md 章节;它信号源是 hook,我们(Stage 1)是用户主动触发 |
| Drift Detection | 它们扫 L3(spec-vs-代码),我们扫 L2(AGENTS.md-vs-实际) |
| Spec Kit `/clarify` | 它在 P2 阶段(完善 spec),我们在 P4 阶段(修订 AGENTS.md) |
| Addy agents.md | 思想对(living document)但没机制,我们提供机制 |

### 9.3 已废弃的设计(对比说明)

原提案有"4 种操作模式 A/B/C/D":

| 原模式 | 现状态 |
|---|---|
| **模式 A 初始访谈**(`/init-claude-md`) | **废弃**。Anthropic `/init` + `CLAUDE_CODE_NEW_INIT=1` 已实验性发布,覆盖此功能。重造无意义。 |
| **模式 B 主动 refresh** | **保留**,成为 **Stage 1**(Critical 单档) |
| **模式 C 端点反思** | **保留**,成为 **Stage 0**(无需新工具,workflow.md §3.3 已写) |
| **模式 D 信号触发** | **降级**到 Stage 2 候选(可能永远不做) |

---

## 10. 跟 spec 检查的关系

本提案是 **L2(项目约定层)** 的维护工具。要避免和 **L3(功能规约层)** 混淆。

详细的 L1/L2/L3 三层框架见 [workflow.md §6.4](../workflow.md#64-按规则源分层验证three-layer-review-separation)。

| 层 | 规则源 | 维护工具 | 检查工具 |
|---|---|---|---|
| L1 通用规则 | `~/.claude/rules/*` | 不需要(规则稳定) | hooks(机械强制) |
| **L2 项目约定** | `AGENTS.md` | **本提案** `/refresh-agents-md`(规划) | linter + agent review + AGENTS.md context |
| L3 功能规约 | `docs/specs/<NNN>/spec.md` | 复用 GitHub Spec Kit `/speckit.clarify` | 测试 + agent review + spec.md context |

**关键判定:为什么 L2 / L3 分别建工具,不合并**:

| 维度 | L2(本提案) | L3(spec) |
|---|---|---|
| 输入 | AGENTS.md(项目级,稳定) | spec/&lt;feature&gt;.md(功能级,每次新) |
| 失败模式 | 风格/结构错 | 行为/范围错 |
| 频率 | 持续(drift 监测) | 一次性(交付前) |
| 抽象层 | form(代码长得像不像) | function(代码做了没做) |

→ **Matt-派精神**:不同输入、不同生命周期、不同失败模式 = 不同 skill。合并会让描述模糊、触发判定弱化。

### 检查层(review)用现有工具,不需新 skill

| 检查 | 现有工具 |
|---|---|
| L2 AGENTS.md 合规 | `pr-review-toolkit:review-pr` / `everything-claude-code:python-review` 等(提供 AGENTS.md 作 context) |
| L3 Spec 合规 | 同上(提供 spec.md 作 context) |
| L1 通用规则 | hook + 通用 reviewer |

**真正缺口在 Q&A 维护层**(规则文档怎么写好/更新),不在检查层 —— 检查层 reviewer 已经够,缺的是给它正确的 context。

### 组合点:workflow §3.3 proof bundle

L2 + L3 的组合**不发生在 skill 层**,**发生在 workflow 调用处**:

```
模块交付时(workflow §3.3):
  ↓ 调用现有 reviewer
  ↓ 提供 AGENTS.md 路径(L2 context)
  ↓ 提供 docs/specs/<NNN>.md 路径(L3 context)
  ↓ reviewer 一次过两层检查,输出统一 proof bundle
```

skill 保持小而锐,组合在 workflow 层发生。
