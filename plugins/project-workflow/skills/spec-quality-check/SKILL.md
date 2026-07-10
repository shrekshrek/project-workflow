---
name: spec-quality-check
description: "Run the Codex-native pre-implementation quality gate for a full-lane feature spec, plan, and tasks. Combines mechanical checks with the canonical subjective reviewer and blocks failed artifacts."
---

# Spec Quality Check (Codex)

Match the user's language. Read [`../../docs/actions/spec-quality-check.md`](../../docs/actions/spec-quality-check.md) and [`../../docs/reviewers/spec-quality-reviewer.md`](../../docs/reviewers/spec-quality-reviewer.md) completely before reviewing.

## Workflow

1. Resolve the feature by slug/number, or use the newest active full-lane feature. Exclude `archive/`.
2. If `spec.md` is absent, report that the light lane does not use this gate and stop without failure.
3. Detect greenfield vs brownfield from the document shape.
4. Run the canonical mechanical checks:
   - required sections and no mission-critical TODOs;
   - explicit included and excluded scope for greenfield;
   - concrete Delta with Added/Modified/Removed for brownfield;
   - executable verification items;
   - affected modules and sibling alignment where applicable;
   - implementation-sized tasks with validation/proof work;
   - current-truth reference and non-contradiction when a domain document exists.
5. Run the canonical subjective reviewer in a general subagent when available, passing the three artifact paths and detected shape. If no subagent is available, execute the same methodology in the main session.
6. Aggregate findings without double-counting the same root cause. Cite exact file sections or lines.

## Verdict

- `READY`: no failed or unresolved checks.
- `BORDERLINE`: no failures, but risk remains. Implementation may proceed only after the accepted risk, reason, and follow-up are recorded in `plan.md` or `tasks.md`.
- `BLOCKED`: at least one failed check; do not start implementation.

Do not automatically mark `spec.md` as confirmed. After `READY`, or after the user accepts and records a `BORDERLINE` risk, tell the user to confirm the spec before implementation. Do not edit artifacts unless the user asks for the fixes.
