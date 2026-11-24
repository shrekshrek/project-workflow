# Project Workflow

**A workflow for AI-assisted development:** agree on the approach, review useful results along the way, and verify the finished work.

## Start here

- Using the workflow: [`Quickstart`](docs/quickstart.md).
- Writing feature records: [`Feature record guide`](docs/spec-driven.md).
- Maintaining the rules: [`Actions`](docs/actions/) and [`Reviewers`](docs/reviewers/).
- Visual overview: [`Workflow diagram`](docs/project-workflow-overview.drawio).

For background, see [`workflow.md`](docs/workflow.md), [`cross-tool-methodology.md`](docs/cross-tool-methodology.md), [`tooling.md`](docs/tooling.md), and [`gotchas.md`](docs/gotchas.md). These are not required reading to get started.

## Why v3 exists

AI can produce code faster than people can check it. Long conversations can bury important decisions, and project rules can drift as the code changes. Workflow addresses these problems through conversation, focused verification and records of agreed decisions.

Background and sources: [`docs/workflow.md §0.1`](docs/workflow.md).

## Project goal

Explain the result and approach before implementation, use staged results to gather feedback, and keep enough evidence to judge the work. Personal and team projects use the same workflow; permission to implement, submit code and close a feature are handled separately.

| Need | What to use |
|---|---|
| Set up a project | `project-init` inspects the repository and chooses the appropriate setup. |
| Keep requirements beyond the conversation | `feature-init` creates or reuses a record when needed; one `spec.md` by default. |
| Change an agreed requirement | `spec-revise` updates the affected decisions and acceptance criteria. |
| Check whether a feature is ready | `feature-done` runs required checks and reviews, then records the result. |
| Update stale project rules | `agents-md-revise` compares conventions with the actual project. |

Workflow works independently. If an approved Project Blueprint plan exists, feature records reference it rather than copy or silently change it.

## Repository layout

| Part | Purpose | Location |
|---|---|---|
| Shared rules | Planning, implementation, verification, review and record maintenance | [`docs/`](docs/) |
| Starter templates | Project setup, optional rules and feature/domain/ADR templates | [`template/`](template/) |
| Agent Skills | 9 action entry points | [`entries/`](entries/) |

An example project is [`full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4); its stack and layout are not requirements for using Workflow.

## Install

Use Node.js 22.20 or later for the skills CLI. Install the nine Agent Skills from the release branch. For local Codex and DeepSeek Harness using their default shared user skill directory:

```bash
npx skills add https://github.com/shrekshrek/project-workflow/tree/skills-dist --skill '*' --agent codex --global --copy
```

For Claude Code, add `--agent claude-code` to the same command. Local Cursor can discover the shared skills. Omit `--global` for a project installation. Check existing skills of the same name before replacing them. Re-run the command with the same scope and clients to update. For an unattended install, append `--yes` after checking the scope and names.

Open a fresh chat and invoke `feature-init`. Check the version under `metadata.version` in its installed `SKILL.md`. Independent reviews require a host with subagent support or the fallback allowed by the selected action.

### Migrating from the marketplace plugin

In each client where the old plugin is installed, remove its entry and dedicated marketplace, then run the install command above. Use the original installation scope for Claude Code (default: user).

```bash
# Codex
codex plugin remove project-workflow@project-workflow
codex plugin marketplace remove project-workflow

# Claude Code
claude plugin uninstall project-workflow@project-workflow
claude plugin marketplace remove project-workflow
```

In a new chat, check that `feature-init` resolves to the skill directory from the new installation. Project-owned documents and rules stay in their repositories.

## Workflow surface

The complete rules live in [`docs/actions/`](docs/actions/).

Most work does not need all nine actions. Set up once, then use the actions relevant to the change:

| When | Action | Purpose |
|---|---|---|
| Project setup | `project-init` | Inspect the repository and choose the appropriate setup. |
| Adapting existing project guidance | `project-personalize` | Base working rules on the project's code, configuration and conventions. |
| Planning a change | `feature-init` | Clarify behavior and important choices; create or reuse a record only when needed. |
| Checking readiness to implement | `spec-quality-check` | Check that the record matches agreed requirements and resolves important questions. |
| Delivering a tracked change | `feature-done` | Check the actual changes, run required verification and reviews, and record the result. |
| Authorized closure or periodic cleanup | `feature-archive` | Update current product documentation and archive delivered changes. |

Delivery ends at READY, with archive pending. [Authorized closure](docs/actions/feature-archive.md#closure-authorization)
continues to `feature-archive`. Archiving needs a valid current delivery receipt; missing or invalid evidence
requires another `feature-done` run. A receipt for uncommitted work is valid only in the same task;
archiving in a later task needs a reviewed commit. Archive checks pending documentation updates against the
current project state.

Exception and maintenance actions appear only when their condition exists:

| Condition | Action |
|---|---|
| Agreed requirements need an important correction before archive | `spec-revise` |
| Active specs, current product documentation or ADRs contradict each other | `spec-reconcile` |
| Project rules no longer match the code, configuration or directory structure | `agents-md-revise` |

The [actions index](docs/actions/README.md) identifies which file owns each rule. This overview and Quickstart
summarize those rules without adding requirements.

Templates ship with the skills; actions create project records only when needed. To customize templates, fork
the repository and edit `template/`.

For a focused review, run relevant test/check commands (L1), or use `agents-md-reviewer` for project rules (L2)
and `spec-reviewer` for agreed feature behavior (L3).

## Reviewer methodology

Risk and project requirements determine which independent reviews are needed. Every acceptance requirement
still needs verification. Reviewers use the supplied test results rather than rerun them. Only an execution
failure that produces no final result allows one fresh attempt under the same rules. See the [reviewer index](docs/reviewers/README.md) for all six roles.

## Development

Run all checks with `node scripts/check-all.cjs`. To test an unpublished build, generate an empty distribution directory and pass it to the same installer:

```bash
dist=$(mktemp -d)
node scripts/build-skills.cjs --out "$dist"
# From a disposable project:
npx skills add "$dist" --skill '*' --agent codex --copy
```

Build from a Git checkout. Edit the action and reviewer contracts in `docs/` and the skill entry points in `entries/`. Each installed action includes its runtime resources so it can be installed independently. A release commit of the form `release: vX.Y.Z ...` with a matching new `VERSION` builds and publishes the `skills-dist` branch after validation.

## License

MIT
