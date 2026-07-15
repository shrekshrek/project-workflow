---
name: agents-md-revise
description: Refresh project conventions by comparing AGENTS.md and explicitly selected host-specific rules with objective repository state, then applying only approved drift fixes.
---

# Agents.md Revise

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/agents-md-revise.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional scope. Root/applicable nested `AGENTS.md` are the default; include `.claude/rules/` only when the user explicitly selects them.
- Use Read/Grep/Glob/Bash for evidence. Missing `AGENTS.md` redirects to `/project-workflow:project-personalize`.
- Use an inline value-to-source trace for simple synchronization. When the canonical dispatch boundary is met, dispatch `decision-completeness-auditor` with proposed contents and evidence; main-session fallback must follow the same reviewer contract.
- Ask only for material ambiguity or new policy, then use one consolidated apply gate; do not reconfirm objective stale-value synchronization item by item.
- Apply only approved convention edits. Do not edit product specs, implementation code, or commit.

Report applied/skipped drift, evidence, audit trigger/result, unresolved questions, and a commit-message draft.
