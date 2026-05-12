---
name: proof-bundle
description: Verify a feature's proof bundle is complete — tests passing, L1/L2/L3 reviewed, diff summary, drift suggestions. Fills/updates the Proof Bundle section at the bottom of tasks.md. Use at end of P2 feature delivery.
---

# Proof Bundle

Proof bundle = the **end-of-feature delivery checklist**. Borrowed from openai/symphony's "manage work, not agents" principle: verify the work produced the right outputs, not that the agent followed the right process.

The template (from `template/docs/specs/_template/tasks.md` § Proof Bundle):

```
- [ ] Diff 摘要:(新建/改了什么)
- [ ] Tests:<X>/<Y> passed, coverage <Z>%
- [ ] L2 合规(reviewer 提供 AGENTS.md 作 context 跑过):
- [ ] L3 合规(reviewer 提供 spec.md 作 context 跑过):
- [ ] AGENTS.md drift 建议(如有):
- [ ] 开放问题(如有):
```

This skill **verifies** these items and **fills them in** at the bottom of `tasks.md`.

User input: `$ARGUMENTS` — feature slug or "current"

## Step 1 — Locate the feature

Same logic as `/l3-review`:

| Input | Resolution |
|---|---|
| `<slug>` | `docs/specs/<NNN>-<slug>/` |
| `current` or empty | most-recent `docs/specs/<NNN>-*/` |
| `<full-path>` | use directly |

Verify all three files exist: spec.md, plan.md, tasks.md.

## Step 2 — Compute each proof bundle item

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

### Item 5: AGENTS.md drift 建议

Compare project's AGENTS.md against actual implementation. Look for:

- Things in code that violate AGENTS.md → not drift (that's an L2 issue)
- Things in code that AGENTS.md **doesn't mention but should** (e.g., new module pattern not documented) → drift suggestion
- Commands changed in `package.json` but not reflected in AGENTS.md `Commands` section → drift

Output: 0-3 bullets. If nothing, write "无 (none)".

### Item 6: 开放问题

Read tasks.md `## 实施记录` and `## 未决` sections (if present). Any item still pending or marked TODO → list here.

Also include any spec ambiguities the L3 reviewer flagged.

## Step 3 — Write to tasks.md

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
- [x] **AGENTS.md drift 建议**: 后端 AGENTS.md 应该提一句 "新 module 的 templates/ 目录(如有)放 jinja2 模板,不要混进 schemas/"。
- [x] **开放问题**: SMTP 限速(slowapi)上线前要补,见 plan.md §4 风险 + backlog
```

Use the user's Edit tool to update tasks.md atomically — single edit replacing the proof-bundle section.

## Step 4 — Report back

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
| AGENTS.md drift | <0/N suggestions> |
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
