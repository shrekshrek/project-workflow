# project-workflow v2

**Spec-driven feature development blueprint for AI-assisted coding** — methodology docs + starter template + reference implementation + Claude Code plugin.

> v1 (5 slash commands forcing a workflow) is preserved at git tag `v1.1.0`.
> v2 is a **complete rewrite**: docs-first, optional plugin, non-process-owning. See [Migration from v1](#migration-from-v1) below.

---

## What's in v2

| Layer | What | Where |
|---|---|---|
| 📘 **Methodology docs** | 5-phase blueprint (P0 Project Setup / P2 Feature / P3 Maintenance / P4 Drift Refresh) + 4 pillars + spec-driven 3-file template + 10 工程陷阱 | [`docs/`](docs/) |
| 🧰 **Starter template** | Pure methodology scaffolding (`AGENTS.md`, spec/plan/tasks, ADR, Issue/PR templates, hook skeleton) — language/framework-agnostic | [`template/`](template/) |
| 🏗 **Reference implementation** | Vue 3 + Element Plus + FastAPI full-stack scaffold, Docker + Postgres + Alembic + 18 passing tests | [`examples/full-stack-vue-fastapi/`](examples/full-stack-vue-fastapi/) |
| 🤖 **Claude Code plugin** | Slash commands automating high-ROI workflow actions | [`.claude-plugin/`](.claude-plugin/) + [`skills/`](skills/) |

## Install (Claude Code plugin)

```
/plugin marketplace add shrekshrek/project-workflow
/plugin install project-workflow
```

Then in any project:
```
/project-workflow:spec-init <feature-slug>
```

## Skills (current state)

| Skill | Status | What it does |
|---|---|---|
| `/project-workflow:spec-init` | ✅ v2.0.0 | Start a new feature spec — creates `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md` with module-setup auto-detection (per workflow §2) |
| `/project-workflow:l1-review` | 🚧 planned | Run project's `check` command (lint/typecheck/test) and report |
| `/project-workflow:l2-review` | 🚧 planned | AGENTS.md compliance review via sub-agent |
| `/project-workflow:l3-review` | 🚧 planned | spec.md compliance review via sub-agent |
| `/project-workflow:proof-bundle` | 🚧 planned | Verify proof bundle completeness on feature delivery |
| `/project-workflow:feature-done` | 🚧 planned | Composite: L1 + L2 + L3 + proof-bundle |

## Read this first

- [`docs/workflow.md`](docs/workflow.md) — ⭐ Core 5-phase blueprint
- [`docs/gotchas.md`](docs/gotchas.md) — ⭐ 10 engineering pitfalls (from real validation)
- [`docs/spec-driven.md`](docs/spec-driven.md) — spec/plan/tasks pattern detail
- [`docs/dev-deploy.md`](docs/dev-deploy.md) — local dev + sync deploy pattern
- [`examples/full-stack-vue-fastapi/`](examples/full-stack-vue-fastapi/) — see the methodology in actual working code

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

v2.0.0 is **early** — 1 skill (`/spec-init`) shipped, 5 more in progress. The full methodology docs (workflow.md / gotchas.md / spec-driven.md) and reference implementation (full-stack-vue-fastapi) are complete and validated end-to-end.

## License

MIT
