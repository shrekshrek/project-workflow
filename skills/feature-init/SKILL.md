---
name: feature-init
description: Start a new feature spec — create docs/specs/<NNN>-<slug>/{spec,plan,tasks}.md from project template. Auto-detect if a new module is needed and add module setup to plan/tasks (per workflow §2 Module Setup sub-flow). Optional Step 7 walks user through Q&A fill of §3-5 TODOs with §3.7 quality criteria internalized (can dispatch tech-researcher sub-agent for stack-unsure choices).
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions, progress messages. Code, commands, file paths, and `$ARGUMENTS` stay as-is.

# Spec Init

User wants to start a new feature. Their input: `$ARGUMENTS`

## Step 1 — Parse input

`$ARGUMENTS` may be one of:
- `<slug>` only — e.g., `email-verification`
- `<slug>: <description>` — e.g., `email-verification: send verify link on register`
- Empty — ask user "feature slug? (kebab-case)" then proceed

Slug requirements:
- kebab-case only (`a-z0-9-`)
- 2-40 chars
- No leading/trailing hyphen

If invalid, ask user to correct before proceeding.

## Step 2 — Determine the NNN number

```bash
ls docs/specs/ | grep -E '^[0-9]{3}-' | sort -rn | head -1
```

Take the highest leading number, increment by 1, zero-pad to 3 digits. If `docs/specs/` doesn't exist or is empty, start with `001`.

## Step 3 — Read project context

Read these files for context (skip silently if missing):
- `AGENTS.md` (project conventions)
- `docs/specs/_template/{spec,plan,tasks}.md` (optional override — only if project customized)

Scan project structure to map existing modules:
- Backend: `backend/src/*/` (or `src/*/` for single-tier)
- Frontend: `frontend/src/modules/*/`

## Step 4 — Detect Module Setup needs (workflow §2 sub-flow)

Based on slug + description + existing modules, decide:

| Situation | Module action |
|---|---|
| Feature clearly extends one existing module | No new module; note "extends `<X>`" in plan |
| Feature crosses 2+ existing modules with no clear home | Ask user: which module owns it / split how |
| Feature is a wholly new domain (e.g., `notifications` when none exists) | **New module needed** — add module skeleton to plan/tasks |
| Cross-tier feature (e.g., auth) | Likely needs module in **both** tiers; check each tier separately |

**If unsure, ASK the user before generating files.** Don't fabricate module decisions.

## Step 5 — Generate the three files

Create directory `docs/specs/<NNN>-<slug>/` and write:

### `spec.md` (WHAT — frozen once approved)

```markdown
# <NNN> <slug> — Spec

> Created YYYY-MM-DD · Status: draft

## 1. Goal
<one-paragraph "why" derived from description, or {{TODO}}>

## 2. Scope
**Include**:
- {{prefilled from description, else TODO}}

**Exclude** (out of scope this iteration):
- {{TODO}}

## 3. User Scenarios
- {{TODO — list real user actions, not "as a user I want"}}

## 4. Data Model
{{If new module → describe its main entities; else: "extends existing <module>"}}

## 5. API Contract
| Method | Path | Body | Response | Status |
|---|---|---|---|---|
| {{TODO}} | | | | |

Errors:
- {{TODO — list 401/404/422 cases}}

## 6. Verification
- [ ] Backend unit tests cover happy + 1 边界 + 1 错误路径 per endpoint
- [ ] {{TODO custom}}
- [ ] L1: `pnpm check` (or equivalent) passes
- [ ] L2: `/project-workflow:l2-review` clean
- [ ] L3: `/project-workflow:l3-review` clean (this file is the L3 baseline)
- [ ] Manual smoke test in browser/CLI
```

### `plan.md` (HOW — can amend during implementation)

```markdown
# <NNN> <slug> — Plan

> Based on spec.md. HOW we'll build it.

## Implementation Order
{{If multi-tier: Backend-first (workflow §8.6); else: by phase}}

1. {{TODO list ordered steps}}

## Module Boundaries
{{One of the following:}}

**(a) Extends existing module**: this feature lives in `<path>`. No new module.

**(b) New module needed**: add `<tier>/<module-path>/`
- Responsibility: {{single-line}}
- Public API surface: {{list of functions/endpoints exposed}}
- Decoupling: {{which existing modules it depends on, which depend on it}}
- File layout: standard five-file (models / schemas / service / router / deps)

## Risks / Open Questions
- {{TODO}}

## What We're NOT Doing
- {{TODO — be explicit about deferred decisions}}

## References
- Project spec: `../../spec.md`
- Engineering gotchas to check during impl: `../../gotchas.md` (if exists in project, scan for relevant items based on the stack used)
```

### `tasks.md` (STEPS — keep updated during implementation)

```markdown
# <NNN> <slug> — Tasks

> Based on plan.md. Granular steps, check off as you go.

## Setup (if new module per plan)
- [ ] Create `<tier>/<module-path>/` directory
- [ ] Add `{__init__,models,schemas,service,router}.py` (or tier equivalent)
- [ ] Register router in `main.py` / wire into app
- [ ] Add alembic migration (if DB schema changes)

## Backend
- [ ] {{TODO}}

## Frontend (if applicable)
- [ ] {{TODO}}

## Tests
- [ ] {{TODO unit tests}}
- [ ] {{TODO integration / e2e}}

## Acceptance
- [ ] All spec §6 verification items pass
- [ ] Proof bundle ready (run `/project-workflow:proof-bundle`)
```

## Step 6 — Report back

After creating, output:

```
✅ Spec created: docs/specs/<NNN>-<slug>/
   ├── spec.md  — Fill in §3-5 (user scenarios, data model, API)
   ├── plan.md  — Review module boundaries section
   └── tasks.md — Adjust estimates per task

📌 Module decision: {{one of:}}
   - Extends existing `<module>` (no new module)
   - New module recommended: `<path>` (plan/tasks include skeleton setup)
   - Needs user clarification: <which option>

Next steps:
1. (推荐)立刻进 Step 7 Q&A 走完 §3-5 fill(本 skill 内置)
2. 或选 n 跳过 → 后续自己跟 AI 在主会话填(参考 [`spec-driven.md §3.6.5`](../../docs/spec-driven.md#365-phase-a-填-todos-的-ai-协作-sop))
3. 填完跑 `/project-workflow:spec-quality-check` — pre-implementation gate
4. Implement following tasks.md
5. 实施中真发现 spec/plan 错时:`/project-workflow:spec-revise`(走 [workflow.md §3.5](../../docs/workflow.md#35-开发中发现-specplan-错怎么办))
6. 完成时:`/project-workflow:feature-done`(L1+L2+L3+proof-bundle)
```

## Step 7 — (Optional)Q&A 填 §3-5 TODOs

After Step 6 报告完成,**询问用户是否立即进 Q&A fill 阶段**:

```
spec.md §3-5 还有 TODOs。要我现在 Q&A 走完吗?
  (y)es      → 我按 §3.6.5 SOP 走 §3 → §4 → §5 → §2 末轮补"不做"
  (n)o       → 你后续自由填(我退出)
  (s)kip §X  → 只填指定节(如 'skip §3' 跳过 user scenarios)
```

若用户答 (n) → exit。若 (y) 或 (s),按下面顺序执行 7.1-7.5。

**贯穿 Step 7 的纪律**(对应 [`spec-driven.md §3.7`](../../docs/spec-driven.md#37-specplan-写完后的质量自检7-问-checklist) 7 问):

- §3.7 Q1(六要素齐)— Step 7 强制走完保证齐
- §3.7 Q2(必有"不做")— Step 7.4 末轮补
- §3.7 Q3(Verification 可机械化)— Step 7.3 API Contract 出错码 + Step 6 verification 模板已有 L1/L2/L3
- §3.7 Q4(Outcomes 具体)— Step 7.1 引导问"具体动作 + 边界"
- §3.7 Q5(Constraints 真假)— Step 7.3 API Contract 阶段问硬数字 / 法规
- §3.7 Q6(Sibling Alignment)— 已在 plan.md template §1.1(用户 review 即可)
- §3.7 Q7(tasks verifiable)— Step 6 输出 tasks.md 时已经 verifiable;Step 7 不重复

### Step 7.1 — §3 User Scenarios(~3-5 个引导问题)

按顺序问用户(每问后等回答再下一问):

```
1. "这个 feature 的核心用户场景是什么?用具体动作描述,不要 'as a user I want'。"
2. "有什么边界 case?(异常输入 / 时序问题 / 权限边缘 / etc.)"
3. (按需)"这个场景跟现有 features 有 overlap 吗?"
```

收齐答案 → 用 Edit 工具写进 spec.md §3。完成后 1 行确认:

> "✅ §3 已填:<总结>。OK 进 §4 Data Model 吗?"

### Step 7.2 — §4 Data Model(~3-5 个引导问题)

```
1. "这个 feature 涉及哪些核心实体?(用户/订单/邀请/...)"
2. "实体间的关系?(1-1 / 1-N / N-N + 谁拥有谁)"
3. "每个实体的关键字段?(只列关键 3-5 个,不必详尽)"
4. (按需,若用户对 ORM / 序列化方式不确定)"用 X 还是 Y?要我调研吗?"
   → 用户 yes → dispatch tech-researcher sub-agent
5. (按需)"需要 migration 吗?(若用 SQL DB)"
```

写进 spec.md §4。确认。

### Step 7.3 — §5 API Contract(~3-5 个引导问题)

```
1. "暴露哪些 HTTP endpoint?(列 method + path)"
2. "每个 endpoint 的 request payload + response shape?"
3. "错误路径有哪些?(401 / 404 / 422 / 409 / 500 ...)"
   → 主动追问 "401 / 404 case 覆盖了吗?"(对应 §3.7 Q3 可测验证)
4. (若有硬性能 / 时延约束)"P95 / 并发限制?"(→ §3 Constraints)
```

写进 spec.md §5。**同时把性能/合规约束回填 §3 Constraints**。确认。

### Step 7.4 — §2 Scope 末轮补"不做"(最关键的一步)

**为什么单独最后做**:用户走完 §3-5 后才知道 scope 真实边界,**这时问"什么不做"答得最准**。

```
"现在你看了 §3-5,有哪些**显式不做**的事?
 (例:'本版只支持 email 邀请,不发短信'/ '不做 race condition 处理,假设单点写'/ etc.)
 
 至少列 2-3 条 —— 这是 scope creep 防御。"
```

写进 spec.md §2 `**Exclude(不做)**:` 清单。

### Step 7.5 — 报告 + 提示下一步

```
✅ Spec §3-5 + §2 Exclude 已 Q&A 填完。

下一步建议:
1. 跑 `/project-workflow:spec-quality-check` 验最后那 5%(检 plan.md §1.1 Sibling Alignment + 主观二审)
2. 通过后 `git commit` spec.md → 进 implementation
3. 实施中发现 spec 错 → `/project-workflow:spec-revise`
```

### Step 7 Failure modes

| 错误 | 应对 |
|---|---|
| 用户 Q&A 中途想退出 | 保存已填部分,告诉用户 "已写到 §X,后续可以自己续填" |
| 用户对某节业务概念完全没想清 | 跳过该节(填 `{{TODO — pending business decision: <topic>}}`),提示用户后续 quality-check 前要填 |
| Step 7.2 dispatch tech-researcher 失败 | 退回 user 自答,不阻塞 fill 流程 |
| 用户回答跟前面 §自相矛盾 | 提示 "§3 你说 X,§5 这里说 Y,是 X 还是 Y?",请求澄清 |

## Notes

- **Do not** generate code yet — this is the planning artifact only
- **Do not** overwrite existing `docs/specs/<NNN>-<slug>/` (collision detection: error out)
- **Template source**:本 SKILL.md § Step 5 起的 spec/plan/tasks 内置模板是 canonical source。若项目有 `docs/specs/_template/`(用户手工 mkdir + `.user-customized` 哨兵),则优先读本地 override
