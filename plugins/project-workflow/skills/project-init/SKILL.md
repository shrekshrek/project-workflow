---
name: project-init
description: Initialize a project-workflow v2 baseline in Codex for a new project that does not yet have AGENTS.md. Use at P0 to copy the starter template, create project conventions, path-scoped rules, hooks, ADR and spec templates, and fill stack-specific placeholders. Not for an existing v2-shaped project.
---

# Project Init

Match the user's language in natural-language output. This is the Codex adapter for the P0 greenfield action.

Canonical action spec: `../../docs/actions/project-init.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Resolve the target directory.
   - Use the current working directory unless the user provides a path.
   - If the directory does not exist, ask before creating it.
   - If `AGENTS.md` already exists, stop and recommend `$project-personalize`.
   - If this appears to be the `project-workflow` repository itself, warn and ask before continuing.

2. Ask only baseline questions needed to fill durable project conventions.
   - Project type: fullstack, backend, frontend, CLI/library, mobile, or other.
   - Tier names and paths for multi-tier projects.
   - Main language/framework and package manager per tier when needed.
   - Test, lint, and check commands if they cannot be inferred from manifests.
   - If the user is unsure about stack or tool choices, prefer a separate Codex subagent running `../../docs/reviewers/tech-researcher.md`; otherwise run the research in the main session.
   - Do not ask business-domain questions; feature details belong in `$feature-init`.

3. Copy the starter template.
   - Source: bundled `../../template/`.
   - Exclude example-only folders: `_multi_tier_examples/` and `.claude/rules/_examples/`.
   - Copy bundled `../../docs/gotchas.md` if it is not already present in the template output.
   - Ensure these exist afterward: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.gitignore`, `docs/adr/`, and `docs/specs/_template/`.
   - Keep `CLAUDE.md` as a one-line alias to `AGENTS.md` for Claude compatibility; Codex reads `AGENTS.md`.

4. Fill placeholders conservatively.
   - Replace known stack commands and paths.
   - Leave deployment as deferred if not actually known.
   - Keep root `AGENTS.md` short; put tier-specific conventions in tier `AGENTS.md` files when applicable.
   - For Codex, `AGENTS.md` is the shared source of truth; `.claude/` files are compatibility assets, not methodology core.

5. Verify the baseline.
   - Search for unresolved `{{...}}` placeholders in generated markdown, excluding intentional templates under `docs/specs/_template/` and example-only assets if any remain.
   - Confirm path-scoped rule files have clear descriptions and sensible path matching if present.
   - Before finalizing generated convention files, prefer a separate Codex subagent running `../../docs/reviewers/decision-completeness-auditor.md`; otherwise run the audit in the main session.
   - Summarize the loaded conventions: project type, main stack, check command, test command, and tier layout.

## Output

Report created files, unresolved deferred decisions, and the next action. For feature work, next action is `$feature-init`.

## Guardrails

- Do not scaffold application code.
- Do not invent commands that are not in manifests or user answers.
- Do not overwrite an existing v2 baseline; use `$project-personalize`.
