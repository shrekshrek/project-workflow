# <NNN> <slug> — Plan

> 基于 spec.md。回答 **HOW** —— 怎么做。实施中可细化;只有符合 §3 范围的决定才在那里记录 why/source。

## 1. 模块影响范围

列出本 feature 涉及的所有模块(新增 + 改动),按 tier 分组:

- `<tier>/<module>/` —— {{新增模块 / 改:加 xxx / 改:替换 yyy}}
- ...

### 1.1 Sibling Alignment(涉及多模块时必填)

| 兄弟模块 | 对齐方式 | 备注 |
|---|---|---|
| `<sibling-module>` | **Align**(沿用现有约定) / **Deviate**(本 feature 特例,写理由) / **Codify**(把本 feature 模式提升为约定)| {{TODO;Codify 时写持久规则 + root/tier/module AGENTS.md 或机械门禁的精确落点 + 来源;嵌套规则只写父级差量}} |

> 单模块 feature 可省本子节。多模块 feature 不填 = drift 风险。Codify 不等于一定新建文件:
> 跨项目规则留根级,同 tier 共享差量进 tier,只有真实模块特例进 module;产品/feature 语义留 spec/plan/ADR,
> 可机械判定的优先 lint/hook/test。嵌套 Claude 兼容采用一行 `@AGENTS.md` alias,不复制规则正文。

### 1.2 Delivery Shape Baseline

> 记录 feature-init 已确认的影响边界;不是文件清单或工期估算。实施中触发未声明项时先停下,按 scope delta 重新分类。

- 当前 outcome / consumer: {{TODO}}
- Delivery risk signal: {{small / medium / large / extra-large + 具体依据}}
- 预期责任区域: {{TODO}}
- Contract / data / authorization / migration / release signals: {{TODO}}
- 明确排除: {{TODO}}
- Scope growth triggers: {{TODO 新持久状态/API/角色/工作流/管理面/队列/runtime/Provider/迁移/授权/发布边界等}}

## 2. 架构决策

> 只保留本 feature 真正适用的子节,删除不适用项。数据模型、接口契约、关键算法、状态管理等都属于 **HOW**。
> 不重复 spec.md(spec 写做什么,plan 写怎么做)。
> 只有架构/模块边界、持久跨 feature 技术决定或取代既有 ADR 时才创建 ADR,并在本节链接具体文件;
> 其他选择也只有符合 §3 的持久追踪条件时才写入 Prior decisions,普通实现细节不需要逐项记账。

### 数据模型(若适用)

{{TODO — 关键 entity 字段、关系、索引}}

### 外部接口 / API 契约(若适用)

| Operation / Method | Target / Path | Input | Output | Errors |
|---|---|---|---|---|
| {{TODO}} | {{TODO}} | {{TODO}} | {{TODO}} | {{TODO}} |

### 关键算法 / 状态机(若适用)

{{TODO}}

## 3. Prior decisions

> 这里只记录需要持久 why/source 的非显然选择、外部来源解释、冲突裁决、bundled-risk 接受或
> supersede 决定;Outcomes、Scope、Constraints、Exclusions 只留在 spec.md,不要重复成第二份契约。
> 仓库来源写 path + section;用户决定写日期/当前 feature。若取代旧决定,在来源中明确
> `supersedes: ...`。不要粘贴原始聊天记录。没有此类决定时写
> `N/A(no durable why/source decision)`,不要为填表复制 spec。

| 决策 | 为什么 | 来源 |
|---|---|---|
| {{TODO 用 X 不用 Y}} | {{TODO 具体原因}} | {{TODO repo path/section 或 user confirmation YYYY-MM-DD; supersedes 若适用}} |

## 4. 风险与未决

### 风险

- {{TODO}}

### 未决(实施时决)

- {{TODO}}

## 5. 实施顺序

> 按真实依赖顺序排列可独立检查的实施步骤,不默认某个 tier 先行。
> 仅当 Delivery risk signal 为 large/extra-large 时,把步骤组织为少量合同切片,并写明可检查退出条件、
> 下一个 consumer 与最小 focused evidence；切片转换和 context/session 恢复时执行 Implementation Continuation Check：
> 一致直接继续,material delta 才触发 Implementation Scope Stop。该要求只约束切片边界,
> 不限制切片内部的真实依赖顺序。

1. {{TODO 实施步骤;large/extra-large 时补充:合同切片 / 可检查退出条件 / 下一个 consumer / 最小 focused evidence}}
