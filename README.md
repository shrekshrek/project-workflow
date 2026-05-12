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
| 🤖 **Claude Code plugin** | Slash commands automating high-ROI workflow actions | [`.claude-plugin/`](.claude-plugin/) + [`skills/`](skills/) |

> **Reference implementation**: methodology is validated against a Vue 3 + Element Plus + FastAPI full-stack scaffold (Docker + Postgres + Alembic + 18 passing tests, end-to-end). The scaffold lives in a separate repo (TBD; currently maintained in a private dev playground while the plugin stabilizes). Once published, it'll be referenced from `docs/dev-deploy.md`.

## Install (Claude Code plugin)

```
/plugin marketplace add shrekshrek/project-workflow
/plugin install project-workflow
```

Then in any project:
```
/project-workflow:spec-init <feature-slug>
```

## Skills

| Skill | Version | What it does |
|---|---|---|
| `/project-workflow:spec-init` | v2.0.0 | Start a new feature spec — creates `docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md` with module-setup auto-detection (per workflow §2) |
| `/project-workflow:l1-review` | v2.1.0 | Run project's `check` command (lint/typecheck/test) and report pass/fail with concise summary |
| `/project-workflow:l2-review` | v2.1.0 | AGENTS.md compliance review via `agents-md-reviewer` sub-agent — finds rule violations on changed files |
| `/project-workflow:l3-review` | v2.1.0 | spec.md compliance review via `spec-reviewer` sub-agent — finds missing items, deviations, scope creep |
| `/project-workflow:proof-bundle` | v2.1.0 | Verify proof bundle completeness and write to `tasks.md` § Proof Bundle |
| `/project-workflow:feature-done` | v2.1.0 | Composite: L1 → L2 → L3 → proof-bundle, single READY/NEEDS WORK/BLOCKED verdict |

## Sub-agents

| Agent | Used by | Scope |
|---|---|---|
| `agents-md-reviewer` | `/l2-review` | Reads AGENTS.md (+ tier-level + `.claude/rules/`), checks changed code for rule violations |
| `spec-reviewer` | `/l3-review` | Reads feature's spec.md, checks implementation matches §1 Outcomes / §2 Scope / §3 Constraints / §4 Verification |

## Read this first

- [`docs/workflow.md`](docs/workflow.md) — ⭐ Core 5-phase blueprint
- [`docs/gotchas.md`](docs/gotchas.md) — ⭐ 10 engineering pitfalls (from real validation)
- [`docs/spec-driven.md`](docs/spec-driven.md) — spec/plan/tasks pattern detail
- [`docs/dev-deploy.md`](docs/dev-deploy.md) — local dev + sync deploy pattern

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

v2.1.0 ships 6 skills + 2 sub-agents. `/spec-init` is validated end-to-end (produced a 316-line spec/plan/tasks triple for `email-verification` feature on the reference scaffold). The remaining 5 skills are fresh — battle-testing welcome.

The methodology docs (workflow.md / gotchas.md / spec-driven.md / dev-deploy.md) are complete and have been validated against a working Vue 3 + FastAPI scaffold (kept in a private dev playground until publish).

## License

MIT
