---
name: feature-done
description: Run the Codex end-of-feature project-workflow gate with L1 mechanical checks, L2 project convention review, L3 spec compliance review, proof bundle update, and a single READY or NEEDS WORK or BLOCKED verdict. Use when implementation is complete and the feature is ready for final verification before commit or PR.
---

# Feature Done

Match the user's language in natural-language output. This is the Codex adapter for the P2 delivery action in bundled `../../docs/workflow.md §3.3`.

Canonical action spec: `../../docs/actions/feature-done.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Locate the feature.
   - Accept `<slug>`, `<NNN>`, `<NNN>-<slug>`, a full path, `current`, or no argument.
   - With no argument/current, use the latest `docs/specs/<NNN>-*/` (excluding `archive/`).
   - Require `tasks.md`.
   - Full lane: `spec.md` exists. Light lane: no `spec.md`; L3 is N/A but proof still checks invariants.

2. Inspect current changes.
   - Run `git status --short`.
   - Identify changed files in or related to the feature scope.
   - If the repository has no git metadata, continue with best-effort diff summary from file paths and user context.

3. L1 mechanical checks.
   - Find the project check command from `AGENTS.md` or obvious package scripts/Makefile commands.
   - Prefer one project-level command that covers lint/type/test.
   - If no command is documented, mark L1 `NEEDS WORK` with "check command missing" instead of inventing one.
   - If the command fails, stop the gate and return `BLOCKED`.

4. L2 project convention review.
   - Prefer a separate Codex subagent running `../../docs/reviewers/agents-md-reviewer.md`; otherwise run the review in the main session.
   - Read root and relevant nested `AGENTS.md`.
   - Also read scoped guidance if present: nested `AGENTS.md` and explicit rule sections first; `.claude/rules/` only as a Claude-adapter compatibility source.
   - Review changed files against project conventions.
   - Classify findings as critical violations, non-critical partials, or clean.

5. L3 spec compliance review.
   - Prefer a separate Codex subagent running `../../docs/reviewers/spec-reviewer.md`; otherwise run the review in the main session.
   - Full lane: compare implementation and changed files against `spec.md`, `plan.md`, and `tasks.md`.
   - Look for missing outcomes, deviations, scope creep, and verification gaps.
   - Light lane: mark L3 `N/A`, then perform the light-lane invariant reverse check from `tasks.md`; if high-blast-radius/invariant paths were touched, verdict is at least `NEEDS WORK` and the feature should be upgraded to full lane.

5.5. Current-truth check (only when `docs/current/` exists).
   - If the feature touches an area with a `docs/current/<area>.md`, compare delivered behavior against it.
   - Contradiction without a declared deviation: verdict at least `NEEDS WORK`, list the conflicting statements.
   - Durable behavior changed: record "current truth update pending → run `$feature-archive`" in the proof bundle. Do not skip this line silently.
   - No `docs/current/`: record `current truth: N/A`.

6. Write or refresh the proof bundle.
   - Update `tasks.md ## Proof Bundle`.
   - Include diff summary, L1/L2/L3 results, current-truth status, test evidence, AGENTS/rule drift suggestions, and open questions.
   - Append each drift suggestion as one plain-text line to the drift ledger (default `.claude/drift-ledger.md`, format `- <NNN>-<slug> (YYYY-MM-DD): <gist>`). No fingerprints or counters; before appending, read existing entries and flag any theme an earlier feature already logged as recurring (codify candidate).
   - Preserve existing task history; replace stale proof-bundle content only.
   - If the final verdict is `READY` and this is full lane, update the top `spec.md` status marker to `已实现` by moving the bold marker only. Do not change contract text. Skip for light lane or non-READY results.

7. Return the canonical verdict.
   - L1 failure: `BLOCKED`.
   - L2 critical violation: `BLOCKED`.
   - L2 non-critical partial, L3 deviation/missing/scope creep, missing proof evidence, or accepted risk not recorded: `NEEDS WORK`.
   - L1 green + L2 clean/accepted + L3 clean/N/A-valid + complete proof bundle: `READY`.

## Output Shape

Use this structure:

```markdown
## Feature Done — <NNN>-<slug>

### L1 — Mechanical
<result>

### L2 — Project conventions
<result>

### L3 — Spec compliance
<result or N/A for light lane>

### Current truth
<N/A | aligned | update pending → $feature-archive>

### Proof Bundle
Updated: <tasks.md path>

### Gate health
<findings per gate this run; add a hint if any gate produced zero findings of any severity across the last 3+ features (read prior proof bundles); omit when history is unavailable>

### Verdict: <READY | NEEDS WORK | BLOCKED>
<short reason and next action; READY with pending current truth must name $feature-archive as the next step; otherwise remind that delivered features are picked up by the next $feature-archive sweep>
```

## Guardrails

- Do not commit automatically.
- Do not silently skip L1 unless no check command exists; report the missing command.
- Do not treat proof-bundle writing as proof that checks passed.
- Keep the four layers separate; do not collapse L1/L2/L3 into one generic review.
