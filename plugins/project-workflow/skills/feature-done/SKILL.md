---
name: feature-done
description: "Run the Codex-native end-of-feature gate: L1 mechanical checks, L2 project-convention review, L3 change-spec review, current-truth check, compact delivery receipt, and one readiness verdict."
---

# Feature Done (Codex)

Match the user's language. Read [`../../docs/actions/feature-done.md`](../../docs/actions/feature-done.md) completely before acting. Reviewer behavior comes only from [`../../docs/reviewers/agents-md-reviewer.md`](../../docs/reviewers/agents-md-reviewer.md) and [`../../docs/reviewers/spec-reviewer.md`](../../docs/reviewers/spec-reviewer.md).

## Codex execution contract

- Resolve the active feature by slug, number, explicit path, or newest active directory. Exclude `archive/`.
- Use general subagents for L2 and L3 when available, each receiving its canonical reviewer file and exact scope. Main-session fallback is valid.
- Read [`../../docs/adapters/codex-scoped-rule-bridge.md`](../../docs/adapters/codex-scoped-rule-bridge.md) completely before assembling L2 convention sources.
- Reviewers remain read-only. This skill may update only the delivery receipt (`## Proof Bundle`), drift ledger, and READY status marker described by the canonical action.
- Never auto-fix implementation findings or commit.

## Workflow

1. Read `tasks.md`; detect full lane by `spec.md` presence and detect greenfield/brownfield shape.
2. Inspect repository status and determine changed implementation files. Reuse a prior same-session L2/L3 result only when scope and rule/spec inputs are provably unchanged; receipt-only edits and the endpoint-owned `已确认` → `已实现` status transition do not invalidate cache. State every reuse.
3. Run L1 using commands declared in `AGENTS.md` or manifests. Capture command, exit code, concise failure locations, test totals, and coverage when available.
4. Resolve `.claude/rules/` against the complete changed-file population through the Codex bridge. Run L2 against root/nested `AGENTS.md`, global and matching rules, conservatively read ambiguous rules, and included gotchas. Honor the canonical reviewer verdict; zero findings require exact scope/rule IDs and 100% applicable coverage. Every partial is blocking or advisory.
5. For full lane, run L3 against the change spec: greenfield Outcomes/Scope/Constraints/Verification; brownfield Delta/Constraints/Verification. Honor the canonical reviewer evidence contract. Domain docs are context, not the L3 baseline. For light lane, record L3 N/A but execute or mechanically check every `tasks.md` `## 验证` item; missing anchors, non-execution, or failure blocks READY.
6. Check current-truth alignment. A greenfield full-lane delivery that establishes durable user/system behavior always records `update pending` even if no area document exists; `$feature-archive` creates it. Name a document only when spec/plan declare a reliable area; otherwise record `area unresolved` instead of inventing a path. Use “no relevant domain document” only for non-durable/internal work. For light lane, re-check declared high-blast-radius paths.
7. Write a compact delivery receipt to the legacy-compatible `## Proof Bundle` section containing Verdict, exact review-scope paths, endpoint-owned output paths (receipt/status/drift when written), Checks (including light verification), L2/L3 findings and exact item IDs, bridge counts plus applicable/ambiguous paths, Current truth, and only non-empty Open questions/Drift. Do not present unrelated user changes as reviewer scope. Re-read and structurally validate every required field before finalizing; missing evidence is unreliable. Include the exact on-disk `## Proof Bundle` block verbatim in the response, not a summary or link.
8. Append new uncodified drift suggestions to `.claude/drift-ledger.md`, deduplicating semantically repeated entries. Report recurrence hints.
9. For full-lane `READY`, change only the top spec status marker to implemented.
10. Keep finding counts inside the receipt. Do not scan historical receipts unless the user requests calibration; do not infer sensitivity or downscope without known-bad mutation smoke and user judgment.

## Verdict

Verdict contract: L1 failure or unreliable required checks = `BLOCKED`; blocking L2/L3/light-verification/current-truth findings = `NEEDS WORK`; evidence-backed required gates with only explicit nonblocking advisories = `READY`.

- `READY`: L1 passes, L2/L3 are evidence-backed PASS or an allowed explicit skip, light verification passes when applicable, only explicit nonblocking advisories remain, no blocking current-truth issue remains, and the receipt is complete.
- `NEEDS WORK`: fixable convention, spec, classification, or current-truth findings remain.
- `BLOCKED`: L1 fails, required context is missing, or checks cannot run reliably.

Even when L1 fails, continue every independently executable layer and assemble the receipt; record non-execution only for a layer whose own required inputs or environment are unavailable. `READY` is delivery readiness, not lifecycle closure; archive later with `$feature-archive`.
