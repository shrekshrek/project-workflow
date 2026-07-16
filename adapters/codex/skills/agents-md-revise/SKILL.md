---
name: agents-md-revise
description: "Refresh project conventions in Codex from objective repository evidence and apply only user-approved drift fixes."
---

# Agents.md Revise (Codex)

Match the user's language. Read [`../../../../docs/actions/agents-md-revise.md`](../../../../docs/actions/agents-md-revise.md) completely before acting; it owns the portable workflow and contract.

- Scope root/applicable nested `AGENTS.md` by default; include host-private convention files only when explicitly selected. Do not translate another host's private rules.
- Use an inline value-to-source trace for simple synchronization. At the canonical audit boundary, when Codex dispatch is available and capacity is not reported exhausted, you MUST spawn a fresh general subagent to run [`../../../../docs/reviewers/decision-completeness-auditor.md`](../../../../docs/reviewers/decision-completeness-auditor.md); never retask an existing subagent instance. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract, record the execution mode and observed reason, and never treat unexplained fallback as a satisfied pre-apply audit.
- Ask only for material ambiguity or new policy, then use one consolidated apply gate; do not reconfirm objective stale-value synchronization item by item.
- Apply only approved convention edits. Do not edit product specs, implementation code, or commit.

Report applied/skipped drift, evidence, `Reviewer execution` for every applicable audit, audit trigger/result, unresolved questions, and a commit-message draft.
