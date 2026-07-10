---
name: project-personalize
description: "Adapt a copied scaffold or retrofit a non-empty existing codebase to project-workflow in Codex. Creates, repairs, or personalizes AGENTS.md, scoped rules, commands, tiers, paths, and conventions. Use project-init only for an empty greenfield directory."
---

# Project Personalize (Codex)

Match the user's language and preserve each file's language. Read and follow [`../../docs/actions/project-personalize.md`](../../docs/actions/project-personalize.md) completely before acting.

## Codex execution contract

- Work only inside the resolved target repository.
- Resolve the plugin root as the nearest ancestor of this skill containing `.codex-plugin/plugin.json` before copying any baseline template.
- Use a general subagent for reviewer methodology when useful; custom agent names are not required.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before inspecting `.claude/rules/` compatibility files.
- Run [`../../docs/reviewers/codebase-explorer.md`](../../docs/reviewers/codebase-explorer.md) for structure surveys and [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) before applying generated convention changes. Main-session fallback is valid.
- Preserve user changes and request confirmation before replacing demonstrably stale scaffold values.

## Workflow

0. Resolve the target directory. If it is empty apart from version-control metadata, stop and recommend `$project-init`. Otherwise classify the baseline as complete, partial/custom, or missing; all three non-empty cases continue in retrofit mode.
1. Inspect root/tier `AGENTS.md`, one-line compatibility aliases, `.codex/`, manifests, and shallow project structure. Inventory `.claude/rules/` frontmatter through the Codex bridge before reading matched bodies.
2. Present the applicable scopes: create or complete the baseline; replace scaffold defaults; repair tier-level guidance; survey the codebase and update Project Structure. Baseline creation/completion is selected by default when partial or missing.
3. For a missing baseline, copy the minimum plugin template while excluding examples, multi-tier examples, and feature/domain templates; never overwrite existing code or config. For a partial/custom `AGENTS.md`, preserve useful content and add missing responsibilities in the file's existing language and structure. Replace only values supported by manifests, existing code, or user answers. Do not infer product semantics from directory names. Activate an edit hook only for a confirmed, safe, sub-five-second per-file command; otherwise retain an inactive scaffold and report the reason.
4. If surveying structure, follow the canonical codebase-explorer report and show it before editing `AGENTS.md`.
5. Ensure always-on security guidance is actually imported, normalized rule scopes match real paths, tier aliases point to their local `AGENTS.md`, and example assets did not become active rules. Read ambiguous rules conservatively; ambiguity that may hide a critical rule blocks application.
6. Audit all proposed convention text for unanchored decisions. Must-fix findings block application; show warning-level defaults to the user.
7. Apply approved patches, then validate placeholders, frontmatter, path scopes, commands, aliases, and AGENTS.md length. Verify an active hook against a matching file; otherwise report `hook: scaffold/inactive + reason` without claiming runtime enforcement.

Report changed values, files touched, evidence sources, hook status, bridge global/matched/skipped/ambiguous sets, unresolved decisions, and suggested next action. Do not commit automatically or rewrite historical feature specs.
