---
name: spec-revise
description: Orchestrate mid-implementation spec/plan/module revision per workflow.md §3.5 (spec/plan errors) and §2.6 (module boundary changes). Handles ADR creation + spec.md 修订记录 entry + plan.md prior decisions update + tasks.md rebalance + module CLAUDE.md (if needed). Use when implementation reveals the spec/plan/module is wrong. NOT for fixing typos or polish — those go in directly without ceremony.
---

**Response language**: Match the user's prompt language for all natural-language output. File contents stay in source language.

# Spec Revise

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/spec-revise.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

Orchestrate the mid-implementation revision SOP from [`workflow.md §3.5`](../../docs/workflow.md#35-开发中发现-specplan-错怎么办) (spec/plan errors) and [`workflow.md §2.6`](../../docs/workflow.md#26-module-中途变更feature-实施中发现边界要调整) (module boundary changes).

**Use when**: implementation reveals real spec error, verification not testable, scope missed item, or module boundary needs adjustment.

**Not for**: typos, formatting fixes, minor wording polish — those edit directly. This skill exists for **decisions that need ADR + cross-file consistency**.

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

**车道判定**:`spec.md` 缺失 = **轻车道**(只 tasks.md)。`/spec-revise` 改 frozen spec + 起 ADR,**只适用全道** → 报 "轻车道无 frozen spec 可修订。若本次变更需要 spec(触达不变量 / 契约变更),先重跑 `/feature-init <slug>` 选全道补 spec.md + plan.md 再回来"(升级路径见 [spec-driven §3.2.5](../../docs/spec-driven.md#325-轻车道小改免-frozen-spec--plan))退出。

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
| Constraints 太死 | ⚠️ 看 | 真不必要 → 改 + ADR;只是难做 → 别动 |
```

Q&A 决策:
- **真错** → 进 Step 3
- **不必修(只是模糊/难做)**→ 引导用户写 plan.md prior decisions(`§3` 加一条)+ 退出。**不强行起 ADR / 改 spec**——避免过度 ceremony 把 plan.md 当 release note 用。
- **module 边界变更** → 自动跑 §2.6 流程(走 Step 5.5)

## Step 3 — 找下一个 ADR 编号

```bash
ls docs/adr/ | grep -E '^[0-9]{4}-' | sort -rn | head -1
```

取最大 4 位数字 + 1,zero-pad to 4 digits。若 `docs/adr/` 不存在或为空,起 `0001`。`0000-template.md` 跳过。

## Step 4 — 起 ADR 草稿

复制 `docs/adr/0000-template.md` 到 `docs/adr/<NNNN>-<topic-slug>.md`。

跟用户 Q&A 填:

| ADR 节 | 怎么填 |
|---|---|
| Context | 描述触发 revision 的发现(实施中遇到什么)|
| Decision | 决定改 spec 哪些节 / 改成什么 |
| Consequences | 这次改动影响哪些 module / file / 既有代码 |

写好 ADR 文件,用户 review。

### 4.5 反向 supersede 核对(防旧 ADR 状态撒谎)

落盘前按 topic 关键词 grep 既有 `Accepted` / `Proposed` ADR 的标题与 Decision 节,列出可能被本决策**推翻或矛盾**的(0-3 份,引原文)逐份问用户:推翻 → 老 ADR 状态行改 `Superseded by <NNNN>`(唯一允许的改动)+ 新 ADR Context 注一句取代原因;正交共存 / 拿不准 → 不动(后者列入报告)。零命中静默跳过。只登记新决策不翻旧状态,就是 ADR 冲突积累的主通道(与 spec 侧"反向标记别漏"同构)。

## Step 5 — 改 spec.md

### 5.1 改正文(对应 §3.5 / §2.6 的"改 spec.md 节")

按 ADR Decision 用 Edit 工具改 spec.md 对应 §1-§6 节。

### 5.2 在 `## 修订记录` 节追加

格式(标准化):

```markdown
- YYYY-MM-DD: 改了 §<N> <节名>;原因见 ADR-<NNNN>
```

若 spec.md 没有 `## 修订记录` 节(老 spec 或自定 template),提示用户在 spec.md 末尾手动加该节,**然后** skill 追加条目。

## Step 5.5 — (--module 模式追加)Module 边界变更

按 [§2.6](../../docs/workflow.md#26-module-中途变更feature-实施中发现边界要调整):

1. 重审 plan.md `§1.1 Sibling Alignment` —— 这次往往触发 "Codify"
2. 若 module **反常**(参见 [§2.3](../../docs/workflow.md#23-反常判定何时该写模块-agentsmd) 判定)→ 写 / 改 `<module>/AGENTS.md`(主文件)+ `<module>/CLAUDE.md`(1 行 `@AGENTS.md` alias)
3. (如适用)起 tier-level AGENTS.md 调整(若 codify 出来的规则属于 tier 级)
4. (如适用)若 codify 出来的规则属 framework / topic 级 → 加 / 改 path-scoped rules(Claude materialization 为 `.claude/rules/<topic>.md`;见 [§1.3](../../docs/workflow.md#13-a-类约定的内容标准agentsmd--claude-rules))

每步跟用户确认改了什么。

## Step 6 — 改 plan.md

- **6.1 `## 3. Prior decisions` 加一条**:`- 改 spec.md §<N>: <改了什么>。原因 / 详细决策见 ADR-<NNNN>。`
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

跟用户确认每条变化,用 Edit 工具更新 `tasks.md`。

## Step 7.5 — 决策完整性 audit(默认强制,workflow §1.12)

**降频**(workflow §1.12 提示 #4):最近 ≥ 3 个 feature audit 全零 🚫 且本次只动 tasks.md 无新 ADR → 可跳过(报告标注);含 spec/plan/ADR 改动仍无条件跑;再出 🚫 即恢复强制。
Dispatch [`decision-completeness-auditor`](../../agents/decision-completeness-auditor.md):

- `files_to_audit`: `docs/specs/changes/<NNN>-<slug>/{spec,plan,tasks}.md` + `docs/adr/<NNNN>-<topic>.md` +(若 Step 5.5 触发)`<module>/AGENTS.md` + `<tier>/AGENTS.md` + `.claude/rules/<topic>.md`
- `baseline`: spec/plan/tasks 的**修订前**内容(让 auditor 只审本次修订新增的决策;ADR 是全新文件无 baseline,审全文)
- `qa_answers`: Step 2 触发发现 + Step 4 ADR 三节 + Step 5/5.5/6/7 user 确认改动
- `language_conventions`: null
- `plugin_hardcoded_defaults`: `{value: "<NNNN>-<topic>", source: "Step 3 ADR numbering"}`

**Block 规则**:🚫 > 0 → 报 user,提示 `git checkout HEAD -- <file>` 回退 + 据 feedback 重跑;⚠️ 不 block。

## Step 7.6 — Diff Review Gate(强制)

跑 `git diff HEAD -- <files-touched>` + 附 7.5 audit 摘要(`✅ N / ⚠️ M / 🚫 K`)。

AskUserQuestion:

| 选项 | 处理 |
|---|---|
| ✅ 接受 | 进 Step 8 |
| ⚠️ 改某项 | 改完重跑 7.5 + 7.6 |
| 🚫 revert | `git checkout HEAD -- <files-touched>` + 退回 Step 2 |

## Step 8 — 总结

报告:起了哪份 ADR(`docs/adr/<NNNN>-<topic>.md`)+ 改了哪些文件(spec.md §N + 修订记录 / plan.md 相应节 / tasks.md / 若 §5.5 触发的 `<module>/AGENTS.md` 与 `.claude/rules/<topic>.md`)。下一步:`git diff` 复查 → `git commit -m "revise: <topic> per ADR-<NNNN>"` → 回到实施(修订后的 spec 是新 baseline)。

## Failure modes

| 错误 | 应对 |
|---|---|
| 找不到 feature 目录 | 提示用户列出 `ls docs/specs/changes/` 自选 |
| `docs/adr/` 不存在 | 询问 "项目还没起 ADR 目录,要先建吗?(y/n)";yes → mkdir + 复制 0000-template;no → 中止 revise |
| spec.md 无 `## 修订记录` 节(老 spec)| 提示用户手动加节 → continue |
| 用户走完 Step 2 决定 "其实不必修" | 引导写 plan.md prior decisions + 退出,不起 ADR |
| 多个 ADR 同时起(并发 revision)| 警告"建议一次只 revise 一个 topic",用户确认后 continue |
| Step 7.5 audit 标 🚫 | 报告 plant 给 user,提示 `git checkout HEAD -- <file>` 回退 + 据 feedback 重跑;skill 不主动重 audit(等 user 决定)|
| Step 7.6 user 选 revert | 跑 `git checkout HEAD -- <files-touched>`,退回 Step 2 让 user 调整发现描述后重启 |

## Notes

- **跟 `/feature-init` 区别**:`/feature-init` 起骨架(P2 头);`/spec-revise` 修订既有 spec(P2 中)。两者不互替。
- **跟 `/spec-quality-check` 区别**:`/spec-quality-check` 是 **pre-implementation gate**(便宜阶段查质量);`/spec-revise` 是 **mid-implementation 修订**(贵阶段)。
- **Goal-driven**:本 skill 服务 [§0.1 命题 1 Verification](../../docs/workflow.md#01-这本手册解决什么)(spec 仍是契约,修订有迹可循)+ 命题 3 Drift(防止偷偷改 spec 累积漂移)。
- **ADR 编号**:`NNNN` 4 位数字,从 0001 开始(0000 是 template);全局递增,跨 feature 共享。
