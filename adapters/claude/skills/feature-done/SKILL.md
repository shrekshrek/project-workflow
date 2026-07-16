---
name: feature-done
description: Run the end-of-feature gate across checks, project conventions, change-spec compliance, current truth, and the delivery receipt.
---

# Feature Done

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-done.md` completely before acting. Also read `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/agents-md-reviewer.md` and `${CLAUDE_PLUGIN_ROOT}/docs/reviewers/spec-reviewer.md` completely; those files own L2/L3 behavior.

Claude execution details:

- Resolve `$ARGUMENTS` through the shared active-feature rules; exclude `archive/`. Use `spec.md` presence to distinguish full and light lanes.
- Run project checks with Bash and capture executable evidence even when another independent layer fails.
- At each applicable L2/L3 boundary, when named-agent dispatch is available and the host has not reported exhausted capacity, you MUST dispatch `agents-md-reviewer` or `spec-reviewer` with the exact review population; L2 also includes applicable `.claude/rules/`. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Reuse same-session reviewer results only when scope and all reviewer inputs are provably unchanged; state reuse explicitly.
- Reviewers are read-only. This skill may update only the canonical `## Proof Bundle` receipt and the allowed READY status marker; never auto-fix code or commit.
- Persist L2/L3 `Review execution` evidence, including reviewer, mode, completion status, and fallback reason or `none`.
- Re-read the receipt for structural validity and include the exact on-disk `## Proof Bundle` block verbatim in the response.

Apply the canonical verdict contract. `READY` is delivery readiness; lifecycle closure remains `/project-workflow:feature-archive`.
