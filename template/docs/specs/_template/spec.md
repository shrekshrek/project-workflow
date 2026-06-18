# <NNN> <slug> — Spec

> 创建于 <TODAY> · 状态:**草稿** / 评审中 / 已确认
>
> **本文件回答 WHAT —— 做什么、为什么。评审通过后冻结,需变更则起新功能 spec。**
> 写法详见 [project-workflow / spec-driven.md](https://github.com/shrekshrek/project-workflow/blob/main/docs/spec-driven.md)。

## 1. Outcomes

> 场景化散文 **或** API 行为描述。**不要**用 user story 句式("As a X I want Y...")。

{{TODO — 谁,在什么场景下,能做什么。具体动作,不写 wish list}}

## 2. Scope boundaries

**做**:
- {{TODO}}

**不做**(显式列出避免 scope creep,至少 2-3 条):
- {{TODO}}

## 3. Constraints

> 性能 / 安全 / 兼容性 / 法规等**硬数字**约束。**不**写 "希望快"(那是 wish);写 "P95 < 200ms"。

- {{TODO}}

## 4. Verification

> 上线前怎么验证。具体、可执行,**不要**写"覆盖率 80%"这种空话。**本节即 L3 review 基线。**

- 单测:{{TODO 测什么场景}}
- 集成:{{TODO 测什么端到端流程}}
- 手测:{{TODO 运行什么命令验证什么}}
- 上线指标:{{若适用}}
