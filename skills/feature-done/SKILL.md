---
name: feature-done
description: One-shot end-of-feature gate. Runs L1 (mechanical checks) → L2 (AGENTS.md compliance) → L3 (spec.md compliance) → proof-bundle in sequence, aggregates results, gives a single READY/NEEDS WORK/BLOCKED verdict. Replaces manually running the four steps.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, verdict explanations, suggested commit message hints. Sub-skills/agents called from here inherit the same rule. Code, commands, file paths stay as-is.

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

## Step 2 — Cache check (skip re-running if code unchanged since last review)

If L2/L3/proof-bundle have already been run in this session (visible in conversation history) **and code hasn't changed since**, reuse those results instead of re-running. This makes `/feature-done` idempotent and cheap to re-invoke.

**Cache invalidation conditions** (re-run the affected step if any are true):
1. User explicitly requested re-run (`/feature-done <slug> --fresh` or similar wording)
2. `git status --short` shows modified files in scope since last review timestamp
3. Last review was > 24 hours ago
4. Conversation context shows code edits (Edit / Write tool calls) on scoped files after the last review

**For each step**, decide independently: L1 should usually re-run (cheap, ~10s); L2/L3 typically reuse if cache valid (~1-6 min agent calls saved).

**Always do** `git status --short` at start to know what actually changed. Document the decision in your report header:

```
L1: fresh (always re-run)
L2: 复用 (~1 min agent run earlier this session, no scoped changes since)
L3: 复用 (~6 min agent run earlier this session, no scoped changes since)
proof-bundle: re-run (writes tasks.md, so always re-run to refresh)
```

## Step 3 — L1 mechanical checks (almost always fresh)

Invoke the L1 skill internally (or duplicate its logic):
- Find check command in AGENTS.md
- Run it
- Parse pass/fail

**If L1 red**: STOP. Output failing items + "Fix L1 before running L2/L3." Return verdict 🔴 BLOCKED.

**If L1 green**: continue.

## Step 4 — L2 AGENTS.md compliance (reuse if cache valid per Step 2)

Invoke L2 skill (which calls `agents-md-reviewer` agent):
- Find AGENTS.md files relevant to changed files
- Pass scope + AGENTS.md to agent
- Get findings

**If L2 has 🔴 violations**: continue but note in final verdict.

**If L2 clean or only partials**: continue.

## Step 5 — L3 spec.md compliance (reuse if cache valid per Step 2)

Invoke L3 skill (which calls `spec-reviewer` agent):
- Pass spec.md, plan.md, tasks.md, changed-files scope to agent
- Get findings

**Always continue to proof-bundle**, regardless of L3 result (proof bundle records it).

## Step 6 — proof-bundle (always fresh — writes tasks.md)

Invoke proof-bundle skill:
- Compute diff summary
- Aggregate L1/L2/L3 results from above (don't re-run)
- Write to tasks.md

## Step 7 — Aggregate report

Single consolidated report (not 4 separate ones):

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

## Step 8 — Verdict logic

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
- **Re-running is cheap** thanks to the Step 2 cache check. Encourage user to re-run after fixes — only changed steps will re-execute.
- **ROI-ranked action list**: when verdict is 🟡, rank suggested actions by impact (highest-leverage fix first, e.g., "config change that unblocks coverage gate" before "1-line AGENTS.md edit"). Include estimated time per action when known.
- **Conditional commit message hint**: even on 🟡, if user might want to ship despite blockers, offer a draft commit message that explicitly notes the known deviations and where context lives (e.g., proof bundle path).
