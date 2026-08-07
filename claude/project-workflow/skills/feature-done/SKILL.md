---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Fresh reviewer agents read their own canonical specs; read a reviewer spec in the main session only for an allowed fallback.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Apply the action's L1 scope, reuse, sequencing, prerequisite, and evidence rules exactly with Bash. Do not expand checks or dispatch reviewers beyond those rules, and do not repair a failure inside this gate.
- After required L1 passes, dispatch fresh `agents-md-reviewer` / `spec-reviewer` agents for applicable boundaries under the canonical execution contract. Full lane requires both: dispatch them in parallel when capacity permits, otherwise sequentially; single-slot capacity is not fallback. Light lane uses conditional L2 and always records L3 as N/A. L2 may include only project-root `.claude/rules/`, never user-level `~/.claude/rules/` unless the user explicitly selects them. Record `Reviewer execution` as required by the action.
- Reviewers are read-only. This skill may update only the canonical `## Proof Bundle` receipt and the allowed READY status marker; never auto-fix code or commit.
- Capture the reviewed Git identity before endpoint-owned writes, then persist and structurally re-read the canonical receipt. Return its exact on-disk `## Proof Bundle`.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
