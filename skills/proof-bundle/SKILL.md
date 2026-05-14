---
name: proof-bundle
description: Verify a feature's proof bundle is complete — tests passing, L1/L2/L3 reviewed, diff summary, drift suggestions. Fills/updates the Proof Bundle section at the bottom of tasks.md. Use at end of P2 feature delivery.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions. Tasks.md proof-bundle section content follows the existing language used in that tasks.md file (preserve consistency). Code, commands, file paths stay as-is.

# Proof Bundle

Proof bundle = the **end-of-feature delivery checklist**. Borrowed from openai/symphony's "manage work, not agents" principle: verify the work produced the right outputs, not that the agent followed the right process.

The template (from `/feature-init` SKILL.md inline tasks.md § Proof Bundle):

```
- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:<X>/<Y> passed, coverage <Z>%
- [ ] L2 合规(reviewer 提供 AGENTS.md 作 context 跑过):
- [ ] L3 合规(reviewer 提供 spec.md 作 context 跑过):
- [ ] AGENTS.md 触动汇总(本 feature 实际改了哪几份):
- [ ] AGENTS.md drift 建议(L2 提议但未应用,如有):
- [ ] 开放问题(如有):
```

This skill **verifies** these items and **fills them in** at the bottom of `tasks.md`.

> **Item 5a vs 5b 的区分**:5a 是 audit(已发生改动),5b 是 backlog(待处理建议)。早期版本把两者混成单条 "AGENTS.md drift 建议",用户无法区分 "我已改了什么" vs "还需改什么" —— v2.3.6 起拆开。

User input: `$ARGUMENTS` — feature slug or "current"

## Step 1 — Locate the feature

Same logic as `/l3-review`:

| Input | Resolution |
|---|---|
| `<slug>` | `docs/specs/<NNN>-<slug>/` |
| `current` or empty | most-recent `docs/specs/<NNN>-*/` |
| `<full-path>` | use directly |

Verify all three files exist: spec.md, plan.md, tasks.md.

## Step 2 — Cache invalidation check before reusing L2/L3 findings

Before reusing L2/L3 findings from earlier in this session, **verify they're still valid**. Stale findings caused multiple bugs in v2.1.x development; this step is mandatory.

For **L2** (AGENTS.md compliance) cache validity:

1. Run `git status --short`
2. **If any of these files changed since the previous L2 run**, **re-run /l2-review fresh**, don't reuse:
   - `AGENTS.md` (root + tier-level: `backend/AGENTS.md` / `frontend/AGENTS.md`)
   - `.claude/rules/*.md`
   - `docs/gotchas.md` (if exists)
   - Any source files in scope (the implementation)
3. **Special case**: if the project scope (e.g., a sub-project directory freshly added but not yet `git add`ed) is **fully untracked** (`?? <dir>/` in git status — entire directory not in git yet), `git status` won't show inner file changes. **In this case, always force fresh L2 run** since git can't track changes within untracked directories. Fall back to file mtime comparison if needed:
   ```bash
   find <scope> -name "AGENTS.md" -o -name "*.md" -newer <last-review-marker> 2>/dev/null
   ```

For **L3** (spec.md compliance) cache validity:

1. Same `git status` check
2. **If `docs/specs/<NNN>-<slug>/spec.md` or `plan.md` or `tasks.md` changed** OR any implementation file in scope changed, **re-run /l3-review fresh**
3. Same untracked-directory rule as L2

If you do reuse, **state explicitly in the report header**: "L2 reused from earlier run in this session (no scoped changes detected by git status / mtime)". Don't reuse silently.

## Step 3 — Compute each proof bundle item

### Item 1: Diff 摘要

Use git to get a structured diff summary:

```bash
git diff --stat HEAD~N HEAD  # if you can determine N from commit history
# OR
git diff --stat <base-branch>...HEAD
# OR
git status --short  # for uncommitted scope
```

Format: `<N> files changed, <X> additions(+), <Y> deletions(-)`. Then list **categorized**:
- **New**: <count> new files (top 5 paths)
- **Modified**: <count> modified files
- **Deleted**: <count> deleted files

Keep concise (5-10 lines).

### Item 2: Tests <X>/<Y> passed, coverage <Z>%

Read project's `check` command from AGENTS.md (same as `/l1-review`). Run **only** the test part:

```bash
<test-command>  # e.g., `pnpm be:test:cov`
```

Parse output for:
- Total passed / total / skipped
- Coverage percentage (if shown)

If user already ran `/l1-review` and it's still green, you can reuse that result and skip re-running. Otherwise run fresh.

### Item 3: L2 合规

Invoke `/project-workflow:l2-review <slug>` (or call the agents-md-reviewer agent directly). Capture the verdict:

- ✅ "Clean (no violations)" or
- 🟡 "N partial, no critical" or
- 🔴 "<N> violations — list them here as 1-line summaries"

### Item 4: L3 合规

Same pattern, invoking `spec-reviewer` agent (or `/project-workflow:l3-review <slug>`):

- ✅ "Spec match — N items verified, 0 missing/deviation"
- ⚠️ "N deviations from spec.md (list each as 1 line)"

### Item 5a: AGENTS.md 触动汇总(本 feature 实际改了哪几份)

**Why this section exists**:feature 实施期常顺手改 AGENTS.md(Boundaries / 模块结构 / 框架约定),但用户改完代码后**容易忘记自己改了哪几份**。本节给出显式 audit,让 reviewer / 自己复盘时能一眼看到。

**How to compute**:

```bash
# 找出本 feature 触动的 AGENTS.md / CLAUDE.md 文件
git diff --name-only <base>...HEAD 2>/dev/null | grep -E "(^|/)(AGENTS|CLAUDE)\.md$"
# 或对未 commit 的 scope:
git status --short | awk '{print $2}' | grep -E "(^|/)(AGENTS|CLAUDE)\.md$"
```

**按三档分类**:

| 档 | 路径模式 | 例 |
|---|---|---|
| **root** | `./AGENTS.md` 或 `./CLAUDE.md` | 项目根 |
| **tier** | `<tier>/AGENTS.md`(deep 2) | `backend/AGENTS.md` / `frontend/AGENTS.md` |
| **module** | `<tier>/<...>/<module>/CLAUDE.md`(deep ≥ 3) | `backend/src/email/CLAUDE.md` |

**每份标注分类**(Align / Deviate / Codify):
- 若 `plan.md §1.1 Sibling Alignment` 节里**显式声明了**该 module 的决策 → 用那个
- 否则 → "未声明",建议用户后续在 plan.md 补声明或解释

**输出格式**(0-N 行):

```markdown
- **scaffold-v2/backend/AGENTS.md** (tier) — Codify: 加 "业务 vs infra module" 区分(本 feature 002 引入 `email/` infra,plan.md §1.1 声明 Codify)
- **scaffold-v2/AGENTS.md** (root) — 未声明:工程坑指针修复(死链),建议补 plan.md §1.1 标 Align
- **(无 module CLAUDE.md 触动)**
```

若**完全没有 AGENTS.md 改动**(纯实施 feature 不动规则):写 "无 (none) — 本 feature 完全在现有 AGENTS.md 框架内,未触动任何规则文件"。

### Item 5b: AGENTS.md drift 建议(L2 提议但未应用)

L2 review 跑完会有"建议加规则但未落地"的 finding。这里抽出来跟 Item 5a(已应用)区分。

Compare project's AGENTS.md against actual implementation. Look for:

- Things in code that violate AGENTS.md → not drift (that's an L2 issue)
- Things in code that AGENTS.md **doesn't mention but should** (e.g., new module pattern not documented) → drift suggestion
- Commands changed in `package.json` but not reflected in AGENTS.md `Commands` section → drift

Output: 0-3 bullets. If nothing, write "无 (none)"。

**跟 Item 5a 的区分**:5a = 已经改了的,5b = 还没改但建议改的。Item 5a 是 audit(已发生),Item 5b 是 backlog(待处理)。

### Item 6: 开放问题

Read tasks.md `## 实施记录` and `## 未决` sections (if present). Any item still pending or marked TODO → list here.

Also include any spec ambiguities the L3 reviewer flagged.

## Step 4 — Write to tasks.md

Open `<feature-dir>/tasks.md`. Find the `## Proof Bundle` section near the end. **Replace** the checklist with filled-in values (keep the checkboxes).

Example filled version:

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

Use the user's Edit tool to update tasks.md atomically — single edit replacing the proof-bundle section.

## Step 5 — Report back

After updating tasks.md, output:

```
## /project-workflow:proof-bundle — <feature-slug>

📋 Proof bundle written to <tasks.md path>.

| Item | Status |
|---|---|
| Diff 摘要 | ✅ <N> files, +<X>/-<Y> |
| Tests | ✅ <X>/<Y> passed, coverage <Z>% |
| L2 合规 | <status> |
| L3 合规 | <status> |
| AGENTS.md 触动(5a,已改) | <K> 份(root/tier/module) |
| AGENTS.md drift(5b,待改) | <0/N suggestions> |
| 开放问题 | <0/N> |

Overall: **<🟢 READY / 🟡 NEEDS WORK / 🔴 BLOCKED>**

<If READY:>
Next: commit + open PR. tasks.md proof bundle is already filled — use it as the PR body summary.

<If NEEDS WORK / BLOCKED:>
Address the items marked above and re-run `/project-workflow:proof-bundle`.
```

Verdict logic:
- 🟢 READY = all 6 items resolved (tests pass, L2/L3 clean or only minor partials, drift suggestions are optional)
- 🟡 NEEDS WORK = L3 deviations or scope creep present; user must reconcile
- 🔴 BLOCKED = tests failing OR L2 critical violations

## Notes

- **Don't auto-fix anything**. Even if L2/L3 find issues, this skill only reports. User fixes.
- **Don't commit anything**. Just write the proof bundle into tasks.md and report.
- **Idempotent**: running this twice should produce same output (modulo test re-runs).
- This skill is **the natural exit point** of P2 (feature dev). After this, the user commits + opens PR.
