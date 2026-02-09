---
description: "Multi-phase guided project planning: requirements → research → clarification → architecture → persist to project files."
argument-hint: Project idea or description
---

# Project Planning

You are helping a developer plan a new project or major initiative. Follow a systematic multi-phase approach: understand requirements deeply, research the technical landscape, resolve all ambiguities, design architecture with multiple options, then persist everything to project memory files.

## Core Principles

- **Ask before assuming**: Identify all ambiguities and wait for user answers before proceeding
- **Research before designing**: Understand the technical landscape and existing code (if any)
- **Multiple perspectives**: Use parallel agents to explore different architectural approaches
- **Persist everything**: All decisions must be saved to project files before implementation begins
- **Gate each phase**: Do not proceed to the next phase without user confirmation

---

## Entry: New vs Revision

Before starting, check whether project planning files already exist (`CLAUDE.md`, `PROGRESS.md`, `docs/architecture.md`).

### If files do NOT exist → Full Flow

Proceed to Phase 1 and run all 5 phases sequentially.

### If files already exist → Revision Mode

This is a re-run to adjust an existing plan. Read the existing files, then:

1. Present a brief summary of the current plan (tech stack, module list, architecture approach)
2. Ask the user: **"What do you want to adjust?"** Typical answers:
   - "Requirements changed" → Go to Phase 1, then cascade through subsequent phases as needed
   - "Want to reconsider tech stack" → Go to Phase 2
   - "Architecture doesn't feel right" → Go to Phase 4
   - "Just update the files with what we discussed" → Go to Phase 5
3. Execute from the chosen phase. When persisting (Phase 5), **update** existing files rather than overwriting from scratch — preserve content from unchanged phases.

---

## Phase 1: Discovery

**Goal**: From a rough idea to a structured requirements document

Initial request: $ARGUMENTS

### Step 1: Assess clarity

Evaluate the initial request:
- **Clear** ($ARGUMENTS is detailed with specific features and constraints) → Skip to Step 3
- **Vague** ($ARGUMENTS is brief, open-ended, or absent) → Go to Step 2

### Step 2: Diverge (Brainstorming)

Trigger the Brainstorming skill to explore possibilities:
- Who could benefit from this? What problems could it solve?
- What features could it have? What adjacent ideas exist?
- Are there reference projects or competing products?

Let the user think freely. Do NOT constrain or structure at this point. Collect all ideas and possibilities.

### Step 3: Converge (Requirements Structuring)

Organize the discussion output (from brainstorming or from clear $ARGUMENTS) into a structured requirements document. **The agent drafts every section; the user only reviews and adjusts.**

Go through this framework item by item:

1. **User Personas**: Who are the core users? (extract from discussion, propose if not mentioned)
2. **Core Problem**: What specific pain point does this solve? (one sentence)
3. **MVP Features**: Must-have features for v1 (extract from discussion, propose priority order)
4. **Explicitly Out of Scope**: What is NOT in v1? (agent proposes boundary based on discussion)
5. **Constraints**: For each, ask if not mentioned:
   - Tech stack preference or requirement?
   - Target platform? (web, mobile, CLI, API)
   - Timeline or budget constraints?
   - Must integrate with existing systems?
6. **Non-functional Requirements**: Agent proposes sensible defaults and asks user to confirm:
   - Performance targets (e.g., "API < 500ms, 100 concurrent users — does this match your expectations?")
   - Security requirements (e.g., "needs auth? what user data is sensitive?")
   - Scalability expectations (e.g., "MVP for 100 users, or planning for 10k?")
7. **Success Criteria**: How do we know it's done and working? (agent proposes, user confirms)

**For any item the user didn't mention**: Do NOT skip. Propose a reasonable default with your reasoning, then ask the user to confirm or adjust. Example:

> You haven't mentioned performance targets. Based on this project's nature, I'd suggest:
> - API response time < 500ms
> - Support 100 concurrent users for MVP
> Does this match your expectations, or do you have different targets?

### Step 4: Confirm

Present the complete structured requirements document. **Wait for user to confirm** before proceeding to Phase 2.

Create todo list with all 5 phases at this point.

---

## Phase 2: Research

**Goal**: Understand the technical landscape

**Assess the situation first**, then choose the appropriate path:

### Path A: New Project (no existing code)
1. Launch 2-3 **tech-researcher** agents in parallel, each targeting a different technology decision area:
   - Example: "Research Python web frameworks (FastAPI vs Django vs Flask) for a video analysis API with async processing needs"
   - Example: "Compare database options (PostgreSQL vs SQLite vs MongoDB) for a project storing structured analysis reports with full-text search"
   - Example: "Find reference projects and boilerplate starters for [target stack], evaluate their architecture quality"
2. Review agent findings, synthesize into a unified tech stack recommendation
3. Present comparison table with trade-offs and **wait for user confirmation** on tech direction

### Path B: Existing Project (has code)
1. Launch 2-3 **codebase-explorer** agents in parallel, each targeting a different aspect:
   - Agent 1: "Map overall architecture and module boundaries of this project"
   - Agent 2: "Trace key user flows and data models"
   - Agent 3: "Identify coding conventions, patterns, and extension points"
2. Read key files identified by agents
3. Present findings and **wait for user confirmation**

### Path C: Renovation (existing code + new tech)
Execute both Path A and Path B in parallel.

---

## Phase 3: Clarifying Questions

**Goal**: Resolve ALL ambiguities before designing architecture

**CRITICAL: DO NOT SKIP THIS PHASE**

**Actions**:
1. Review Phase 1 requirements + Phase 2 research findings
2. Identify every underspecified aspect:
   - Feature boundaries: what's in MVP, what's out
   - Data model: core entities and their relationships
   - Key user scenarios: main flows and their expected behavior
   - Non-functional requirements: performance, security, scalability targets
   - Integration points: third-party APIs, external services
   - Deployment and infrastructure preferences
3. **Present all questions in a clear, organized list**
4. **Wait for answers before proceeding**

If user says "whatever you think is best", provide your recommendation and get explicit confirmation.

---

## Phase 4: Architecture Design

**Goal**: Design the system architecture with multiple approaches

**Actions**:
1. Launch 2-3 **system-architect** agents in parallel, each given the same requirements and tech stack from Phase 1-3, but with a different design mandate:
   - Agent 1 mandate: **Minimal viable** — "Design the simplest architecture that delivers MVP. Minimize moving parts, prefer monolithic over distributed, pick the most straightforward solution for each component."
   - Agent 2 mandate: **Scalable design** — "Design a clean architecture with clear module boundaries, well-defined interfaces, and room to grow. Prioritize maintainability over speed of initial development."
   - Agent 3 mandate: **Pragmatic balance** — "Balance development speed with architectural quality. Use simple solutions where complexity isn't justified, but invest in clean abstractions for core domain logic."
2. Each agent must produce (as defined in system-architect agent spec):
   - System architecture diagram (Mermaid)
   - Data model (Mermaid ER diagram)
   - Module boundaries (responsibilities, interfaces, dependencies)
   - Key scenario flows (Mermaid sequence diagrams)
   - Design decisions with trade-off reasoning
3. Review all approaches and form your recommendation
4. Present to user:
   - Brief summary of each approach
   - Trade-offs comparison table
   - **Your recommendation with reasoning**
   - Key differences in concrete terms (e.g., "Approach A has 3 modules, Approach B has 6 — here's why that matters for your project")
5. **Ask user which approach they prefer**

---

## Phase 5: Persist

**Goal**: Save all decisions to project memory files

After user confirms architecture choice, create/update these files:

### 1. CLAUDE.md (target < 300 lines)
- Project overview (one paragraph)
- Feature scope (included / excluded)
- Tech stack table (category | choice | rationale)
- Architecture overview (one paragraph + pointer to docs/architecture.md)
- Module list (name + one-line responsibility, no status)
- Coding conventions (concrete rules, not vague guidelines)
- Common pitfalls / things to avoid
- Reference document pointers (PROGRESS.md, docs/architecture.md, docs/plan.md (created by `/module-plan`))

### 2. PROGRESS.md
- Module status table (all modules "未开始", with dependency notes)
- "下次继续的入口": which module to start with and why
- Empty "已完成的里程碑" section

### 3. docs/architecture.md
- System architecture diagram (Mermaid flowchart or C4)
- Data model (ER diagram in Mermaid or table structure description)
- Module boundaries (responsibilities, interfaces, dependencies between modules)
- Key scenario flows (Mermaid sequence diagrams for 2-3 core user journeys)
- Design decisions log (trade-off analysis from Phase 4, chosen approach and rationale)

**After writing all files**:
- List each file path and line count
- Summarize the project plan in 3-5 bullet points
- **Wait for user to confirm before considering planning complete**

---

## Important Notes

- **Do NOT write any implementation code** during this command. This is planning only.
- **Do NOT skip Phase 3** (Clarifying Questions). Ambiguities caught here prevent costly rework later.
- If the user wants to change direction mid-planning, go back to the relevant phase rather than starting over.
- CLAUDE.md must stay under 300 lines. If content exceeds this, move details to docs/architecture.md or module-level CLAUDE.md files.
