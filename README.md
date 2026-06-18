# project-workflow v2

**Spec-driven feature development blueprint for AI-assisted coding** — methodology docs + starter template + Claude Code plugin.

> v1 (5 slash commands forcing a workflow) is preserved at git tag `v1.1.0`.
> v2 is a **complete rewrite**: docs-first, optional plugin, non-process-owning. See [Migration from v1](#migration-from-v1) below.

---

## Why v2 exists

AI-assisted coding has three Tier 1 engineering problems. Every part of v2 — the 5-phase workflow, 4 pillars, skills, template — exists to address these three:

- **Verification** — AI generates code 10x faster than humans can validate. Boris Cherny (Claude Code lead): *"The most important thing is to give Claude a way to verify."*
- **Context-as-RAM** — Context windows behave like RAM, not storage. Long sessions drift, token costs scale, attention degrades past 200-line files.
- **Drift** — Without long-term memory, AI conventions drift across time (same code reviewed twice gives different verdicts), modules (A vs B style mismatch), and project lifecycle (month 1 vs month 6 codebase).

Cross-layer inconsistency (frontend/backend/DB contracts) is treated as a stack-specific tactic (`docs/workflow.md §8.6`), not a top-level proposition — community evidence frames it as a general architecture problem, not AI-specific.

Full framing with sources: [`docs/workflow.md §0.1`](docs/workflow.md).

---

## Project goal

project-workflow helps real projects move from **chat-driven AI coding** to **spec-driven, reviewable, maintainable AI-assisted development**.

| Need | project-workflow answer |
|---|---|
| Start a project with shared conventions | P0 starter kit: `AGENTS.md`, `.claude/rules/`, hooks, ADR/spec templates |
| Start a feature without losing requirements in chat | P2 `spec.md` / `plan.md` / `tasks.md` |
| Keep implementation aligned while coding | spec revise SOP, module-boundary handling, environment-enforced rules |
| Know whether a feature is ready | L1/L2/L3 review + proof bundle |
| Keep the codebase from drifting over months | P4 `agents-md-revise` refresh of project conventions |

The intended outcome is practical: fewer repeated reminders, fewer unreviewed AI changes, clearer handoff artifacts, and project rules that stay close to the codebase as it evolves.

---

## What's in v2

| Layer | What | Where |
|---|---|---|
| 📘 **Methodology docs** | 5-phase blueprint (P0 Project Setup / P2 Feature / P3 Maintenance / P4 Drift Refresh) + 4 pillars + spec-driven 3-file template + 10 工程陷阱 | [`docs/`](docs/) |
| 🧰 **Starter template** | Pure methodology scaffolding (`AGENTS.md`, spec/plan/tasks, ADR, Issue/PR templates, hook skeleton) — language/framework-agnostic | [`template/`](template/) |
| 🤖 **Claude Code plugin** | Slash commands automating high-ROI workflow actions | [`.claude-plugin/`](.claude-plugin/) + [`skills/`](skills/) |

> **Concrete project example** (example-of-one, not authoritative source): [`shrekshrek/full-stack-scaffolding-fastapi-nuxt4`](https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt4) — a FastAPI + Nuxt 4 full-stack scaffold that follows v2 methodology. v2's own arguments are self-contained in `docs/`; the scaffold is just one concrete instantiation.

## Install (Claude Code plugin)

```
/plugin marketplace add shrekshrek/project-workflow
/plugin install project-workflow
```

Then in any project:
```
/project-workflow:feature-init <feature-slug>
```

### Without plugin (OpenCode / manual)

For users who can't install the Claude Code plugin (e.g. OpenCode):

```bash
cp -r <path-to-this-repo>/template/. <your-project>/
```

Then edit `AGENTS.md` placeholders, `.claude/rules/*.md` for your stack, and `.claude/hooks/lint-on-edit.js` (uncomment the lint line for your stack). Note: `template/` is **methodology only** — Dockerfile / docker-compose / build scripts are your own to add per stack.

## Skills

> Version follows `plugin.json`(currently 2.9.x);per-skill version columns removed to avoid drift。

| Skill | What it does |
|---|---|
| `/project-workflow:project-init` | P0 greenfield initialization — Q&A walks through stack and conventions, generates 10+ files (AGENTS.md / .claude/ / docs/adr/ / etc.). "不确定" answers trigger `tech-researcher` sub-agent for parallel research. Auto-handles fullstack tier structure. |
| `/project-workflow:project-personalize` | P0 scaffold-cloned / retrofit — adapts existing v2-shaped project to user's values. Replaces scaffold defaults, completes tier-level AGENTS.md (双文件 scheme), dispatches `codebase-explorer` sub-agent to scan existing structure. |
| `/project-workflow:feature-init` | Start a new feature spec — creates `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md` with module-setup auto-detection (per workflow §2). **Pure scaffold + chat-context pre-fill + reminders + decision-completeness audit** ── **zero preset Q&A interview**. Mission-critical strong constraints (Scope "不做" / Sibling Alignment) become reminders gated by `/spec-quality-check`, not required Q&A. Adaptive reminders tell the main session when to use `tech-researcher` / `context7`; the skill itself does not pre-run research. All TODOs filled via conversational mode (per spec-driven §3.6.5). |
| `/project-workflow:spec-quality-check` | **Pre-implementation gate** — verify spec/plan/tasks quality per spec-driven.md §3.7 7-q checklist. Mechanical checks + dispatches `spec-quality-reviewer` sub-agent for subjective items. |
| `/project-workflow:spec-revise` | **Mid-implementation revision** — orchestrate spec/plan/module change SOP per workflow.md §3.5 / §2.6 (ADR + spec.md 修订记录 + plan.md prior decisions + tasks.md rebalance) + `decision-completeness-auditor` 兜底 (Step 7.5) + Diff Review Gate with revert hatch (Step 7.6)。 |
| `/project-workflow:l1-review` | Run project's `check` command (lint/typecheck/test) and report pass/fail with concise summary |
| `/project-workflow:l2-review` | A 类约定 compliance review (AGENTS.md 多层 + `.claude/rules/*.md`) via `agents-md-reviewer` sub-agent — finds rule violations on changed files |
| `/project-workflow:l3-review` | spec.md compliance review via `spec-reviewer` sub-agent — finds missing items, deviations, scope creep |
| `/project-workflow:proof-bundle` | Verify proof bundle completeness and write to `tasks.md` § Proof Bundle |
| `/project-workflow:feature-done` | Composite: L1 → L2 → L3 → proof-bundle, single READY/NEEDS WORK/BLOCKED verdict |
| `/project-workflow:agents-md-revise` | **P4 main tool** — proactively audit A 类约定 (AGENTS.md 多层 + `.claude/rules/`) vs project actual state; report objective drifts (commands / deps / dirs / versions / config), per-item yes/no/ignore-forever, apply + commit draft. Critical-only, no subjective signals, no hook auto-trigger. |

> Spec templates (`docs/specs/_template/{spec,plan,tasks}.md`) are plugin-canonical — `/feature-init` cps from `$CLAUDE_PLUGIN_ROOT/template/` at feature-creation time. To customize, fork the plugin and edit `template/docs/specs/_template/`.

## Sub-agents

| Agent | Used by | Scope |
|---|---|---|
| `agents-md-reviewer` | `/l2-review` | Reads AGENTS.md (+ tier-level + `.claude/rules/`), checks changed code for rule violations |
| `spec-reviewer` | `/l3-review` | Reads feature's spec.md, checks implementation matches §1 Outcomes / §2 Scope / §3 Constraints / §4 Verification |
| `tech-researcher` | `/project-init` Q&A | Researches stack/library choices (2-3 candidates + pros/cons + recommendation). Read-only. Triggers when user answers "不确定" / "帮我选" in Q&A. |
| `codebase-explorer` | `/project-personalize` Path C | Surveys existing codebase structure → recommends `## Project Structure` content. Read-only, no edits. |
| `spec-quality-reviewer` | `/spec-quality-check` | Subjective spec quality assessment (Outcomes specificity / Constraints真假 / tasks verifiable). 4-phase methodology, cite-or-skip discipline. Read-only. |
| `decision-completeness-auditor` | `/project-init`, `/project-personalize`, `/feature-init`, `/spec-revise`, `/agents-md-revise` | Pre-Preview-Gate plant-decision audit (workflow.md §1.12). Traces every specific-string decision (module name / path / broker / port / package name / host) back to Q&A answers or stack conventions; flags unanchored plants 🚫 must-fix. Read-only. |

## Read this first

- [`docs/project-workflow-overview.drawio`](docs/project-workflow-overview.drawio) — ⭐ Visual one-page overview (2 tabs: Lifecycle + Skill ↔ Agent dispatch). Open in [draw.io](https://app.diagrams.net) or VS Code Draw.io Integration extension.
- [`docs/quickstart.md`](docs/quickstart.md) — shortest daily path for using project-workflow in a real project
- [`docs/workflow.md`](docs/workflow.md) — ⭐ Core 5-phase blueprint
- [`docs/gotchas.md`](docs/gotchas.md) — ⭐ 10 engineering pitfalls (from real validation)
- [`docs/spec-driven.md`](docs/spec-driven.md) — spec/plan/tasks pattern detail
- [`docs/tooling.md`](docs/tooling.md) — three-layer tool stack model + v2 vs Spec Kit / Superpowers / ECC / Symphony 对比(评估者 first read)

## Migration from v1

v1 was 5 `/project-plan` / `/module-plan` / `/module-dev` / `/module-done` / `/plan-review` slash commands that **owned the entire workflow process**. The premise didn't survive: users felt locked into a rigid flow.

v2 abandons process-ownership:
- **Methodology lives in docs**, not in slash commands
- **Slash commands are optional helpers**, each independently usable
- **No mandated phase sequence** — open at the part you need
- **Cross-tool by design** (AGENTS.md + docs + template work in any AI tool;
  slash commands enhance Claude Code but aren't required)

v1 source preserved at git tag [`v1.1.0`](../../tree/v1.1.0). Install via `git checkout v1.1.0` if needed.

## Status

v2.9.35 ships **11 skills + 6 sub-agents** covering the full P0→P2→P3→P4 lifecycle. The remaining skills are still gathering field hours — battle-testing welcome.

The methodology docs (workflow.md / spec-driven.md / gotchas.md / tooling.md) are complete and self-contained. A concrete instantiation exists at the public scaffold linked above, but the docs do not depend on it for authority.

## License

MIT
