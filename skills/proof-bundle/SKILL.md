---
name: proof-bundle
model: sonnet
description: Verify a feature's proof bundle is complete — tests passing, L1/L2/L3 reviewed, diff summary, drift suggestions. Fills/updates the Proof Bundle section at the bottom of tasks.md. Use at end of P2 feature delivery.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions. Tasks.md proof-bundle section content follows the existing language used in that tasks.md file (preserve consistency). Code, commands, file paths stay as-is.

# Proof Bundle

Proof bundle = end-of-feature delivery checklist。

**Use when**: P2 endpoint, after L1 + L2 + L3 are run. Typically invoked by `/feature-done` (Step 6) as the final assembly step, but standalone-runnable.
**Not for**: replacing the individual reviews (use `/l1-review` / `/l2-review` / `/l3-review`) / pre-implementation spec quality check (use `/spec-quality-check`).

> Full P2 flow: [workflow.md §3.0](../../docs/workflow.md#30-p2-流程全景skill-视角).

The template (from `template/docs/specs/_template/tasks.md` § Proof Bundle):

```
- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:`<X>/<Y>` passed, coverage `<Z>%`
- [ ] L1 合规
- [ ] L2 合规(reviewer 提供 AGENTS.md 作 context 跑过)
- [ ] L3 合规(reviewer 提供 spec.md 作 context 跑过)
- [ ] AGENTS.md 实际改动审计(item 5a)
- [ ] AGENTS.md drift 建议(item 5b)
- [ ] 开放问题(如有)
```

This skill **verifies** these items and **fills them in** at the bottom of `tasks.md`.

User input: `$ARGUMENTS` — feature slug or "current"

## Step 1 — 定位 feature

跟 `/l3-review` 同逻辑:

| 输入 | 处理 |
|---|---|
| `<slug>` | `docs/specs/<NNN>-<slug>/` |
| `current` 或空 | 最近的 `docs/specs/<NNN>-*/` |
| `<full-path>` | 直接用 |

校验文件:`tasks.md` 必在。**车道判定**:`spec.md` 存在 = 全道;缺失 = **轻车道**(只 tasks.md,见 [spec-driven.md §3.2.5](../../docs/spec-driven.md#325-轻车道小改免-frozen-spec--plan))—— 轻车道下 L3 跳过、增不变量反核(见 Item 1.5 / Item 4)。

## Step 2 — Review result intake + 缓存校验

Proof bundle 优先**复用**本 session 或 `/feature-done` 刚产生的 L1 / L2 / L3 结果:

| Review | 默认行为 |
|---|---|
| L1 | 复用最近一次 `/l1-review` 或 `/feature-done` Step 3 的结果;若缺失,提示用户先跑 `/l1-review` 或确认由本 skill 跑测试子集 |
| L2 | 复用最近一次 `/l2-review` 或 `/feature-done` Step 4 的结果;缓存失效才 fresh 跑 |
| L3 | 复用最近一次 `/l3-review` 或 `/feature-done` Step 5 的结果;缓存失效才 fresh 跑 |

本 skill 的主责是**装配和写入证据**,不是替代 L1/L2/L3。Standalone 运行时可以补跑缺失项,但必须在报告头部声明哪些是 reused,哪些是 fresh。

复用本 session 早期 L2 / L3 findings 之前,**必须确认仍然有效**。

**L2**(A 类约定合规)缓存有效性:

1. 跑 `git status --short`
2. **以下任一文件在上次 L2 之后改动过 → 重跑 /l2-review fresh,不复用**:
   - `AGENTS.md`(root + tier-level:`backend/AGENTS.md` / `frontend/AGENTS.md`)
   - `.claude/rules/*.md`
   - `docs/gotchas.md`(若存在)
   - scope 内任何源代码文件(实施)
3. **特例**:若 project scope(如刚加但还没 `git add` 的 sub-project 目录)**整体 untracked**(`?? <dir>/` 出现在 git status —— 整目录还没进 git),`git status` 看不到目录内部变化。**这种情况强制 fresh 跑 L2**,因为 git 无法跟踪 untracked 目录内的变化。必要时退到 file mtime 比对:
   ```bash
   find <scope> -name "AGENTS.md" -o -name "*.md" -newer <last-review-marker> 2>/dev/null
   ```

**L3**(spec.md 合规)缓存有效性:

1. 同样的 `git status` 检查
2. **若 `docs/specs/<NNN>-<slug>/spec.md` / `plan.md` / `tasks.md` 改动过**,或 scope 内任何实施文件改动 → **重跑 /l3-review fresh**
3. 同 L2 的 untracked 特例

确实复用 → **在报告头部显式声明**:"L2 reused from earlier run in this session (no scoped changes detected by git status / mtime)"。**不要静默复用**。

## Step 3 — 计算每个 proof bundle 项

### Item 1: Diff 摘要

用 git 取结构化 diff 摘要:

```bash
git diff --stat HEAD~N HEAD  # 若能从 commit history 判 N
# OR
git diff --stat <base-branch>...HEAD
# OR
git status --short  # uncommitted scope
```

格式:`<N> files changed, <X> additions(+), <Y> deletions(-)`。然后**分类**列:
- **New**:<count> 新文件(top 5 路径)
- **Modified**:<count> 修改文件
- **Deleted**:<count> 删除文件

简短(5-10 行)。

### Item 1.5: 轻车道不变量反核(仅轻车道,§3.2.5 安全闸 2)

仅当本 feature 是**轻车道**(Step 1 判定无 spec.md):用 Item 1 的实际改动文件列表 grep 根 `AGENTS.md`「灾难性不变量 / 高爆破半径路径」节声明的 glob。**命中** → 报:

```
🚨 轻车道误分类:实际改动触达不变量路径 <path> —— 本 feature 应走全道。
   停止轻车道交付,重跑 /feature-init 选全道补 spec.md + §4 验证。
```

→ Overall verdict 至少 NEEDS WORK。无声明节 / 未命中 / 全道 feature → 跳过本项。

### Item 2: Tests <X>/<Y> passed, coverage <Z>% + L1 合规

优先复用 L1 结果:

- 若 `/feature-done` 或 `/l1-review` 刚跑过且缓存有效,直接写入其 tests / coverage / L1 verdict
- 若没有 L1 结果,从 AGENTS.md 读项目 `check` 命令(同 `/l1-review`)并询问用户是否允许本 skill 跑测试子集
- 不静默跑完整 L1;完整机械检查归 `/l1-review`

用户确认本 skill 补跑测试子集时:

```bash
<test-command>  # 如 `pnpm be:test:cov`
```

解析输出:
- 总 passed / total / skipped
- coverage 百分比(若有)

若无法确定测试命令或用户不允许补跑,Item 2 / L1 合规写为 "缺失:请先跑 `/project-workflow:l1-review`",总体 verdict 至少为 NEEDS WORK。

### Item 3: L2 合规

调 `/project-workflow:l2-review <slug>`(或直接调 agents-md-reviewer agent)。取 verdict:

- ✅ "Clean (no violations)" 或
- 🟡 "N partial, no critical" 或
- 🔴 "<N> violations —— 列单行摘要"

### Item 4: L3 合规

**轻车道(无 spec.md)→ L3 跳过**,写 `L3: N/A(轻车道无 frozen spec)`;全道按下:

同样模式,调 `spec-reviewer` agent(或 `/project-workflow:l3-review <slug>`):

- ✅ "Spec match — N items verified, 0 missing/deviation"
- ⚠️ "N deviations from spec.md(各 1 行)"

**L2 + L3 去重**:同一行同根因 → 以 L3 为准 + L2 标 "also flagged by L2";不同根因 → 两条都保留(workflow.md §6.4)。

### Item 5a: A 类约定触动汇总(本 feature 实际改了哪几份)

A 类 = AGENTS.md 多层 + `.claude/rules/*.md`(workflow §0.3 / §1.3)。

**计算方法**:

```bash
# 找出本 feature 触动的 A 类约定文件(AGENTS.md / CLAUDE.md / .claude/rules/*.md)
git diff --name-only <base>...HEAD 2>/dev/null | grep -E "(^|/)(AGENTS|CLAUDE)\.md$|^\.claude/rules/.*\.md$"
# 未 commit 的 scope:
git status --short | awk '{print $2}' | grep -E "(^|/)(AGENTS|CLAUDE)\.md$|^\.claude/rules/.*\.md$"
```

**按四档分类**:

| 档 | 路径模式 | 例 |
|---|---|---|
| **root** | `./AGENTS.md` 或 `./CLAUDE.md` | 项目根 |
| **tier** | `<tier>/AGENTS.md`(deep 2) | `backend/AGENTS.md` / `frontend/AGENTS.md` |
| **module** | `<tier>/<...>/<module>/CLAUDE.md`(deep ≥ 3) | `backend/src/email/CLAUDE.md` |
| **path-rule** | `.claude/rules/<topic>.md` | `.claude/rules/code-style.md` / `.claude/rules/fastapi.md` |

**每份标注分类**(Align / Deviate / Codify):
- 若 `plan.md §1.1 Sibling Alignment` 节里**显式声明了**该 module 的决策 → 用那个
- 否则 → "未声明",建议用户后续在 plan.md 补声明或解释

**输出格式**(0-N 行):

```markdown
- **scaffold-v2/backend/AGENTS.md** (tier) — Codify: 加 "业务 vs infra module" 区分(本 feature 002 引入 `email/` infra,plan.md §1.1 声明 Codify)
- **scaffold-v2/AGENTS.md** (root) — 未声明:工程坑指针修复(死链),建议补 plan.md §1.1 标 Align
- **.claude/rules/fastapi.md** (path-rule) — 未声明:新加 "templates/ 目录约定";建议补 plan.md §1.1
- **(无 module CLAUDE.md 触动)**
```

若完全无 A 类约定改动:写 "无 (none)"。

### Item 5b: A 类约定 drift 建议(L2 提议但未应用)

L2 review 跑完会有"建议加规则但未落地"的 finding。这里抽出来跟 Item 5a(已应用)区分。

把项目 A 类约定(AGENTS.md 多层 + `.claude/rules/`)跟实际 impl 对照,看:

- 代码里违反 AGENTS.md / `.claude/rules/` 的 → 不是 drift(那是 L2 issue)
- 代码里出现但 A 类约定**没提该提的**(如新 module pattern 未文档化、新 framework 约定不在 `.claude/rules/<framework>.md`)→ drift 建议
- `package.json` 里命令变了但 AGENTS.md `Commands` 没同步 → drift

输出:0-3 个 bullet。无则写 "无 (none)"。

**末尾 hint(重现感知,基于 ledger)**:

对本 feature 每条 5b 建议算语义指纹(`drift-5b|<文件类别>|<主题slug>`),upsert 到 `.claude/drift-ledger.json`(不存在则创建,结构 `{fingerprint: {occurrences:[NNN…], last_seen}}`):append 当前 feature NNN 到 `occurrences`、更新 `last_seen`。然后:

- 本 feature 任一 5b 指纹 `occurrences ≥ 2`(同一缺口又来了)→ hint:
  ```
  🔁 「<gist>」已在 <NNN,NNN,…> 共 N 个 feature 重现。别再逐 feature 重登 —— codify 它:
     · 客观漂移(命令/版本/路径)→ /project-workflow:agents-md-revise
     · 模式该文档化(module/framework 约定)→ /project-workflow:spec-revise 或手改 AGENTS.md/rules
  ```
- 无则不输出。

> codify 后该缺口不再被列 5b,指纹自然停增 —— 无需额外 status / 老化逻辑。

### Item 6: 开放问题

读 tasks.md 的 `## 实施记录` 和 `## 未决` 节(若有)。仍 pending 或 TODO 的项 → 列在这里。

同时收 L3 reviewer flagged 的 spec ambiguities。

## Step 4 — 写入 tasks.md

打开 `<feature-dir>/tasks.md`,找文件末尾的 `## Proof Bundle` 节。**replace** checklist 为填好的值(保留 checkboxes)。

填好的示例:

```markdown
## Proof Bundle(完成时填,P2.3 端点交付)

- [x] **Diff 摘要**: 21 files changed, +1843 / -127.
  - New: backend/src/email/{service.py, templates/*}, alembic/versions/2026_05_13_*, frontend/src/modules/auth/{VerifyEmailView,RegisterSentView}.vue
  - Modified: backend/src/auth/{models,schemas,service,router}.py, frontend/src/modules/auth/{api,RegisterView,LoginView}.ts/vue, docker-compose.yml
- [x] **Tests**: 25/25 passed, coverage 84% (auth: 89%, email: 78%)
- [x] **L2 合规**: ✅ Clean — 0 violations across 21 files (checked against backend/AGENTS.md, frontend/AGENTS.md, docs/gotchas.md)
- [x] **L3 合规**: ⚠️ 1 deviation — spec §3 says "token URL-safe ≥ 32 bytes" but actual is `secrets.token_urlsafe(24)` → 32 chars output but 24 bytes entropy. Action: either bump to `(32)` or update spec to "≥ 24 bytes / ≥ 32 chars".
- [x] **AGENTS.md 触动汇总(Item 5a)**:
  - **backend/AGENTS.md** (tier) — Codify: 加 "业务 vs infra module" 区分(plan.md §1.1 已声明 Codify)
  - **AGENTS.md** (root) — 未声明:工程坑指针修复
  - (无 module CLAUDE.md 触动)
- [x] **AGENTS.md drift 建议(Item 5b,未应用)**: 后端 AGENTS.md 应该提一句 "新 module 的 templates/ 目录(如有)放 jinja2 模板,不要混进 schemas/"。
- [x] **开放问题**: SMTP 限速(slowapi)上线前要补,见 plan.md §4 风险 + backlog
```

用 Edit 工具 atomic 更新 tasks.md —— 单次 edit 替换整个 proof-bundle 节。

## Step 5 — 报告

tasks.md 更新后,输出:

```
## /project-workflow:proof-bundle — <feature-slug>

📋 Proof bundle written to <tasks.md path>.

| Item | Status |
|---|---|
| Diff 摘要 | ✅ <N> files, +<X>/-<Y> |
| Tests | ✅ <X>/<Y> passed, coverage <Z>% |
| L2 合规 | <status> |
| L3 合规 | <status> |
| A 类约定触动(5a,已改) | <K> 份(root/tier/module/path-rule) |
| A 类约定 drift(5b,待改) | <0/N suggestions> |
| 开放问题 | <0/N> |

Overall: **<🟢 READY / 🟡 NEEDS WORK / 🔴 BLOCKED>**

<If READY:>
Next: commit + open PR. tasks.md proof bundle is already filled — use it as the PR body summary.

<If NEEDS WORK / BLOCKED:>
Address the items marked above and re-run `/project-workflow:proof-bundle`.

<If 本 feature 任一 5b 指纹 occurrences ≥ 2(重现):>
🔁 「<gist>」已在 <NNN,…> 共 N 个 feature 重现 —— codify 它(客观漂移→agents-md-revise;模式→spec-revise/手改),别再重登。
```

Verdict 判定逻辑:
- 🟢 READY = 6 项全过(tests 过、L2/L3 clean 或仅 minor partials、drift 建议是可选)
- 🟡 NEEDS WORK = L3 有 deviation 或 scope creep,用户需 reconcile
- 🔴 BLOCKED = tests 失败 或 L2 critical violations

## Notes

- **不自动 fix 任何东西**。L2/L3 找到问题也只是报,用户修
- **不 commit 任何东西**。本 skill 只把 proof bundle 写进 tasks.md + 报告
- **幂等**:跑两次应该产出相同结果(除测试 re-run 的 timing 差异)
