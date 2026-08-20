---
name: feature-init
description: Preview or apply feature routing when the user explicitly asks whether work needs a project-workflow feature, or when proposed implementation may need tracked acceptance, handoff, current-truth synchronization, or contract/risk protection; classify completed decisions as DIRECT, LIGHT tasks-only, or FULL spec/plan/tasks. Route-preview requests are read-only. Do not invoke for general discussion, reasonableness assessment, diagnosis, implementation-status review, or local reversible work unless the user explicitly requests feature routing.
---

# Feature Init

Match the user's language. Read `${CLAUDE_PLUGIN_ROOT}/docs/actions/feature-init.md` completely before acting; it owns classification, workflow, outputs, and safety rules.

Claude execution details:

- Parse `$ARGUMENTS` as a kebab-case slug plus optional description. Resolve the target root explicitly; all writes stay below it.
- Read root/applicable nested `AGENTS.md` and active current truth. Claude-local `.claude/rules/` are host-specific convention inputs when applicable.
- `CLAUDE_PLUGIN_ROOT` is required; invoke `${CLAUDE_PLUGIN_ROOT}/scripts/materialize-feature-artifact.cjs` and never search another runtime cache or bypass its no-clobber gate.
- When the selected change establishes or materially changes project-wide application architecture, read `${CLAUDE_PLUGIN_ROOT}/docs/architecture-design.md` completely and use only its applicable conversational-fill topics; ordinary features skip it.
- Resolve applicable Guidance Placement in existing plan/tasks; ordinary modules receive no generated
  guidance. Under the shared execution contract, dispatch a fresh `decision-completeness-auditor` only for newly generated
  unconfirmed high-impact architecture, ownership, infrastructure, port, package/API, or ADR choices, or
  conflicting/weak evidence; ordinary full-lane work with directly traceable values is `N/A`. Use
  main-session fallback only when canonical dispatch is unavailable or fails, and record the observed reason.
  Report canonical Reviewer execution evidence whenever this audit boundary applies.
- Create no implementation code and never commit. Return control to the enclosing request as directed by the
  canonical action.
- If materialization reports an occupied directory, leave it untouched and rerun feature-init to recompute the number.

Report the canonical compact route result without adding an adapter-specific schema.
