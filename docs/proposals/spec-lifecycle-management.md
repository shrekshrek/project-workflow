# Spec Lifecycle Management Proposal

> Status: **accepted(收敛版已实施,2026-07-05)** —— 本文保留为原始提案历史;实施时的权威定义见 `docs/actions/feature-archive.md` / `docs/actions/spec-reconcile.md` / `spec-driven.md §5.1-§5.2` / `workflow.md §0.3 E 类`。
>
> Date: 2026-07-05
>
> Motivation: lessons from a long-running Dashboard rebuild where several historical feature specs remained in active context and repeatedly pulled implementation back toward superseded product directions.
>
> **收敛记录**(评审后与原提案的差异):
> 1. 公开 action 从 5 个收敛为 2 个:`feature-archive`(吸收 `spec-supersede` 的标记步骤)+ `spec-reconcile`;`current-truth-check` 降为 `feature-done` / `spec-quality-check` 的内置检查项,不独立成 action。
> 2. `outcome-review`(产品结果验证)判定为正交议题,移出本提案,未实施。
> 3. 防 current-truth 腐化机制升级为强制:`feature-done` 的 current-truth check 不可静默跳过,READY + "更新 pending" 必须显式写入 proof bundle 并点名 `feature-archive`。
> 4. `docs/current/` 归入 workflow.md §0.3 文档职责分类新增的 **E 类(产品事实)**,与 A 类工程约定显式分界。
> 5. 状态命名统一为中文标记 + 英文别名:已取代(superseded)/ 已废弃(abandoned)/ 历史基础(historical-foundation)。
> 6. delta 格式仅在"该域已有 current truth"时要求,不做全局强制。
>
> **二次收敛记录**(2026-07-05 稍后,针对"注意力污染"根因再简化):
> 7. 就地标记升级为**物理归档**(采纳原提案引用的 OpenSpec archive 模型):`docs/specs/` 只放进行中,已交付 feature 整目录 `git mv` 进 `docs/specs/archive/`;`feature-archive` 默认清扫模式批量收尾。状态行对 grep 不可见,目录隔离才是机械可靠的检索边界。
> 8. **删除 `历史基础` 状态**:其语义("仍有效的基础部分")由"事实提炼进 current truth + spec 照常归档"承担,状态全集收敛为 5 个。
> 9. `spec-reconcile` 重新定位为存量 retrofit 修复工具;稳态(清扫常态化)下很少需要。
> 10. 配套防线:行为变更车道下限(**仅限已有 current truth 覆盖的域**——改行为的 diff 无论多小至少轻车道,保证账本唯一写入口;未覆盖域不受限,防仪式化)/ current truth 瘦身纪律(< 150 行 + 替换式更新 + 新鲜度头)/ P4 粗粒度新鲜度 advisory / ADR 一致性核对(合并结论与 Accepted ADR 矛盾时强制停下)。

## 1. Problem

project-workflow v2 is strong at single-feature execution:

- `feature-init` creates a durable feature artifact.
- `spec-quality-check` gates full-lane implementation.
- `spec-revise` protects frozen specs from silent rewrites.
- `feature-done` separates L1 mechanical checks, L2 project conventions, L3 spec compliance, and proof bundle evidence.
- `agents-md-revise` refreshes A-class project conventions.

However, long-running product areas can accumulate many feature specs that all appear equally available to future agents. When later discussion supersedes an earlier IA, product direction, or contract, the old feature spec often remains in `docs/specs/<NNN>-.../` with a status like `已实现`. That is historically true, but it is no longer a safe implementation baseline.

The current methodology says feature artifacts are completed and archived, but it does not provide a first-class action that:

- merges stable feature decisions into a current product truth;
- marks old specs as superseded, abandoned, or historical foundation;
- detects conflicts between multiple specs that touch the same product area;
- prevents stale specs from being used as active implementation guidance;
- distinguishes mechanical feature readiness from product outcome readiness.

This gap matters most for product IA, dashboards, assistants, report workflows, and other areas where the visible outcome evolves through multiple rounds of clarification.

## 2. Reference: What OpenSpec Gets Right

OpenSpec separates:

- `specs/`: current system truth;
- `changes/`: active proposed or in-progress changes;
- `archive/`: historical changes after they have been folded back into current specs.

The useful principle is not "write more specs." It is:

> Current truth has one place. A change is temporary. When done, the durable part is merged into current truth and the change is archived.

project-workflow can adopt this principle without abandoning its stronger engineering controls around AGENTS.md, path-scoped rules, L1/L2/L3 review, proof bundles, and feature lanes.

## 3. Recommended Direction

Add a spec lifecycle layer on top of the existing feature workflow.

The target model:

```text
Current truth        Long-lived product/system behavior that future agents should read first.
Active feature       Current feature artifact used to implement one change.
Historical feature   Completed or abandoned feature artifact kept for audit, not default guidance.
ADR                  Append-only decision record explaining why a cross-feature decision changed.
AGENTS.md            Current engineering conventions, commands, boundaries, and path rules.
```

This preserves project-workflow's existing strengths while reducing context pollution from old feature specs.

## 3.1 Practical Adoption Recommendation

The best adoption path is not to replace project-workflow's feature artifact model with OpenSpec's file model. Keep the project-workflow three-file feature shape:

```text
docs/specs/<NNN>-<slug>/
  spec.md   # WHAT
  plan.md   # HOW
  tasks.md  # STEPS + proof bundle
```

Then add an OpenSpec-like current-truth layer and make each feature describe a delta against that truth.

Recommended durable structure:

```text
docs/current/
  dashboard.md
  report-workflow.md
  assistant.md
  datagroup.md

docs/specs/
  index.md
  067-overview-trend-series-drilldown/
  068-overview-ia-context-rail/
  ...
  078-dashboard-strategy-diagnostic-workbench/
```

This keeps existing commands, templates, habits, and proof bundles intact while solving the main long-term issue: historical feature specs no longer compete with current product truth.

### Feature Specs Should Become Current-Truth Deltas

Future full-lane feature specs should cite the current truth they modify and describe the change as a delta:

```markdown
## Current Truth References

- docs/current/dashboard.md

## Delta

### Added
- Add the What Changed driver matrix.

### Modified
- Market Pulse defaults to the latest valid period instead of the latest calendar period.

### Removed
- Remove the old six-section Dashboard layout from the final IA.
```

The feature can still include normal Outcomes, Scope boundaries, Constraints, and Verification. The delta section exists to prevent the feature from redefining the whole product area and accidentally reviving old assumptions.

### Completion Should Be Three Steps

For user-visible or long-running product areas, completion should become:

```text
feature-done     -> engineering readiness
outcome-review   -> product goal validity
feature-archive  -> current truth and historical status reconciled
```

`feature-done READY` means the implementation passes checks against the feature artifact. It should not automatically mean the product area is closed, because the durable conclusions may still need to be merged into `docs/current/<area>.md`, and old specs may need to be marked `superseded`, `abandoned`, or `historical-foundation`.

### Do Not Move Directories At First

Do not start by moving completed specs into `docs/specs/archive/` or splitting active/superseded directories. That is more disruptive to existing adapters and repo habits.

Start with:

- `docs/current/`;
- `docs/specs/index.md`;
- explicit status markers in each feature spec;
- lifecycle actions that update those markers and indexes.

Physical archive directories can be introduced later, after path semantics are stable across Claude, Codex, and manual workflows.

## 4. New Concepts

### 4.1 Current Truth

Introduce a project convention for current product/system facts. Suggested default:

```text
docs/current/
  <area>.md
```

Examples:

```text
docs/current/dashboard.md
docs/current/report-workflow.md
docs/current/assistant.md
```

`docs/current/` answers: "How does this product/system area work now?"

Feature specs answer: "What did this one tracked change intend to do?"

Current truth should be the first reference for future feature-init, spec-quality-check, and feature-done when a task touches that product area.

### 4.2 Expanded Feature Status

The current `草稿 / 已确认 / 已实现` statuses are useful but insufficient for long-running specs. Add explicit lifecycle statuses:

| Status | Meaning | May guide new implementation? |
|---|---|---|
| `draft` / `草稿` | Still being shaped | No, unless user explicitly says to continue drafting |
| `accepted` / `已确认` | User accepted and implementation may begin | Yes, for that feature |
| `implemented` / `已实现` | The feature contract was delivered | Only as history, unless current truth points to it |
| `superseded` | Replaced by a later spec, ADR, or current truth | No |
| `abandoned` | Stopped because direction was wrong or no longer needed | No |
| `historical-foundation` | Data/API/foundation remains useful, visible product direction superseded | Only for named foundation parts |

`implemented` must not mean "still product-current."

### 4.3 Current Truth Index

For projects that do not want a new directory, a lower-impact alternative is:

```text
docs/specs/index.md
```

The index should list:

- current truth documents;
- active features;
- implemented historical features;
- superseded features;
- abandoned features;
- features that are only historical foundations.

This is weaker than `docs/current/`, but still prevents agents from treating all numbered specs as equally current.

## 5. New Actions

### 5.1 `spec-reconcile`

Use when a product area has accumulated multiple specs or when the user suspects drift.

Inputs:

- product area or module path;
- related `docs/specs/<NNN>-.../`;
- related ADRs;
- related current truth documents, if any;
- optional current implementation files.

Outputs:

- conflict matrix across related specs;
- selected source of truth;
- specs to mark as `superseded`, `abandoned`, or `historical-foundation`;
- current truth gaps;
- next recommended feature or doc update.

Invariants:

- Do not edit implementation code.
- Do not delete history.
- Do not continue implementation until contradictory active specs have a resolved precedence.
- Cite exact files and sections for every conflict.

Typical verdicts:

- `CLEAN`: current truth and specs align.
- `NEEDS LIFECYCLE UPDATE`: docs need status/current-truth changes before implementation.
- `BLOCKED`: contradictory specs make implementation unsafe.

### 5.2 `feature-archive`

Run after `feature-done READY`, before treating a feature as closed.

Inputs:

- feature directory;
- proof bundle;
- changed files;
- related current truth documents;
- related specs and ADRs.

Outputs:

- updated current truth, if the feature changed durable product/system behavior;
- updated feature status;
- optional archive move or archive index update;
- superseded/historical-foundation status updates for old specs;
- final archive note in `tasks.md`.

Invariants:

- A ready feature is not necessarily current truth until durable conclusions are merged.
- Historical details stay in the feature directory or archive.
- Current truth should be concise and future-facing.

### 5.3 `spec-supersede`

Use when a spec's direction has been explicitly replaced.

Inputs:

- old spec;
- replacing spec, ADR, or current truth document;
- reason;
- list of still-valid foundation parts, if any.

Outputs:

- old spec status updated to `superseded` or `historical-foundation`;
- top-of-file note linking to the replacement;
- optional ADR if the change is cross-feature or architectural.

Invariants:

- Superseding is not deletion.
- The old spec must no longer be used as a product baseline.
- If useful implementation/data foundations remain, name them explicitly.

### 5.4 `outcome-review`

Use for product IA, dashboards, reports, assistants, onboarding, and other user-visible outcomes where passing tests does not prove product success.

Inputs:

- spec/current truth;
- screenshots or rendered page evidence where relevant;
- real or representative data;
- user-goal questions.

Outputs:

- outcome checklist result;
- screenshot/data evidence;
- mismatch list between intended user outcome and visible implementation;
- recommendation: continue, revise spec, or abandon.

Invariants:

- Do not validate product IA by heading presence alone.
- Tests should assert user-relevant behavior, not just text rendering.
- If data cannot support a claimed signal, UI must say evidence is insufficient.

Example Dashboard outcome questions:

- Can the user tell what changed?
- Can the user see plausible drivers of the change?
- Can the user distinguish core signals, related signals, weak signals, and noise?
- Can the user inspect evidence for a selected period, driver, entity, or consumer signal?
- Does the page avoid claiming sampled data as market share or all-web truth?

### 5.5 `current-truth-check`

Lightweight check used by `feature-init`, `spec-quality-check`, and `feature-done`.

Checks:

- Does this feature touch an area with a current truth document?
- Does the feature cite that current truth?
- Does the feature contradict any current truth statement?
- If READY, does it require updating current truth?

Verdict:

- `PASS`
- `NEEDS CURRENT TRUTH UPDATE`
- `BLOCKED BY CURRENT TRUTH CONFLICT`

## 6. Changes To Existing Actions

### 6.1 `feature-init`

Add:

- If the slug/module/product area has related historical specs, warn and recommend `spec-reconcile`.
- Prefer current truth documents over historical feature specs when pre-filling context.
- Add a field to `plan.md`: "Current truth references."

### 6.2 `spec-quality-check`

Add an eighth check:

> The spec cites the current truth for the product/system area, or explicitly states no current truth exists.

For high-drift areas, failed current-truth alignment should block implementation.

### 6.3 `spec-revise`

Extend:

- If the revision changes durable product/system behavior, require updating current truth or recording why not.
- If the revision supersedes prior specs, call `spec-supersede` or record follow-up.

### 6.4 `feature-done`

After L1/L2/L3 and proof bundle:

- Run `current-truth-check`.
- If user-visible product outcome is involved, run or require `outcome-review`.
- READY should mean "feature implementation ready"; CLOSED should require archive/current-truth reconciliation.

Possible final states:

| State | Meaning |
|---|---|
| `READY` | Implementation passes checks |
| `READY-PENDING-ARCHIVE` | Implementation ready, current truth/archive step pending |
| `CLOSED` | Feature archived and durable truth reconciled |
| `NEEDS WORK` | Fixable implementation/spec/outcome issue |
| `BLOCKED` | Cannot verify safely |

### 6.5 `agents-md-revise`

Keep it scoped to A-class conventions. Do not make it responsible for product spec reconciliation.

It may report advisory findings:

- specs without lifecycle status;
- current truth documents missing for high-churn product areas;
- implemented specs that still look like active guidance.

## 7. Suggested Directory Model

Recommended first phase:

```text
docs/current/
docs/specs/<NNN>-<slug>/
docs/specs/index.md
docs/adr/
```

Defer this more OpenSpec-like physical layout until adapters and project habits are ready:

```text
docs/current/
docs/specs/active/<NNN>-<slug>/
docs/specs/archive/<NNN>-<slug>/
docs/specs/superseded/<NNN>-<slug>/
docs/adr/
```

Recommendation: start with `docs/current/` plus `docs/specs/index.md`. Keep numbered feature directories in place and use lifecycle statuses first. Moving directories can be introduced later after adapters and docs agree on path semantics.

## 8. Adapter Work

### Claude Code Adapter

Add public actions:

- `/project-workflow:spec-reconcile`
- `/project-workflow:feature-archive`
- `/project-workflow:spec-supersede`
- `/project-workflow:outcome-review`

Optionally keep `current-truth-check` as an internal helper used by other actions.

### Codex Adapter

Expose the same public actions as skills:

- `$spec-reconcile`
- `$feature-archive`
- `$spec-supersede`
- `$outcome-review`

Codex should prefer `docs/current/` + current feature spec as default context for long-running areas, and only read historical specs when current truth links to them or `spec-reconcile` requests them.

## 9. Migration Plan

1. Add this proposal as a design note.
2. Add `docs/current/README.md` to define current truth semantics.
3. Add `docs/specs/index.md` to define active, implemented, historical-foundation, superseded, and abandoned feature groups.
4. Add a short section to `docs/spec-driven.md` explaining feature status lifecycle and current-truth deltas.
5. Add action specs for `spec-reconcile`, `feature-archive`, `spec-supersede`, and `outcome-review`.
6. Update `feature-init`, `spec-quality-check`, `spec-revise`, and `feature-done` action docs.
7. Update templates to include:
   - current truth references;
   - delta section;
   - lifecycle status;
   - archive/current-truth checklist in tasks proof bundle.
8. Update Claude and Codex adapters.
9. Run the new flow against a known drift-heavy project area, such as a Dashboard redesign, before broad release.

## 10. Expected Benefits

- Historical specs remain auditable without polluting active context.
- Long-running product areas have one current source of truth.
- Agents stop treating `implemented` as equivalent to `still correct`.
- Feature completion becomes a two-step idea: implementation readiness plus lifecycle closure.
- Product IA work gets outcome validation instead of heading-based validation.
- project-workflow keeps its existing strengths while adopting OpenSpec's strongest lifecycle idea.

## 11. Non-Goals

- Do not replace AGENTS.md with current truth documents. AGENTS.md remains the source for engineering conventions.
- Do not delete historical specs by default.
- Do not force every tiny change through current truth.
- Do not turn project-workflow into a process-owning framework. The added lifecycle actions should remain opt-in or triggered by clear drift risk.
- Do not make outcome-review a substitute for L1/L2/L3; it answers a different question.

## 12. Open Questions

- Should `docs/current/` be included in the starter template by default, or only created when the first durable product area appears?
- Should archived specs physically move directories or stay in place with status markers and `docs/specs/index.md`?
- Should `feature-done READY` be renamed, or should a new `CLOSED` state be added after archive reconciliation?
- How strict should current-truth-check be for small backend/API changes?
- Should ADR be mandatory when a current truth document supersedes several implemented specs?
