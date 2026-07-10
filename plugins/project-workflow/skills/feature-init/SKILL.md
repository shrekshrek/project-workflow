---
name: feature-init
description: "Create a tracked feature artifact in Codex only when the change benefits from project-workflow tracking. Supports no-artifact, light tasks-only, and full greenfield or brownfield spec/plan/tasks lanes."
---

# Feature Init (Codex)

Match the user's language. Read [`../../docs/actions/feature-init.md`](../../docs/actions/feature-init.md) completely before acting; it is the source of truth for classification and outputs.

## Codex execution contract

- Resolve the target root explicitly. It must contain `AGENTS.md` and `docs/specs/`; never write under an incidental cwd.
- Read active conventions and current-truth documents first. Exclude `docs/specs/changes/archive/` when gathering implementation context.
- Use a general subagent with [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) for non-empty prefill; otherwise run the audit in the main session.
- Do not write implementation code.

## Workflow

1. Parse a kebab-case slug and optional description. Resolve the next three-digit number across both active and archived directories; never reuse an archived number.
2. Read root and applicable nested `AGENTS.md`, scoped rules, `docs/specs/index.md`, and substantive `docs/specs/<area>.md` files.
3. Determine whether a new artifact is useful:
   - no artifact for tiny/local work or implementation already covered by an accepted spec;
   - at least light lane for behavior or durable-rule changes already declared in a domain document;
   - full lane for API/schema/data migration/security/auth/cross-module/new-module/high-blast-radius work.
4. Resolve module ownership. If multiple modules could own the change, ask rather than guessing.
5. Choose spec shape for full lane: brownfield only when a substantive domain document exists; otherwise greenfield. Do not create an empty domain document just to force brownfield.
6. Copy from the plugin's `template/docs/specs/changes/_template/`:
   - full: shape-appropriate `spec.md`, plus `plan.md` and `tasks.md`;
   - light: `tasks-light.md` as `tasks.md`.
7. Replace structural placeholders such as number, slug, date, and area. Preserve unknown `{{TODO ...}}` markers. Prefill only facts explicitly supplied by the user or existing project sources, with brief trace notes.
8. Audit prefilled decisions. Remove or defer unanchored endpoints, fields, error codes, paths, packages, and technology choices.
9. Verify that files landed under the resolved target root and that no existing feature directory was overwritten.

Report the chosen lane, spec shape, area, module decision, created files, unresolved placeholders, audit result, and next action. Full-lane work proceeds to `$spec-quality-check`; light-lane work validates directly through its tasks and proof bundle.
