---
name: project-personalize
description: Adapt an existing v2-shaped or scaffold-cloned project to its real project values in Codex. Use when AGENTS.md already exists and needs scaffold defaults replaced, tier AGENTS files completed, project structure updated, or conventions aligned with the actual codebase. Not for empty greenfield directories.
---

# Project Personalize

Match the user's language in natural-language output. This is the Codex adapter for the P0 retrofit/scaffold-cloned action.

Canonical action spec: `../../docs/actions/project-personalize.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Detect the current baseline.
   - Require root `AGENTS.md`.
   - Check whether it has the v2 convention sections: commands, testing, project structure, code style, git workflow, and boundaries.
   - Inspect `CLAUDE.md`, `.claude/`, `.agents/`, tier directories, manifests, and existing docs.
   - If no v2 baseline exists, stop and recommend `$project-init`.

2. Present a short personalization plan.
   - Replace scaffold defaults such as project name, package name, DB name, container names, domains, and placeholder paths.
   - Complete tier-level `AGENTS.md` files where tier rules differ from root.
   - Update `## Project Structure` from the actual codebase.
   - Fill or remove leftover path-scoped rule placeholders in nested `AGENTS.md` / `AGENTS.override.md` rule sections, or `.claude/rules/` compatibility files.
   - Clean stale Claude-only aliases only when they conflict with `AGENTS.md` as source of truth.

3. Scan objective evidence before editing.
   - Read manifests: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, compose files, `.env.example`.
   - List top-level and tier-level directories.
   - For structure survey, prefer a separate Codex subagent running `../../docs/reviewers/codebase-explorer.md`; otherwise run the survey in the main session.
   - Search for scaffold/default/placeholder strings.
   - Distinguish real project values from template examples.

4. Ask before replacing project-specific values.
   - Show each candidate replacement with file and current value.
   - Accept "keep" for any item.
   - Do not rewrite framework versions or dependencies unless the user explicitly asks.

5. Apply accepted edits.
   - Keep `AGENTS.md` canonical.
   - Keep `CLAUDE.md` as `@AGENTS.md` when present.
   - For tier-specific behavior, write tier `AGENTS.md` instead of expanding root guidance.
   - For path-scoped rule placeholders, fill concrete `description`, path matchers such as `globs`, framework names, commands, and coverage policy from actual manifests; if a value is not present, write `N/A` or a deferred note instead of inventing it.
   - Preserve user-written content and only change confirmed scaffold/default drift.

6. Verify.
   - Search for unresolved placeholders and obvious scaffold strings.
   - Confirm `AGENTS.md` still points to correct commands and structure.
   - Before finalizing generated convention edits, prefer a separate Codex subagent running `../../docs/reviewers/decision-completeness-auditor.md`; otherwise run the audit in the main session.
   - Report any deferred decisions.

## Guardrails

- Do not treat a scaffold example as a requirement.
- Do not normalize everything into root `AGENTS.md`; use nested files for scoped rules.
- Do not edit app code unless a documented convention file references a wrong path or command.
