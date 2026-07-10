# project-init

Canonical P0 action for creating a greenfield project-workflow baseline in an empty or genuinely new target project.

## Use When

- Starting a new project or an empty target directory.
- The user wants project-level conventions, path-scoped rules, an ADR guide, and optional tier-level guidance.

Do not use for any non-empty existing codebase or copied scaffold, whether or not it already has `AGENTS.md`; use [`project-personalize`](project-personalize.md).

## Inputs

- Target directory, defaulting to the current working directory.
- Project shape: single tier or multi-tier.
- Durable stack facts needed to fill conventions: language, framework, package manager, test/check/lint commands, tier names.

Do not ask feature or business-domain questions. Those belong to [`feature-init`](feature-init.md).

Ask setup questions interactively, not as a long static questionnaire. Each adapter should use the cadence that fits its host environment: ask one baseline question or one tightly coupled question group, wait for the answer, then continue. Adapters may reduce interruptions when answers are objectively inferable from project manifests, prior chat context, or an explicit user preference for automatic setup.

## Outputs

Minimum baseline:

- `AGENTS.md`
- `CLAUDE.md` as a one-line alias for Claude compatibility
- path-scoped rule files where the adapter supports them
- hook/check configuration only when a user-confirmed, safe per-file command is known; otherwise keep hook assets in the plugin and report `hook: not installed + reason`
- `docs/specs/index.md` as the E-class domain index; do not create an empty domain document at P0
- `docs/adr/`
- `docs/gotchas.md`
- `.gitignore`

For multi-tier projects, create tier-level `AGENTS.md` files only when there is durable tier-specific guidance.

## Codex Adapter Contract

After generating `.claude/rules/` compatibility files, the Codex adapter validates them through the [Codex scoped-rule bridge](../adapters/codex-scoped-rule-bridge.md). It reports compact counts plus applicable/ambiguous paths; full skipped paths are debug-only.

## Invariants

- `AGENTS.md` is the cross-tool convention entry point.
- Tool-specific files are adapter assets, not methodology core.
- Source templates may contain stack-rendering placeholders; generated active files may not. After initialization, active `AGENTS.md` and path-scoped rules must be concrete for the target stack. Project-local hook files/config exist only for an active verified mapping.
- Commands must come from user answers, manifests, or conservative stack conventions. Unknown deployment commands stay deferred.
- Path-scoped rule files must be stack-adapted, including concise `description:` metadata and a `paths:` YAML list. Do not use broad catch-all patterns as a substitute for real language/tier matching. Rules without `paths:` are global.
- No unresolved scaffold placeholders may remain in generated project-workflow files.
- Generated `AGENTS.md` indexes only files that actually exist; absent hooks and plugin-only templates are not advertised as project-local assets.
- Render and audit the complete proposed baseline in memory or a disposable staging directory. One consolidated approval precedes every target write, including creation of an absent target directory; rejection or a blocking audit leaves the target unchanged. Applying the approved staging tree uses strict no-clobber preflight and rejects symlinked destination components before copying anything.
- No application code is generated.

## Validation

- Search generated markdown for unresolved `{{...}}` placeholders; plugin-only templates and example assets should not exist in the target project.
- Verify generated rule files have clear descriptions and sensible path scopes.
- Verify an activated hook actually runs its declared per-file command; when no safe mapping is available, verify no new project-local hook mapping/script was installed and report the reason.
- Summarize created files, known deferred decisions, and next action.
- For Codex, verify bridge scope resolution and report compact counts plus applicable/ambiguous paths.
