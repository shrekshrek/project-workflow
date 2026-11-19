# project-workflow v3

**A workflow for AI-assisted development:** agree on the approach, review useful results along the way, and verify the finished work. Supports Claude Code and Codex.

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

## What's in v3

| Part | Purpose | Location |
|---|---|---|
| Shared rules | Planning, implementation, verification, review and record maintenance | [`docs/`](docs/) |
| Starter templates | Project setup, optional rules and feature/domain/ADR templates | [`template/`](template/) |
| Claude Code plugin | 9 skills and 6 named agents | [`adapters/claude/`](adapters/claude/) |
| Codex plugin | The same 9 actions, using Codex skills and shared reviewer rules | [`adapters/codex/`](adapters/codex/) |

Both plugins use the same workflow rules while keeping their own tool integration.
An example project is [`full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4); its stack and layout are not requirements for using Workflow.

## Install

### Claude Code plugin

Install the GitHub version in Claude Code:

```text
/plugin marketplace add shrekshrek/project-workflow
/plugin install project-workflow@project-workflow
```

Then in any project:

```text
/project-workflow:feature-init <feature-slug>
```

Update the marketplace and plugin, then restart Claude Code before testing the new version:

```bash
claude plugin marketplace update project-workflow
claude plugin update project-workflow@project-workflow
```

Claude Code and Codex expose the same 9 workflow actions.

### Codex plugin

The marketplace installs the Codex package from the `plugin-dist` branch.

Install the GitHub version in Codex:

```bash
codex plugin marketplace add shrekshrek/project-workflow
codex plugin add project-workflow@project-workflow
```

Or in Codex App: open **Plugins**, add the GitHub marketplace source `shrekshrek/project-workflow`, then install **Project Workflow**, then start a new thread in the target repository.

Update to the latest pushed version:

```bash
codex plugin marketplace upgrade project-workflow
codex plugin add project-workflow@project-workflow
```

Start a new Codex task after installing or updating so the refreshed skills are loaded.

<details>
<summary>Local development install (repo contributors only)</summary>

Build both packages into a fresh temporary directory. Before switching from GitHub to a local install, remove the GitHub marketplace for that host; both sources use the same plugin name.

```bash
DIST_ROOT=$(mktemp -d)
node scripts/build-plugin-packages.cjs --out "$DIST_ROOT"
```

Claude Code:

```bash
claude plugin marketplace add "$DIST_ROOT"
claude plugin install project-workflow@project-workflow
```

Codex:

```bash
codex plugin marketplace add "$DIST_ROOT"
codex plugin add project-workflow@project-workflow
```

The same output root contains a Claude marketplace at `.claude-plugin/marketplace.json` and a Codex marketplace at `.agents/plugins/marketplace.json`. In Codex App, add the generated output directory as the local marketplace, install **Project Workflow**, and start a new thread.

</details>

Installed Codex skills are invoked as:

```text
$project-init
$project-personalize
$feature-init <feature-slug>
$spec-quality-check <feature-slug>
$spec-revise <feature-slug>
$feature-done <feature-slug>
$feature-archive <feature-slug>
$spec-reconcile <area>
$agents-md-revise
```

Use `$project-init` for new or existing projects. It sets up a new project or uses `$project-personalize` to adapt existing guidance without replacing project configuration. If setup already matches, nothing changes. `$project-personalize` also works directly. Run generators that need an empty directory before setup.

Foundation and architecture work use [`feature-init`](docs/actions/feature-init.md) too. Keep setup with the first feature when they belong together; track architecture separately only when other work needs it independently. Read [`architecture-design`](docs/architecture-design.md) when the action calls for it.

### Manual fallback

For tools without plugin support, use the same baseline materializer from this checkout:

```bash
node <path-to-this-repo>/scripts/materialize-project-baseline.cjs \
  --stage <temporary-staging-dir> --target <your-project>
node <path-to-this-repo>/scripts/materialize-project-baseline.cjs \
  --apply-staged <temporary-staging-dir> <your-project>
```

Setup does not invent a technology stack. Templates and optional tool-specific files stay in the plugin until needed. Docker and build files belong to the project.

### Source naming rule

The plugin identity is `project-workflow` for both Claude Code and Codex. Local and remote sources should not be installed simultaneously under that same plugin name. For normal use, install the GitHub release source. For local development, replace it with the local source rather than installing both.

### Runtime compatibility

- Release checks currently run with Claude Code 2.1.144 and Codex CLI 0.142.5; these are tested baselines, not declared minimum versions.
- Primary release verification runs on macOS; Linux and Windows are not fully end-to-end certified.
- Older hosts without current plugin support may still use the manual fallback, but are outside adapter guarantees.

## Workflow surface

The plugin manifests define the version. Claude Code uses `/project-workflow:*`; Codex uses `$skill`.
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

Templates stay in the plugin; actions create project records only when needed. To customize templates, fork
the plugin and edit `template/`.

For a focused review, run relevant test/check commands (L1), or use `agents-md-reviewer` for project rules (L2)
and `spec-reviewer` for agreed feature behavior (L3).

## Reviewer methodology

Risk and project requirements determine which independent reviews are needed. Every acceptance requirement
still needs verification. Reviewers use the supplied test results rather than rerun them. Only an execution
failure that produces no final result allows one fresh attempt under the same rules. See the [reviewer index](docs/reviewers/README.md) for all six roles.

## Maintaining generated plugin packages

The main branch contains shared rules and separate Claude/Codex adapters. The build script assembles both
packages in a temporary directory. A versioned release commit publishes them to `plugin-dist` after checks
pass; generated packages are not committed on `main`. Maintainer-only test fixtures and grading tools stay
in the source repository.

After changing shared rules or either adapter, run:

```bash
node scripts/check-all.cjs
```

The suite runs the same checks that remain separate in CI for precise failure reporting:

```bash
node scripts/build-plugin-packages.cjs --check
node scripts/check-adapter-parity.js
node scripts/check-workflow-contracts.cjs
node scripts/check-reviewer-fixtures.cjs
node scripts/check-feature-init-fixtures.cjs
node scripts/check-template-contracts.js
node scripts/check-lifecycle-links.cjs
node scripts/check-markdown-links.cjs
```

These checks cover action parity, packaged file access, skill length, document structure, fixture inputs,
verdict rules, safe file creation and links. They do not run model reviewers or generative skills.
For changes to model behavior, run the applicable [reviewer smoke test](docs/examples/reviewer-mutation-smoke.md)
or [feature-init scenarios](docs/examples/feature-init-scenario-matrix.md) and record the result in the release PR/task.

## License

MIT
