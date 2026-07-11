# project-workflow v3

**Spec-driven feature development blueprint for AI-assisted coding** — methodology docs + starter template + runtime adapters.

> v3 is docs-first and adds dual Claude/Codex plugin packaging plus spec lifecycle management.

---

## Why v3 exists

AI-assisted coding has three Tier 1 engineering problems. Every part of v3 — the 5-phase workflow, 4 pillars, skills, template, and spec lifecycle — exists to address these three:

- **Verification** — AI generates code 10x faster than humans can validate. Boris Cherny (Claude Code lead): *"The most important thing is to give Claude a way to verify."*
- **Context-as-RAM** — Context windows behave like RAM, not storage. Long sessions drift, token costs scale, attention degrades past 200-line files.
- **Drift** — Without long-term memory, AI conventions drift across time (same code reviewed twice gives different verdicts), modules (A vs B style mismatch), and project lifecycle (month 1 vs month 6 codebase).

Cross-layer inconsistency (frontend/backend/DB contracts) is treated as a stack-specific tactic (`docs/workflow.md §8.6`), not a top-level proposition — community evidence frames it as a general architecture problem, not AI-specific.

Full framing with sources: [`docs/workflow.md §0.1`](docs/workflow.md).

---

## Project goal

project-workflow helps real projects move from **chat-driven AI coding** to **spec-driven, reviewable, maintainable AI-assisted development**.

v3 separates **methodology core** from **runtime adapters**:

- Core: `AGENTS.md`, `docs/specs/`(域现状), `docs/specs/changes/`(tracked changes), conditional ADR, compact delivery receipt, L1/L2/L3 review model, canonical workflow actions in `docs/actions/`, and canonical reviewer specs in `docs/reviewers/`.
- Adapters: Claude Code plugin is mature; Codex is distributed as a separate Codex plugin package. Both adapters use the same core docs and template, but their installed artifacts are separate.

See [`docs/cross-tool-methodology.md`](docs/cross-tool-methodology.md).

| Need | project-workflow answer |
|---|---|
| Start a project with shared conventions | P0 starter kit: `AGENTS.md`, path-scoped rules, optional verified hooks, ADR guide |
| Start a feature without losing requirements in chat | P2 `spec.md` / `plan.md` / `tasks.md` |
| Keep implementation aligned while coding | spec revise SOP, module-boundary handling, environment-enforced rules |
| Know whether a feature is ready | L1/L2/L3 review + delivery receipt |
| Keep the codebase from drifting over months | P4 `agents-md-revise` refresh of project conventions |

The intended outcome is practical: fewer repeated reminders, fewer unreviewed AI changes, clearer handoff artifacts, and project rules that stay close to the codebase as it evolves.

---

## Start here

- Users: [`docs/quickstart.md`](docs/quickstart.md).
- Runtime contract authors: [`docs/actions/`](docs/actions/) and [`docs/reviewers/`](docs/reviewers/).
- Visual overview: [`docs/project-workflow-overview.drawio`](docs/project-workflow-overview.drawio).

Deep reference, not required reading: [`workflow.md`](docs/workflow.md), [`spec-driven.md`](docs/spec-driven.md), [`cross-tool-methodology.md`](docs/cross-tool-methodology.md), [`tooling.md`](docs/tooling.md), and the plugin evidence library [`gotchas.md`](docs/gotchas.md).

---

## What's in v3

| Layer | What | Where |
|---|---|---|
| 📘 **Methodology core** | 5-phase blueprint (P0 Project Setup / P2 Feature + Module Setup sub-flow / P3 Maintenance / P4 Drift Refresh; no P1 by design — see workflow.md §0.2) + canonical action specs + 4 pillars + cross-tool boundaries + spec-driven 3-file template + 10 工程陷阱 | [`docs/`](docs/) |
| 🧰 **Starter template** | Plugin-side baseline and optional hook assets. Project init materializes conventions always and hooks only when a safe command is verified. | [`template/`](template/) |
| 🤖 **Claude Code adapter** | 9 Claude-native slash-command skills + 6 named sub-agents | [`.claude-plugin/`](.claude-plugin/) + [`skills/`](skills/) + [`agents/`](agents/) |
| 🧩 **Codex adapter** | 9 Codex-native skills using bundled canonical reviewer specs | [`plugins/project-workflow/`](plugins/project-workflow/) + [`.agents/plugins/`](.agents/plugins/) |

> **Concrete project example** (example-of-one, not authoritative source): [`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4) — a FastAPI + Nuxt 4 full-stack scaffold that follows project-workflow methodology. The methodology's arguments are self-contained in `docs/`; the scaffold is just one concrete instantiation.

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

Claude Code exposes the same 9 workflow actions as Codex — one entry point per action, no separate helper commands. Normal feature delivery ends with `/project-workflow:feature-done`; partial reruns re-invoke the same command (idempotent, caches reused).

### Codex plugin

The Codex plugin package lives at [`plugins/project-workflow/`](plugins/project-workflow/), and this repo exposes it through [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json). Codex exposes the same 9 workflow actions through its own native skill implementations; the Codex skills are not copies of the Claude runtime adapter.

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

If an older delivered feature still has a checkbox-style `## Proof Bundle` without `Verdict:`, rerun `feature-done` before archiving it. `feature-archive` sweep reports these as legacy migration candidates and never guesses READY from old checkboxes.

<details>
<summary>Local development install (repo contributors only)</summary>

Point Codex at your working copy instead of GitHub while iterating on this repo itself:

```bash
codex plugin marketplace add <path-to-this-repo>
codex plugin add project-workflow@project-workflow
```

Or in Codex App: open **Plugins**, add or open the local marketplace at `<path-to-this-repo>/.agents/plugins/marketplace.json`, then install **Project Workflow**.

Do not add both the local development source and the GitHub release source at the same time — both provide plugin name `project-workflow`, and Codex will not distinguish which one a bare `project-workflow` reference means. Run `codex plugin marketplace remove <name>` on one of them first if you need to switch.

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

For an empty greenfield target, run `$project-init` once to materialize conventions and the domain index. ADRs are created only when a qualifying decision exists; hook assets are added only when a safe per-file command is verified. For any non-empty existing codebase or copied scaffold, use `$project-personalize`.

### Manual fallback

For tools without plugin support, copy the starter template:

```bash
rsync -a \
  --exclude '_multi_tier_examples/' \
  --exclude 'docs/specs/_template/' \
  --exclude 'docs/specs/changes/' \
  --exclude 'docs/adr/0000-template.md' \
  --exclude '.claude/rules/_examples/' \
  --exclude '.claude/hooks/' \
  --exclude '.claude/settings.json' \
  --exclude '.codex/' \
  <path-to-this-repo>/template/ <your-project>/
```

Then edit `AGENTS.md` placeholders (delete `{{HOOK_INDEX}}` unless you materialize verified hooks) and adapt path-scoped rules for your runtime. All reusable templates stay in the plugin/source library; the fallback installs no no-op hook files. Dockerfile / docker-compose / build scripts are your own to add per stack.

### Source naming rule

The plugin identity is `project-workflow` for both Claude Code and Codex. Local and remote sources should not be installed simultaneously under that same plugin name. For normal use, install the GitHub release source. For local development, replace it with the local source rather than installing both.

### Runtime compatibility

- Release checks currently run with Claude Code 2.1.144 and Codex CLI 0.142.5; these are tested baselines, not declared minimum versions.
- Primary release verification runs on macOS. When hooks are materialized, Codex includes a PowerShell `commandWindows` override and the shared hook resolves Windows venv/npm binaries; Linux and Windows remain smoke-tested rather than full end-to-end certified.
- Older hosts without current plugin or hook support may still use the manual fallback, but are outside adapter guarantees.

## Workflow surface

> Version follows the Claude and Codex plugin manifests; per-skill version columns are intentionally omitted to avoid drift. Claude Code uses `/project-workflow:*`; Codex uses the same action names as `$skill`. [`docs/actions/`](docs/actions/) is the canonical contract layer.

Most work does **not** use all nine actions. Initialize once, then use the daily path only when a change benefits from tracking:

| Frequency | Action | Purpose |
|---|---|---|
| Once, greenfield | `project-init` | Create the project baseline and conventions. |
| Per tracked change | `feature-init` | Choose no artifact, light tasks-only, or full spec/plan/tasks. Tiny/local work can proceed directly. |
| Full lane only | `spec-quality-check` | Check the collaboratively completed draft before implementation. |
| End of tracked change | `feature-done` | Run L1/L2/L3, current-truth check, and write one compact delivery receipt. |
| Periodic sweep | `feature-archive` | Merge pending current truth and move delivered changes out of the active tree. |

Exception and maintenance actions appear only when their condition exists:

| Condition | Action |
|---|---|
| Copied scaffold or any non-empty existing codebase retrofit | `project-personalize` |
| A confirmed contract becomes materially wrong during implementation | `spec-revise` |
| Historical active specs contradict each other | `spec-reconcile` |
| Objective project state drifts from `AGENTS.md` or scoped rules | `agents-md-revise` |

> Reusable templates (feature/domain/ADR) are plugin-canonical and are not retained in generated projects. Actions instantiate only concrete artifacts when needed. To customize, fork the plugin and edit `template/`.
>
> Ad-hoc single-layer review (formerly `/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle`, merged into `feature-done` in v3.0): run the project check command directly for L1, or dispatch the `agents-md-reviewer` / `spec-reviewer` sub-agent from the main session for L2/L3.

## Reviewer methodology

[`docs/reviewers/`](docs/reviewers/) is the canonical layer for the six reviewer, auditor, and research roles. Claude exposes thin named-agent adapters in [`agents/`](agents/); Codex skills read the same bundled reviewer specs and use a general subagent or main-session fallback. See the [reviewer index](docs/reviewers/README.md) for the role map instead of duplicating it here.

## Maintaining the Codex package

The Codex plugin contains a bundled copy of core docs and `template/` because installed Codex plugins do not share the Claude Code plugin install directory. Treat those bundled files as release artifacts. Its `SKILL.md` bodies are a separately maintained Codex-native adapter and are deliberately not overwritten by the sync script; shared non-runtime references such as `project-init/reference.md` are still synchronized. After changing shared core assets or either adapter, run:

```bash
node scripts/sync-codex-plugin.js
node scripts/sync-codex-plugin.js --check
node scripts/check-adapter-parity.js
node scripts/check-workflow-contracts.cjs
node scripts/check-reviewer-fixtures.cjs
node scripts/check-template-contracts.js
node scripts/check-lifecycle-links.cjs
node scripts/check-markdown-links.cjs
```

These checks enforce the same 9 public actions, installed-plugin-safe canonical reads, the `< 200` line limit, structural verdict/receipt/template contracts, deterministic endpoint fixture inputs and verdict truth tables, release-copy synchronization, and local Markdown paths/fragments. They do not execute model reviewers. When reviewer or endpoint behavior changes, run the model endpoint smoke in [`docs/examples/reviewer-mutation-smoke.md`](docs/examples/reviewer-mutation-smoke.md) and record the result in the release PR/task.

## License

MIT
