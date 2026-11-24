---
name: spec-revise
description: "Revise a materially wrong accepted or delivered-but-unarchived contract, including when the user corrects, rejects, removes, or replaces accepted behavior, while updating affected decisions, acceptance, optional work notes, and any conditional ADR."
metadata:
  version: "4.0.0"
---

# Spec Revise

Match the user's language and preserve file language. Read [`resources/docs/actions/spec-revise.md`](resources/docs/actions/spec-revise.md) completely before acting. Apply [runtime conventions](resources/docs/actions/README.md#shared-runtime-conventions).

- For a change in scope use [scope stops](resources/docs/actions/feature-init.md#implementation-scope-stop). For material decision closure read [discovery](resources/docs/actions/feature-init.md#conversation-and-discovery); for reopening read [receipt history](resources/docs/actions/feature-done.md#completion-preflight); for convention placement read [guidance placement](resources/docs/actions/agents-md-revise.md#guidance-placement-contract).

- Resolve the feature under canonical record/lifecycle rules. Read applicable root/nested `AGENTS.md`, recomputing applicability when module scope changes.
- Use the bundled `resources/` directory; when
  canonical `ADR_REQUIRED` applies, search only relevant ADR metadata/references and instantiate the bundled
  `template/docs/adr/0000-template.md`.
- Apply the authorized revision using [record rules](resources/docs/actions/feature-init.md#record-and-authorization) and [maintenance](resources/docs/actions/feature-init.md#document-updates-and-context).
- At the narrowed canonical boundary, dispatch a fresh subagent for
  [`decision-completeness-auditor`](resources/docs/reviewers/decision-completeness-auditor.md#dispatch-boundary), with fallback
  under the [review execution](resources/docs/reviewers/README.md#reviewer-execution-contract). Blocking or unreliable audit evidence prevents apply.
- Apply the authorized revision without restoring via checkout, rewriting unrelated history, or committing.
