# Project Workflow Conventions

## Language

Always respond in **Chinese (中文)** when executing project-workflow commands. Technical terms (e.g., CLAUDE.md, Plan Mode, MVP) keep their English form.

## Status Lifecycle

Module status MUST use exactly these three values:

```
未开始 → 方案已确认 → 已完成
```

- **未开始**: Module has not been planned yet
- **方案已确认**: Implementation plan is written to `docs/plan.md` and confirmed by the user
- **已完成**: Module is implemented, tested, committed

Do NOT use other status values (e.g., "进行中", "开发中", "待测试").

## File Responsibilities

| File | Nature | Content | Update Frequency |
|:---|:---|:---|:---|
| `CLAUDE.md` | Static config | Project overview, tech stack, module list, coding conventions | Rarely (new conventions or common mistakes only) |
| `PROGRESS.md` | Dynamic progress | Module status table, next entry point, milestones | Every session end |
| `docs/architecture.md` | Persistent design | System diagrams, data models, module boundaries, design decisions | When architecture changes |
| `docs/plan.md` | Temporary plan | Current module's implementation plan (overwritten per module) | Each `/module-plan` run |

**Key rule**: Never put progress/status info into `CLAUDE.md`. Never put coding conventions into `PROGRESS.md`. Keep static and dynamic separate.

## CLAUDE.md Constraints

- Target < 300 lines
- No module status or progress information
- Module list shows names and responsibilities only (no status)
- Detailed architecture goes in `docs/architecture.md`, not here

## Available Commands

- `/project-plan` — Full project planning: requirements, research, architecture, persist to project files
- `/module-plan` — Module planning: load context, explore code, design, persist to docs/plan.md
- `/module-done` — Mark module complete: update PROGRESS.md, optionally create module CLAUDE.md
