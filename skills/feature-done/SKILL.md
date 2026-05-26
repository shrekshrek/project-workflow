---
name: feature-done
description: One-shot end-of-feature gate. Runs L1 (mechanical checks) → L2 (AGENTS.md compliance) → L3 (spec.md compliance) → proof-bundle in sequence, aggregates results, gives a single READY/NEEDS WORK/BLOCKED verdict. Replaces manually running the four steps.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, verdict explanations, suggested commit message hints. Sub-skills/agents called from here inherit the same rule. Code, commands, file paths stay as-is.

# Feature Done

Composite skill: chains L1 → L2 → L3 → proof-bundle for end-of-P2 delivery verification。

**Use when**: P2 endpoint — feature implementation complete, ready for the four-check gate before commit / PR.
**Not for**: starting a feature (use `/feature-init`) / mid-implementation partial review (run individual `/l1-review` or `/l2-review` for ad-hoc check) / spec revision (use `/spec-revise`).

User input: `$ARGUMENTS` — feature slug or "current"

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角).

## Step 1 — 定位 feature

跟 `/l3-review` 和 `/proof-bundle` 同逻辑:

| 输入 | 处理 |
|---|---|
| `<slug>` | `docs/specs/<NNN>-<slug>/` |
| `current` 或空 | 最近的 `docs/specs/<NNN>-*/` |

校验 spec.md 存在。不存在则报 "No spec found. Run `/project-workflow:feature-init <slug>` first." 退出。

## Step 2 — 缓存检查(无改动则复用上次 review)

若 L2 / L3 本 session 已跑过(对话历史可见)且**之后代码无改动**,则复用结果不重跑。Proof bundle 会写 `tasks.md`,所以每次 `/feature-done` 都 fresh 运行。

**缓存失效条件**(任一命中则该步重跑):
1. 用户显式要求重跑(`/feature-done <slug> --fresh` 或同义)
2. `git status --short` 显示 scope 内文件在上次 review 时间戳之后被改
3. 上次 review 距今 > 24 小时
4. 对话上下文显示在上次 review 之后对 scope 文件做过 Edit / Write
5. **scope 目录整体 untracked**(`?? <dir>/` 出现在 `git status`,整目录还没进 git)。这种情形 `git status` **看不到目录内部文件变化**,只报 dir untracked。**强制 fresh 重跑**,除非能用 file mtime 比对证明无相关变化(`find <scope> -name "AGENTS.md" -o -name "spec.md" -newer <previous-review-time> 2>/dev/null`)

**每步独立判定**:L1 一般重跑;L2/L3 cache 有效时复用。

**开局必做** `git status --short`,先看实际改了什么。报告头部声明每步的决定:

```
L1: fresh (always re-run)
L2: 复用 (~1 min agent run earlier this session, no scoped changes since)
L3: 复用 (~6 min agent run earlier this session, no scoped changes since)
proof-bundle: re-run (writes tasks.md, so always re-run to refresh)
```

## Step 3 — L1 机械检(几乎总是 fresh)

内部调 L1 skill(或复用其逻辑):
- 从 AGENTS.md 找 check 命令
- 跑命令
- 解析 pass / fail

**L1 红**: STOP。输出失败项 + "Fix L1 before running L2/L3."。verdict = 🔴 BLOCKED。

**L1 绿**: 继续。

## Step 4 — L2 A 类约定 合规(缓存有效则复用,见 Step 2)

调 L2 skill(其内部 dispatch `agents-md-reviewer` agent):
- 收集 A 类约定全集:AGENTS.md 多层 + `.claude/rules/*.md` 全集
- 全集传给 agent;agent 自己按 frontmatter `globs:` 判作用域(skill 层不过滤)
- 拿到 findings

**L2 有 🔴 violations**: 继续,但记入最终 verdict。

**L2 clean 或仅 partials**: 继续。

## Step 5 — L3 spec 合规(缓存有效则复用,见 Step 2)

调 L3 skill(其内部 dispatch `spec-reviewer` agent):
- 把 spec.md / plan.md / tasks.md / changed-files scope 传给 agent
- 拿到 findings

**无论 L3 结果如何,都继续到 proof-bundle**(proof bundle 会记录)。

## Step 6 — proof-bundle(总是 fresh —— 写 tasks.md)

调 proof-bundle skill:
- 传入/复用上面 L1 / L2 / L3 的 verdict 摘要和关键 findings
- 让 proof-bundle 自己计算 diff / A 类约定触动 / drift 建议 / 开放问题
- 写入 tasks.md

**边界**:本 skill 是 orchestrator,不重复定义 proof-bundle 每一项的计算细节。Proof Bundle 的 canonical checklist 和写入逻辑只维护在 [`/proof-bundle`](../proof-bundle/SKILL.md)。

## Step 7 — 聚合报告

单一聚合报告(不出 4 份分散报告):

```markdown
## /project-workflow:feature-done — <feature-slug>

🏁 End-of-feature gate complete. Total time: <Ns> (this run) / <累计> (this session).

### Cache decisions
- L1: <fresh | cached + reason>
- L2: <fresh | 复用 (reason)>
- L3: <fresh | 复用 (reason)>
- proof-bundle: <fresh, always>

### L1 — Mechanical (<duration>)
<one-line: ✅ all green / ❌ N failures listed below>

### L2 — A 类约定 compliance(AGENTS.md + `.claude/rules/`)(<duration>)
<one-line: ✅ no violations / 🟡 N partials / 🔴 N violations>

<if 🔴/🟡, list the worst 3 findings>

### L3 — Spec compliance (<duration>)
<one-line: ✅ N items verified, 0 deviations / ⚠️ N deviations / ❌ N missing>

<if any, list each as 1 line with file:line>

### Proof Bundle written to <tasks.md path>
- Tests: X/Y passed, coverage Z%
- Diff: <N> files, +<X>/-<Y>
- **A 类约定触动**: <K> 份(root: <0/1> / tier: <0-N> / module: <0-N> / path-rule: <0-N>)—— 详见 tasks.md proof bundle Item 5a
- Drift suggestions (未应用): <count>
- Open questions: <count>

---

### Verdict: <🟢 READY / 🟡 NEEDS WORK / 🔴 BLOCKED>

<if 🟢:>
✅ All four checks passed. Ready to commit + open PR.
Suggested commit:
```
feat(<scope>): <feature title from spec §1>

<2-3 lines of context from spec.md §1 Outcomes>

Closes: <issue # if known>
```

<if 🟡:>
⚠️ Needs review. Address before merge:
- <each blocker as a bullet>

<if 🔴:>
❌ Blocked. Must fix:
- L1: <failing item> (this is non-negotiable)

Re-run `/project-workflow:feature-done <slug>` after fixes.

<if proof bundle Item 5b 累积 ≥ 3 条(本 feature + 历史 tasks.md):>
📝 累积 <N> 条 A 类约定 drift backlog。方便时跑 `/project-workflow:agents-md-revise` 一次性 audit + apply(不催)。
```

## Step 8 — Verdict 判定逻辑

| L1 | L2 | L3 | Verdict |
|---|---|---|---|
| ❌ | * | * | 🔴 BLOCKED |
| ✅ | 🔴 (violations) | * | 🟡 NEEDS WORK |
| ✅ | 🟡 (partials) | ❌ missing items | 🟡 NEEDS WORK |
| ✅ | 🟡 / ✅ | ⚠️ deviations | 🟡 NEEDS WORK |
| ✅ | ✅ | ✅ | 🟢 READY |

Spec scope creep(🚫)= 🟡 NEEDS WORK(用户裁实施 或 改 spec §2 二选一)。

## Notes

- **不自动 commit**。即使 🟢 READY,commit 也留给用户
- **不自动 fix**。底层每个 skill(L1/L2/L3)都是 read-only,本 skill 只做聚合
- **🟡 verdict 报告**:suggested actions 按 impact 排序(高 leverage 先);提供 commit message 草稿显式标注 known deviations(供用户带 deviations 上线选项)
