---
name: spec-revise
description: Orchestrate a frozen full-lane contract revision when implementation reveals a material error in an accepted spec, verification contract, scope, plan, or module boundary. Synchronizes spec/plan/tasks with a revision record and creates an ADR only for architecture/module or durable cross-feature decisions. Not for draft edits, typos, or polish.
---

**Response language**: Match the user's prompt language for all natural-language output. File contents stay in source language.

# Spec Revise

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

Orchestrate the mid-implementation revision SOP from [`workflow.md §3.5`](../../docs/workflow.md#35-开发中发现-specplan-错怎么办) (spec/plan errors) and [`workflow.md §2.6`](../../docs/workflow.md#26-module-中途变更feature-实施中发现边界要调整) (module boundary changes).

**Use when**: implementation reveals real spec error, verification not testable, scope missed item, or module boundary needs adjustment.

**Not for**: typos, formatting fixes, minor wording polish — those edit directly. This skill exists for material frozen-contract changes; not every revision needs an ADR.

User input: `$ARGUMENTS` — optional `<feature-slug>` and/or `--spec` / `--module` mode hint.

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角). 本 skill 是 P2 实施期"贵阶段修订"通道。

## Step 1 — 定位 feature

目标 feature 目录解析:

| 输入 | 处理 |
|---|---|
| `<slug>`(如 `email-verification`)| 找 `docs/specs/changes/<NNN>-email-verification/` |
| 空 / "current" | 找最近活跃的 feature(`docs/specs/changes/` 下 mtime 最新,排除 `archive/`)|
| 多个匹配 / 不明 | 请用户挑 |

读该 feature 的 `spec.md` + `plan.md` + `tasks.md`,为后续步骤准备 context。

**车道判定**:`spec.md` 缺失 = **轻车道**。本 skill 只修订 frozen full-lane spec;轻车道风险升级时先补全道 artifact。

## Step 2 — 判定是否需要 revision(走 §3.5 判断表)

Ask user: "什么发现触发了这次 revision?简述。"

Then walk through the [§3.5 judgment table](../../docs/workflow.md#35-开发中发现-specplan-错怎么办) with user:

```
| 发现 | 是不是真错 | 处理 |
|---|---|---|
| Scope 漏写"不做" → AI 多做了 | ✅ 真错 | spec.md §2 必修 |
| Outcomes 模糊 | ⚠️ 看影响 | 已写错方向 → 必修;否则 plan.md prior decisions 加澄清 |
| Verification 不可机械化 | ✅ 真错 | spec.md §4 必修 |
| 数据模型/API 契约跟实际冲突 | ⚠️ 检查 | 模型错改 spec;代码错改代码 |
| 需要拆/合/改 module | ✅ 真错 | 走 §2.6(本 skill 自动转 --module 模式)|
| Constraints 太死 | ⚠️ 看 | 真不必要 → 改 + revision record;若是持久技术决策再加 ADR |
```

Q&A 决策:
- **真错** → 分类 `ADR_REQUIRED`;若为 yes,先扫既有 Accepted/Proposed ADR 找可能 supersede/冲突项。展示“决定 + 原因 + affected files + ADR_REQUIRED + supersede 决定”并取得第 1 次确认后进 Step 3
- **不必修(只是模糊/难做)**→ 引导用户写 plan.md prior decisions(`§3` 加一条)+ 退出。**不强行起 ADR / 改 spec**——避免过度 ceremony 把 plan.md 当 release note 用。
- **module 边界变更** → 自动跑 §2.6 流程(走 Step 5.5)

### ADR_REQUIRED 判据

- yes:架构/模块边界、跨 feature 持久技术决策、取代/矛盾既有 ADR。
- no:普通产品 scope、outcome、constraint 或 verification 修正,且不改变上述长期技术决策。

## Step 3 — 条件式 ADR(仅 `ADR_REQUIRED=yes`)

```bash
ls docs/adr/ | grep -E '^[0-9]{4}-' | sort -rn | head -1
```

取最大 4 位数字 + 1,zero-pad to 4 digits。若 `docs/adr/` 不存在或为空,起 `0001`。

### 起 ADR 草稿

从 `${CLAUDE_PLUGIN_ROOT}/template/docs/adr/0000-template.md` 读取模板,在内存中拟定 `docs/adr/<NNNN>-<topic-slug>.md`;第二次确认前不落盘。

跟用户 Q&A 填:

| ADR 节 | 怎么填 |
|---|---|
| Context | 描述触发 revision 的发现(实施中遇到什么)|
| Decision | 决定改 spec 哪些节 / 改成什么 |
| Consequences | 这次改动影响哪些 module / file / 既有代码 |

ADR 草稿纳入最终 proposed diff;除非出现新歧义,不单独追加 approval。

### 4.5 反向 supersede 核对(防旧 ADR 状态撒谎)

第 1 次确认前已经按 topic 扫过既有 `Accepted` / `Proposed` ADR。这里只按已确认结果拟定旧状态更新;拿不准的新冲突才追加问题。`ADR_REQUIRED=no` 跳过 Step 3 全部内容。

## Step 5 — 改 spec.md

### 5.1 改正文(对应 §3.5 / §2.6 的"改 spec.md 节")

按已确认 decision 拟定 spec.md 最终内容,暂不落盘。

### 5.2 在 `## 修订记录` 节追加

格式(标准化):

```markdown
- YYYY-MM-DD: 改了 §<N> <节名>;原因:<一句话>;决定来源:<用户确认 / ADR-NNNN>
```

若 spec.md 没有 `## 修订记录` 节(老 spec 或自定 template),在 proposed diff 中创建该节并追加条目,不要求用户手工编辑。

## Step 5.5 — (--module 模式追加)Module 边界变更

按 [§2.6](../../docs/workflow.md#26-module-中途变更feature-实施中发现边界要调整):

1. 重审 plan.md `§1.1 Sibling Alignment` —— 这次往往触发 "Codify"
2. 若 module **反常**(参见 [§2.3](../../docs/workflow.md#23-反常判定何时该写模块-agentsmd) 判定)→ 写 / 改 `<module>/AGENTS.md`(主文件)+ `<module>/CLAUDE.md`(1 行 `@AGENTS.md` alias)
3. (如适用)起 tier-level AGENTS.md 调整(若 codify 出来的规则属于 tier 级)
4. (如适用)若 codify 出来的规则属 framework / topic 级 → 加 / 改 path-scoped rules(Claude materialization 为 `.claude/rules/<topic>.md`;见 [§1.3](../../docs/workflow.md#13-a-类约定的内容标准agentsmd--claude-rules))

按第 1 次确认的范围在内存中拟定这些变化;只有发现新 module ambiguity 时再提问。

## Step 6 — 改 plan.md

- **6.1 `## 3. Prior decisions` 加一条**:`- 改 spec.md §<N>: <改了什么>。原因:<一句话>;来源:<用户确认 / ADR-NNNN>。`
- **6.2 `## 1. 模块影响范围`**:若 §5.5 触发 module 变更,更新 module list。
- **6.3 `## 2. 架构决策`**:若 ADR 涉及架构层(数据模型 / API 契约 / 关键算法),加 1-2 句简述引 ADR。

### 6.4 Current truth / 老 spec 联动(按需)

- 若修订改变了 `docs/specs/<area>.md` 已记录的持久行为 → **不在本 skill 直接改 E 类文档**;在 plan/tasks 记录 `current truth update pending`,交给 `/feature-done` 标入 proof bundle 后由 `/feature-archive` 写回
- 若修订**取代**了更早 spec 的方向 → 提示交付后跑 `/feature-archive` 或 `/spec-reconcile` 给老 spec 打状态标记并归档([spec-driven.md §5.1](../../docs/spec-driven.md#51-生命周期状态全集--物理归档)),本 skill 不直接改老 spec

## Step 7 — 改 tasks.md(若任务列表变化)

按修订决策评估:
- 已完成的 task 是否要重做?
- 新加 task?
- 删除 task?

按已确认 revision 拟定 `tasks.md` 最终内容;新增歧义才提问,不逐 task 重复确认。

## Step 7.5 — 按复杂度选择 trace check / auditor

普通单一用户决定、无 ADR、无新 ownership/port/package/infra 且每个具体值有直接来源 → 主 skill 输出紧凑 trace matrix。存在 ADR、新模块/基础设施决策、弱证据或生成决策跨多文件 → dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md):

- `files_to_audit`: proposed final inline contents for `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` +(仅 ADR_REQUIRED)新/被 supersede ADR +(module mode)约定文件
- `baseline`: spec/plan/tasks 的**修订前**内容(让 auditor 只审本次修订新增的决策;ADR 是全新文件无 baseline,审全文)
- `qa_answers`: Step 2 触发发现 + 第 1 次 decision approval + 条件式 ADR 内容
- `language_conventions`: null
- `plugin_hardcoded_defaults`:仅 `ADR_REQUIRED=yes` 时传 `{value: "<NNNN>-<topic>", source: "Step 3 ADR numbering"}`

**Block 规则**:🚫 > 0 → 不落盘,按 feedback 修 proposed contents 后重跑;⚠️ 不 block。

## Step 7.6 — Consolidated Diff Review Gate(第 2 次确认)

从 pre-skill on-disk 内容与 proposed final contents 生成 unified diff,附 7.5 audit 摘要(`✅ N / ⚠️ M / 🚫 K`)。不得用当前 worktree 的其他未提交变化冒充本次 patch。

展示一个完整 diff 后 AskUserQuestion:

| 选项 | 处理 |
|---|---|
| ✅ 接受 | 一次性 apply proposed patch,再进 Step 8 |
| ⚠️ 改某项 | 改完重跑 7.5 + 7.6 |
| 🚫 放弃 | 丢弃内存草稿,worktree 保持不变 |

## Step 8 — 总结

报告 revision record、`ADR_REQUIRED` 结论/文件、改动文件、trace/audit 结果和下一步。Commit 草稿有 ADR 时引用 ADR,无 ADR 时引用 revision topic。

## Failure modes

| 错误 | 应对 |
|---|---|
| 找不到 feature 目录 | 提示用户列出 `ls docs/specs/changes/` 自选 |
| `ADR_REQUIRED=yes` 但 `docs/adr/` 不存在 | 在第 1 次确认中包含“创建 ADR 目录/模板”;不同意则中止涉及架构决策的 revision |
| spec.md 无 `## 修订记录` 节(老 spec)| proposed diff 自动创建该节 |
| 用户走完 Step 2 决定 "其实不必修" | 引导写 plan.md prior decisions + 退出,不起 ADR |
| 多个 ADR 同时起(并发 revision)| 警告"建议一次只 revise 一个 topic",用户确认后 continue |
| Step 7.5 audit 标 🚫 | worktree 未改;据 feedback 修 proposed contents 后重跑 |
| Step 7.6 user 放弃 | 丢弃草稿;不得改动或 checkout 用户原有文件 |

## Notes

- **跟 `/feature-init` 区别**:`/feature-init` 起骨架(P2 头);`/spec-revise` 修订既有 spec(P2 中)。两者不互替。
- **跟 `/spec-quality-check` 区别**:`/spec-quality-check` 是 **pre-implementation gate**(便宜阶段查质量);`/spec-revise` 是 **mid-implementation 修订**(贵阶段)。
- **Goal-driven**:本 skill 服务 [§0.1 命题 1 Verification](../../docs/workflow.md#01-这本手册解决什么)(spec 仍是契约,修订有迹可循)+ 命题 3 Drift(防止偷偷改 spec 累积漂移)。
- **ADR 编号**:仅 `ADR_REQUIRED=yes` 时分配;`NNNN` 4 位、全局递增。
