---
name: feature-done
description: "Run the Codex-native end-of-feature gate: L1 mechanical checks, L2 project-convention review, L3 change-spec review, current-truth check, proof bundle, and one readiness verdict."
---

# Feature Done (Codex)

Match the user's language. Read [`../../docs/actions/feature-done.md`](../../docs/actions/feature-done.md) completely before acting. Reviewer behavior comes only from [`../../docs/reviewers/agents-md-reviewer.md`](../../docs/reviewers/agents-md-reviewer.md) and [`../../docs/reviewers/spec-reviewer.md`](../../docs/reviewers/spec-reviewer.md).

## Codex execution contract

- Resolve the active feature by slug, number, explicit path, or newest active directory. Exclude `archive/`.
- Use general subagents for L2 and L3 when available, each receiving its canonical reviewer file and exact scope. Main-session fallback is valid.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before assembling L2 convention sources.
- Reviewers remain read-only. This skill may update only the proof bundle, drift ledger, and READY status marker described by the canonical action.
- Never auto-fix implementation findings or commit.

## Workflow

1. Read `tasks.md`; detect full lane by `spec.md` presence and detect greenfield/brownfield shape.
2. Inspect repository status and determine changed implementation files. Reuse a prior same-session L2/L3 result only when scope and rule/spec inputs are provably unchanged; state every reuse.
3. Run L1 using commands declared in `AGENTS.md` or manifests. Capture command, exit code, concise failure locations, test totals, and coverage when available.
4. Resolve `.claude/rules/` against the complete changed-file population through the Codex bridge. Run L2 against root/nested `AGENTS.md`, global and matching rules, conservatively read ambiguous rules, and included gotchas. The reviewer must cite the convention source for every finding; a potentially critical scope ambiguity blocks readiness.
5. For full lane, run L3 against the change spec: greenfield Outcomes/Scope/Constraints/Verification; brownfield Delta/Constraints/Verification. Domain docs are context, not the L3 baseline. Do not pass A-class compatibility rules as L3 requirements. For light lane, record the explicit L3 skip.
6. Check current-truth alignment and whether durable behavior requires a later `$feature-archive` merge. For light lane, re-check declared high-blast-radius paths.
7. Write a proof bundle to `tasks.md` containing diff summary, L1/L2/L3 evidence, the L2 bridge global/matched/skipped/ambiguous source sets, convention changes/drift suggestions, current-truth state, and open questions. Record blocked/skipped layers explicitly rather than omitting them.
8. Append new uncodified drift suggestions to `.claude/drift-ledger.md`, deduplicating semantically repeated entries. Report recurrence hints.
9. For full-lane `READY`, change only the top spec status marker to implemented.
10. Report gate-health counts and warn when L2, L3, or drift review has produced zero findings across at least three delivered features.

## Verdict

Verdict contract: L1 failure or unreliable required checks = `BLOCKED`; fixable L2/L3/current-truth findings = `NEEDS WORK`; all required gates and proof complete = `READY`.

- `READY`: L1 passes, no blocking L2/L3/current-truth issue, and proof is complete.
- `NEEDS WORK`: fixable convention, spec, classification, or current-truth findings remain.
- `BLOCKED`: L1 fails, required context is missing, or checks cannot run reliably.

Even when L1 fails, record the attempted check and explicit non-execution of dependent layers in the proof bundle so the endpoint leaves auditable evidence. `READY` is delivery readiness, not lifecycle closure; archive later with `$feature-archive`.
