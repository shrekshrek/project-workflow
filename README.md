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

Personal and team development use the same per-change workflow. A team does not need a project-workflow collaboration layer: each contributor applies the same no-artifact/light/full classification, verification, and archive rules to their own change before submitting it.

v3 separates **methodology core** from **runtime adapters**:

- Core: `AGENTS.md`, `docs/specs/`(域现状), `docs/specs/changes/`(tracked changes), conditional ADR, compact delivery receipt, L1/L2/L3 review model, canonical workflow actions in `docs/actions/`, and canonical reviewer specs in `docs/reviewers/`.
- Adapters: Claude Code and Codex each have a host-native plugin package. Both use the same core docs and template, while keeping runtime skills, manifests, and subagent dispatch host-specific.

See [`docs/cross-tool-methodology.md`](docs/cross-tool-methodology.md).

| Need | project-workflow answer |
|---|---|
| Start a project without guessing the stack | P0 neutral six-file baseline; personalize from repository evidence after a scaffold exists |
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
| 📘 **Methodology core** | 5-phase blueprint (P0 Project Setup / P2 Feature + Module Setup sub-flow / P3 Maintenance / P4 Drift Refresh; no P1 by design — see workflow.md §0.2) + canonical action specs + 4 pillars + cross-tool boundaries + spec-driven 3-file template + demonstrative gotchas ledger | [`docs/`](docs/) |
| 🧰 **Starter template** | Six-file generated baseline plus optional rules, hooks, tier examples, feature/domain/ADR templates, and safety scripts retained in the plugin library. | [`template/`](template/) |
| 🤖 **Claude Code adapter** | 9 Claude-native slash-command skills + 6 named sub-agents | [`adapters/claude/`](adapters/claude/) + [`.claude-plugin/`](.claude-plugin/) marketplace |
| 🧩 **Codex adapter** | 9 Codex-native skills using bundled canonical reviewer specs | [`adapters/codex/`](adapters/codex/) + [`.agents/plugins/`](.agents/plugins/) marketplace |

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

Update the marketplace and plugin, then restart Claude Code before testing the new version:

```bash
claude plugin marketplace update project-workflow
claude plugin update project-workflow@project-workflow
```

Claude Code exposes the same 9 workflow actions as Codex — one entry point per action, no separate helper commands. Normal feature delivery ends with `/project-workflow:feature-done`; partial reruns re-invoke the same command. Same-task reviewer results may be reused only when every input is provably unchanged.

### Codex plugin

The Codex-native source adapter lives at [`adapters/codex/`](adapters/codex/). The repository marketplace resolves the self-contained generated package from the `plugin-dist` branch. Codex exposes the same 9 workflow actions through its own native skill implementations; the Codex skills are not copies of the Claude runtime adapter.

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

If an older delivered feature still has a checkbox-style `## Proof Bundle` without `Verdict:`, rerun `feature-done` before archiving it. `feature-archive` sweep reports these as legacy migration candidates and never guesses READY from old checkboxes.

<details>
<summary>Local development install (repo contributors only)</summary>

Build both self-contained packages into a fresh temporary directory while iterating on this repo itself. If the GitHub marketplace is already configured for the host being tested, remove it before adding this local marketplace; local and remote sources intentionally share the same marketplace and plugin names.

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

Do not add both the local development source and the GitHub release source at the same time. Remove the configured `project-workflow` marketplace for that host before switching sources, then reinstall and start a new task.

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

For an empty greenfield target, run `$project-init` once to materialize the neutral six-file baseline: `AGENTS.md`, the one-line `CLAUDE.md` alias, `.gitignore`, `docs/specs/index.md`, `docs/adr/README.md`, and `docs/gotchas.md`. For any non-empty existing codebase or copied scaffold, use `$project-personalize`; that is where real commands, paths, tiers, and optional host-specific rules/hooks are derived from repository evidence.

### Manual fallback

For tools without plugin support, use the same baseline materializer from this checkout:

```bash
node <path-to-this-repo>/scripts/materialize-project-baseline.cjs \
  --stage <temporary-staging-dir> --target <your-project>
node <path-to-this-repo>/scripts/materialize-project-baseline.cjs \
  --apply-staged <temporary-staging-dir> <your-project>
```

The generated baseline contains no stack placeholders or no-op hooks. All reusable templates and optional host-specific assets stay in the plugin/source library; add them later through evidence-backed personalization. Dockerfile / docker-compose / build scripts remain project-owned.

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
| Once, greenfield | `project-init` | Create the neutral six-file project baseline. |
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
| Objective project state drifts from `AGENTS.md` or explicitly selected host-specific convention files | `agents-md-revise` |

> Reusable templates (feature/domain/ADR) are plugin-canonical and are not retained in generated projects. Actions instantiate only concrete artifacts when needed. To customize, fork the plugin and edit `template/`.
>
> Ad-hoc single-layer review (formerly `/l1-review` / `/l2-review` / `/l3-review` / `/proof-bundle`, merged into `feature-done` in v3.0): run the project check command directly for L1, or dispatch the `agents-md-reviewer` / `spec-reviewer` sub-agent from the main session for L2/L3.

## Reviewer methodology

[`docs/reviewers/`](docs/reviewers/) is the canonical layer for the six reviewer, auditor, and research roles. Claude exposes thin named-agent adapters in [`adapters/claude/agents/`](adapters/claude/agents/); Codex skills read the same bundled reviewer specs. At an applicable dispatch boundary, both adapters must use a fresh native subagent invocation whenever dispatch and capacity are available; they may reuse an explicitly allowed, unchanged completed result, but never retask an existing reviewer instance. Main-session fallback is limited to unavailable/failed dispatch or exhausted capacity and must carry explicit execution evidence. See the [reviewer index](docs/reviewers/README.md) for the role map and fail-closed contract.

## Maintaining generated plugin packages

The main branch keeps one canonical core plus separate Claude- and Codex-native adapters. `scripts/build-plugin-packages.cjs` assembles two self-contained packages in a temporary output tree; no generated package is committed on `main`. A versioned release commit on `main` publishes the validated output to the generated `plugin-dist` branch after all checks pass. Maintainer-only feature-init fixtures, grading scripts, and scenario instructions remain source-only. After changing shared core assets or either adapter, run:

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

These checks enforce the same 9 public actions, installed-plugin-safe canonical reads, the `< 200` line limit, structural verdict/receipt/template contracts, deterministic endpoint and feature-init fixture inputs, mechanical no-clobber behavior, verdict truth tables, generated-package completeness, and source plus packaged Markdown paths/fragments. They do not execute model reviewers or generative skills. When reviewer, endpoint, or feature-init generation behavior changes, run the applicable model smoke in [`docs/examples/reviewer-mutation-smoke.md`](docs/examples/reviewer-mutation-smoke.md) or [`docs/examples/feature-init-scenario-matrix.md`](docs/examples/feature-init-scenario-matrix.md) and record the result in the release PR/task.

## License

MIT
