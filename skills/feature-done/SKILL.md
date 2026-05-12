---
name: feature-done
description: One-shot end-of-feature gate. Runs L1 (mechanical checks) → L2 (AGENTS.md compliance) → L3 (spec.md compliance) → proof-bundle in sequence, aggregates results, gives a single READY/NEEDS WORK/BLOCKED verdict. Replaces manually running the four steps.
---

# Feature Done

Composite skill: chains L1 → L2 → L3 → proof-bundle for end-of-P2 delivery verification.

The motivation: humans skip steps. If you forget L2, you ship code that violates project conventions. If you forget L3, you ship something that doesn't match spec. This skill makes "all four checks" a one-line action.

User input: `$ARGUMENTS` — feature slug or "current"

## Step 1 — Resolve feature

Same logic as `/l3-review` and `/proof-bundle`:

| Input | Resolution |
|---|---|
| `<slug>` | `docs/specs/<NNN>-<slug>/` |
| `current` or empty | most-recent `docs/specs/<NNN>-*/` |

Verify spec.md exists. If not: "No spec found. Run `/project-workflow:spec-init <slug>` first."

## Step 2 — Run sequence

Execute these in order. **Stop early** if a fatal step fails (configurable below).

### 2.1 L1 — mechanical checks

Invoke the L1 skill internally (or duplicate its logic):
- Find check command in AGENTS.md
- Run it
- Parse pass/fail

**If L1 red**: STOP. Output failing items + "Fix L1 before running L2/L3." Return verdict 🔴 BLOCKED.

**If L1 green**: continue.

### 2.2 L2 — AGENTS.md compliance

Invoke L2 skill (which calls `agents-md-reviewer` agent):
- Find AGENTS.md files relevant to changed files
- Pass scope + AGENTS.md to agent
- Get findings

**If L2 has 🔴 violations**: continue but note in final verdict.

**If L2 clean or only partials**: continue.

### 2.3 L3 — spec.md compliance

Invoke L3 skill (which calls `spec-reviewer` agent):
- Pass spec.md, plan.md, tasks.md, changed-files scope to agent
- Get findings

**Always continue to proof-bundle**, regardless of L3 result (proof bundle records it).

### 2.4 proof-bundle

Invoke proof-bundle skill:
- Compute diff summary
- Aggregate L1/L2/L3 results from above (don't re-run)
- Write to tasks.md

## Step 3 — Aggregate report

Single consolidated report (not 4 separate ones):

```markdown
## /project-workflow:feature-done — <feature-slug>

🏁 End-of-feature gate complete. Total time: <Ns>.

### L1 — Mechanical (<duration>)
<one-line: ✅ all green / ❌ N failures listed below>

### L2 — AGENTS.md compliance (<duration>)
<one-line: ✅ no violations / 🟡 N partials / 🔴 N violations>

<if 🔴/🟡, list the worst 3 findings>

### L3 — Spec compliance (<duration>)
<one-line: ✅ N items verified, 0 deviations / ⚠️ N deviations / ❌ N missing>

<if any, list each as 1 line with file:line>

### Proof Bundle written to <tasks.md path>
- Tests: X/Y passed, coverage Z%
- Diff: <N> files, +<X>/-<Y>
- Drift suggestions: <count>
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
```

## Step 4 — Verdict logic

| L1 | L2 | L3 | Verdict |
|---|---|---|---|
| ❌ | * | * | 🔴 BLOCKED |
| ✅ | 🔴 (violations) | * | 🟡 NEEDS WORK |
| ✅ | 🟡 (partials) | ❌ missing items | 🟡 NEEDS WORK |
| ✅ | 🟡 / ✅ | ⚠️ deviations | 🟡 NEEDS WORK |
| ✅ | ✅ | ✅ | 🟢 READY |

Spec scope creep (🚫) = 🟡 NEEDS WORK (user reconciles by either trimming impl or updating spec §2).

## Notes

- **This is the canonical "I'm done" command**. After this, user just needs to git commit + push.
- **Don't auto-commit**. Even on 🟢 READY, leave commit to the user.
- **Don't auto-fix**. Each underlying skill (L1/L2/L3) is read-only; this skill aggregates them.
- **Parallelizable later**: L2 and L3 could run in parallel (they don't depend on each other). v2.1.0 runs them sequentially for simplicity; revisit if user reports slowness.
- **Re-running** is cheap (most skills are deterministic on same input). Encourage user to re-run after fixes.
