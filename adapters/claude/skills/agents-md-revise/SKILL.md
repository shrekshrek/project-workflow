---
name: agents-md-revise
description: Refresh project conventions by comparing AGENTS.md and explicitly selected host-specific rules with objective repository state, then applying only approved drift fixes.
---

# Agents.md Revise

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/agents-md-revise.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional scope. Root/applicable nested `AGENTS.md` are the default; include `.claude/rules/` only when the user explicitly selects them.
- Use Read/Grep/Glob/Bash for evidence. Missing `AGENTS.md` redirects to `/project-workflow:project-personalize`.
- Use an inline value-to-source trace for simple synchronization. At the canonical audit boundary, when named-agent dispatch is available and the host has not reported exhausted capacity, you MUST dispatch `decision-completeness-auditor` with the proposed contents and evidence. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract, record the execution mode and observed reason, and never treat unexplained fallback as a satisfied pre-apply audit.
- Ask only for material ambiguity or new policy, then use one consolidated apply gate; do not reconfirm objective stale-value synchronization item by item.
- Apply only approved convention edits. Do not edit product specs, implementation code, or commit.

Report applied/skipped drift, evidence, `Reviewer execution` for every applicable audit, audit trigger/result, unresolved questions, and a commit-message draft.
