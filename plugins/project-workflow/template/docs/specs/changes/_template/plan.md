# <NNN> <slug> — Plan

> 基于 spec.md。回答 **HOW** —— 怎么做。实施中可改;改的同时在 §3 Prior decisions 写"为什么改"。

## 1. 模块影响范围

列出本 feature 涉及的所有模块(新增 + 改动),按 tier 分组:

- `<tier>/<module>/` —— {{新增模块 / 改:加 xxx / 改:替换 yyy}}
- ...

### 1.1 Sibling Alignment(涉及多模块时必填)

| 兄弟模块 | 对齐方式 | 备注 |
|---|---|---|
| `<sibling-module>` | **Align**(沿用现有约定) / **Deviate**(本 feature 特例,写理由) / **Codify**(把本 feature 模式提升为约定,更新 AGENTS.md)| {{TODO}} |

> 单模块 feature 可省本子节。多模块 feature 不填 = drift 风险(见 [spec-driven.md §3.7 Q6](https://github.com/shrekshrek/project-workflow/blob/main/docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist))。

## 2. 架构决策

> 数据模型、API 契约、关键算法、状态管理 —— **本 feature 的具体技术形状**。
> 不重复 spec.md(spec 写做什么,plan 写怎么做)。

### 数据模型(若适用)

{{TODO — 关键 entity 字段、关系、索引}}

### API 契约(若适用)

| Method | Path | Body | Response | Errors |
|---|---|---|---|---|
| {{TODO}} | | | | 401 / 404 / 422 / ... |

### 关键算法 / 状态机(若适用)

{{TODO}}

## 3. Prior decisions

> 每个决策**带 why**,实施中遇到诱惑回头讨论时 = 关闭讨论的依据。

| 决策 | 为什么 |
|---|---|
| {{TODO 用 X 不用 Y}} | {{TODO 具体原因}} |

## 4. 风险与未决

### 风险

- {{TODO}}

### 未决(实施时决)

- {{TODO}}

## 5. 实施顺序

{{若全栈 feature 走 [workflow §8.6](https://github.com/shrekshrek/project-workflow/blob/main/docs/workflow.md) 后端先行;else: by phase}}

1. {{TODO}}
