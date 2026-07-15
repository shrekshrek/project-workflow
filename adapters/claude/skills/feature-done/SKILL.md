---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Also read `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/agents-md-reviewer.md` and `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/spec-reviewer.md` completely; those files own L2/L3 behavior.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run project checks with Bash and capture executable evidence even when another independent layer fails.
- Dispatch `agents-md-reviewer` for L2 and `spec-reviewer` for full-lane L3 with the exact review population. Include applicable `.claude/rules/` in L2. Main-session fallback must follow the same reviewer specs.
- Reuse same-session reviewer results only when scope and all reviewer inputs are provably unchanged; state reuse explicitly.
- Reviewers are read-only. This skill may update only the canonical `## Proof Bundle` receipt and the allowed READY status marker; never auto-fix code or commit.
- Re-read the receipt for structural validity and include the exact on-disk `## Proof Bundle` block verbatim in the response.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
