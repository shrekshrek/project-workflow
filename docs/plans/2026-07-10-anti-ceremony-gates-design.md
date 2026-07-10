# Anti-ceremony gate hardening design

> Date: 2026-07-10
> Status: implemented; pending release

## Goal

Make every mandatory project-workflow step either change a decision, produce evidence required for a verdict, or feed a named downstream consumer. Remove mechanisms that only create the appearance of governance.

This is a proportionality pass, not a minimization exercise. Preserve an infrequent or zero-finding mechanism when it protects a distinct material risk, has a clear consumer, and is cheaper than the failure it prevents. Do not remove a control merely because it is not used on the happy path.

## Decisions

1. A reviewer with zero findings passes only with evidence: exact scope and applicable-item populations, 100% applicable coverage, no applicable-unverified item, no blocking ambiguity, and calibrated confidence. Definite nonmatches are excluded from the denominator. Missing evidence makes the review unreliable and blocks READY.
2. Production finding count is a cost signal, not a sensitivity test. Repeated zero findings may prompt an explicit or periodic calibration, but `feature-done` does not scan history on every run. Known-bad mutation smoke is the correct sensitivity check.
3. The persisted proof bundle becomes a compact delivery receipt. Every field has a consumer: user/PR, feature-archive, current-truth merge, or convention-drift follow-up. The same receipt is shown in the endpoint response.
4. Hook assets remain plugin templates until a confirmed safe per-file command exists. A new target without such a command receives no project-local hook script or active hook mapping.
5. Frozen spec changes always get a revision record. ADRs are conditional: architecture/module-boundary changes, durable cross-feature technical decisions, or decisions that supersede an ADR require one; ordinary product-scope corrections do not.
6. `spec-revise` has two approval points: decision/scope approval and final diff approval. Intermediate per-file confirmations occur only when new ambiguity appears.
7. Decision-completeness subagents are complexity-triggered. Simple single-source synchronization uses an inline trace check; cross-file generated decisions, weak evidence, new ownership, ports, packages, infrastructure, or ADR work use the auditor.
8. Codex scoped-rule reporting defaults to counts plus applicable/ambiguous paths. Full skipped lists are debug output only.
9. User onboarding points to quickstart first. Deep methodology and maintainer material remain references, not a required reading queue.

## Non-goals

- Do not merge L1/L2/L3; they retain distinct rule sources.
- Do not remove proof history or current-truth/feature-archive lifecycle.
- Do not weaken light-lane L2 until reviewer mutation tests support safe downscoping.
- Do not add a new public action, agent, telemetry file, or pseudo-lane.

## Validation

- Structural contracts compare canonical verdict text, parse delivery-receipt fields, reject unsafe/legacy branches, validate plugin-only template and hook materialization, and check repeatable reviewer fixtures. String markers remain only where no structured representation exists.
- Existing adapter parity, template/hook fixtures, lifecycle-link relocation, Markdown links, plugin manifests, and package sync remain green.
- Release smoke should include known-bad L2 and L3 fixtures; deterministic CI checks the prompt contract, while model sensitivity remains a release-level dynamic check.

## Implementation evidence

| Scenario | Result | Evidence supplied by the endpoint |
| --- | --- | --- |
| Codex full-lane clean | `READY` | L1 green; exact review-scope paths separated from endpoint-owned receipt/status outputs; exact L2 rule IDs and L3 spec IDs; 100% applicable coverage; zero unverified or ambiguous items; high confidence |
| Claude full-lane clean | `READY` | Same verdict and evidence contract as Codex; unresolved current-truth area is reported without inventing a domain filename |
| Full-lane known-bad | `NEEDS WORK` | L1 stayed green while L2 found two planted convention violations and L3 found three planted behavior/constraint/verification defects |
| Light-lane clean | `READY` | L3 is explicitly N/A; every declared `tasks.md` verification ran and passed; exact light-verification IDs are persisted |
| Light-lane known-bad | `NEEDS WORK` | L1 and L2 passed; the endpoint still blocked solely on a failed declared light verification |
| Same-session rerun | Idempotent | L1 and receipt assembly reran; valid L2/L3 evidence was reused; the persisted receipt remained byte-identical |
| `spec-revise` without ADR trigger | Applied once | Decision approval and final-diff approval both occurred while the worktree remained clean; only approved spec/plan/tasks content was applied; no ADR was created |
| Staged project baseline | Safe transactional boundary | Staging leaves existing or absent targets unchanged; plugin-only assets stay excluded; strict apply rejects approval-time conflicts plus target-root, ancestor, and child symlinks before copying; normal approved apply remains complete |

Static regression also passes adapter parity for 9 Claude-native and 9 Codex-native skills, all 9 Codex skill validations, structured workflow contracts, four deterministic endpoint fixture inputs plus verdict truth-table checks, 7 template rules, 12 hook cases, lifecycle relocation, local Markdown path/fragment checks, script syntax checks, and `git diff --check`. Reviewer sensitivity and receipt writing remain dynamic endpoint evidence, not a CI claim.
