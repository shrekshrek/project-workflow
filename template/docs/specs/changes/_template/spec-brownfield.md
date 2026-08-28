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
> 每个新增持久状态、API、角色、工作流、管理面、队列或 runtime component 都要注明当前 consumer 与必要性;仅为未来可能性服务的能力不进入本 feature。

### Added

- {{TODO 新增的行为 / 规则,没有写 N/A}}

### Modified

- {{TODO 相对 domain 现状要改变什么,没有写 N/A}}

### Removed

- {{TODO 要删 / 停用的行为,没有写 N/A}}

## Constraints

> 写清性能、安全、兼容性等具体约束；适用时给出量化指标。

- {{TODO}}

## Verification

> 写已声明 Delta/风险及最小充分证据，一个证据可覆盖多个相关义务；矩阵用于真实交互风险或项目/发布约定。用户可见验证优先最短 actor-to-result 流程。L3 对照 Delta、Constraints 和 Verification，domain doc 提供背景。

- {{TODO Delta/主要风险 → 最小 command / assertion;具体测试文件和 case 可在实施时决定}}
