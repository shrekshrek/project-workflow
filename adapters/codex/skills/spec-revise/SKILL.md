---
name: spec-revise
description: "Revise a materially wrong accepted or delivered-but-unarchived contract in Codex, including when the user corrects, rejects, removes, or replaces accepted behavior, while updating affected decisions, acceptance, optional work notes, and any conditional ADR."
---

# Spec Revise (Codex)

Match the user's language and preserve file language. Read [`../../../../docs/actions/spec-revise.md`](../../../../docs/actions/spec-revise.md) completely before acting. Apply [runtime conventions](../../../../docs/actions/README.md#shared-runtime-conventions).

- For material decision closure read [discovery](../../../../docs/actions/feature-init.md#conversation-and-discovery); for reopening read [receipt history](../../../../docs/actions/feature-done.md#completion-preflight); for convention placement read [guidance placement](../../../../docs/actions/agents-md-revise.md#guidance-placement-contract).

- Resolve the feature under canonical record/lifecycle rules. Read applicable root/nested `AGENTS.md`, recomputing applicability when module scope changes.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; when
  canonical `ADR_REQUIRED` applies, search only relevant ADR metadata/references and instantiate the bundled
  `template/docs/adr/0000-template.md`.
- Apply the authorized revision using [record rules](../../../../docs/actions/feature-init.md#record-and-authorization) and [maintenance](../../../../docs/actions/feature-init.md#document-updates-and-context).
- At the narrowed canonical boundary, dispatch a fresh subagent for
  [`decision-completeness-auditor`](../../../../docs/reviewers/decision-completeness-auditor.md#dispatch-boundary), with fallback
  under the [review execution](../../../../docs/reviewers/README.md#reviewer-execution-contract). Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.
