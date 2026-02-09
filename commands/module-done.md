---
description: "Mark a module as complete: update PROGRESS.md, create module CLAUDE.md if needed."
argument-hint: Module name (or omit to detect from recent work)
---

# Module Done

Mark a module as complete and prepare the project for the next module.

## Step 1: Identify the Module

- If $ARGUMENTS specifies a module → use that
- If $ARGUMENTS is empty → infer from PROGRESS.md (the module currently marked "方案已确认")

Read `PROGRESS.md` to confirm module identity and current status.

**If the module is already marked "已完成"**: Ask the user what they want to update:
- "Update module CLAUDE.md" → Go to Step 3
- "Fix the next entry point" → Go to Step 2, only update "下次继续的入口"
- "Re-mark as complete" → Proceed normally (idempotent)

## Step 2: Update PROGRESS.md

1. Mark this module's status as "已完成" (condense to one line — do not preserve detailed implementation steps)
2. Update "下次继续的入口":
   - Identify the next module to work on (check dependency order)
   - Write a specific handoff description, not vague phrases like "继续开发"
   - Good example: "从支付模块的 Webhook 处理开始，先设计幂等性方案，参考 docs/architecture.md 第 3 节的时序图"
3. Add an entry to "已完成的里程碑" if appropriate

## Step 3: Module CLAUDE.md (Conditional)

**Evaluate whether this module needs its own CLAUDE.md.** Create `src/[module]/CLAUDE.md` if ANY of the following apply:

- The module exposes interfaces that other modules will consume
- The data model has non-obvious constraints (e.g., soft deletes, optimistic locking, enum mappings)
- There are implementation decisions that would surprise or confuse a future reader
- Error handling or edge cases have patterns that downstream modules must follow

**Skip if**: The module is simple CRUD with no surprising behavior.

**If creating**, include only what a developer working on a *dependent module* needs to know:

```markdown
# [Module Name]

## Public Interface
- [Key functions/endpoints with their contracts]

## Data Model
- [Entities, key constraints, non-obvious rules]

## Important Notes
- [Gotchas, edge cases, decisions that affect other modules]
```

Target: 50-150 lines. Do NOT duplicate what's already in `docs/architecture.md` — reference it instead.

## Step 4: Summary

After writing:
- List each modified/created file with line count
- State the next module and entry point
- Remind: "Run `/module-plan [next module]` to start planning the next module."
