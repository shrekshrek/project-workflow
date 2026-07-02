---
name: agents-md-revise
description: Run the project-workflow P4 drift refresh in Codex by auditing AGENTS.md and path-scoped rules against objective project state. Use periodically or after repeated convention drift to update commands, dependencies, directory structure, versions, and configuration facts. Not for subjective style suggestions or feature backlog.
---

# Agents Md Revise

Match the user's language in natural-language output. This is the Codex adapter for P4 drift refresh.

Canonical action spec: `../../docs/actions/agents-md-revise.md`. Follow that file for methodology rules; this skill only adds Codex execution guidance.

## Workflow

1. Collect A-class convention sources.
   - Root `AGENTS.md` is required.
   - Include nested `AGENTS.md` files under relevant tiers/modules.
   - Include nested `AGENTS.md` / `AGENTS.override.md` files as Codex-native scoped guidance.
   - Include `.claude/rules/` only as Claude-adapter compatibility input when present.
   - Treat these files as current project convention sources, not historical records.

2. Extract only objectively checkable statements.
   - Commands, scripts, package managers, tool versions.
   - Dependency/framework versions.
   - Directory and module structure.
   - Ports, environment variables, config file names.
   - Explicit framework usage rules tied to installed dependencies.
   - Exclude subjective advice such as "keep code clean" or "prefer simple names".

3. Scan actual project state.
   - Read manifests and config files: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, lockfiles, compose files, `.env.example`, tool-version files.
   - Inspect actual directories to reasonable depth, excluding dependency/build/cache folders.
   - Use git history only as supporting evidence, not as the sole reason to codify a subjective pattern.

4. Produce drift candidates.
   - For each candidate, show old convention, observed reality, evidence, and proposed patch.
   - Include only high-confidence objective drift.
   - Group candidates by file.
   - If nothing objective changed, report clean and stop.

5. Ask for per-item decisions.
   - Apply now.
   - Skip this time.
   - Ignore long-term if the project intentionally keeps a convention that differs from observed state.
   - Do not apply broad rewrites without explicit approval.

6. Apply accepted patches.
   - Before applying accepted convention edits, prefer a separate Codex subagent running `../../docs/reviewers/decision-completeness-auditor.md`; otherwise run the audit in the main session.
   - Keep edits narrow and factual.
   - Prefer updating scoped/nested `AGENTS.md` or path-scoped rules over bloating root `AGENTS.md`.
   - Preserve existing wording where possible.
   - Do not update historical specs or ADRs during P4.

7. Summarize.
   - Applied changes.
   - Skipped/ignored candidates.
   - Any missing project metadata that prevented a clean comparison.
   - Suggested commit message, but do not commit.

## Guardrails

- Do not create subjective conventions from recent code style alone.
- Do not use P4 for feature backlog, TODO lists, or product requirements.
- Do not rewrite rules into a new format just because another adapter exists; map adapter-specific files only when needed.
