---
name: l3-review
description: Run the project's L3 review — verify implementation matches the feature's spec.md (Outcomes, Scope, Constraints, Verification). Delegates to the `spec-reviewer` sub-agent. Use after L1 (mechanical) and L2 (AGENTS.md) are green.
---

> **Response language**: Match the user's prompt language (中文 / English / etc.) in all natural-language output — headers, summaries, questions. Pass-through agent reports preserve the agent's own language choice (which also follows this rule). Code, commands, file paths stay as-is.

# L3 Review

L3 in the project-workflow methodology = **feature-spec compliance**. This is the only review level that checks "did you build what the spec said". Pairs naturally with `spec-init` (which created the spec).

User input: `$ARGUMENTS` — feature slug or path to spec.md

## Step 1 — Locate the spec

Resolve `$ARGUMENTS` to a spec.md path:

| Input | Resolution |
|---|---|
| `email-verification` | `docs/specs/<NNN>-email-verification/spec.md` (latest matching NNN) |
| `002` or `002-email-verification` | `docs/specs/002-*/spec.md` |
| `docs/specs/.../spec.md` (full path) | Use as-is |
| empty | Find most-recent `docs/specs/<NNN>-*/spec.md` by `ls -t` or NNN order |

If spec.md missing: fail with "Spec not found. Run `/project-workflow:spec-init <slug>` first."

If found, also locate sibling `plan.md` and `tasks.md` (for context — pass to agent).

## Step 2 — Determine implementation scope

Figure out which files were changed implementing this feature:

1. **Preferred**: parse `tasks.md` for explicit file mentions (paths in task items)
2. **Fallback**: git history — find commits referencing the feature slug:
   ```bash
   git log --oneline --all --grep="<slug>"
   git log --name-only -p -- $(git diff --name-only HEAD~N HEAD)
   ```
3. **Last resort**: `git diff --name-only HEAD~1` if user says "since last commit"
4. **If still unclear**: ask user "which commit range or file list scopes this feature?"

## Step 3 — Spawn the spec-reviewer agent

Use Task tool with `subagent_type: spec-reviewer`.

Pass:
- spec.md path
- plan.md path (context only)
- tasks.md path (status context)
- List of changed files (scope)

Example task prompt:

> Review L3 spec compliance for feature `email-verification`.
>
> - Spec: `docs/specs/002-email-verification/spec.md` (THIS is the baseline)
> - Plan (context only, not the source of truth): `docs/specs/002-email-verification/plan.md`
> - Tasks (status): `docs/specs/002-email-verification/tasks.md`
>
> Implementation scope (changed files):
> - backend/src/email/{__init__.py, service.py, templates/*.j2}
> - backend/src/auth/{models.py, schemas.py, service.py, router.py}
> - backend/alembic/versions/<two-new>.py
> - frontend/src/modules/auth/{RegisterSentView.vue, VerifyEmailView.vue, api.ts, RegisterView.vue, LoginView.vue}
> - frontend/src/router/index.ts
> - docker-compose.yml, .env.example
>
> Return structured findings per your output format. Focus on:
> 1. Spec §1 Outcomes — actually happens?
> 2. Spec §2 Scope — anything excluded that snuck in? Anything included that's missing?
> 3. Spec §3 Constraints — hard numbers respected (32-byte token, 24h expiry, etc)?
> 4. Spec §4 Verification — listed tests present?

## Step 4 — Forward the agent's report

The sub-agent returns a markdown report with sections (Missing / Deviations / Scope creep / Verified / Summary). Pass it through verbatim with header/footer:

```
## /project-workflow:l3-review — <feature-slug>

<agent's verbatim report>

---
Next: if L3 clean → `/project-workflow:proof-bundle <slug>` to verify delivery checklist.
If deviations remain → fix them or update spec.md (deviations from intended design need explicit spec edit).
```

## Step 5 — Failure modes

- **Spec describes something not yet built**: that's fine — L3 distinguishes "missing" from "deviation". If most items are missing, the feature is just in-progress; tell user "Feature looks incomplete — N of M spec items unimplemented. Continue per tasks.md."
- **Tasks.md / files mismatch**: trust the spec, not tasks.md. tasks.md is "intended steps", spec is "what we promised".
- **Agent finds scope creep**: don't auto-fix. The user decides: trim impl OR update spec §2.

## Notes

- **L3 ≠ L2**. L2 checks "do you follow project conventions?". L3 checks "did you build what you promised?".
- **L3 is the most valuable layer for verifying feature delivery** but also the slowest (~2-3 min agent call).
- **Run after L1 + L2 are green**. Spec compliance review is wasted if there are broken tests.
- **Spec ambiguities surface here**: agent's report may include a `📝 Spec ambiguities` section. Those are real signals — improve spec.md if they're recurring.
