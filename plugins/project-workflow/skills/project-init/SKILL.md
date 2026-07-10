---
name: project-init
description: "Initialize a greenfield project's project-workflow baseline in Codex. Creates AGENTS.md, scoped rules, Claude compatibility files, Codex hooks, ADR templates, and the domain index through an interactive stack-neutral setup. Use once at P0; use project-personalize for an existing project-workflow-shaped repository."
---

# Project Init (Codex)

Match the user's language. This is the Codex-native adapter for the canonical action in [`../../docs/actions/project-init.md`](../../docs/actions/project-init.md). Read that file completely before acting; it wins on scope, outputs, invariants, and validation.

## Codex execution contract

- Resolve the plugin root as the nearest ancestor of this file containing `.codex-plugin/plugin.json`.
- Use the current Codex file and shell tools for inspection and edits. Prefer patch-based edits for generated text.
- Ask one baseline question or one tightly coupled group at a time. Infer only objective facts from manifests or prior answers.
- When a choice needs research, run the methodology in [`../../docs/reviewers/tech-researcher.md`](../../docs/reviewers/tech-researcher.md) in a general subagent when available; otherwise run it in the main session. The user makes the final choice.
- Before writing generated conventions, run [`../../docs/reviewers/decision-completeness-auditor.md`](../../docs/reviewers/decision-completeness-auditor.md) the same way. Must-fix findings block the write.

## Workflow

1. Resolve the target directory from the skill argument or cwd. If it already has `AGENTS.md`, redirect to `$project-personalize`. If it is this plugin source repository, warn and require confirmation.
2. Determine single-tier vs multi-tier, language/framework, package manager, tests, lint, and tier names. Do not ask product-feature questions or invent deployment commands.
3. Read the plugin `template/`, `template/_multi_tier_examples/`, and [`reference.md`](reference.md). The shared reference tables are mandatory before rendering placeholders.
4. Copy the starter template into the target, excluding `_multi_tier_examples/`, `.claude/rules/_examples/`, and feature/domain template directories. Copy the bundled `docs/gotchas.md` into the generated project.
5. Render root `AGENTS.md`, path-scoped rules, hook configuration, and any tier-level `AGENTS.md`. Keep `CLAUDE.md` files as one-line aliases. Generated active files must contain no unresolved `{{...}}` placeholders.
6. Keep framework detail in scoped rule files; tier `AGENTS.md` contains only concise differences from the root. Enable the always-on security import when the rule has no path scope.
7. Show a concise preview of generated conventions plus the decision-audit summary. Obtain confirmation before overwriting any existing file or applying warning-level defaults.
8. Validate placeholders, rule frontmatter, real path prefixes, command consistency, alias files, and AGENTS.md line counts. Report deferred commands explicitly.

## Result

Report created files, inferred vs user-confirmed decisions, deferred items, validation status, and the next recommended action (`$feature-init <slug>`). Do not generate application code or commit changes.
