---
name: feature-init
description: Use when a new feature or durable behavior change may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; check whether the request is one independently deliverable outcome or needs decomposition, then classify direct/no-artifact, light tasks-only, or full spec/plan/tasks. Do not invoke for local reversible work with no durable artifact consumer.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns classification, workflow, outputs, and safety rules.

Claude execution details:

- Parse `$ARGUMENTS` as a kebab-case slug plus optional description. Resolve the target root explicitly; all writes stay below it.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- Apply the action's scope-viability, deferred-outcome, and progressive-read boundaries exactly; normal single-outcome and no-artifact paths need no extra gate narration.
- When the selected change establishes or materially changes project-wide application architecture, read `${CLAUDE_PLUGIN_ROOT}/docs/architecture-design.md` completely and use only its applicable conversational-fill topics; ordinary features skip it.
- Use inline trace for sourced prefill. Under the shared execution contract, dispatch a fresh `decision-completeness-auditor` only for newly generated unconfirmed high-impact architecture, ownership, infrastructure, port, package/API, or ADR choices, or conflicting/weak evidence; ordinary full-lane work with directly traceable values is `N/A`. Use main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
- Preserve unresolved TODOs; do not replace an unknown implementation detail with discovery-task prose merely to remove its marker, and do not turn unspecified or out-of-scope inputs into verification obligations, artifact decisions, or reported placeholders unless they block implementation. Create no implementation code and never commit.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report only lane/no-artifact, created paths, module decision, literal unresolved template placeholders, applicable audit execution, and next action. Add a scope-viability section only for `clarification-required`, `split-required`, or `bundled-risk-accepted`; on the normal path do not mention that check, its field name, or its omission. Light lane proceeds directly to implementation and skips `spec-quality-check`; full lane runs that gate before implementation.
