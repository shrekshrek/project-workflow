# Backlog:待决定与未实现的想法

> 索引型清单,详细方案各自独立成文于 `docs/proposals/`。
>
> 等主线内容过完后回头统一评估 —— 决定哪些值得做、怎么配合、什么优先级。

---

## Active 提案

| # | 提案 | 提出日期 | 详细方案 |
|---|---|---|---|
| 1 | AGENTS.md 维护机制(3 阶段渐进推进) | 2026-05-08 提出,2026-05-11 大幅修订 | [`proposals/agents-md-maintenance-skill.md`](proposals/agents-md-maintenance-skill.md) |
| 2 | Spec/Plan 质量自检 + 中途修订 SOP(workflow.md + spec-driven.md + template plan.md 文档化,**先 SOP 后工具**)| 2026-05-14 | 见下"提案 2 概要" |
| 3 | (条件性)`system-architect` sub-agent —— P0 多方案架构探索 + ADR draft 辅助。**前置依赖**:提案 2 多方案探索 SOP 先文档化(§0.6 文档先于工具)| 2026-05-14,**等提案 2 + 真实使用反馈** | — |
| 4 | (条件性)`spec-quality-reviewer` sub-agent —— `/feature-init` 后自动 review spec.md 质量。**前置依赖**:提案 2 质量自检 SOP 跑过几次 | 2026-05-14 | — |
| 5 | (条件性)`spec-revision-helper` sub-agent —— 开发中 spec 出错时辅助起 ADR + 改 spec/plan。**前置依赖**:提案 2 修订 SOP 落地 | 2026-05-14 | — |

### 提案 2 概要(Spec/Plan 质量 + 修订 SOP)

**问题**:v2.3.0 当前覆盖了 spec.md/plan.md/tasks.md 的**创建**(`/feature-init`)和**事后 review**(`/l3-review`),但**没文档化**:

- spec.md 写完后的**质量自检清单**(六要素齐?Scope 含"不做"?Verification 可机械化?)
- 开发中发现 **spec/plan 错时的修订流程**(spec.md 默认冻结,真错怎么改、怎么记)
- 开发中发现 **module 边界要调整时的 SOP**(plan.md §1.1 Sibling Alignment 当时没料到)

**核心思路**(§0.6 docs first):

| 加在哪 | 内容 | 体量 |
|---|---|---|
| `workflow.md` §3.5 新增 | 开发中 spec/plan 修订 SOP | ~35 行 |
| `spec-driven.md` 新增章节 | spec.md 7 问质量自检清单 | ~35 行 |
| `workflow.md` §2.5(或单独子节)| module 设计中途变更 SOP | ~25 行 |

**触及 §2 / §3 workflow.md 守门章节**(`⚠️ Ask first`),独立 commit。

**先做这个,跑过几次真实项目,再决定要不要做提案 3/4/5 sub-agent**。

**Target**: v2.3.1 commit。

---

## 提案模板(新增时套用)

新提案应建独立文件 `docs/proposals/<slug>.md`,在本表加一行索引。建议结构:

```
1. 问题陈述(为什么需要)
2. 核心思路
3. 设计细节(模式 / 接口 / 例子)
4. 关键设计原则
5. Skill 草图(若适用)
6. 推荐进度路径
7. 与现有工作流的接口
8. 评估时要回答的问题
9. 相关工作
```
