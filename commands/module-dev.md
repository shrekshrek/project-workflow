---
description: "Guided module implementation: load context → confirm scope → implement with tests → verify against plan."
argument-hint: Module name (or omit to use PROGRESS.md entry point)
---

# Module Development

You are helping a developer implement a module according to its confirmed plan. This command ensures Claude loads full context, follows the plan step by step, writes tests for key behaviors, and verifies the result against the plan before finishing.

## Prerequisites

This command assumes `/module-plan` has been run and these files exist:
- `CLAUDE.md` — project overview, tech stack, coding conventions
- `PROGRESS.md` — module status table (target module should be "方案已确认")
- `docs/architecture.md` — system architecture, module boundaries
- `docs/plan.md` — current module's implementation plan

If `docs/plan.md` doesn't exist or the module status is "未开始", tell the user to run `/module-plan` first.

---

## Entry: New vs Resume vs Refinement

Before starting, assess implementation state by scanning existing code against `docs/plan.md` steps.

### If no implementation code exists for this module → Full Flow

Proceed to Phase 1 and run all 4 phases.

### If partial implementation exists (some steps done, some remaining) → Resume Mode

This is a continuation (new session or after `/compact`). Scan existing code against `docs/plan.md` steps:

1. List which steps are done vs remaining
2. Ask the user: **"从哪一步继续？"**
3. Run Phase 1 (Load Context), then jump to Phase 3 at the chosen step

### If all steps are implemented → Refinement Mode

All plan steps appear complete. This is a re-run to check quality and fix issues.

1. Run Phase 1 (Load Context)
2. Skip Phase 2-3, go directly to Phase 4 (Verify)
3. Present verification results
4. Ask the user: **"需要改进什么？"** Typical answers:
   - "Fix the issues found in verification" → Fix them, then re-run Phase 4
   - "Add tests for [area]" → Write the tests, run them, then re-run Phase 4
   - "Refactor [component]" → Refactor, run tests, then re-run Phase 4
   - "No issues, looks good" → Suggest running `/module-done`
5. After each round of improvements, re-run Phase 4 to confirm

---

## Phase 1: Load Context

**Goal**: Ensure Claude has the full picture before writing any code

**Actions**:
1. Read `CLAUDE.md` (coding conventions, tech stack)
2. Read `docs/plan.md` (implementation plan — this is the primary guide)
3. Read `docs/architecture.md` (system design, module boundaries)
4. Read `PROGRESS.md` (confirm module status is "方案已确认")
5. If the module depends on completed modules, read their module CLAUDE.md files (e.g., `src/[dep]/CLAUDE.md`) for public interfaces

**Present to user**:
- Module name and current status
- Number of implementation steps from plan
- Key dependencies loaded
- **Wait for user to confirm** before proceeding

---

## Phase 2: Confirm Scope

**Goal**: Extract actionable steps and set expectations

**Actions**:
1. Extract the implementation steps list from `docs/plan.md`
2. For each step, classify:
   - **Needs tests**: Steps involving business logic, data processing, API endpoints, edge cases identified in plan
   - **No tests needed**: Config files, migrations (schema only), static assets, simple wiring
3. Present the step list with test annotations:
   ```
   Step 1: 创建数据库迁移 [无需测试]
   Step 2: 实现订单创建逻辑 [需要测试 — 边界: 库存不足、重复订单]
   Step 3: 实现订单查询 API [需要测试 — 参数校验、分页]
   Step 4: 接入支付回调 [需要测试 — 幂等性、签名验证]
   ```
4. **Ask user to confirm or adjust** the step list and test annotations

---

## Phase 3: Implement

**Goal**: Execute each step following a disciplined rhythm

**For each step**, follow this sequence:

### Steps marked "需要测试":

1. **Define interface / types** — Write the function signatures, type definitions, or API contracts first
2. **Write tests for key behaviors** — Cover the specific scenarios identified in Phase 2 (from plan's edge cases and boundaries). Don't test trivial code. Focus on:
   - Core business rules
   - Boundary conditions noted in plan
   - Error handling paths
   - Integration points with other modules
3. **Implement** — Write the code to make tests pass
4. **Run tests** — Verify they pass. Fix if needed.
5. **Move to next step**

### Steps marked "无需测试":

1. **Implement directly** — Write the code following plan specifications
2. **Verify** — Run build/type check if applicable
3. **Move to next step**

### Rhythm guidelines:

- **Don't batch**: Complete one step fully before starting the next
- **Don't gold-plate**: Implement exactly what the plan specifies, nothing more
- **Stay aligned**: If you discover the plan needs adjustment during implementation, pause and tell the user rather than silently deviating
- **Context awareness**: If context window is getting full, tell the user which steps are done and suggest running `/compact` or starting a new session with `/module-dev` (Resume Mode will pick up)

---

## Phase 4: Verify

**Goal**: Confirm the implementation meets the plan before declaring done

**Run this phase when all steps are complete** (or when the user asks to verify current state).

### 4.1 Build Check
- Run the project's build / type check command
- Fix any errors before proceeding

### 4.2 Test Check
- Run the full test suite (not just this module's tests — catch regressions)
- Fix any failures before proceeding

### 4.3 Plan Verification
Go through `docs/plan.md` item by item:

- **Each interface/endpoint in the plan** → Is it implemented?
- **Each edge case in the plan** → Is it handled? Is there a test?
- **Each design constraint in the plan** → Is it respected?
- **Test strategy in the plan** → Are the specified tests written?

Report:
```
✓ 已实现: [list]
✗ 未实现: [list, if any]
⚠ 偏差: [any deviations from plan, with reason]
```

### 4.4 Convention Check
Scan implemented code against `CLAUDE.md` coding conventions:
- File organization matches project structure
- Naming conventions followed
- Error handling patterns consistent

### 4.5 Summary
Output:
- Files created/modified (with line counts)
- Tests written (count and what they cover)
- Build status: pass/fail
- Test status: pass/fail (with coverage if available)
- Any remaining issues or deviations

**If all checks pass**: "验收通过，可以运行 `/module-done` 标记模块完成。"

**If issues remain**: List them and ask user how to proceed (fix now, defer, or accept as-is).

---

## Important Notes

- **This command WRITES code.** Unlike `/module-plan` which only plans, `/module-dev` produces actual implementation.
- **Follow the plan, don't redesign.** If the plan feels wrong during implementation, stop and discuss with the user rather than silently changing the approach. If the plan needs changes, suggest re-running `/module-plan` in revision mode.
- **Tests are targeted, not exhaustive.** Only test what the plan identifies as important. Don't aim for arbitrary coverage numbers — aim for covering the behaviors that matter.
- **docs/plan.md is the source of truth** for what to implement. When in doubt, refer back to it.
