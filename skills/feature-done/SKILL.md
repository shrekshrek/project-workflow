---
name: feature-done
model: sonnet
description: Default end-of-feature gate. Runs L1 (mechanical checks) → L2 (AGENTS.md compliance) → L3 (spec.md compliance) → current-truth check → compact delivery receipt in one pass, aggregates results, and gives a single READY/NEEDS WORK/BLOCKED verdict. Idempotent — re-run it for partial recheck (valid caches are reused). For ad-hoc single-layer review, dispatch the agents-md-reviewer / spec-reviewer sub-agent directly instead.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output. Sub-agents called from here inherit the same rule. Code, commands, file paths stay as-is.

# Feature Done

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

唯一端点入口:L1 → L2 → L3 → current-truth check → delivery receipt,单一 verdict。

**Use when**: P2 endpoint — feature implementation complete, ready for the endpoint gate before commit / PR.
**Not for**: starting a feature (use `/feature-init`) / spec revision (use `/spec-revise`) / lifecycle closure after READY (use `/feature-archive`)。中途想单看某一层:L1 = 直接跑项目 check 命令;L2 / L3 = 主会话直接 dispatch [`agents-md-reviewer`](../../agents/agents-md-reviewer.md) / [`spec-reviewer`](../../agents/spec-reviewer.md)。

User input: `$ARGUMENTS` — feature slug or "current"

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角).

## Step 1 — 定位 feature + 车道判定

| 输入 | 处理 |
|---|---|
| `<slug>`(如 `email-verification`)| `docs/specs/changes/<NNN>-<slug>/`(取最新匹配 NNN)|
| `<NNN>` / `<NNN>-<slug>`(如 `002`)| `docs/specs/changes/<NNN>-*/` |
| `current` / 空 | 最近的 `docs/specs/changes/<NNN>-*/`(mtime / NNN 最新;排除 `archive/`)|
| `<full-path>` | 直接用 |

校验 `tasks.md` 存在。**车道判定**:`spec.md` 存在 = 全道;缺失(仅 tasks.md)= 轻车道(L3 跳过)。两者都无 → 报 "No feature artifact in `docs/specs/changes/`. Run `/project-workflow:feature-init <slug>` first." 退出。

**change spec 形态**(全道):`spec.md` 含 `## Delta` → **brownfield**;含 `## 1. Outcomes` → **greenfield**。

## Step 2 — 缓存检查(无改动则复用上次 review)

**缓存仅在同一 session 内有效**:判断依据是对话历史里能看到上次 review 的完整输出。新 session / 恢复的 session / summarize 后看不到完整输出 → 一律视为无缓存,全量 fresh(失败模式安全:顶多重跑一次)。

同 session 内:若 L2 / L3 已跑过且**之后 scope 无改动**,复用结果不重跑。L1 几乎总是 fresh;delivery receipt 写 `tasks.md`,每次都 fresh。

**缓存失效条件**(任一命中则该层重跑):
1. 用户显式要求(`--fresh` 或同义)
2. `git status --short` 显示 scope 内文件在上次 review 之后被改
3. 上次 review 距今 > 24 小时
4. 对话上下文显示上次 review 之后对 scope 文件做过 Edit / Write
5. **scope 目录整体 untracked**(`?? <dir>/`):git 看不到目录内部变化,**强制 fresh**,除非 file mtime 比对(`find <scope> -name "*.md" -newer <marker>`)证明无变化
6. L2 特有:`AGENTS.md`(root / tier)/ `.claude/rules/*.md` / `docs/gotchas.md` 在上次 L2 之后改过
7. L3 特有:本 feature 的 contract/plan/verification/task 内容改过。`tasks.md` 仅 `## Proof Bundle` 被本 action 写回、或 `spec.md` 仅状态从 `已确认` 变 `已实现`,不使缓存失效

**开局必做** `git status --short`。复用时在报告头部显式声明(如 "L2: 复用 — 本 session 早前运行,scope 无变化"),**不静默复用**。

## Step 3 — L1 机械检

找 check 命令,优先级:
1. `AGENTS.md` § Commands 节(含 `check` / `提交前` / `pre-commit` 关键词的行)
2. `package.json` scripts(`check` / `test` / `verify`)
3. `Makefile`(`check:` / `test:` target)
4. 栈惯例(Python `pytest` + `ruff check`;Go `go vet ./... && go test ./...`;Rust `cargo check && cargo test`)

找不到 → 问用户。跑命令(`<cmd> 2>&1`,用 AGENTS.md 原文,不加额外 flag),解析为紧凑报告:lint 错误数 / typecheck 错误数 / tests passed-failed-skipped / coverage / exit code。失败项给 `file:line` + 1 行原因,不 dump 全文。

**L1 红**:记 verdict = 🔴 BLOCKED,但继续 L2/L3/current-truth/proof,让一次端点运行留下完整可审计证据。若 check 需要容器 / server 而未起,记录阻塞原因并继续可独立执行的 reviewer。**不自动 fix**。

## Step 4 — L2 A 类约定合规(缓存有效则复用)

收集 A 类约定全集:root `AGENTS.md` + 命中 tier 的 `<tier>/AGENTS.md` + `<module>/AGENTS.md`(若有)+ **`.claude/rules/*.md` 全量**(skill 层不按 paths 过滤,reviewer 自判作用域)+ `docs/gotchas.md`(若有)。

用 Task 工具 dispatch `subagent_type: agents-md-reviewer`,传:
- Scope(changed files 列表;来源:tasks.md 显式提到的路径,后备 `git diff --name-only` / `git status --porcelain`)
- A 类约定路径全集
- (可选)spec.md 路径仅作 context —— agent 不做 spec 合规

**找不到 AGENTS.md** → 报 "L2 requires AGENTS.md; run `/project-init` or `/project-personalize` first."。按 canonical reviewer verdict 解释结果:零 findings 只有 exact scope/rule IDs + 100% applicable coverage 才是 PASS;`UNRELIABLE` 阻断 READY。每个 partial 必须标 blocking/advisory。

## Step 5 — L3 spec 合规(缓存有效则复用)

**轻车道**:L3 记 `N/A(轻车道)`,但逐项执行/机械核对 `tasks.md` `## 验证`。每项记录 command/assertion 与结果;缺少执行锚、未执行或失败 → `NEEDS WORK`。完成后进 Step 5.5。全道:

用 Task 工具 dispatch `subagent_type: spec-reviewer`,传:
- `spec.md` 路径 + **形态 brownfield|greenfield**
- brownfield: 另传 `docs/specs/<area>.md`(**只读 context**,非 L3 全文基线)
- `plan.md` / `tasks.md`(context)+ 改动文件列表
- **检查焦点**:
  - **brownfield**:Delta(Added/Modified/Removed)是否实现 + Constraints + Verification;domain doc 不逐条对照
  - **greenfield**:§1 Outcomes / §2 Scope / §3 Constraints / §4 Verification

多数项 missing = feature 未完成,报 "N of M spec items unimplemented, continue per tasks.md"。tasks.md 与 spec 冲突时信 spec。**无论结果如何继续到 delivery receipt**(会记录)。

## Step 5.5 — Domain doc check(E 类,按需)

1. brownfield:读 `spec.md` 引用的 `docs/specs/<area>.md`;greenfield:若没有 domain doc,本项不做冲突对照。
2. **矛盾**:实施与 domain 冲突且 change spec 未声明 deviation → 至少 🟡。
3. **持久行为变更**或 greenfield 首次交付会形成新当前事实 → receipt 的 `Current truth` 记 "domain 更新 pending → `/feature-archive`"。spec/plan 未声明 area 时写 `area unresolved`,不得猜 `docs/specs/<name>.md`。
4. brownfield 未引用已存在的相关 domain → ⚠️ 提示。

## Step 6 — Delivery receipt 装配 + 写入 `## Proof Bundle`(总是 fresh)

计算各项并**单次 Edit** 替换 `tasks.md` 末尾历史兼容的 `## Proof Bundle` 节:

| Item | 内容 |
|---|---|
| **Verdict** | READY / NEEDS WORK / BLOCKED |
| **Change** | diff identity + exact review-scope paths + endpoint-owned outputs(`tasks.md` receipt、READY spec status、实际写入的 drift ledger);不得冒充含用户无关改动的完整 worktree population,完整 diff 以 Git 为准 |
| **轻车道不变量反核**(仅轻车道;结果并入 Checks) | 实际改动文件 grep 根 AGENTS.md「灾难性不变量 / 高爆破半径路径」声明;命中 → 🚨 误分类应走全道,verdict 至少 🟡 |
| **Checks** | Step 3 commands、exit status、tests totals/coverage + L1 verdict;轻车道追加每个 `## 验证` item 的结果 |
| **L2** | verdict/findings + exact applicable rule IDs + coverage/applicable-unverified/ambiguity/confidence + bridge `global/matched/skipped/ambiguous` counts + applicable/ambiguous paths |
| **L3** | verdict/findings + exact spec item IDs + coverage/applicable-unverified/ambiguity/confidence;轻车道写 `N/A` + verification verdict |
| **Current truth** | N/A / aligned / **更新 pending**(area 可可靠确定时指向 `docs/specs/<area>.md`;否则写 `area unresolved`) |
| **Open questions** | 只写影响 handoff/release 的未决项;空则省略 |
| **Drift** | 只写可行动的 A 类触动/建议;未解决建议 append drift ledger;空则省略 |

写后重读该节做 schema self-check:exact review-scope paths、endpoint-owned output paths、L2 exact rule IDs、全道 L3 exact spec IDs或轻车道 verification IDs、coverage/unverified/ambiguity/confidence、bridge counts/paths、Verdict/Checks/Current truth 缺一项都标 `UNRELIABLE`。最终回复必须逐字包含磁盘上的完整 `## Proof Bundle` block,不得改写成摘要。

**Drift 重现感知**:每条未解决建议以自由文本 append 到 `.claude/drift-ledger.md`(一行一条:`- <NNN>-<slug> (YYYY-MM-DD): <一句话 gist>`;文件不存在则创建)。**不算指纹、不维护计数** —— append 前通读现有条目,若发现早前 feature 已记过同一件事(语义判断,不要求措辞一致)→ 报告尾部提示:"🔁 「<gist>」已在 N 个 feature 重现 —— 可行动的 A 类约定候选走 `/agents-md-revise`;只有本 feature 的冻结契约真的变了才走 `/spec-revise`"。已 codify 的条目顺手删行(ledger 只留未处理项)。

**Overall READY 且全道** → 把 `spec.md` 顶部状态行粗体标记挪到 `已实现`(幂等,只动标记不改措辞;这是交付标记非契约修订,见 [spec-driven.md §3.8](../../docs/spec-driven.md#38-spec-编辑边界只有-1-条线))。轻车道 / 非 READY → 跳过。

## Step 7 — 聚合报告 + verdict

单一聚合报告:

```markdown
## /project-workflow:feature-done — <feature-slug>

### Cache decisions
- L1: fresh | L2: <fresh / 复用(原因)> | L3: <fresh / 复用 / N/A> | proof: fresh

### L1 — Mechanical:<✅ / ❌ N failures(列出)>
### L2 — A 类约定:<✅ / 🟡 N partials / 🔴 N violations(最重 3 条)>
### L3 — Spec compliance:<✅ / ⚠️ N deviations(每条 1 行 file:line)/ N/A 轻车道>
### Current truth:<N/A / aligned / ⚠️ 更新 pending>
### Delivery receipt
<原样展示写入 tasks.md 的紧凑 receipt,随后给 path>

### Verdict: <🟢 READY / 🟡 NEEDS WORK / 🔴 BLOCKED>
```

Finding 数已在 receipt 的 L2/L3/Drift 字段展示,不另设重复“门健康”区。用户明确要求校准或做周期流程评估时才汇总历史成本信号;known-bad mutation smoke 才验证 sensitivity。

Verdict 判定:

Verdict contract: L1 failure or unreliable required checks = `BLOCKED`; blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.

| L1 | L2 | L3 | Verdict |
|---|---|---|---|
| ❌ | * | * | 🔴 BLOCKED |
| ✅ | 🔴 violations | * | 🟡 NEEDS WORK |
| ✅ | blocking partial / violation | * | 🟡 NEEDS WORK |
| ✅ | evidence-backed ✅ / advisory only | deviation / missing / scope creep | 🟡 NEEDS WORK |
| ✅ | evidence-backed ✅ / advisory only | evidence-backed ✅ | 🟢 READY |

**轻车道**:L3 = N/A;L1 ✅ + L2 evidence-backed PASS/advisory only + `## 验证` 全过 + receipt 完整 = 🟢;不变量反核命中 = 🟡(误分类,补全道 spec)。Current-truth 矛盾 = 至少 🟡。

- 🟢:附 commit message 草稿(`feat(<scope>): <title>` + spec §1 摘要);**若 current truth 更新 pending,显式提示下一步 `/feature-archive <slug>`,不能省**;否则提醒"合并后可攒进下次 `/feature-archive` 清扫"
- 🟡:blockers 按 impact 排序;commit 草稿显式标注 known deviations(供用户带 deviations 上线)
- 🔴:必修项 + "Re-run `/project-workflow:feature-done <slug>` after fixes."

## Notes

- **不自动 commit / 不自动 fix**:review 层全 read-only,本 skill 只聚合 + 写 delivery receipt(+ READY 翻 spec 状态行)
- **幂等**:重跑产出相同结果(除测试 timing);这就是"局部复查"的入口 —— 有效缓存自动复用,只重算失效层
- **READY ≠ 关闭**:每个已交付 feature 最终都由 `/feature-archive` 移入 `docs/specs/changes/archive/`(清扫模式批量,不必逐个);current truth pending 的 feature 归档时必须完成合并,不能静默跳过(canonical spec 的 verdict 语义)
