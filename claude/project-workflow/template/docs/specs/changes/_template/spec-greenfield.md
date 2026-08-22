# <NNN> <slug> — Change Spec

> 创建于 <TODAY> · 状态:**草稿** / 已确认 / 已实现
> (交付后由 `/feature-archive` 归档到 `docs/specs/changes/archive/`;见 spec-driven.md §5.1)
>
> **Greenfield 胖 change spec**:尚无 domain doc 覆盖本范围时使用;首个 READY change 归档时由 `/feature-archive` 创建/更新 `docs/specs/<area>.md`。

## 1. Outcomes

> 场景化散文 **或** API 行为描述。**不要**用 user story 句式。

{{TODO — 谁,在什么场景下,能做什么}}

## 2. Scope boundaries

**做**:
- {{TODO}}

> 每个新增持久状态、API、角色、工作流、管理面、队列或 runtime component 都要注明当前 consumer 与必要性;仅为未来可能性服务的能力不进入本 feature。

**不做**:
- {{TODO}}

## 3. Constraints

> **硬数字**约束,不写 wish list。

- {{TODO}}

## 4. Verification

> 写“已声明行为/风险 + 最小可执行证据”,不是预排测试用例。不要从通用测试习惯派生未声明输入、边界或错误 case。一个证据可覆盖多个相关风险;只有交互维度、已有回归要求或发布/合规契约确实改变结果时才使用矩阵。用户可见验证按最短 actor-to-result 流程优先排序，无需额外标签。**本节即 L3 review 基线。**

- {{TODO 行为/主要风险 → 最小 command / assertion;具体测试文件和 case 可在实施时决定}}
