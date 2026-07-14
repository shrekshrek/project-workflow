---
name: feature-init
description: "Create a tracked feature artifact in Codex only when the change benefits from project-workflow tracking. Supports no-artifact, light tasks-only, and full greenfield or brownfield spec/plan/tasks lanes."
---

# Feature Init (Codex)

Match the user's language. Read [`../../docs/actions/feature-init.md`](../../docs/actions/feature-init.md) completely before acting; it is the source of truth for classification and outputs.

## Codex execution contract

- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json`; invoke the materializer from that packaged root.
- Resolve the target root explicitly. It must contain `AGENTS.md` and `docs/specs/`; never write under an incidental cwd.
- Read active conventions and current-truth documents first. Exclude `docs/specs/changes/archive/` when gathering implementation context.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before resolving path-scoped compatibility input.
- For simple prefill copied from one explicit source, use an inline value-to-source trace matrix. Use [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) only for new technical specifics, ownership, weak evidence, or generated decisions spanning multiple artifacts.
- Do not write implementation code.

## Workflow

1. Parse a kebab-case slug and optional description. Resolve the next three-digit number across both active and archived directories; never reuse an archived number.
2. Read root and applicable nested `AGENTS.md`, `docs/specs/index.md`, and substantive `docs/specs/<area>.md` files. Inventory `.claude/rules/` scope metadata through the Codex bridge, but defer body reads until the target module/file scope is known.
3. Determine whether a new artifact is useful:
   - no artifact for tiny/local work or implementation already covered by an accepted spec;
   - at least light lane for behavior or durable-rule changes already declared in a domain document;
   - full lane for API/schema/data migration/security/auth/cross-module/new-module/high-blast-radius work.
4. Resolve module ownership. If multiple modules could own the change, ask rather than guessing. Then fresh-read every global or matching compatibility-rule body; read ambiguous rules conservatively and report them.
5. Choose spec shape for full lane: brownfield only when a substantive domain document exists; otherwise greenfield. Do not create an empty domain document just to force brownfield.
6. Invoke the packaged `scripts/materialize-feature-artifact.cjs` with the resolved target, number, slug, lane, and full-lane shape. Its atomic no-clobber gate refuses an existing feature directory and exclusively copies from `template/docs/specs/changes/_template/`:
   - full: shape-appropriate `spec.md`, plus `plan.md` and `tasks.md`;
   - light: `tasks-light.md` as `tasks.md`.
7. Replace structural placeholders such as number, slug, date, and area. Preserve unknown `{{TODO ...}}` markers. Prefill only facts explicitly supplied by the user or existing project sources, with brief trace notes.
8. Run the complexity-triggered trace/audit. Remove or defer unanchored endpoints, fields, error codes, paths, packages, and technology choices.
9. Verify that files landed under the resolved target root. An existing-directory refusal is final. For an NNN reservation collision only, retry once with the next number reported by the materializer; never delete an unknown reservation or fall back to manual `mkdir`/copy.

Report the chosen lane, spec shape, area, module decision, created files, unresolved placeholders, trace/audit result and trigger reason, compact bridge counts plus applicable/ambiguous paths, and next action. For full lane, remind the main session that conversational fill creates an ADR only for architecture/module boundaries, durable cross-feature technical decisions, or superseding an existing ADR.
