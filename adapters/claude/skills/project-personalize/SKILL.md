---
name: project-personalize
description: Adapt a copied scaffold or retrofit a non-empty codebase to project-workflow using repository evidence and explicit user decisions.
---

# Project Personalize

Match the user's language and preserve file language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize.md` completely before acting; it owns the portable workflow and contract.

Claude execution details:

- Parse `$ARGUMENTS` as an optional target. Empty greenfield targets redirect to `/project-workflow:project-init`; every non-empty complete/partial/missing baseline stays here.
- Inspect with Read/Grep/Glob/Bash. `codebase-explorer` applies only for a nontrivial structure survey. `tech-researcher` applies only when a material stack, library, or tool choice remains unresolved and needs current external evidence; the user makes the final choice.
- For a partial/missing baseline, use `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-project-baseline.cjs --stage` in a disposable directory. A missing baseline does not copy host-private rules, hooks, or tier examples.
- Treat `.claude/rules/` and hooks as host-private: preserve them unless selected, and activate a new hook only under the canonical verified-command rule.
- Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/project-personalize-reference.md` only when repository evidence or a user decision makes a specific section relevant; it supplies examples, never defaults.
- Use an inline trace for simple synchronization; `decision-completeness-auditor` applies only at its canonical boundary. At each applicable role boundary, when named-agent dispatch is available and the host has not reported exhausted capacity, you MUST dispatch the corresponding named agent. No extra workflow confirmation is required; host security approvals still apply. Fallback is allowed only when dispatch is unavailable, fails, or the host reports no capacity; follow the same contract and record the execution mode and observed reason.
- Show one `Consolidated Preview + Apply Gate`; use native approval, then preflight and apply once. Rejection, an unsafe destination symlink/conflict, or a blocking audit leaves the target unchanged.
- Do not rewrite feature history or commit.

Report evidence-backed commands, source/test paths, project-specific rules/boundaries, real tier ownership, changed files, hook status, `Reviewer execution` for every applicable role, audit result, unresolved decisions, and next action.
