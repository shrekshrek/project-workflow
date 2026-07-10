# project-workflow v3

**Spec-driven feature development blueprint for AI-assisted coding** — methodology docs + starter template + runtime adapters.

> v1 (5 slash commands forcing a workflow) is preserved at git tag `v1.1.0`.
> v2 was the docs-first rewrite from v1. v3 keeps that stance and adds dual Claude/Codex plugin packaging plus spec lifecycle management. See [Migration from v1](#migration-from-v1) below.

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

- Core: `AGENTS.md`, `docs/specs/`(域现状), `docs/specs/changes/`(tracked changes), ADR, proof bundle, L1/L2/L3 review model, canonical workflow actions in `docs/actions/`, and canonical reviewer specs in `docs/reviewers/`.
- Adapters: Claude Code plugin is mature; Codex is distributed as a separate Codex plugin package. Both adapters use the same core docs and template, but their installed artifacts are separate.

See [`docs/cross-tool-methodology.md`](docs/cross-tool-methodology.md).

| Need | project-workflow answer |
|---|---|
| Start a project with shared conventions | P0 starter kit: `AGENTS.md`, path-scoped rules, hooks, ADR template |
| Start a feature without losing requirements in chat | P2 `spec.md` / `plan.md` / `tasks.md` |
| Keep implementation aligned while coding | spec revise SOP, module-boundary handling, environment-enforced rules |
| Know whether a feature is ready | L1/L2/L3 review + proof bundle |
| Keep the codebase from drifting over months | P4 `agents-md-revise` refresh of project conventions |

The intended outcome is practical: fewer repeated reminders, fewer unreviewed AI changes, clearer handoff artifacts, and project rules that stay close to the codebase as it evolves.

---

## What's in v3

| Layer | What | Where |
|---|---|---|
| 📘 **Methodology core** | 5-phase blueprint (P0 Project Setup / P2 Feature + Module Setup sub-flow / P3 Maintenance / P4 Drift Refresh; no P1 by design — see workflow.md §0.2) + canonical action specs + 4 pillars + cross-tool boundaries + spec-driven 3-file template + 10 工程陷阱 | [`docs/`](docs/) |
| 🧰 **Starter template** | Baseline project scaffold: portable core files plus current runtime enforcement assets (`CLAUDE.md`, `.claude/` rules/hooks, `.codex/` hooks). It is language/framework-agnostic, but not tool-empty. | [`template/`](template/) |
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

Run `$project-init` once per target project to materialize `AGENTS.md`, ADR templates, hooks, Claude compatibility assets, and Codex hook config into that project. Feature spec templates stay in the plugin and are copied into concrete `docs/specs/changes/<NNN>-<slug>/` directories by `$feature-init`.

### Manual fallback

For tools without plugin support, copy the starter template:

```bash
rsync -a \
  --exclude '_multi_tier_examples/' \
  --exclude '.claude/rules/_examples/' \
  <path-to-this-repo>/template/ <your-project>/
```

Then edit `AGENTS.md` placeholders and adapt path-scoped rules / hooks for your runtime. Note: `template/` contains methodology files plus Claude compatibility assets and a Codex hook mapping; Dockerfile / docker-compose / build scripts are your own to add per stack.

### Source naming rule

The plugin identity is `project-workflow` for both Claude Code and Codex. Local and remote sources should not be installed simultaneously under that same plugin name. For normal use, install the GitHub release source. For local development, replace it with the local source rather than installing both.

## Primary workflow actions

> Version follows the Claude and Codex plugin manifests; per-skill version columns are intentionally omitted to avoid drift.
> These are the default public workflow actions. Claude Code exposes them as `/project-workflow:*`; Codex exposes the same action set as `$skill` after installing the Codex plugin. Manual users follow the canonical specs in [`docs/actions/`](docs/actions/).

| Action | Claude Code adapter | Codex adapter | What it does |
|---|---|---|---|
| `project-init` | `/project-workflow:project-init` | `$project-init` | P0 greenfield initialization — Q&A walks through stack and conventions, generates the project baseline (`AGENTS.md`, adapter hooks/rules, ADR template, etc.). "不确定" answers may route to `tech-researcher`. |
| `project-personalize` | `/project-workflow:project-personalize` | `$project-personalize` | P0 scaffold-cloned / retrofit — adapts an existing project-workflow-shaped project to actual names, commands, tiers, and conventions; may use `codebase-explorer` for structure survey. |
| `feature-init` | `/project-workflow:feature-init` | `$feature-init` | Create a numbered feature artifact only when the task needs new project-workflow tracking. Full lane creates `spec.md` / `plan.md` / `tasks.md`; light lane creates `tasks.md`. Tiny fixes and work covered by an accepted spec skip this action. |
| `spec-quality-check` | `/project-workflow:spec-quality-check` | `$spec-quality-check` | Pre-implementation gate for full-lane specs: mechanical checks plus subjective review against the 7-question checklist. Failed items block implementation. |
| `spec-revise` | `/project-workflow:spec-revise` | `$spec-revise` | Mid-implementation revision SOP for frozen spec / plan / module-boundary changes: ADR, spec revision record, plan prior decisions, tasks rebalance, and traceability audit. |
| `feature-done` | `/project-workflow:feature-done` | `$feature-done` | Default end-of-feature gate: L1 → L2 → L3 → current-truth check → proof bundle, with one READY / NEEDS WORK / BLOCKED verdict. Idempotent — re-run for partial rechecks. |
| `feature-archive` | `/project-workflow:feature-archive` | `$feature-archive` | Lifecycle closure (default sweep mode): move delivered feature dirs into `docs/specs/changes/archive/` so the active tree holds in-flight work only; merge durable conclusions into `docs/specs/<area>.md` when pending; mark superseded old specs (已取代 / 已废弃). |
| `spec-reconcile` | `/project-workflow:spec-reconcile` | `$spec-reconcile` | Repair conflicts across accumulated specs in one area (retrofit tool): conflict matrix, user-picked source of truth, mark + archive losing specs, current-truth gap report. |
| `agents-md-revise` | `/project-workflow:agents-md-revise` | `$agents-md-revise` | P4 convention refresh: audit A 类约定 (AGENTS.md + path-scoped rules) against objective project state, propose user-approved updates, and summarize drift. |

> Spec templates (`docs/specs/changes/_template/{spec,plan,tasks}.md`) are plugin-canonical — `feature-init` copies them from the installed plugin template at feature-creation time. To customize, fork the plugin and edit `template/docs/specs/changes/_template/`.
>
> Ad-hoc single-layer review (formerly `/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle`, merged into `feature-done` in v3.0): run the project check command directly for L1, or dispatch the `agents-md-reviewer` / `spec-reviewer` sub-agent from the main session for L2/L3.

## Reviewer Agents

Canonical reviewer/auditor methodology lives in [`docs/reviewers/`](docs/reviewers/). Claude files in [`agents/`](agents/) are thin runtime adapters that point back to those specs. Codex-native skills read the bundled reviewer specs directly and may use any available general subagent, with main-session fallback; the Codex package does not ship Claude named-agent adapters.

| Role | Canonical spec | Claude adapter | Codex adapter | Used by |
|---|---|---|---|---|
| L2 project convention review | `docs/reviewers/agents-md-reviewer.md` | `agents/agents-md-reviewer.md` | plugin skill reads reviewer spec | `feature-done` L2 layer(+ ad-hoc direct dispatch) |
| L3 spec compliance review | `docs/reviewers/spec-reviewer.md` | `agents/spec-reviewer.md` | plugin skill reads reviewer spec | `feature-done` L3 layer(+ ad-hoc direct dispatch) |
| Spec quality subjective review | `docs/reviewers/spec-quality-reviewer.md` | `agents/spec-quality-reviewer.md` | plugin skill reads reviewer spec | `/spec-quality-check`, `$spec-quality-check` |
| Decision completeness audit | `docs/reviewers/decision-completeness-auditor.md` | `agents/decision-completeness-auditor.md` | plugin skill reads reviewer spec | init/revise/refresh actions |
| Stack/library research | `docs/reviewers/tech-researcher.md` | `agents/tech-researcher.md` | plugin skill reads reviewer spec | `/project-init`, `$project-init` |
| Codebase structure survey | `docs/reviewers/codebase-explorer.md` | `agents/codebase-explorer.md` | plugin skill reads reviewer spec | `/project-personalize`, `$project-personalize` |

## Maintaining the Codex package

The Codex plugin contains a bundled copy of core docs and `template/` because installed Codex plugins do not share the Claude Code plugin install directory. Treat those bundled files as release artifacts. Its `SKILL.md` bodies are a separately maintained Codex-native adapter and are deliberately not overwritten by the sync script; shared non-runtime references such as `project-init/reference.md` are still synchronized. After changing shared core assets or either adapter, run:

```bash
node scripts/sync-codex-plugin.js
node scripts/sync-codex-plugin.js --check
node scripts/check-adapter-parity.js
```

The parity check enforces the same 9 public actions on both adapters, canonical action references, the `< 200` line limit, and absence of Claude-only runtime markers in Codex skills.

## Read this first

- [`docs/project-workflow-overview.drawio`](docs/project-workflow-overview.drawio) — ⭐ Visual one-page overview (2 tabs: Lifecycle + Skill ↔ Agent dispatch). Open in [draw.io](https://app.diagrams.net) or VS Code Draw.io Integration extension.
- [`docs/quickstart.md`](docs/quickstart.md) — shortest daily path for using project-workflow in a real project
- [`docs/actions/`](docs/actions/) — canonical workflow action specs used by all runtime adapters
- [`docs/reviewers/`](docs/reviewers/) — canonical reviewer/auditor/researcher specs used by both runtime adapters
- [`docs/workflow.md`](docs/workflow.md) — ⭐ Core 5-phase blueprint
- [`docs/cross-tool-methodology.md`](docs/cross-tool-methodology.md) — core vs runtime adapter boundaries for Claude Code / Codex / manual use
- [`docs/gotchas.md`](docs/gotchas.md) — ⭐ 10 engineering pitfalls (from real validation)
- [`docs/spec-driven.md`](docs/spec-driven.md) — spec/plan/tasks pattern detail
- [`docs/tooling.md`](docs/tooling.md) — three-layer tool stack model + project-workflow vs Spec Kit / Superpowers / ECC / Symphony 对比(评估者 first read)

## Migration from v1

v1 was 5 `/project-plan` / `/module-plan` / `/module-dev` / `/module-done` / `/plan-review` slash commands that **owned the entire workflow process**. The premise didn't survive: users felt locked into a rigid flow.

Current project-workflow keeps the v2 rewrite's rejection of process-ownership:
- **Methodology lives in docs**, not in slash commands
- **Slash commands are optional helpers**, each independently usable
- **No mandated phase sequence** — open at the part you need
- **Cross-tool by design** (AGENTS.md + docs + template work in any AI tool;
  slash commands enhance Claude Code but aren't required)

v1 source preserved at git tag [`v1.1.0`](../../tree/v1.1.0). Install via `git checkout v1.1.0` if needed.

## Status

The current release ships a mature **Claude-native adapter** with **9 skills + 6 named sub-agents** and a separate **Codex-native plugin adapter** exposing the same 9 workflow skills through bundled canonical action/reviewer specs. Both adapters share one action surface and one methodology core; runtime interaction, subagent dispatch, commands, and plugin-root handling stay native to each host.

The methodology docs (`workflow.md` / `actions/` / `reviewers/` / `cross-tool-methodology.md` / `spec-driven.md` / `gotchas.md` / `tooling.md`) are complete and self-contained. A concrete instantiation exists at the public scaffold linked above, but the docs do not depend on it for authority.

## License

MIT
