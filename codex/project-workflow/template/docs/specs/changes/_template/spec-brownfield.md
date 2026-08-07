# <NNN> <slug> — Change Spec

> 创建于 <TODAY> · 状态:**草稿** / 已确认 / 已实现
> (交付后由 `/feature-archive` 归档到 `docs/specs/changes/archive/`;见 spec-driven.md §5.1)
>
> **Brownfield 瘦 change spec**:域现状在 `docs/specs/<area>.md`;本文件只写动机 + 相对域的 Delta + 约束 + 验证。

## Motivation

> 为什么现在要做这次变更(1 段)。**不要**重复 domain doc 里已有的全貌 Outcomes。

{{TODO — 触发场景 + 期望结果,具体动作}}

## Domain References

- `docs/specs/{{area}}.md` — {{本 change 触达的产品域}}

## Delta

> 相对上列 domain doc 的变更;**必填**。

### Added

- {{TODO 新增的行为 / 规则,没有写 N/A}}

### Modified

- {{TODO 相对 domain 现状要改变什么,没有写 N/A}}

### Removed

- {{TODO 要删 / 停用的行为,没有写 N/A}}

## Constraints

> 性能 / 安全 / 兼容性等**硬数字**约束。

- {{TODO}}

## Verification

> 写“已声明 Delta/风险 + 最小可执行证据”,不是预排测试用例。不要从通用测试习惯派生未声明输入、边界或错误 case。一个证据可覆盖多个相关风险;只有交互维度、已有回归要求或发布/合规契约确实改变结果时才使用矩阵。**本节 + Delta = L3 review 基线**(domain doc 只作 context,不作 L3 全文对照)。

- {{TODO Delta/主要风险 → 最小 command / assertion;具体测试文件和 case 可在实施时决定}}
