---
description: "Guided module implementation planning: load context → explore dependencies → design → persist to docs/plan.md."
argument-hint: Module name (or omit to use PROGRESS.md entry point)
---

# Module Planning

You are helping a developer plan the implementation of a single module. This command guides the discussion from project context to a concrete, persisted implementation plan.

## Prerequisites

This command assumes `/project-plan` has already been run and these files exist:
- `CLAUDE.md` — project overview, tech stack, module list, coding conventions
- `PROGRESS.md` — module status table, next entry point
- `docs/architecture.md` — system architecture, data model, module boundaries

If these files don't exist, tell the user to run `/project-plan` first.

---

## Entry: New vs Revision

Before starting, check whether `docs/plan.md` exists and which module it covers.

### If `docs/plan.md` does NOT exist → Full Flow

Proceed to Phase 1 and run all 4 phases sequentially.

### If `docs/plan.md` exists for a DIFFERENT module → Full Flow

The previous module's plan is no longer needed. Proceed to Phase 1 (Phase 4 will overwrite `docs/plan.md`).

### If `docs/plan.md` exists for the SAME module → Revision Mode

This is a re-run to adjust an existing module plan. Read `docs/plan.md`, then:

1. Present a brief summary of the current plan (data model, API design, implementation steps)
2. Ask the user: **"What do you want to adjust?"** Typical answers:
   - "Data model needs changes" → Go to Phase 3, starting from the Data Model item
   - "API design doesn't feel right" → Go to Phase 3, starting from the API / Interface Design item
   - "Need to rethink the whole approach" → Go to Phase 3 from the beginning
   - "Just update the files" → Go to Phase 4
3. Execute from the chosen point. When persisting (Phase 4), **merge** changes into the existing plan rather than drafting from scratch — preserve content from unchanged items.

---

## Phase 1: Context

**Goal**: Understand the module scope and project context

**Actions**:
1. Read `CLAUDE.md`, `PROGRESS.md`, `docs/architecture.md`
2. Determine which module to plan:
   - If $ARGUMENTS specifies a module → use that
   - If $ARGUMENTS is empty → use PROGRESS.md "下次继续的入口"
3. From `docs/architecture.md`, extract this module's:
   - Responsibility (what it does)
   - Public interface (what other modules call)
   - Dependencies (what it calls)
   - Data owned (which entities/tables it manages)
4. Check PROGRESS.md for dependency status — are all upstream modules completed?
5. Present a brief summary to the user:
   - Module name and responsibility
   - Dependencies and their current status
   - Any warnings (e.g., upstream module not yet completed)
6. **Wait for user to confirm** the module selection before proceeding

---

## Phase 2: Exploration (Conditional)

**Goal**: Understand existing code that this module depends on or extends

**Skip this phase if**: This is a new project with no implemented modules yet.

**Run this phase if**: The module depends on already-completed modules, or there is existing code to integrate with.

**Actions**:
1. Launch 1-3 **codebase-explorer** agents to examine relevant existing code (scale agent count by complexity — 1 for simple dependencies, 2-3 for modules integrating deeply with existing code):
   - Agent 1: "Trace the interfaces and data models of [dependency modules] that this module will consume"
   - Agent 2 (if needed): "Identify patterns, conventions, and extension points in the existing codebase relevant to [this module]"
   - Agent 3 (for complex integrations): "Analyze similar existing features to [this module], trace their full implementation flow and identify reusable patterns"
2. Synthesize findings into context for design:
   - Available interfaces from dependency modules
   - Data models already in place
   - Conventions to follow (naming, error handling, patterns)
3. Present findings and **wait for user confirmation**

---

## Phase 3: Design

**Goal**: Produce a detailed implementation plan through discussion

**The agent drafts the complete plan; the user reviews and adjusts.** Go through this framework item by item:

1. **Data Model**: Specific table schemas, columns, types, indexes, constraints. If extending existing models, show what changes.
2. **API / Interface Design**: Routes or function signatures, request/response shapes, error responses. Follow patterns established in completed modules.
3. **Implementation Steps**: Ordered list of concrete steps. Each step should be small enough to implement and test independently. Include:
   - What to create (files, functions, classes)
   - What to modify (existing files, configurations)
   - Dependencies between steps
4. **Edge Cases & Error Handling**: Known edge cases, validation rules, error scenarios, and how each is handled.
5. **Test Strategy**: What to test and how:
   - Unit tests (which functions, what scenarios)
   - Integration tests (which flows)
   - Which scenarios warrant TDD (`/tdd`) vs direct implementation
6. **Key Decisions**: Any design choices made during discussion, with reasoning. Flag anything the user should explicitly confirm.

**For each item**: Draft a concrete proposal based on `docs/architecture.md` and Phase 2 findings. Don't ask the user to design from scratch — present a plan and let them adjust.

**Discussion is iterative**: The user may question, push back, or request alternatives. Revise the plan until the user is satisfied.

After all items are discussed, present the complete plan summary and **ask user to confirm** before persisting.

---

## Phase 4: Persist

**Goal**: Save the confirmed plan to project files

**Actions**:
1. Write `docs/plan.md` (overwrite) with the confirmed implementation plan:
   - Module name and responsibility (one line)
   - Data model details (table schemas or type definitions)
   - API / interface design (routes, signatures, contracts)
   - Implementation steps (ordered, with file paths where applicable)
   - Edge cases and error handling
   - Test strategy (what to test, which approach)
   - Key decisions and rationale
2. Update `PROGRESS.md`:
   - Mark this module's status as "方案已确认"
   - Update "下次继续的入口" to describe starting this module's implementation (specific enough for a new session to pick up, e.g., "从订单模块的数据库迁移开始，参考 docs/plan.md 第 2 节的表结构设计")

**After writing**:
- List each modified file with line count
- Remind the user: "Plan is saved. Start implementation with `Shift+Tab` to enter execution mode, or use `/tdd` for core business logic."

---

## Important Notes

- **Do NOT write implementation code** during this command. This is planning only.
- **docs/plan.md is temporary** — it gets overwritten each time a new module is planned. This is by design: it serves as a context bridge across `/compact` boundaries.
- If the module's upstream dependencies are not yet completed, warn the user but don't block planning. Some modules can be planned ahead.
- If the user wants to change the module scope significantly, suggest updating `docs/architecture.md` first (architecture changes should be reflected globally before module-level planning).
