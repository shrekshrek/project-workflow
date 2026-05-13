# `<NNN>` `<slug>` — Plan

> 创建于 YYYY-MM-DD · 基于 [`spec.md`](spec.md)
>
> **本文件回答 HOW —— 用什么技术、改哪些模块。实施过程中可补充,但不能推翻 spec。**
> 详细写法见 [`docs/spec-driven.md`](../../spec-driven.md)。

---

## 1. 模块影响范围

> 列出本功能会动哪些**模块**(不是文件)。这是 feature ↔ module 关系的桥梁。
>
> - **多 tier 项目**(全栈等):列出每个 tier 内的模块,如 `backend/src/<module>/` + `frontend/layers/<module>/`
> - **单 tier 项目**:列模块,如 `src/<module>/`
> - **小项目 / 无模块划分**:直接写"集中在 X.py" 或 "单文件改动",跳过下面的罗列

- `<module-path>/` — 改 / 新增 / 不动
- `<module-path>/` — 改 / 新增 / 不动

### 1.1 Sibling Alignment(对齐既有兄弟模块)

> **写本节前**:扫一眼项目里做"同型事情"的现有模块——错误处理、API 路由命名、test 风格、字段命名约定等。
> 这一步把 Tier 1 #3 Drift 的**空间维度**([workflow.md §0.1](../../workflow.md#01-这本手册解决什么))在 spec 阶段就截住,不必事后检测。

每个本功能涉及的"同型决策"在下表做 3 选 1:

| 决策 | 含义 | 后续动作 |
|---|---|---|
| **Align** | 沿用既有模块的做法 | 不动 AGENTS.md |
| **Deviate** | 用不同做法 + 写明为什么 | 在本节列理由,接受 L2 / L3 review 质询 |
| **Codify** | 既有模块和本功能都该统一,提取到 AGENTS.md | 列入 proof bundle 的 "AGENTS.md drift 建议",P4 处理 |

填写示例:

- 错误处理风格:**Align** —— 跟 `backend/src/invitations/` 一致(`try/except + log + raise`)
- 字段命名:**Codify** —— 现有 A/B 模块 snake_case,C 模块 camelCase → 应统一,加 AGENTS.md `Code Style` 节
- 数据校验:**Deviate** —— 本模块涉外部输入,需更严的 Pydantic v2 strict mode,理由:外部信任边界

**无既有兄弟可对齐时**(首个同型模块)写一行 "首个 X-型模块,无对齐对象" 即可。

### 1.2 跨模块依赖

> 运行时调用关系 / 数据流 / 共享 contract(跟 §1.1 不同 —— 这里是**会调谁**,§1.1 是**应该长什么样**)。

(简述)

## 2. 架构决策

> 数据模型、API 契约、关键算法、状态管理选择。

(简述本功能在系统里的位置和形状)

## 3. Prior decisions

> 已经讨论或选定的技术决策,**附带"为什么"**。每次跟 AI 讨论中作出的决策**当场**写回来。

- 选 X 不选 Y:(原因)

## 4. 风险与未决

> 已知风险点 + 还没敲定但会在实施中决定的事。

- 风险:
- 未决:
