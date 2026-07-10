---
name: project-personalize
description: "Adapt an existing project-workflow-shaped repository to its real names, commands, tiers, paths, and conventions in Codex. Use for copied scaffolds and retrofits; use project-init for an empty greenfield directory."
---

# Project Personalize (Codex)

Match the user's language and preserve each file's language. Read and follow [`../../docs/actions/project-personalize.md`](../../docs/actions/project-personalize.md) completely before acting.

## Codex execution contract

- Work only inside the resolved target repository.
- Use a general subagent for reviewer methodology when useful; custom agent names are not required.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before inspecting `.claude/rules/` compatibility files.
- Run [`../../docs/reviewers/codebase-explorer.md`](../../docs/reviewers/codebase-explorer.md) for structure surveys and [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) before applying generated convention changes. Main-session fallback is valid.
- Preserve user changes and request confirmation before replacing demonstrably stale scaffold values.

## Workflow

0. Resolve the target directory and verify that root `AGENTS.md` contains Commands, Testing, Project Structure, Code Style, Git Workflow, and Boundaries. Otherwise stop and recommend `$project-init`.
1. Inspect root/tier `AGENTS.md`, one-line compatibility aliases, `.codex/`, manifests, and shallow project structure. Inventory `.claude/rules/` frontmatter through the Codex bridge before reading matched bodies.
2. Present the applicable scopes: replace scaffold defaults; repair tier-level guidance; survey the codebase and update Project Structure. Continue with the scopes the user selected.
3. Replace only values supported by manifests, existing code, or user answers. Do not infer product semantics from directory names.
4. If surveying structure, follow the canonical codebase-explorer report and show it before editing `AGENTS.md`.
5. Ensure always-on security guidance is actually imported, normalized rule scopes match real paths, tier aliases point to their local `AGENTS.md`, and example assets did not become active rules. Read ambiguous rules conservatively; ambiguity that may hide a critical rule blocks application.
6. Audit all proposed convention text for unanchored decisions. Must-fix findings block application; show warning-level defaults to the user.
7. Apply approved patches, then validate placeholders, frontmatter, path scopes, commands, aliases, and AGENTS.md length.

Report changed values, files touched, evidence sources, bridge global/matched/skipped/ambiguous sets, unresolved decisions, and suggested next action. Do not commit automatically or rewrite historical feature specs.
