---
name: feature-done
model: sonnet
description: Default end-of-feature gate. Runs L1 (mechanical checks) → L2 (AGENTS.md compliance) → L3 (spec.md compliance) → current-truth check → proof bundle in one pass, aggregates results, and gives a single READY/NEEDS WORK/BLOCKED verdict. Idempotent — re-run it for partial recheck (valid caches are reused). For ad-hoc single-layer review, dispatch the agents-md-reviewer / spec-reviewer sub-agent directly instead.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output. Sub-agents called from here inherit the same rule. Code, commands, file paths stay as-is.

# Feature Done

Before acting, Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely. It is the canonical methodology contract and wins on scope, outputs, invariants, and validation; this skill adds Claude Code execution details.

唯一端点入口:L1 → L2 → L3 → current-truth check → proof bundle,单一 verdict。

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

同 session 内:若 L2 / L3 已跑过且**之后 scope 无改动**,复用结果不重跑。L1 几乎总是 fresh;proof bundle 写 `tasks.md`,每次都 fresh。

**缓存失效条件**(任一命中则该层重跑):
1. 用户显式要求(`--fresh` 或同义)
2. `git status --short` 显示 scope 内文件在上次 review 之后被改
3. 上次 review 距今 > 24 小时
4. 对话上下文显示上次 review 之后对 scope 文件做过 Edit / Write
5. **scope 目录整体 untracked**(`?? <dir>/`):git 看不到目录内部变化,**强制 fresh**,除非 file mtime 比对(`find <scope> -name "*.md" -newer <marker>`)证明无变化
6. L2 特有:`AGENTS.md`(root / tier)/ `.claude/rules/*.md` / `docs/gotchas.md` 在上次 L2 之后改过
7. L3 特有:本 feature 的 `spec.md` / `plan.md` / `tasks.md` 改过

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

**找不到 AGENTS.md** → 报 "L2 requires AGENTS.md; run `/project-init` or `/project-personalize` first."。Agent 返回空 findings = ✅。有 🔴 violations → 继续但记入 verdict。

## Step 5 — L3 spec 合规(缓存有效则复用)

**轻车道 → 跳过**,记 `L3: N/A(轻车道)`,直接 Step 5.5。全道:

用 Task 工具 dispatch `subagent_type: spec-reviewer`,传:
- `spec.md` 路径 + **形态 brownfield|greenfield**
- brownfield: 另传 `docs/specs/<area>.md`(**只读 context**,非 L3 全文基线)
- `plan.md` / `tasks.md`(context)+ 改动文件列表
- **检查焦点**:
  - **brownfield**:Delta(Added/Modified/Removed)是否实现 + Constraints + Verification;domain doc 不逐条对照
  - **greenfield**:§1 Outcomes / §2 Scope / §3 Constraints / §4 Verification

多数项 missing = feature 未完成,报 "N of M spec items unimplemented, continue per tasks.md"。tasks.md 与 spec 冲突时信 spec。**无论结果如何继续到 proof bundle**(会记录)。

## Step 5.5 — Domain doc check(E 类,按需)

1. brownfield:读 `spec.md` 引用的 `docs/specs/<area>.md`;greenfield:若没有 domain doc,本项不做冲突对照。
2. **矛盾**:实施与 domain 冲突且 change spec 未声明 deviation → 至少 🟡。
3. **持久行为变更**或 greenfield 首次交付会形成新当前事实 → proof Item 5.5 记 "domain 更新 pending → `/feature-archive`"。
4. brownfield 未引用已存在的相关 domain → ⚠️ 提示。

## Step 6 — Proof bundle 装配 + 写入 tasks.md(总是 fresh)

计算各项并**单次 Edit** 替换 `tasks.md` 末尾 `## Proof Bundle` 节(保留 checkbox 结构):

| Item | 内容 |
|---|---|
| **1 Diff 摘要** | `git diff --stat <base>...HEAD` 或 `git status --short`;`N files, +X/-Y` + New / Modified / Deleted 分类(5-10 行) |
| **1.5 轻车道不变量反核**(仅轻车道) | 实际改动文件 grep 根 AGENTS.md「灾难性不变量 / 高爆破半径路径」声明;命中 → 🚨 误分类应走全道,verdict 至少 🟡 |
| **2 Tests + L1** | Step 3 结果:`X/Y passed, coverage Z%` + L1 verdict |
| **3 L2 合规** | ✅ clean / 🟡 N partials / 🔴 N violations(1 行摘要each) |
| **4 L3 合规** | ✅ / ⚠️ N deviations;轻车道写 `N/A`。**L2+L3 去重**:同行同根因以 L3 为准,L2 标 "also flagged";不同根因两条都留([workflow.md §6.4](../../docs/workflow.md#64-按规则源分层验证three-layer-review-separation)) |
| **5a A 类约定触动** | `git diff --name-only` 过滤 `(AGENTS|CLAUDE)\.md$|^\.claude/rules/`;按 root / tier / module / path-rule 四档列出,每份标 plan.md §1.1 声明的 Align / Deviate / Codify(未声明则提示补) |
| **5b A 类约定 drift 建议**(未应用) | 代码里出现但 A 类约定没提该提的(新 pattern 未文档化 / 命令未同步)→ 0-3 bullet |
| **5.5 Current truth** | N/A / aligned / **更新 pending(指向 `docs/specs/<area>.md`,下一步 `/feature-archive`)** |
| **6 开放问题** | tasks.md `## 实施记录` 未决项 + L3 flagged spec ambiguities |

**5b 重现感知**:每条 5b 建议以自由文本 append 到 `.claude/drift-ledger.md`(一行一条:`- <NNN>-<slug> (YYYY-MM-DD): <一句话 gist>`;文件不存在则创建)。**不算指纹、不维护计数** —— append 前通读现有条目,若发现早前 feature 已记过同一件事(语义判断,不要求措辞一致)→ 报告尾部提示:"🔁 「<gist>」已在 N 个 feature 重现 —— codify 它:客观漂移 → `/agents-md-revise`;模式文档化 → `/spec-revise` 或手改 AGENTS.md/rules"。已 codify 的条目顺手删行(ledger 只留未处理项)。

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
### Proof bundle → <tasks.md path>(Tests X/Y · Diff N files · A 类触动 K 份 · drift 建议 N · 开放问题 N)

### 门健康:L2 <N> · L3 <N> · drift <N> findings 本次;<某门连续 ≥3 feature 零产出则加一句提示,否则省略本行>

### Verdict: <🟢 READY / 🟡 NEEDS WORK / 🔴 BLOCKED>
```

**门健康遥测**(服务 [workflow.md §7.9/§7.10](../../docs/workflow.md#79-不要让-review-门空转太安静) 的门校准):数据源是近 2-3 个已交付 feature 的 `tasks.md` proof bundle(grep Item 3 / 4 / 5b 的 finding 计数,不新建存储)。某门(L2 / L3 / drift 5b)**连续 ≥ 3 个 feature 任何 severity 都是零** → 提示 "「<门>」连续 N 个 feature 零产出 —— 约定可能已内化,考虑降频或退轻车道(§7.9)"。只提示不决策;读不到历史 proof bundle 就省略本行,不算错误。

Verdict 判定:

Verdict contract: L1 failure or unreliable required checks = `BLOCKED`; fixable L2/L3/current-truth findings = `NEEDS WORK`; all required gates and proof complete = `READY`.

| L1 | L2 | L3 | Verdict |
|---|---|---|---|
| ❌ | * | * | 🔴 BLOCKED |
| ✅ | 🔴 violations | * | 🟡 NEEDS WORK |
| ✅ | 🟡 / ✅ | ⚠️ deviations / ❌ missing / 🚫 scope creep | 🟡 NEEDS WORK |
| ✅ | ✅ / 🟡 partials | ✅ | 🟢 READY |

**轻车道**:L3 = N/A;L1 ✅ + L2 ✅/🟡 + proof 过 = 🟢;Item 1.5 不变量反核命中 = 🟡(误分类,补全道 spec)。Current-truth 矛盾 = 至少 🟡。

- 🟢:附 commit message 草稿(`feat(<scope>): <title>` + spec §1 摘要);**若 current truth 更新 pending,显式提示下一步 `/feature-archive <slug>`,不能省**;否则提醒"合并后可攒进下次 `/feature-archive` 清扫"
- 🟡:blockers 按 impact 排序;commit 草稿显式标注 known deviations(供用户带 deviations 上线)
- 🔴:必修项 + "Re-run `/project-workflow:feature-done <slug>` after fixes."

## Notes

- **不自动 commit / 不自动 fix**:review 层全 read-only,本 skill 只聚合 + 写 proof bundle(+ READY 翻 spec 状态行)
- **幂等**:重跑产出相同结果(除测试 timing);这就是"局部复查"的入口 —— 有效缓存自动复用,只重算失效层
- **READY ≠ 关闭**:每个已交付 feature 最终都由 `/feature-archive` 移入 `docs/specs/changes/archive/`(清扫模式批量,不必逐个);current truth pending 的 feature 归档时必须完成合并,不能静默跳过(canonical spec 的 verdict 语义)
